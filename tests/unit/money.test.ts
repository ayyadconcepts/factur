import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import {
  toAmount,
  toDecimal4,
  asDecimal,
  sumAmounts,
  multiplyAndRound2,
  isZero,
  isNegative,
  formatFR,
  ZERO_AMOUNT,
  ZERO_DECIMAL4,
} from '@/core/domain/money';
import type { Amount} from '@/core/domain/invoice';

describe('toAmount', () => {
  it('should round to 2 decimal places', () => {
    expect(toAmount('10.456')).toBe('10.46');
    expect(toAmount('10.454')).toBe('10.45');
    expect(toAmount('10.455')).toBe('10.46'); // ROUND_HALF_UP
  });

  it('should pad to 2 decimal places', () => {
    expect(toAmount('10')).toBe('10.00');
    expect(toAmount('10.5')).toBe('10.50');
  });

  it('should handle negative amounts', () => {
    expect(toAmount('-5.999')).toBe('-6.00');
  });

  it('should handle zero', () => {
    expect(toAmount('0')).toBe('0.00');
  });

  it('should accept Decimal instances', () => {
    expect(toAmount(new Decimal('123.456'))).toBe('123.46');
  });
});

describe('toDecimal4', () => {
  it('should round to 4 decimal places', () => {
    expect(toDecimal4('10.12345')).toBe('10.1235');
  });

  it('should pad to 4 decimal places', () => {
    expect(toDecimal4('10')).toBe('10.0000');
    expect(toDecimal4('10.5')).toBe('10.5000');
  });
});

describe('asDecimal', () => {
  it('should parse a branded string back to Decimal', () => {
    const amount = toAmount('123.45');
    const decimal = asDecimal(amount);
    expect(decimal).toBeInstanceOf(Decimal);
    expect(decimal.toString()).toBe('123.45');
  });
});

describe('sumAmounts', () => {
  it('should sum an array of amounts', () => {
    const amounts: Amount[] = [
      toAmount('10.00'),
      toAmount('20.50'),
      toAmount('0.50'),
    ];
    expect(sumAmounts(amounts)).toBe('31.00');
  });

  it('should return 0.00 for empty array', () => {
    expect(sumAmounts([])).toBe('0.00');
  });

  it('should handle negative amounts', () => {
    const amounts: Amount[] = [toAmount('100.00'), toAmount('-30.00')];
    expect(sumAmounts(amounts)).toBe('70.00');
  });
});

describe('multiplyAndRound2', () => {
  it('should multiply and round to 2 decimals', () => {
    // 3 × 33.33 = 99.99
    expect(multiplyAndRound2('3', '33.33')).toBe('99.99');
  });

  it('should use ROUND_HALF_UP', () => {
    // 1.005 × 100 = 100.50 (no rounding issue since we use Decimal)
    expect(multiplyAndRound2('1.005', '100')).toBe('100.50');
  });

  it('should handle quantity × unit price correctly', () => {
    // 2.5 × 19.99 = 49.975 → 49.98
    expect(multiplyAndRound2('2.5', '19.99')).toBe('49.98');
  });
});

describe('isZero / isNegative', () => {
  it('isZero should detect zero amounts', () => {
    expect(isZero(ZERO_AMOUNT)).toBe(true);
    expect(isZero(toAmount('0'))).toBe(true);
    expect(isZero(toAmount('0.01'))).toBe(false);
  });

  it('isNegative should detect negative amounts', () => {
    expect(isNegative(toAmount('-1.00'))).toBe(true);
    expect(isNegative(toAmount('0.00'))).toBe(false);
    expect(isNegative(toAmount('1.00'))).toBe(false);
  });
});

describe('formatFR', () => {
  it('should format amounts in French locale', () => {
    const result = formatFR(toAmount('1234.56'));
    // Should contain the value with comma as decimal separator
    // Non-breaking space as thousands separator: "1 234,56 €"
    expect(result).toContain('1');
    expect(result).toContain('234');
    expect(result).toContain(',56');
    expect(result).toContain('€');
  });

  it('should format zero', () => {
    const result = formatFR(ZERO_AMOUNT);
    expect(result).toContain('0,00');
    expect(result).toContain('€');
  });
});

describe('constants', () => {
  it('ZERO_AMOUNT should be "0.00"', () => {
    expect(ZERO_AMOUNT).toBe('0.00');
  });

  it('ZERO_DECIMAL4 should be "0.0000"', () => {
    expect(ZERO_DECIMAL4).toBe('0.0000');
  });
});
