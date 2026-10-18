import { describe, it, expect } from 'vitest';
import { verifyDraft } from '../../src/core/verify/verifyDraft';
import { LlmInvoiceDraft } from '../../src/server/extract/schema';
import { PdfTextItem } from '../../src/core/extraction/types';

describe('verifyDraft', () => {
  const dummyItems: PdfTextItem[] = [
    { str: 'Facture', page: 1, x: 10, y: 10, w: 10, h: 10 },
    { str: 'FA-2026-10', page: 1, x: 20, y: 10, w: 10, h: 10 },
    { str: '1 500,00 €', page: 1, x: 30, y: 10, w: 10, h: 10 },
  ];

  it('detects ungrounded quote', () => {
    const draft = {
      invoiceNumber: { value: 'FA-123', raw: 'FA-123', quote: 'Missing quote', printedLabel: null, ambiguous: false, note: null },
      totals: {},
      seller: {},
      buyer: {}
    } as LlmInvoiceDraft;

    const res = verifyDraft(draft, dummyItems);
    expect(res.fields['invoiceNumber'].status).toBe('error');
    expect(res.fields['invoiceNumber'].issues[0]).toMatch(/UNGROUNDED/);
  });

  it('detects incoherent raw and value', () => {
    const draft = {
      totals: {
        excludingVat: { value: '1.50', raw: '1 500,00 €', quote: '1 500,00 €', printedLabel: null, ambiguous: false, note: null }
      },
      invoiceNumber: null,
      seller: {},
      buyer: {}
    } as LlmInvoiceDraft;

    const res = verifyDraft(draft, dummyItems);
    expect(res.fields['totals.excludingVat'].status).toBe('warning');
    expect(res.fields['totals.excludingVat'].issues[0]).toMatch(/Interprétation divergente/);
  });

  it('handles ambiguous flag', () => {
    const draft = {
      totals: {
        excludingVat: { value: '1500.00', raw: '1 500,00 €', quote: '1 500,00 €', printedLabel: null, ambiguous: true, note: 'Two totals' }
      },
      invoiceNumber: null,
      seller: {},
      buyer: {}
    } as LlmInvoiceDraft;

    const res = verifyDraft(draft, dummyItems);
    expect(res.fields['totals.excludingVat'].status).toBe('warning');
    expect(res.fields['totals.excludingVat'].issues[0]).toMatch(/Lecture ambiguë/);
  });

  it('detects identical buyer and seller siren', () => {
    const draft = {
      seller: { siren: { value: '123456789', raw: '123456789', quote: '123456789', printedLabel: null, ambiguous: false, note: null } },
      buyer: { siren: { value: '123456789', raw: '123456789', quote: '123456789', printedLabel: null, ambiguous: false, note: null } },
      totals: {}
    } as LlmInvoiceDraft;
    
    // add items so they aren't ungrounded
    const items = [...dummyItems, { str: '123456789', page: 1, x: 10, y: 10, w: 10, h: 10 }];

    const res = verifyDraft(draft, items);
    expect(res.fields['buyer.siren'].status).toBe('error');
    expect(res.fields['buyer.siren'].issues[0]).toMatch(/identique/);
  });
});
