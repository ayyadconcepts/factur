import { describe, it, expect } from 'vitest';
import { renderInvoicePdf } from '../../src/core/facturx/renderInvoicePdf';
import { Invoice } from '../../src/core/domain/invoice';
import * as fs from 'fs';
import * as path from 'path';

describe('renderInvoicePdf', () => {
  it('should generate a non-empty Uint8Array', async () => {
    const invoice = {
      profile: 'EN16931',
      number: 'INV-123',
      typeCode: '380',
      issueDate: '2023-10-01',
      currency: 'EUR',
      seller: {
        name: 'Seller Company',
        siren: '123456789',
        address: { line1: '1 rue Seller', postalCode: '75001', city: 'Paris', country: 'FR' },
        electronicAddress: { schemeId: '0002', value: '123456789' }
      },
      buyer: {
        name: 'Buyer Company',
        siren: '987654321',
        address: { line1: '2 rue Buyer', postalCode: '69001', city: 'Lyon', country: 'FR' },
        electronicAddress: { schemeId: '0002', value: '987654321' }
      },
      lines: [
        {
          id: '1',
          name: 'Product 1',
          quantity: '2',
          unit: 'C62',
          unitPriceNet: '10.00',
          lineNetAmount: '20.00',
          vat: { category: 'S', percent: '20.00' }
        }
      ],
      vatBreakdown: [
        { category: 'S', percent: '20.00', taxableAmount: '20.00', taxAmount: '4.00' }
      ],
      totals: {
        lineNet: '20.00',
        taxExclusive: '20.00',
        taxTotal: '4.00',
        taxInclusive: '24.00',
        payable: '24.00'
      },
      payment: { meansCode: '30' },
      notes: []
    } as unknown as Invoice;

    const fontPath = path.resolve(__dirname, '../../assets/fonts/Roboto-Regular.ttf');
    const boldFontPath = path.resolve(__dirname, '../../assets/fonts/Roboto-Bold.ttf');

    const fontBytes = fs.readFileSync(fontPath);
    const boldFontBytes = fs.readFileSync(boldFontPath);

    const pdfBytes = await renderInvoicePdf(invoice, fontBytes, boldFontBytes);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);
  }, 20000);
});
