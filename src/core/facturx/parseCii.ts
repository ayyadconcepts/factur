import { create } from 'xmlbuilder2';

export interface ParsedParty {
  name: string;
  siren?: string;
  siret?: string;
  vatId?: string;
  address: {
    line1?: string;
    line2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
}

export interface ParsedLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalHt: number;
  vatRate: number;
}

export interface ParsedTotals {
  totalHt: number;
  totalVat: number;
  totalTtc: number;
  duePayable: number;
}

export interface ParsedVatBreakdown {
  category: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface ParsedCiiInvoice {
  profile: string;
  guideline: string;
  number: string;
  typeCode: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  notes: string[];
  seller: ParsedParty;
  buyer: ParsedParty;
  totals: ParsedTotals;
  lines: ParsedLineItem[];
  vatBreakdown: ParsedVatBreakdown[];
}

function getText(val: any): string {
  if (val === undefined || val === null) return '';
  if (typeof val === 'string' || typeof val === 'number') return String(val).trim();
  if (typeof val === 'object' && val['#'] !== undefined) return String(val['#']).trim();
  return '';
}

function getArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

export function parseCii(xmlString: string): ParsedCiiInvoice {
  const doc = create(xmlString);
  const obj = doc.toObject() as any;
  const cii = obj['rsm:CrossIndustryInvoice'] || obj['CrossIndustryInvoice'] || {};

  // 1. Profil & Contexte
  const context = cii['rsm:ExchangedDocumentContext'] || cii['ExchangedDocumentContext'] || {};
  const guidelineParam = context['ram:GuidelineSpecifiedDocumentContextParameter'] 
    || context['GuidelineSpecifiedDocumentContextParameter'] || {};
  const guideline = getText(guidelineParam['ram:ID'] || guidelineParam['ID'] || '');

  let profile = 'EN 16931';
  const gLower = guideline.toLowerCase();
  if (gLower.includes('minimum')) profile = 'MINIMUM';
  else if (gLower.includes('basicwl') || gLower.includes('basic-wl')) profile = 'BASIC WL';
  else if (gLower.includes('basic')) profile = 'BASIC';
  else if (gLower.includes('extended')) profile = 'EXTENDED';
  else if (gLower.includes('en16931')) profile = 'EN 16931';

  // 2. Document d'échange
  const exchangedDoc = cii['rsm:ExchangedDocument'] || cii['ExchangedDocument'] || {};
  const number = getText(exchangedDoc['ram:ID'] || exchangedDoc['ID'] || '');
  const typeCode = getText(exchangedDoc['ram:TypeCode'] || exchangedDoc['TypeCode'] || '380');
  
  const issueDateNode = exchangedDoc['ram:IssueDateTime'] || exchangedDoc['IssueDateTime'] || {};
  const issueDateRaw = getText(issueDateNode['udt:DateTimeString'] || issueDateNode['DateTimeString'] || '');
  let issueDate = issueDateRaw;
  if (issueDateRaw.length === 8 && /^\d{8}$/.test(issueDateRaw)) {
    issueDate = `${issueDateRaw.slice(0, 4)}-${issueDateRaw.slice(4, 6)}-${issueDateRaw.slice(6, 8)}`;
  }

  const rawNotes = getArray(exchangedDoc['ram:IncludedNote'] || exchangedDoc['IncludedNote']);
  const notes = rawNotes
    .map((n: any) => getText(n['ram:Content'] || n['Content'] || n))
    .filter(Boolean);

  // 3. Transaction
  const transaction = cii['rsm:SupplyChainTradeTransaction'] || cii['SupplyChainTradeTransaction'] || {};

  // Partenaires (Seller & Buyer)
  const agreement = transaction['ram:ApplicableHeaderTradeAgreement'] || transaction['ApplicableHeaderTradeAgreement'] || {};
  const sellerParty = agreement['ram:SellerTradeParty'] || agreement['SellerTradeParty'] || {};
  const buyerParty = agreement['ram:BuyerTradeParty'] || agreement['BuyerTradeParty'] || {};

  const parseParty = (partyNode: any): ParsedParty => {
    const name = getText(partyNode['ram:Name'] || partyNode['Name'] || '');
    
    // Legal organization ID (SIREN ou SIRET)
    const legalOrg = partyNode['ram:SpecifiedLegalOrganization'] || partyNode['SpecifiedLegalOrganization'] || {};
    const legalId = getText(legalOrg['ram:ID'] || legalOrg['ID'] || '');
    
    const taxReg = partyNode['ram:SpecifiedTaxRegistration'] || partyNode['SpecifiedTaxRegistration'] || {};
    const vatId = getText(taxReg['ram:ID'] || taxReg['ID'] || '');

    const addr = partyNode['ram:PostalTradeAddress'] || partyNode['PostalTradeAddress'] || {};
    const line1 = getText(addr['ram:LineOne'] || addr['LineOne'] || '');
    const line2 = getText(addr['ram:LineTwo'] || addr['LineTwo'] || '');
    const postalCode = getText(addr['ram:PostcodeCode'] || addr['PostcodeCode'] || '');
    const city = getText(addr['ram:CityName'] || addr['CityName'] || '');
    const country = getText(addr['ram:CountryID'] || addr['CountryID'] || 'FR');

    let siren = '';
    let siret = '';
    if (legalId.length === 14) {
      siret = legalId;
      siren = legalId.slice(0, 9);
    } else if (legalId.length === 9) {
      siren = legalId;
    } else if (legalId) {
      siren = legalId;
    }

    return {
      name,
      ...(siren ? { siren } : {}),
      ...(siret ? { siret } : {}),
      ...(vatId ? { vatId } : {}),
      address: {
        ...(line1 ? { line1 } : {}),
        ...(line2 ? { line2 } : {}),
        ...(postalCode ? { postalCode } : {}),
        ...(city ? { city } : {}),
        country,
      },
    };
  };

  const seller = parseParty(sellerParty);
  const buyer = parseParty(buyerParty);

  // Règlement & Totaux
  const settlement = transaction['ram:ApplicableHeaderTradeSettlement'] || transaction['ApplicableHeaderTradeSettlement'] || {};
  const currency = getText(settlement['ram:InvoiceCurrencyCode'] || settlement['InvoiceCurrencyCode'] || 'EUR');
  
  // Date d'échéance éventuelle
  const paymentTerms = settlement['ram:SpecifiedTradePaymentTerms'] || settlement['SpecifiedTradePaymentTerms'] || {};
  const dueDateNode = paymentTerms['ram:DueDateDateTime'] || paymentTerms['DueDateDateTime'] || {};
  const dueDateRaw = getText(dueDateNode['udt:DateTimeString'] || dueDateNode['DateTimeString'] || '');
  let dueDate: string | undefined = undefined;
  if (dueDateRaw && dueDateRaw.length === 8 && /^\d{8}$/.test(dueDateRaw)) {
    dueDate = `${dueDateRaw.slice(0, 4)}-${dueDateRaw.slice(4, 6)}-${dueDateRaw.slice(6, 8)}`;
  } else if (dueDateRaw) {
    dueDate = dueDateRaw;
  }

  const summation = settlement['ram:SpecifiedTradeSettlementHeaderMonetarySummation'] 
    || settlement['SpecifiedTradeSettlementHeaderMonetarySummation'] || {};

  const totalHt = Number(getText(summation['ram:LineTotalAmount'] || summation['ram:TaxBasisTotalAmount'] || summation['LineTotalAmount'] || summation['TaxBasisTotalAmount'] || 0)) || 0;
  const totalVat = Number(getText(summation['ram:TaxTotalAmount'] || summation['TaxTotalAmount'] || 0)) || 0;
  const totalTtc = Number(getText(summation['ram:GrandTotalAmount'] || summation['GrandTotalAmount'] || (totalHt + totalVat))) || 0;
  const duePayable = Number(getText(summation['ram:DuePayableAmount'] || summation['DuePayableAmount'] || totalTtc)) || 0;

  const totals: ParsedTotals = {
    totalHt,
    totalVat,
    totalTtc,
    duePayable,
  };

  // Ventilation TVA
  const rawTaxes = getArray(settlement['ram:ApplicableTradeTax'] || settlement['ApplicableTradeTax']);
  const vatBreakdown: ParsedVatBreakdown[] = rawTaxes.map((t: any) => ({
    category: getText(t['ram:CategoryCode'] || t['CategoryCode'] || 'S'),
    rate: Number(getText(t['ram:RateApplicablePercent'] || t['RateApplicablePercent'] || 0)) || 0,
    taxableAmount: Number(getText(t['ram:BasisAmount'] || t['BasisAmount'] || 0)) || 0,
    taxAmount: Number(getText(t['ram:CalculatedAmount'] || t['CalculatedAmount'] || 0)) || 0,
  }));

  // Lignes de facture
  const rawLines = getArray(transaction['ram:IncludedSupplyChainTradeLineItem'] || transaction['IncludedSupplyChainTradeLineItem']);
  const lines: ParsedLineItem[] = rawLines.map((l: any, idx: number) => {
    const docLine = l['ram:AssociatedDocumentLineDocument'] || l['AssociatedDocumentLineDocument'] || {};
    const product = l['ram:SpecifiedTradeProduct'] || l['SpecifiedTradeProduct'] || {};
    const agreementLine = l['ram:SpecifiedLineTradeAgreement'] || l['SpecifiedLineTradeAgreement'] || {};
    const deliveryLine = l['ram:SpecifiedLineTradeDelivery'] || l['SpecifiedLineTradeDelivery'] || {};
    const settlementLine = l['ram:SpecifiedLineTradeSettlement'] || l['SpecifiedLineTradeSettlement'] || {};
    const lineSummation = settlementLine['ram:SpecifiedTradeSettlementLineMonetarySummation'] 
      || settlementLine['SpecifiedTradeSettlementLineMonetarySummation'] || {};
    const tax = settlementLine['ram:ApplicableTradeTax'] || settlementLine['ApplicableTradeTax'] || {};

    const priceNode = agreementLine['ram:NetPriceProductTradePrice'] || agreementLine['NetPriceProductTradePrice'] || {};

    return {
      id: getText(docLine['ram:LineID'] || docLine['LineID'] || String(idx + 1)),
      description: getText(product['ram:Name'] || product['Name'] || 'Article'),
      quantity: Number(getText(deliveryLine['ram:BilledQuantity'] || deliveryLine['BilledQuantity'] || 1)) || 1,
      unitPrice: Number(getText(priceNode['ram:ChargeAmount'] || priceNode['ChargeAmount'] || 0)) || 0,
      totalHt: Number(getText(lineSummation['ram:LineTotalAmount'] || lineSummation['LineTotalAmount'] || 0)) || 0,
      vatRate: Number(getText(tax['ram:RateApplicablePercent'] || tax['RateApplicablePercent'] || 0)) || 0,
    };
  });

  return {
    profile,
    guideline,
    number,
    typeCode,
    issueDate,
    ...(dueDate ? { dueDate } : {}),
    currency,
    notes,
    seller,
    buyer,
    totals,
    lines,
    vatBreakdown,
  };
}
