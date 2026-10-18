import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { multiplyAndRound2 } from '@/core/domain/money';
import Decimal from 'decimal.js';

describe('money arithmetic properties', () => {
  it('multiplyAndRound2 should never produce floating point drift', () => {
    // Generate valid invoice-like decimal strings
    const quantityArbitrary = fc.double({ noNaN: true, min: 0.001, max: 10000 }).map(n => n.toFixed(3));
    const priceArbitrary = fc.double({ noNaN: true, min: 0.01, max: 10000 }).map(n => n.toFixed(2));

    fc.assert(
      fc.property(quantityArbitrary, priceArbitrary, (q, p) => {
        const result = multiplyAndRound2(q, p);
        const parsed = new Decimal(result);
        
        // The result should have at most 2 decimal places
        expect(parsed.decimalPlaces()).toBeLessThanOrEqual(2);
        
        // The result should match exact Decimal computation with rounding
        const exact = new Decimal(q).times(new Decimal(p)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
        expect(result).toBe(exact.toFixed(2));
      })
    );
  });
});
