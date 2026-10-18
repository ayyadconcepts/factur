/**
 * money.ts — Pure utility module for exact decimal arithmetic.
 *
 * All monetary values are represented as branded strings (Amount, Decimal4)
 * and manipulated exclusively via decimal.js. Never use parseFloat on amounts.
 */
import Decimal from 'decimal.js';
import type { Amount, Decimal4 } from './invoice';

// ---------------------------------------------------------------------------
// Global Decimal configuration
// ---------------------------------------------------------------------------
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** "0.00" as a branded Amount */
export const ZERO_AMOUNT: Amount = '0.00' as Amount;

/** "0.0000" as a branded Decimal4 */
export const ZERO_DECIMAL4: Decimal4 = '0.0000' as Decimal4;

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

/**
 * Round to 2 decimal places and return a branded Amount string.
 * Accepts a Decimal instance or a numeric string.
 */
export function toAmount(value: Decimal | string): Amount {
  const d = value instanceof Decimal ? value : new Decimal(value);
  return d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2) as Amount;
}

/**
 * Round to 4 decimal places and return a branded Decimal4 string.
 * Accepts a Decimal instance or a numeric string.
 */
export function toDecimal4(value: Decimal | string): Decimal4 {
  const d = value instanceof Decimal ? value : new Decimal(value);
  return d.toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toFixed(4) as Decimal4;
}

/**
 * Parse a branded Amount or Decimal4 string back into a Decimal instance
 * for further computation.
 */
export function asDecimal(value: Amount | Decimal4): Decimal {
  return new Decimal(value);
}

// ---------------------------------------------------------------------------
// Arithmetic
// ---------------------------------------------------------------------------

/**
 * Sum an array of Amount values and return the result as an Amount (2dp).
 * Returns ZERO_AMOUNT for an empty array.
 */
export function sumAmounts(values: readonly Amount[]): Amount {
  let total = new Decimal(0);
  for (const v of values) {
    total = total.plus(new Decimal(v));
  }
  return toAmount(total);
}

/**
 * Multiply two values and round the result to 2 decimal places (Amount).
 * Typical use: quantity × unit price.
 */
export function multiplyAndRound2(a: Decimal | string, b: Decimal | string): Amount {
  const da = a instanceof Decimal ? a : new Decimal(a);
  const db = b instanceof Decimal ? b : new Decimal(b);
  return toAmount(da.times(db));
}

// ---------------------------------------------------------------------------
// Predicates
// ---------------------------------------------------------------------------

/** Returns true if the Amount is exactly zero. */
export function isZero(value: Amount): boolean {
  return new Decimal(value).isZero();
}

/** Returns true if the Amount is strictly negative. */
export function isNegative(value: Amount): boolean {
  return new Decimal(value).isNegative() && !new Decimal(value).isZero();
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Format an Amount as a French-locale currency string.
 * Example: "1 234,56 €"
 *
 * Uses non-breaking space (U+00A0) as the thousands separator and
 * non-breaking space before the currency symbol, per French typographic rules.
 */
export function formatFR(value: Amount): string {
  const d = new Decimal(value);
  const isNeg = d.isNegative();
  const abs = d.abs().toFixed(2);

  // Split integer and decimal parts
  const [intPart, decPart] = abs.split('.') as [string, string];

  // Group the integer part by thousands with non-breaking space (U+00A0)
  const NBSP = '\u00A0';
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);

  const formatted = `${grouped},${decPart}${NBSP}€`;
  return isNeg ? `-${formatted}` : formatted;
}
