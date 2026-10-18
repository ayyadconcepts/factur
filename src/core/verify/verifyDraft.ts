import { LlmInvoiceDraft } from '../../server/extract/schema';
import { PdfTextItem } from '../extraction/types';
import { buildLines } from '../extraction/buildLines';
import { parseFrenchAmount, parseDateFR } from './parsers';
import Decimal from 'decimal.js';

export type FieldStatus = 'verified' | 'warning' | 'error' | 'missing';

export interface VerifiedField {
  status: FieldStatus;
  value: string | null;
  raw: string | null;
  quote: string | null;
  printedLabel: string | null;
  issues: string[];
  note?: string | null;
  bbox?: number[]; // [x, y, w, h] or similar if we map back to pdf items
}

export interface VerificationResult {
  globalStatus: 'success' | 'warning' | 'error';
  fields: Record<string, VerifiedField>;
}

function normalizeText(text: any): string {
  if (text === null || text === undefined) return '';
  return String(text).normalize('NFC').replace(/[\s\u00A0\u202F]+/g, ' ').toLowerCase().trim();
}

function fuzzyIncludes(source: string, target: string): boolean {
  const cleanSource = source.replace(/[\W_]+/g, '');
  const cleanTarget = target.replace(/[\W_]+/g, '');
  return cleanSource.includes(cleanTarget);
}

export function verifyDraft(draft: LlmInvoiceDraft, items: PdfTextItem[]): VerificationResult {
  const pages = buildLines(items);
  const allText = pages.flatMap(p => p.lines.map(l => l.text)).join(' ');
  const normalizedPdfText = normalizeText(allText);

  const fields: Record<string, VerifiedField> = {};
  let hasError = false;
  let hasWarning = false;

  function verifyField(path: string, field: any, type: 'amount' | 'date' | 'identifier' | 'string' = 'string') {
    if (!field || field.value === null) {
      fields[path] = { status: 'missing', value: null, raw: null, quote: null, printedLabel: null, issues: [] };
      return;
    }

    const issues: string[] = [];
    let status: FieldStatus = 'verified';

    // 1. ANCRAGE
    if (field.quote) {
      const normQuote = normalizeText(field.quote);
      if (normalizedPdfText.includes(normQuote)) {
        if (field.raw && !normalizeText(field.raw).includes(normQuote) && !normQuote.includes(normalizeText(field.raw))) {
          status = 'error';
          issues.push('UNGROUNDED: La valeur brute n\'est pas dans la citation.');
        }
      } else {
        // Fallback: check if the exact raw value is present in the document
        if (field.raw && fuzzyIncludes(normalizedPdfText, field.raw.toLowerCase())) {
          // Acceptable: the value is grounded, the quote was just slightly inaccurate (e.g. LLM skipped a word)
        } else {
          status = 'error';
          issues.push('UNGROUNDED: La citation est introuvable dans le document.');
        }
      }
    } else {
      status = 'error';
      issues.push('UNGROUNDED: Citation absente.');
    }

    // 2. COHÉRENCE raw <-> value
    const isDerivedSiren = field.note?.includes('Déduit depuis le SIRET') || field.note?.includes('SIRET');

    if (field.raw && status !== 'error') {
      let parsed: string | null = null;
      if (type === 'amount') parsed = parseFrenchAmount(field.raw);
      else if (type === 'date') parsed = parseDateFR(field.raw);
      else if (type === 'identifier') parsed = field.raw.replace(/[\s\u00A0\u202F]/g, ''); // Identifiers without spaces
      else parsed = normalizeText(field.raw); // Normal string: just normalize spaces

      const comparisonValue = type === 'string' ? normalizeText(field.value) : field.value;

      if (parsed === comparisonValue) {
        // OK
      } else if (parsed === null && (type === 'amount' || type === 'date')) {
        // Fallback: les chiffres doivent correspondre pour montant/date
        const rawDigits = field.raw.replace(/\D/g, '');
        const valueDigits = field.value.replace(/\D/g, '');
        if (rawDigits !== valueDigits && rawDigits + '00' !== valueDigits) { // Tolérer les .00 ajoutés
          status = 'error';
          issues.push('VALUE_NOT_MATCHING_RAW: Le parseur n\'a pas pu lire la valeur, et les chiffres ne correspondent pas.');
        } else {
          status = 'warning';
          issues.push(`Le parseur n'a pas pu valider de façon certaine. Chiffres bruts: ${rawDigits}`);
        }
      } else if (!isDerivedSiren) {
        status = 'warning';
        issues.push(`Interprétation divergente. Imprimé: "${field.raw}", lu par le code: "${parsed}", renvoyé par l'IA: "${field.value}"`);
      }
    }

    // 3. Ambiguïté et Notes
    if (field.ambiguous || isDerivedSiren) {
      status = status === 'error' ? 'error' : 'warning';
      if (isDerivedSiren) {
        // Si c'est un SIREN déduit, on l'affiche proprement en note, pas en issue.
        // On n'ajoute pas d'issue pour ça. L'avertissement viendra du fait que field.note sera affiché par l'UI.
      } else {
        issues.push(`Lecture ambiguë par l'IA: ${field.note || ''}`);
      }
    }

    if (status === 'error') hasError = true;
    if (status === 'warning') hasWarning = true;

    fields[path] = {
      status,
      value: field.value,
      raw: field.raw,
      quote: field.quote,
      printedLabel: field.printedLabel,
      note: field.note,
      issues
    };
  }

  // Déduction du SIREN à partir du SIRET si le SIREN est manquant
  if ((!draft.seller.siren || !draft.seller.siren.value) && draft.seller.siret && draft.seller.siret.value) {
    const cleanSiret = draft.seller.siret.value.replace(/\D/g, '');
    if (cleanSiret.length >= 9) {
      draft.seller.siren = {
        ...draft.seller.siret,
        value: cleanSiret.substring(0, 9),
        note: (draft.seller.siret.note ? draft.seller.siret.note + ' ' : '') + '(Déduit depuis le SIRET)'
      };
    }
  }

  if ((!draft.buyer.siren || !draft.buyer.siren.value) && draft.buyer.siret && draft.buyer.siret.value) {
    const cleanSiret = draft.buyer.siret.value.replace(/\D/g, '');
    if (cleanSiret.length >= 9) {
      draft.buyer.siren = {
        ...draft.buyer.siret,
        value: cleanSiret.substring(0, 9),
        note: (draft.buyer.siret.note ? draft.buyer.siret.note + ' ' : '') + '(Déduit depuis le SIRET)'
      };
    }
  }

  // Champs racine
  verifyField('invoiceNumber', draft.invoiceNumber, 'string');
  verifyField('issueDate', draft.issueDate, 'date');
  verifyField('dueDate', draft.dueDate, 'date');
  verifyField('deliveryDate', draft.deliveryDate, 'date');
  verifyField('currency', draft.currency, 'string');
  verifyField('operationCategory', draft.operationCategory, 'string');
  verifyField('vatOnDebits', draft.vatOnDebits, 'string');

  // Parties
  verifyField('seller.name', draft.seller.name, 'string');
  verifyField('seller.siren', draft.seller.siren, 'identifier');
  verifyField('seller.siret', draft.seller.siret, 'identifier');
  verifyField('seller.vatId', draft.seller.vatId, 'identifier');
  verifyField('seller.legalForm', draft.seller.legalForm, 'string');
  verifyField('seller.addressLine1', draft.seller.addressLine1, 'string');
  verifyField('seller.postalCode', draft.seller.postalCode, 'string');
  verifyField('seller.city', draft.seller.city, 'string');
  verifyField('seller.country', draft.seller.country, 'string');

  verifyField('buyer.name', draft.buyer.name, 'string');
  verifyField('buyer.siren', draft.buyer.siren, 'identifier');
  verifyField('buyer.siret', draft.buyer.siret, 'identifier');
  verifyField('buyer.vatId', draft.buyer.vatId, 'identifier');
  verifyField('buyer.legalForm', draft.buyer.legalForm, 'string');
  verifyField('buyer.addressLine1', draft.buyer.addressLine1, 'string');
  verifyField('buyer.postalCode', draft.buyer.postalCode, 'string');
  verifyField('buyer.city', draft.buyer.city, 'string');
  verifyField('buyer.country', draft.buyer.country, 'string');

  // Lignes
  (draft.lines || []).forEach((line, i) => {
    verifyField(`lines.${i}.description`, line.description, 'string');
    verifyField(`lines.${i}.quantity`, line.quantity, 'string');
    verifyField(`lines.${i}.unit`, line.unit, 'string');
    verifyField(`lines.${i}.unitPriceNet`, line.unitPriceNet, 'amount');
    verifyField(`lines.${i}.vatCategory`, line.vatCategory, 'string');
    verifyField(`lines.${i}.vatRate`, line.vatRate, 'string');
    verifyField(`lines.${i}.lineNetAmount`, line.lineNetAmount, 'amount');
  });

  // TVA
  (draft.vatBreakdown || []).forEach((vat, i) => {
    verifyField(`vatBreakdown.${i}.category`, vat.category, 'string');
    verifyField(`vatBreakdown.${i}.rate`, vat.rate, 'string');
    verifyField(`vatBreakdown.${i}.taxableAmount`, vat.taxableAmount, 'amount');
    verifyField(`vatBreakdown.${i}.vatAmount`, vat.vatAmount, 'amount');
  });

  // Totaux
  verifyField('totals.excludingVat', draft.totals.excludingVat, 'amount');
  verifyField('totals.vatTotal', draft.totals.vatTotal, 'amount');
  verifyField('totals.includingVat', draft.totals.includingVat, 'amount');
  verifyField('totals.amountDue', draft.totals.amountDue, 'amount');

  // Paiement
  if (draft.payment) {
    verifyField('payment.iban', draft.payment.iban, 'identifier');
    verifyField('payment.bic', draft.payment.bic, 'identifier');
    verifyField('payment.terms', draft.payment.terms, 'string');
  }

  // Notes
  (draft.legalNotes || []).forEach((note, i) => {
    verifyField(`notes.${i}`, note, 'string');
  });

  // Arithmétique
  const ht = fields['totals.excludingVat']?.value;
  const tva = fields['totals.vatTotal']?.value;
  const ttc = fields['totals.includingVat']?.value;

  if (ht && tva && ttc && fields['totals.includingVat']!.status !== 'error') {
    const calcTtc = new Decimal(ht).plus(new Decimal(tva));
    if (!calcTtc.equals(new Decimal(ttc))) {
      fields['totals.includingVat']!.status = 'error';
      fields['totals.includingVat']!.issues.push(`Erreur arithmétique: HT (${ht}) + TVA (${tva}) = ${calcTtc.toFixed(2)}, mais TTC lu = ${ttc}`);
      hasError = true;
    }
  }

  // Cohérence SIREN
  const s1 = fields['seller.siren']?.value;
  const s2 = fields['buyer.siren']?.value;
  if (s1 && s2 && s1 === s2) {
    fields['buyer.siren']!.status = 'error';
    fields['buyer.siren']!.issues.push('Le SIREN acheteur est identique au vendeur.');
    hasError = true;
  }

  return {
    globalStatus: hasError ? 'error' : hasWarning ? 'warning' : 'success',
    fields,
    data: draft
  };
}
