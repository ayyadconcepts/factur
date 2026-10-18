import { describe, it, expect } from 'vitest';
import { generateFacturxDocument } from '../../../src/core/facturx/roundTrip';
import { Invoice } from '../../../src/core/domain/invoice';
import fs from 'fs';
import path from 'path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

describe('renderInvoicePdf (Mode Garanti)', () => {
  const validInvoice: Invoice = {
    profile: 'EN16931',
    number: 'FA-2026-10-0043',
    typeCode: '380',
    issueDate: '2026-10-08',
    deliveryDate: '2026-10-05',
    dueDate: '2026-11-07',
    currency: 'EUR',
    operationCategory: 'services',
    vatOnDebits: false,
    seller: {
      name: 'TECH LAB SOLUTIONS SAS',
      siren: '834567893',
      vatId: 'FR12834567893',
      address: { line1: '12 Rue de la Paix', postalCode: '75002', city: 'Paris', country: 'FR' }
    },
    buyer: {
      name: 'ATELIER DU DIGITAL SARL',
      siren: '912345675',
      address: { line1: '45 Avenue', postalCode: '69007', city: 'Lyon', country: 'FR' }
    },
    lines: [
      { id: '1', name: "Ligne 1", quantity: '1.00', unit: 'C62', unitPriceNet: '1200.00', lineNetAmount: '1200.00', vat: { category: 'S', percent: '20.00' } }
    ],
    vatBreakdown: [
      { category: 'S', percent: '20.00', taxableAmount: '1200.00', taxAmount: '240.00' }
    ],
    totals: { lineNet: '1200.00', taxExclusive: '1200.00', taxTotal: '240.00', taxInclusive: '1440.00', payable: '1440.00' },
    payment: { meansCode: '30' },
    notes: []
  };

  it('génère un PDF français sans termes anglais', async () => {
    const iccProfileBytes = fs.readFileSync(path.join(__dirname, '../../../assets/icc/sRGB.icc'));
    const fontBytes = fs.readFileSync(path.join(__dirname, '../../../assets/fonts/Roboto-Regular.ttf'));
    const boldFontBytes = fs.readFileSync(path.join(__dirname, '../../../assets/fonts/Roboto-Bold.ttf'));
    
    const result = await generateFacturxDocument({
      invoice: validInvoice,
      iccProfileBytes: new Uint8Array(iccProfileBytes),
      fontBytes: new Uint8Array(fontBytes),
      boldFontBytes: new Uint8Array(boldFontBytes)
    });

    expect(result.xmlValid).toBe(true);
    
    const loadingTask = getDocument({ data: new Uint8Array(result.pdfBytes) });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1);
    const content = await page.getTextContent();
    const text = content.items.map((i: any) => i.str).join(' ');
    
    // Check French terms
    expect(text).toContain('FACTURE N° FA-2026-10-0043');
    expect(text).toContain('ÉMETTEUR');
    expect(text).toContain('CLIENT');
    expect(text).toContain('Désignation');
    expect(text).toContain('Total HT');
    expect(text).toContain('Net à payer');
    expect(text).toContain('Prestation de services');
    
    // Verify NOT English
    expect(text.toLowerCase()).not.toContain('tax exclusive total');
    expect(text.toLowerCase()).not.toContain('seller');
    expect(text.toLowerCase()).not.toContain('buyer');
    expect(text.toLowerCase()).not.toContain('invoice:');
  }, 10000);
});
