import { describe, it, expect } from 'vitest';
import { toCii } from '@/core/facturx/toCii';
import { engine } from '@/core/facturx/engine';
import { Invoice } from '@/core/domain/invoice';
import { toAmount, toDecimal4, ZERO_AMOUNT } from '@/core/domain/money';
import { invoiceToXml } from '@stafyniaksacha/facturx';

describe('toCii', () => {
  it('should convert Invoice to valid CrossIndustryInvoiceType XML', async () => {
    const invoice: Invoice = {
      profile: 'EN16931',
      number: 'INV-123',
      typeCode: '380',
      issueDate: '2024-01-01' as any,
      currency: 'EUR' as any,
      seller: {
        name: 'Test Corp',
        siren: '552120222',
        vatId: 'FR27552120222',
        address: {
          line1: '1 Rue de la Paix',
          postalCode: '75000',
          city: 'Paris',
          country: 'FR' as any
        },
        electronicAddress: {
          schemeId: '0002',
          value: '552120222'
        }
      },
      buyer: {
        name: 'Test Corp',
        siren: '552120222',
        vatId: 'FR27552120222',
        address: {
          line1: '1 Rue de la Paix',
          postalCode: '75000',
          city: 'Paris',
          country: 'FR' as any
        },
        electronicAddress: {
          schemeId: '0002',
          value: '552120222'
        }
      },
      lines: [
        { id: '1', name: 'Service', quantity: toDecimal4('1'), unit: 'C62' as any, unitPriceNet: toDecimal4('100'), lineNetAmount: toAmount('100'), vat: { category: 'S', percent: toDecimal4('20') } }
      ],
      vatBreakdown: [
        { category: 'S', percent: toDecimal4('20'), taxableAmount: toAmount('100'), taxAmount: toAmount('20') }
      ],
      totals: {
        lineNet: toAmount('100'),
        taxExclusive: toAmount('100'),
        taxTotal: toAmount('20'),
        taxInclusive: toAmount('120'),
        payable: toAmount('120')
      },
      payment: {
        meansCode: '30'
      },
      notes: [
        { content: 'Notes' }
      ]
    };

    const xmlString = toCii(invoice);
    const result = await engine.checkXml(xmlString, 'en16931');
    if (!result.valid) {
      console.log('Validation errors:', JSON.stringify(result.errors, null, 2));
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
