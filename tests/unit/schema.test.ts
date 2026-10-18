import { describe, it, expect } from 'vitest';
import { parseInvoice } from '@/core/validation/schema';
import { toAmount, toDecimal4, ZERO_AMOUNT } from '@/core/domain/money';

describe('schema parsing', () => {
  const validData = {
    profile: 'EN16931',
    number: 'INV-123',
    typeCode: '380',
    issueDate: '2024-01-01',
    currency: 'EUR',
    seller: {
      name: 'Test Corp',
      siren: '552120222',
      vatId: 'FR27552120222',
      address: {
        line1: '1 Rue de la Paix',
        postalCode: '75000',
        city: 'Paris',
        country: 'FR'
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
        country: 'FR'
      },
      electronicAddress: {
        schemeId: '0002',
        value: '552120222'
      }
    },
    lines: [
      { id: '1', name: 'Service', quantity: toDecimal4('1'), unit: 'C62', unitPriceNet: toAmount('100'), lineNetAmount: toAmount('100'), vat: { category: 'S', percent: toDecimal4('20') } }
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

  it('should parse valid data successfully', () => {
    const result = parseInvoice(validData);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid data', () => {
    const invalidData = { ...validData, currency: 'USD' }; // Only EUR allowed
    const result = parseInvoice(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].code).toBe('SCHEMA_ERROR');
    }
  });

  it('should fail on improperly formatted branded types', () => {
    const invalidData = { ...validData, totals: { ...validData.totals, taxTotal: '20.000' } }; // Not exact 2 decimals
    const result = parseInvoice(invalidData);
    expect(result.success).toBe(false);
  });
});
