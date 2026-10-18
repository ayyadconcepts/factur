/**
 * codes.ts — Pure constants for Factur-X business codes.
 *
 * VAT categories, UNECE unit codes, payment means codes, and standard
 * French VAT rates. All values sourced from EU/FR e-invoicing specifications.
 */
import type { VatCategoryCode, UnitCode } from './invoice';

// ---------------------------------------------------------------------------
// VAT category labels (French)
// ---------------------------------------------------------------------------

/** French human-readable labels for each VAT category code. */
export const VAT_CATEGORY_LABELS: Record<VatCategoryCode, string> = {
  S: 'TVA au taux normal',
  Z: 'TVA à taux zéro',
  E: 'Exonéré de TVA',
  AE: 'Autoliquidation (TVA intra-UE)',
  K: 'Autoliquidation (TVA hors-UE)',
  G: 'Exportation hors UE',
  O: 'Hors champ de la TVA',
};

/**
 * VAT categories that require an exemptionReason to be specified.
 * (All categories except S and Z.)
 */
export const EXEMPTION_REQUIRED_CATEGORIES: readonly VatCategoryCode[] = [
  'E' as VatCategoryCode,
  'AE' as VatCategoryCode,
  'K' as VatCategoryCode,
  'G' as VatCategoryCode,
  'O' as VatCategoryCode,
];

// ---------------------------------------------------------------------------
// UNECE Rec.20 unit codes (common subset)
// ---------------------------------------------------------------------------

/** Common UNECE Rec.20 unit codes used in French invoicing. */
export const COMMON_UNIT_CODES: Record<string, { code: UnitCode; label: string }> = {
  piece: { code: 'C62' as UnitCode, label: 'Unité' },
  hour: { code: 'HUR' as UnitCode, label: 'Heure' },
  day: { code: 'DAY' as UnitCode, label: 'Jour' },
  kilogram: { code: 'KGM' as UnitCode, label: 'Kilogramme' },
  meter: { code: 'MTR' as UnitCode, label: 'Mètre' },
  liter: { code: 'LTR' as UnitCode, label: 'Litre' },
  squareMeter: { code: 'MTK' as UnitCode, label: 'Mètre carré' },
};

// ---------------------------------------------------------------------------
// Payment means codes (UNTDID 4461 subset)
// ---------------------------------------------------------------------------

/** Common payment means codes per UNTDID 4461. */
export const PAYMENT_MEANS_CODES: Record<string, { code: string; label: string }> = {
  transfer: { code: '30', label: 'Virement' },
  creditTransfer: { code: '31', label: 'Virement bancaire' },
  sepaTransfer: { code: '58', label: 'Virement SEPA' },
  card: { code: '48', label: 'Carte bancaire' },
  directDebit: { code: '49', label: 'Prélèvement' },
  cheque: { code: '20', label: 'Chèque' },
  cash: { code: '10', label: 'Espèces' },
};

// ---------------------------------------------------------------------------
// Standard French VAT rates
// ---------------------------------------------------------------------------

/**
 * Standard VAT rate percentages applicable in metropolitan France.
 * Serialized as strings with 2 decimal places to match Decimal4 convention.
 */
export const STANDARD_VAT_RATES: readonly string[] = [
  '20.00',
  '10.00',
  '5.50',
  '2.10',
];
