import { describe, it, expect } from 'vitest';
import { convertDraftToInvoice } from '@/server/bulk/convertDraftToInvoice';
import { createZipArchive } from '@/server/bulk/createBatchZip';
import { toCii } from '@/core/facturx/toCii';
import type { LlmInvoiceDraft } from '@/server/extract/schema';

describe('Bulk conversion pipeline', () => {
  it('correctly converts draft to valid EN16931 invoice with French date and harmonized totals', () => {
    const draft: LlmInvoiceDraft = {
      documentType: 'invoice',
      invoiceNumber: { value: 'INV-2024-001', confidence: 0.99 },
      issueDate: { value: '15/10/2024', confidence: 0.95 },
      dueDate: { value: '15/11/2024', confidence: 0.95 },
      seller: {
        name: { value: 'Acme Corp SAS', confidence: 0.9 },
        siren: { value: '732829320', confidence: 0.9 },
        siret: { value: '73282932000074', confidence: 0.9 },
        vatId: { value: 'FR32732829320', confidence: 0.9 },
        addressLine1: { value: '10 rue de la Paix', confidence: 0.9 },
        postalCode: { value: '75002', confidence: 0.9 },
        city: { value: 'Paris', confidence: 0.9 },
      },
      buyer: {
        name: { value: 'Client XYZ SARL', confidence: 0.9 },
        siren: { value: '802070102', confidence: 0.9 },
        addressLine1: { value: '5 avenue Montaigne', confidence: 0.9 },
        postalCode: { value: '75008', confidence: 0.9 },
        city: { value: 'Paris', confidence: 0.9 },
      },
      lines: [
        {
          description: { value: 'Consulting IT' },
          quantity: { value: '2.00' },
          unitPriceNet: { value: '500.00' },
          lineNetAmount: { value: '1000.00' },
          vatRate: { value: '20.00' },
          vatCategory: { value: 'S' },
        },
        {
          description: { value: 'Hébergement Cloud' },
          quantity: { value: '1.00' },
          unitPriceNet: { value: '200.00' },
          lineNetAmount: { value: '200.00' },
          vatRate: { value: '20.00' },
          vatCategory: { value: 'S' },
        },
      ],
      totals: {
        excludingVat: { value: '1200.00' },
        vatTotal: { value: '240.00' },
        includingVat: { value: '1440.00' },
      },
    };

    const invoice = convertDraftToInvoice(draft);

    expect(invoice.number).toBe('INV-2024-001');
    expect(invoice.issueDate).toBe('2024-10-15');
    expect(invoice.dueDate).toBe('2024-11-15');
    expect(invoice.totals.taxExclusive).toBe('1200.00');
    expect(invoice.totals.taxTotal).toBe('240.00');
    expect(invoice.totals.taxInclusive).toBe('1440.00');
    expect(invoice.lines).toHaveLength(2);
    expect(invoice.vatBreakdown).toHaveLength(1);
    expect(invoice.vatBreakdown[0]?.taxableAmount).toBe('1200.00');
    expect(invoice.vatBreakdown[0]?.taxAmount).toBe('240.00');

    // Vérifier que le XML CII généré est conforme sans erreur de champs obligatoires
    const xml = toCii(invoice);
    expect(xml).toContain('INV-2024-001');
    expect(xml).toContain('20241015');
    expect(xml).toContain('1200.00');
    expect(xml).toContain('1440.00');
  });

  it('handles empty / sparse drafts with robust fallbacks', () => {
    const sparseDraft: LlmInvoiceDraft = {
      documentType: 'invoice',
    };

    const invoice = convertDraftToInvoice(sparseDraft);

    expect(invoice.number).toMatch(/^FACT-\d+/);
    expect(invoice.issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(invoice.seller.name).toBe('Fournisseur');
    expect(invoice.seller.siren).toBe('000000000');
    expect(invoice.lines).toHaveLength(1);
    expect(invoice.lines[0]?.unitPriceNet).toBe('0.00');
    expect(invoice.totals.taxExclusive).toBe('0.00');
    expect(invoice.totals.taxInclusive).toBe('0.00');

    const xml = toCii(invoice);
    expect(xml).toContain('rsm:CrossIndustryInvoice');
  });

  it('creates a valid ZIP archive from files in memory', async () => {
    const files = [
      { name: 'facture-1.pdf', bytes: new Uint8Array([37, 80, 68, 70, 45, 49, 46, 55]) }, // %PDF-1.7
      { name: 'facture-2.pdf', bytes: new Uint8Array([37, 80, 68, 70, 45, 49, 46, 55]) },
      { name: 'rapport.txt', bytes: new TextEncoder().encode('Rapport du lot OK') },
    ];

    const zipBytes = await createZipArchive(files);

    expect(zipBytes).toBeInstanceOf(Uint8Array);
    expect(zipBytes.length).toBeGreaterThan(100);
    // Header PK (0x50, 0x4B)
    expect(zipBytes[0]).toBe(0x50);
    expect(zipBytes[1]).toBe(0x4B);
  });
});
