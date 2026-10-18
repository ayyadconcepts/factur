import type { Invoice, InvoiceLine, VatBreakdownLine } from '@/core/domain/invoice';
import type { LlmInvoiceDraft } from '@/server/extract/schema';
import { toAmount, toDecimal4, asDecimal, sumAmounts, multiplyAndRound2 } from '@/core/domain/money';

function formatAmount(val: string | null | undefined, fallback = '0.00'): string {
  if (!val) return fallback;
  const cleaned = val.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num.toFixed(2);
}

function formatPercent(val: string | null | undefined, fallback = '20.00'): string {
  if (!val) return fallback;
  const cleaned = val.replace(/,/g, '.').replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num.toFixed(2);
}

function normalizeIsoDate(val: string | null | undefined, fallback?: string): string | undefined {
  if (!val) return fallback;
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const frMatch = trimmed.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
  if (frMatch && frMatch[1] && frMatch[2] && frMatch[3]) {
    const day = frMatch[1].padStart(2, '0');
    const month = frMatch[2].padStart(2, '0');
    const year = frMatch[3];
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return fallback;
}

const cleanSiren = (val: string | null | undefined, fallback = '000000000') => {
  const digits = (val || '').replace(/\D/g, '');
  if (digits.length >= 9) return digits.slice(0, 9);
  return fallback;
};

const cleanSiret = (val: string | null | undefined) => {
  const digits = (val || '').replace(/\D/g, '');
  if (digits.length === 14) return digits;
  return undefined;
};

const cleanVatId = (val: string | null | undefined) => {
  if (!val) return undefined;
  const clean = val.replace(/[\s.-]/g, '').toUpperCase();
  if (/^[A-Z]{2}[0-9A-Z]{2,13}$/.test(clean)) {
    return clean;
  }
  return undefined;
};

const cleanIban = (val: string | null | undefined) => {
  if (!val) return undefined;
  const clean = val.replace(/[\s-]/g, '').toUpperCase();
  if (/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(clean)) {
    return clean;
  }
  return undefined;
};

export function convertDraftToInvoice(draft: LlmInvoiceDraft): Invoice {
  const invoiceNumber = draft.invoiceNumber?.value?.trim() || `FACT-${Date.now().toString().slice(-6)}`;
  const issueDate = normalizeIsoDate(draft.issueDate?.value) || new Date().toISOString().slice(0, 10);
  const dueDate = normalizeIsoDate(draft.dueDate?.value);
  const deliveryDate = normalizeIsoDate(draft.deliveryDate?.value);
  const typeCode = draft.documentType === 'credit_note' ? '381' : '380';

  const rawHt = formatAmount(draft.totals?.excludingVat?.value);

  // 1. Normalisation des lignes
  const lines: InvoiceLine[] = [];
  if (draft.lines && draft.lines.length > 0) {
    draft.lines.forEach((l, idx) => {
      const q = formatAmount(l.quantity?.value, '1.00');
      const up = formatAmount(l.unitPriceNet?.value, '0.00');
      const computedNet = multiplyAndRound2(toDecimal4(q), toAmount(up));
      const net = l.lineNetAmount?.value ? formatAmount(l.lineNetAmount.value, computedNet) : computedNet;
      const cat = (l.vatCategory?.value as 'S' | 'Z' | 'E') || 'S';
      const pct = formatPercent(l.vatRate?.value, '20.00');

      lines.push({
        id: String(idx + 1),
        name: l.description?.value?.trim() || `Ligne ${idx + 1}`,
        quantity: toDecimal4(q),
        unit: (l.unit?.value?.trim() || 'C62') as any,
        unitPriceNet: toAmount(up),
        lineNetAmount: toAmount(net),
        vat: {
          category: cat,
          percent: toDecimal4(pct),
        },
      });
    });
  }

  // Fallback si aucune ligne n'a pu être extraite
  if (lines.length === 0) {
    lines.push({
      id: '1',
      name: 'Prestation / Marchandise',
      quantity: toDecimal4('1.00'),
      unit: 'C62' as any,
      unitPriceNet: toAmount(rawHt),
      lineNetAmount: toAmount(rawHt),
      vat: {
        category: 'S',
        percent: toDecimal4('20.00'),
      },
    });
  }

  // 2. Harmonisation arithmétique stricte (BR-CO-10, BR-CO-11, BR-CO-17)
  const lineNetTotal = sumAmounts(lines.map((l) => l.lineNetAmount));

  // 3. Regroupement de la ventilation de TVA par catégorie et taux
  const vatGroups = new Map<string, { category: 'S' | 'Z' | 'E'; percent: string; lines: InvoiceLine[] }>();
  for (const line of lines) {
    const key = `${line.vat.category}_${line.vat.percent}`;
    if (!vatGroups.has(key)) {
      vatGroups.set(key, { category: line.vat.category, percent: line.vat.percent, lines: [] });
    }
    vatGroups.get(key)!.lines.push(line);
  }

  const vatBreakdown: VatBreakdownLine[] = [];
  for (const group of vatGroups.values()) {
    const groupTaxable = sumAmounts(group.lines.map((l) => l.lineNetAmount));
    const rate = asDecimal(group.percent).dividedBy(100);
    const groupTax = toAmount(asDecimal(groupTaxable).times(rate));

    vatBreakdown.push({
      category: group.category,
      percent: toDecimal4(group.percent),
      taxableAmount: toAmount(groupTaxable),
      taxAmount: toAmount(groupTax),
    });
  }

  if (vatBreakdown.length === 0) {
    vatBreakdown.push({
      category: 'S',
      percent: toDecimal4('20.00'),
      taxableAmount: toAmount(lineNetTotal),
      taxAmount: toAmount(asDecimal(lineNetTotal).times(0.20)),
    });
  }

  // 4. Totaux harmonisés (BR-CO-14, BR-CO-15, BR-CO-16)
  const taxTotal = sumAmounts(vatBreakdown.map((vb) => vb.taxAmount));
  const taxInclusive = toAmount(asDecimal(lineNetTotal).plus(asDecimal(taxTotal)));

  // 5. Normalisation des tiers (Vendeur et Acheteur)
  const sellerSiret = cleanSiret(draft.seller?.siret?.value);
  const sellerVatId = cleanVatId(draft.seller?.vatId?.value);
  const buyerSiret = cleanSiret(draft.buyer?.siret?.value);
  const buyerVatId = cleanVatId(draft.buyer?.vatId?.value);

  const iban = cleanIban(draft.payment?.iban?.value);
  const bic = draft.payment?.bic?.value?.replace(/\s/g, '');
  const terms = draft.payment?.terms?.value?.trim();

  return {
    profile: 'EN16931',
    number: invoiceNumber,
    typeCode,
    issueDate,
    ...(dueDate ? { dueDate } : {}),
    ...(deliveryDate ? { deliveryDate } : {}),
    currency: 'EUR',
    seller: {
      name: draft.seller?.name?.value?.trim() || 'Fournisseur',
      siren: cleanSiren(draft.seller?.siren?.value || draft.seller?.siret?.value),
      ...(sellerSiret ? { siret: sellerSiret } : {}),
      ...(sellerVatId ? { vatId: sellerVatId } : {}),
      address: {
        line1: draft.seller?.addressLine1?.value?.trim() || 'Adresse principale',
        postalCode: draft.seller?.postalCode?.value?.trim() || '75001',
        city: draft.seller?.city?.value?.trim() || 'Paris',
        country: 'FR',
      },
    },
    buyer: {
      name: draft.buyer?.name?.value?.trim() || 'Client',
      siren: cleanSiren(draft.buyer?.siren?.value || draft.buyer?.siret?.value),
      ...(buyerSiret ? { siret: buyerSiret } : {}),
      ...(buyerVatId ? { vatId: buyerVatId } : {}),
      address: {
        line1: draft.buyer?.addressLine1?.value?.trim() || 'Adresse client',
        postalCode: draft.buyer?.postalCode?.value?.trim() || '75001',
        city: draft.buyer?.city?.value?.trim() || 'Paris',
        country: 'FR',
      },
    },
    lines,
    vatBreakdown,
    totals: {
      lineNet: toAmount(lineNetTotal),
      taxExclusive: toAmount(lineNetTotal),
      taxTotal: toAmount(taxTotal),
      taxInclusive: toAmount(taxInclusive),
      payable: toAmount(taxInclusive),
    },
    payment: {
      meansCode: '30',
      ...(iban ? { iban } : {}),
      ...(bic ? { bic } : {}),
      ...(terms ? { terms } : {}),
    },
    ...(draft.operationCategory?.value ? { operationCategory: draft.operationCategory.value as any } : {}),
    vatOnDebits: draft.vatOnDebits?.value === true,
    notes: draft.legalNotes?.map((n) => ({ content: n.value || '' })) || [],
  };
}
