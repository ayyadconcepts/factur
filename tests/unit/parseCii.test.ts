import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { extract } from '@stafyniaksacha/facturx';
import { parseCii } from '@/core/facturx/parseCii';

describe('parseCii', () => {
  it('correctly extracts structured data from real Factur-X XML', async () => {
    const fixturePath = path.resolve(process.cwd(), 'tests/fixtures/pdf/facture-simple.pdf');
    const pdfBytes = fs.readFileSync(fixturePath);

    const { xml } = await extract({ pdf: pdfBytes });
    expect(xml).toBeDefined();

    const invoice = parseCii(xml);

    // Profile & Header
    expect(invoice.profile).toBe('EN 16931');
    expect(invoice.number).toBe('INV-123');
    expect(invoice.typeCode).toBe('380');
    expect(invoice.issueDate).toBe('2024-01-01');
    expect(invoice.currency).toBe('EUR');
    expect(invoice.notes).toContain('Merci pour votre confiance.');

    // Seller & Buyer
    expect(invoice.seller.name).toBe('Test Corp');
    expect(invoice.seller.siren).toBe('552120222');
    expect(invoice.seller.vatId).toBe('FR27552120222');
    expect(invoice.seller.address.city).toBe('Paris');

    expect(invoice.buyer.name).toBe('Client SARL');
    expect(invoice.buyer.siren).toBe('552120222');
    expect(invoice.buyer.address.city).toBe('Lyon');

    // Totals
    expect(invoice.totals.totalHt).toBe(100);
    expect(invoice.totals.totalVat).toBe(20);
    expect(invoice.totals.totalTtc).toBe(120);
    expect(invoice.totals.duePayable).toBe(120);

    // Lines
    expect(invoice.lines).toHaveLength(1);
    expect(invoice.lines[0]?.description).toBe('Service web');
    expect(invoice.lines[0]?.quantity).toBe(1);
    expect(invoice.lines[0]?.unitPrice).toBe(100);
    expect(invoice.lines[0]?.totalHt).toBe(100);
    expect(invoice.lines[0]?.vatRate).toBe(20);

    // VAT Breakdown
    expect(invoice.vatBreakdown).toHaveLength(1);
    expect(invoice.vatBreakdown[0]?.rate).toBe(20);
    expect(invoice.vatBreakdown[0]?.taxableAmount).toBe(100);
    expect(invoice.vatBreakdown[0]?.taxAmount).toBe(20);
  });
});
