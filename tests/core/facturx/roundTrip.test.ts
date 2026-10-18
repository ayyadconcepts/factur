import { describe, it, expect, beforeAll } from 'vitest';
import { generateFacturxDocument } from '../../../src/core/facturx/roundTrip';
import { engine } from '../../../src/core/facturx/engine';
import { Invoice } from '../../../src/core/domain/invoice';
import fs from 'fs';
import path from 'path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

describe('roundTrip (Mode Fidèle)', () => {
  beforeAll(async () => {
    // Wait for engine initialization if any... (not needed for wasm usually)
  });

  const validInvoice: Invoice = {
    profile: 'EN16931',
    number: 'FA-2026-10-0042',
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
      address: { line1: '12 Rue de la Paix', postalCode: '75002', city: 'Paris', country: 'FR' }
    },
    buyer: {
      name: 'ATELIER DU DIGITAL SARL',
      siren: '912345675',
      address: { line1: '45 Avenue', postalCode: '69007', city: 'Lyon', country: 'FR' }
    },
    lines: [
      { id: '1', name: "Ligne 1", quantity: '1', unit: 'C62', unitPriceNet: '1200.00', lineNetAmount: '1200.00', vat: { category: 'S', percent: '20.00' } }
    ],
    vatBreakdown: [
      { category: 'S', percent: '20.00', taxableAmount: '1200.00', taxAmount: '240.00' }
    ],
    totals: { lineNet: '1200.00', taxExclusive: '1200.00', taxTotal: '240.00', taxInclusive: '1440.00', payable: '1440.00' },
    payment: { meansCode: '30' },
    notes: []
  };

  it('intègre le XML dans le PDF original et conserve le texte visible', async () => {
    const iccProfileBytes = fs.readFileSync(path.join(__dirname, '../../../assets/icc/sRGB.icc'));
    
    // Create a clean dummy PDF
    const { PDFDocument, rgb } = require('pdf-lib');
    const pdfDocRaw = await PDFDocument.create();
    const p = pdfDocRaw.addPage([595.28, 841.89]);
    p.drawText("FACTURE Numéro : FA-2026-10-0042", { x: 50, y: 800, size: 20, color: rgb(0,0,0) });
    p.drawText("Total Hors Taxes: 1200.00", { x: 50, y: 700, size: 12 });
    const cleanPdfBytes = await pdfDocRaw.save();
    
    const result = await generateFacturxDocument({
      invoice: validInvoice,
      sourcePdfBytes: cleanPdfBytes,
      iccProfileBytes: new Uint8Array(iccProfileBytes)
    });

    expect(result.xmlValid).toBe(true);

    // Verify XML is extractable
    const extractedXml = await engine.extractXml(result.pdfBytes);
    expect(extractedXml).toContain('<ram:ID>FA-2026-10-0042</ram:ID>');
    
    // Verify visible text is unchanged (doesn't contain English invoice stub words)
    // We can use pdfjs-dist to extract text
    const loadingTask = getDocument({ data: new Uint8Array(result.pdfBytes) });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1);
    const content = await page.getTextContent();
    const text = content.items.map((i: any) => i.str).join(' ');
    
    expect(text.toLowerCase()).toContain('total hors taxes');
    expect(text.toLowerCase()).toContain('facture numéro');
    
    // The original invoice shouldn't contain English words from the fallback template
    expect(text.toLowerCase()).not.toContain('tax exclusive total');
    expect(text.toLowerCase()).not.toContain('seller');
    expect(text.toLowerCase()).not.toContain('buyer');

    // To check XMP for PDF/A-3B, we can look at the raw bytes
    const pdfString = Buffer.from(result.pdfBytes).toString('utf-8');
    expect(pdfString).toContain('<pdfaid:part>3</pdfaid:part>');
    expect(pdfString).toContain('<pdfaid:conformance>B</pdfaid:conformance>');
  }, 10000);
});
