import { create } from 'xmlbuilder2';
import type { Invoice, Party, InvoiceLine, VatBreakdownLine } from '../domain/invoice';

export class MissingMandatoryFieldsError extends Error {
  constructor(public paths: string[]) {
    super(`Champs obligatoires manquants pour générer le XML : ${paths.join(', ')}`);
    this.name = 'MissingMandatoryFieldsError';
  }
}

function assertParty(party: Party, prefix: string, missing: string[]) {
  if (!party.name) missing.push(`${prefix}.name`);
  if (!party.siren) missing.push(`${prefix}.siren`);
  if (!party.address.line1) missing.push(`${prefix}.address.line1`);
  if (!party.address.postalCode) missing.push(`${prefix}.address.postalCode`);
  if (!party.address.city) missing.push(`${prefix}.address.city`);
  if (!party.address.country) missing.push(`${prefix}.address.country`);
}

export function toCii(invoice: Invoice): string {
  const missing: string[] = [];

  // Vérifications obligatoires (EN16931)
  if (!invoice.number) missing.push('number');
  if (!invoice.issueDate) missing.push('issueDate');
  if (!invoice.currency) missing.push('currency');
  assertParty(invoice.seller, 'seller', missing);
  assertParty(invoice.buyer, 'buyer', missing);
  
  if (!invoice.lines || invoice.lines.length === 0) missing.push('lines');
  if (!invoice.vatBreakdown || invoice.vatBreakdown.length === 0) missing.push('vatBreakdown');

  // Totaux obligatoires
  if (!invoice.totals.lineNet) missing.push('totals.lineNet');
  if (!invoice.totals.taxExclusive) missing.push('totals.taxExclusive');
  if (!invoice.totals.taxTotal) missing.push('totals.taxTotal');
  if (!invoice.totals.taxInclusive) missing.push('totals.taxInclusive');
  if (!invoice.totals.payable) missing.push('totals.payable');

  if (missing.length > 0) {
    throw new MissingMandatoryFieldsError(missing);
  }

  const profileGuideline = invoice.profile === 'EN16931'
    ? 'urn:cen.eu:en16931:2017'
    : 'urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:extended';

  const formatIsoDate = (dateStr: string) => dateStr.replace(/-/g, '');

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('rsm:CrossIndustryInvoice', {
      'xmlns:rsm': 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
      'xmlns:ram': 'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100',
      'xmlns:udt': 'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100'
    });

  // ExchangedDocumentContext
  root.ele('rsm:ExchangedDocumentContext')
    .ele('ram:GuidelineSpecifiedDocumentContextParameter')
      .ele('ram:ID').txt(profileGuideline).up()
    .up()
  .up();

  // ExchangedDocument
  const exchangedDoc = root.ele('rsm:ExchangedDocument')
    .ele('ram:ID').txt(invoice.number).up()
    .ele('ram:TypeCode').txt(invoice.typeCode).up()
    .ele('ram:IssueDateTime')
      .ele('udt:DateTimeString', { format: '102' }).txt(formatIsoDate(invoice.issueDate)).up()
    .up();

  invoice.notes.forEach(note => {
    if (note.content) {
      const n = exchangedDoc.ele('ram:IncludedNote');
      n.ele('ram:Content').txt(note.content).up();
      if (note.subjectCode) {
        n.ele('ram:SubjectCode').txt(note.subjectCode).up();
      }
      n.up();
    }
  });

  // TODO(spec): Mapping exact pour Nature de l'opération et TVA sur débits dans EN16931. 
  // En attendant, on les injecte sous forme de IncludedNote pour ne pas bloquer.
  if (invoice.operationCategory) {
    exchangedDoc.ele('ram:IncludedNote')
      .ele('ram:Content').txt(`Nature de l'opération : ${invoice.operationCategory}`).up()
      // .ele('ram:SubjectCode').txt('...').up()
    .up();
  }
  if (invoice.vatOnDebits) {
    exchangedDoc.ele('ram:IncludedNote')
      .ele('ram:Content').txt("Option pour le paiement de la taxe d'après les débits").up()
      // .ele('ram:SubjectCode').txt('TXD').up()
    .up();
  }

  exchangedDoc.up(); // End ExchangedDocument

  const transaction = root.ele('rsm:SupplyChainTradeTransaction');

  // Lines
  invoice.lines.forEach((line, idx) => {
    const l = transaction.ele('ram:IncludedSupplyChainTradeLineItem')
      .ele('ram:AssociatedDocumentLineDocument')
        .ele('ram:LineID').txt(line.id || String(idx + 1)).up()
      .up()
      .ele('ram:SpecifiedTradeProduct')
        .ele('ram:Name').txt(line.name).up();
        // Optionnel: Description
        // if (line.description) l.ele('ram:Description').txt(line.description).up();
      l.up()
      .ele('ram:SpecifiedLineTradeAgreement')
        .ele('ram:NetPriceProductTradePrice')
          .ele('ram:ChargeAmount').txt(line.unitPriceNet).up()
        .up()
      .up()
      .ele('ram:SpecifiedLineTradeDelivery')
        .ele('ram:BilledQuantity', { unitCode: line.unit }).txt(line.quantity).up()
      .up()
      .ele('ram:SpecifiedLineTradeSettlement')
        .ele('ram:ApplicableTradeTax')
          .ele('ram:TypeCode').txt('VAT').up()
          .ele('ram:CategoryCode').txt(line.vat.category).up()
          .ele('ram:RateApplicablePercent').txt(line.vat.percent).up()
        .up()
        .ele('ram:SpecifiedTradeSettlementLineMonetarySummation')
          .ele('ram:LineTotalAmount').txt(line.lineNetAmount).up()
        .up()
      .up()
    .up();
  });

  // HeaderTradeAgreement
  const agreement = transaction.ele('ram:ApplicableHeaderTradeAgreement');
  
  const buildParty = (parent: any, party: Party, tag: string) => {
    const p = parent.ele(tag)
      .ele('ram:Name').txt(party.name).up();
    
    if (party.siren) {
      p.ele('ram:SpecifiedLegalOrganization')
        .ele('ram:ID', { schemeID: '0002' }).txt(party.siren).up()
      .up();
    }
    
    const addr = p.ele('ram:PostalTradeAddress');
    addr.ele('ram:PostcodeCode').txt(party.address.postalCode).up();
    addr.ele('ram:LineOne').txt(party.address.line1).up();
    if (party.address.line2) {
      addr.ele('ram:LineTwo').txt(party.address.line2).up();
    }
    addr.ele('ram:CityName').txt(party.address.city).up();
    addr.ele('ram:CountryID').txt(party.address.country).up();
    addr.up(); // PostalTradeAddress

    if (party.electronicAddress?.schemeId && party.electronicAddress?.value) {
      p.ele('ram:URIUniversalCommunication')
        .ele('ram:URIID', { schemeID: party.electronicAddress.schemeId }).txt(party.electronicAddress.value).up()
      .up();
    }

    if (party.vatId) {
      p.ele('ram:SpecifiedTaxRegistration')
        .ele('ram:ID', { schemeID: 'VA' }).txt(party.vatId).up()
      .up();
    }
    p.up();
  };

  buildParty(agreement, invoice.seller, 'ram:SellerTradeParty');
  buildParty(agreement, invoice.buyer, 'ram:BuyerTradeParty');
  agreement.up();

  // HeaderTradeDelivery
  const delivery = transaction.ele('ram:ApplicableHeaderTradeDelivery');
  if (invoice.deliveryDate) {
    delivery.ele('ram:ActualDeliverySupplyChainEvent')
      .ele('ram:OccurrenceDateTime')
        .ele('udt:DateTimeString', { format: '102' }).txt(formatIsoDate(invoice.deliveryDate)).up()
      .up()
    .up();
  }
  delivery.up();

  // HeaderTradeSettlement
  const settlement = transaction.ele('ram:ApplicableHeaderTradeSettlement')
    .ele('ram:InvoiceCurrencyCode').txt(invoice.currency).up();
  
  // Payment means
  if (invoice.payment.meansCode || invoice.payment.iban || invoice.payment.bic) {
    const means = settlement.ele('ram:SpecifiedTradeSettlementPaymentMeans');
    // Code par défaut "30" (virement) si absent
    means.ele('ram:TypeCode').txt(invoice.payment.meansCode || '30').up();
    
    if (invoice.payment.iban) {
      means.ele('ram:PayeePartyCreditorFinancialAccount')
        .ele('ram:ProprietaryID').txt(invoice.payment.iban).up()
      .up();
    }
    if (invoice.payment.bic) {
      means.ele('ram:PayeeSpecifiedCreditorFinancialInstitution')
        .ele('ram:BICID').txt(invoice.payment.bic).up()
      .up();
    }
    means.up();
  }

  // VAT Breakdown
  invoice.vatBreakdown.forEach(vat => {
    const tax = settlement.ele('ram:ApplicableTradeTax')
      .ele('ram:CalculatedAmount').txt(vat.taxAmount).up()
      .ele('ram:TypeCode').txt('VAT').up();
      
    if (vat.exemptionReason) {
      tax.ele('ram:ExemptionReason').txt(vat.exemptionReason).up();
    }
      
    tax.ele('ram:BasisAmount').txt(vat.taxableAmount).up()
      .ele('ram:CategoryCode').txt(vat.category).up()
      .ele('ram:RateApplicablePercent').txt(vat.percent).up()
    .up();
  });

  // Due Date & Terms
  if (invoice.dueDate || invoice.payment.terms) {
    const terms = settlement.ele('ram:SpecifiedTradePaymentTerms');
    if (invoice.payment.terms) {
      terms.ele('ram:Description').txt(invoice.payment.terms).up();
    }
    if (invoice.dueDate) {
      terms.ele('ram:DueDateDateTime')
        .ele('udt:DateTimeString', { format: '102' }).txt(formatIsoDate(invoice.dueDate)).up();
    }
    terms.up();
  }

  // Totals
  settlement.ele('ram:SpecifiedTradeSettlementHeaderMonetarySummation')
    .ele('ram:LineTotalAmount').txt(invoice.totals.lineNet).up()
    .ele('ram:TaxBasisTotalAmount').txt(invoice.totals.taxExclusive).up()
    .ele('ram:TaxTotalAmount', { currencyID: invoice.currency }).txt(invoice.totals.taxTotal).up()
    .ele('ram:GrandTotalAmount').txt(invoice.totals.taxInclusive).up()
    .ele('ram:DuePayableAmount').txt(invoice.totals.payable).up()
  .up();

  settlement.up(); // End HeaderTradeSettlement
  transaction.up(); // End SupplyChainTradeTransaction

  return root.end({ prettyPrint: true });
}
