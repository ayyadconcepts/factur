import { describe, it, expect } from 'vitest';
import { parseFrenchAmount, parseDateFR } from '../../src/core/verify/parsers';

describe('parseFrenchAmount', () => {
  it('parses basic amounts', () => {
    expect(parseFrenchAmount('1.500,00')).toBe('1500.00');
    expect(parseFrenchAmount('1,500.00')).toBe('1500.00');
    expect(parseFrenchAmount('1 500,00 €')).toBe('1500.00');
    expect(parseFrenchAmount('1500 EUR')).toBe('1500.00');
    expect(parseFrenchAmount('€ 1500')).toBe('1500.00');
  });

  it('rejects completely ambiguous amounts', () => {
    expect(parseFrenchAmount('1.500')).toBeNull(); // Could be 1500 or 1.5
  });

  it('handles non-breaking spaces', () => {
    expect(parseFrenchAmount('1\u00A0500,00')).toBe('1500.00');
    expect(parseFrenchAmount('1\u202F500,00')).toBe('1500.00');
  });
});

describe('parseDateFR', () => {
  it('parses numeric dates', () => {
    expect(parseDateFR('08/10/26')).toBe('2026-10-08');
    expect(parseDateFR('8/10/2026')).toBe('2026-10-08');
  });

  it('parses textual dates', () => {
    expect(parseDateFR('8 oct. 2026')).toBe('2026-10-08');
    expect(parseDateFR('08 octobre 2026')).toBe('2026-10-08');
  });
});
