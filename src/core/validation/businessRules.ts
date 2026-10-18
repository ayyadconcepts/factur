/**
 * businessRules.ts — Règles métier transverses pour la validation d'une facture.
 *
 * Ce module implémente les règles de surface (présence/cohérence) issues de EN 16931
 * et du cadre français. Les règles arithmétiques sont dans arithmetic.ts.
 *
 * IMPORTANT : Les mentions légales françaises exactes (codes de notes, textes réglementaires)
 * doivent être confirmées par docs/spec avant d'être codées en dur.
 */

import type {
  Invoice,
  Party,
} from '../domain/invoice';
import { EXEMPTION_REQUIRED_CATEGORIES } from '../domain/codes';
import { asDecimal } from '../domain/money';
import { validateSiren, validateSiret, validateVatIdFR, validateIban } from './identifiers';
import type { ValidationIssue } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function issue(
  code: string,
  severity: 'error' | 'warning',
  path: string,
  message: string,
  ruleRef?: string,
): ValidationIssue {
  return ruleRef !== undefined
    ? { code, severity, path, message, ruleRef }
    : { code, severity, path, message };
}

// ---------------------------------------------------------------------------
// BR-* : Structural rules
// ---------------------------------------------------------------------------

/** BR-01 : An Invoice shall have a Specification identifier (profile). */
function validateProfile(invoice: Invoice): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!invoice.profile) {
    issues.push(issue('MISSING_PROFILE', 'error', 'profile', 'Le profil Factur-X est obligatoire.', 'BR-01'));
  }
  return issues;
}

/** BR-02 : An Invoice shall have an Invoice number. */
/** BR-03 : An Invoice shall have an Invoice issue date. */
/** BR-04 : An Invoice shall have an Invoice type code. */
/** BR-05 : An Invoice shall have an Invoice currency code. */
function validateMandatoryHeader(invoice: Invoice): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!invoice.number.trim()) {
    issues.push(issue('MISSING_NUMBER', 'error', 'number', 'Le numéro de facture est obligatoire.', 'BR-02'));
  }
  if (!invoice.issueDate.trim()) {
    issues.push(issue('MISSING_ISSUE_DATE', 'error', 'issueDate', 'La date d\'émission est obligatoire.', 'BR-03'));
  }
  if (!invoice.typeCode) {
    issues.push(issue('MISSING_TYPE_CODE', 'error', 'typeCode', 'Le type de document est obligatoire (380 = facture, 381 = avoir).', 'BR-04'));
  }
  if (!invoice.currency.trim()) {
    issues.push(issue('MISSING_CURRENCY', 'error', 'currency', 'Le code devise est obligatoire.', 'BR-05'));
  }

  return issues;
}

/** BR-16 : An Invoice shall have at least one Invoice line. */
function validateHasLines(invoice: Invoice): readonly ValidationIssue[] {
  if (invoice.lines.length === 0) {
    return [issue('NO_LINES', 'error', 'lines', 'La facture doit comporter au moins une ligne.', 'BR-16')];
  }
  return [];
}

// ---------------------------------------------------------------------------
// Party validation (BR-06, BR-07, BR-08, BR-09, BR-10)
// ---------------------------------------------------------------------------

function validateParty(party: Party, role: 'seller' | 'buyer'): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const label = role === 'seller' ? 'vendeur' : 'acheteur';
  const prefix = role;

  // BR-06 / BR-07 : Seller/Buyer name
  if (!party.name.trim()) {
    issues.push(issue(
      `MISSING_${role.toUpperCase()}_NAME`,
      'error',
      `${prefix}.name`,
      `Le nom du ${label} est obligatoire.`,
      role === 'seller' ? 'BR-06' : 'BR-07',
    ));
  }

  // SIREN
  const sirenIssue = validateSiren(party.siren);
  if (sirenIssue !== null) {
    issues.push({ ...sirenIssue, path: `${prefix}.siren` });
  }

  // SIRET (optional)
  if (party.siret !== undefined) {
    const siretIssue = validateSiret(party.siret);
    if (siretIssue !== null) {
      issues.push({ ...siretIssue, path: `${prefix}.siret` });
    }
  }

  // TVA ID (optional)
  if (party.vatId !== undefined) {
    const vatIssue = validateVatIdFR(party.vatId);
    if (vatIssue !== null) {
      issues.push({ ...vatIssue, path: `${prefix}.vatId` });
    }
  }

  // Address
  if (!party.address.line1.trim()) {
    issues.push(issue('MISSING_ADDRESS_LINE1', 'error', `${prefix}.address.line1`, `L'adresse du ${label} est obligatoire.`));
  }
  if (!party.address.postalCode.trim()) {
    issues.push(issue('MISSING_POSTAL_CODE', 'error', `${prefix}.address.postalCode`, `Le code postal du ${label} est obligatoire.`));
  }
  if (!party.address.city.trim()) {
    issues.push(issue('MISSING_CITY', 'error', `${prefix}.address.city`, `La ville du ${label} est obligatoire.`));
  }
  if (!party.address.country.trim()) {
    issues.push(issue('MISSING_COUNTRY', 'error', `${prefix}.address.country`, `Le pays du ${label} est obligatoire.`));
  }

  // Electronic address (obligatoire en France)
  if (!party.electronicAddress.value.trim()) {
    issues.push(issue('MISSING_ELECTRONIC_ADDRESS', 'error', `${prefix}.electronicAddress.value`, `L'adresse électronique du ${label} est obligatoire pour la facturation électronique française.`));
  }
  if (!party.electronicAddress.schemeId.trim()) {
    issues.push(issue('MISSING_ELECTRONIC_ADDRESS_SCHEME', 'error', `${prefix}.electronicAddress.schemeId`, `Le schéma d'identification de l'adresse électronique du ${label} est obligatoire.`));
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Credit note specific rules
// ---------------------------------------------------------------------------

/** Si typeCode = '381' (avoir), la référence à la facture d'origine est obligatoire. */
function validateCreditNote(invoice: Invoice): readonly ValidationIssue[] {
  if (invoice.typeCode === '381' && !invoice.precedingInvoiceNumber?.trim()) {
    return [issue(
      'CREDIT_NOTE_NO_REF',
      'error',
      'precedingInvoiceNumber',
      'Un avoir (381) doit référencer le numéro de la facture d\'origine.',
      'BR-55',
    )];
  }
  return [];
}

// ---------------------------------------------------------------------------
// VAT rules
// ---------------------------------------------------------------------------

/** BR-E-10, BR-AE-10, BR-K-10, BR-G-10, BR-O-10 : Exemption reason required for certain categories. */
function validateVatExemptionReasons(invoice: Invoice): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (let i = 0; i < invoice.vatBreakdown.length; i++) {
    const vbl = invoice.vatBreakdown[i];
    if (vbl === undefined) continue;

    if (
      (EXEMPTION_REQUIRED_CATEGORIES as readonly string[]).includes(vbl.category) &&
      !vbl.exemptionReason?.trim()
    ) {
      issues.push(issue(
        'MISSING_EXEMPTION_REASON',
        'error',
        `vatBreakdown[${String(i)}].exemptionReason`,
        `Le motif d'exonération est obligatoire pour la catégorie de TVA « ${vbl.category} ».`,
        `BR-${vbl.category}-10`,
      ));
    }
  }

  // Also check lines
  for (const line of invoice.lines) {
    if (
      (EXEMPTION_REQUIRED_CATEGORIES as readonly string[]).includes(line.vat.category) &&
      !line.vat.exemptionReason?.trim()
    ) {
      issues.push(issue(
        'MISSING_LINE_EXEMPTION_REASON',
        'warning',
        `lines[${line.id}].vat.exemptionReason`,
        `Le motif d'exonération est recommandé sur la ligne « ${line.name} » (catégorie ${line.vat.category}).`,
      ));
    }
  }

  return issues;
}

/** BR-S-08 : VAT category S must have a non-zero rate. */
function validateVatRates(invoice: Invoice): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (let i = 0; i < invoice.vatBreakdown.length; i++) {
    const vbl = invoice.vatBreakdown[i];
    if (vbl === undefined) continue;

    if (vbl.category === 'S') {
      const rate = asDecimal(vbl.percent);
      if (rate.isZero()) {
        issues.push(issue(
          'VAT_S_ZERO_RATE',
          'error',
          `vatBreakdown[${String(i)}].percent`,
          'La catégorie TVA « S » (taux normal) ne peut pas avoir un taux de 0 %.',
          'BR-S-08',
        ));
      }
    }
    if (vbl.category === 'Z') {
      const rate = asDecimal(vbl.percent);
      if (!rate.isZero()) {
        issues.push(issue(
          'VAT_Z_NONZERO_RATE',
          'error',
          `vatBreakdown[${String(i)}].percent`,
          'La catégorie TVA « Z » (taux zéro) doit avoir un taux de 0 %.',
          'BR-Z-08',
        ));
      }
    }
    if (vbl.category === 'E') {
      const rate = asDecimal(vbl.percent);
      if (!rate.isZero()) {
        issues.push(issue(
          'VAT_E_NONZERO_RATE',
          'error',
          `vatBreakdown[${String(i)}].percent`,
          'La catégorie TVA « E » (exonéré) doit avoir un taux de 0 %.',
          'BR-E-08',
        ));
      }
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Payment validation
// ---------------------------------------------------------------------------

function validatePayment(invoice: Invoice): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!invoice.payment.meansCode.trim()) {
    issues.push(issue(
      'MISSING_PAYMENT_MEANS',
      'error',
      'payment.meansCode',
      'Le moyen de paiement est obligatoire.',
      'BR-49',
    ));
  }

  // IBAN validation if provided
  if (invoice.payment.iban !== undefined) {
    const ibanIssue = validateIban(invoice.payment.iban);
    if (ibanIssue !== null) {
      issues.push({ ...ibanIssue, path: 'payment.iban' });
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// French mandatory mentions (mentions légales obligatoires)
// ---------------------------------------------------------------------------

/**
 * Vérifie la présence des mentions légales françaises obligatoires.
 *
 * TODO(spec): Les codes de notes exacts (BT-21 subject codes) pour les mentions
 * françaises doivent être confirmés avec docs/spec/. Les textes réglementaires
 * précis sont :
 * - Pénalités de retard (taux BCE + 10 points, ou taux contractuel)
 * - Indemnité forfaitaire de recouvrement (40 €)
 * - Conditions d'escompte (ou mention « Pas d'escompte pour paiement anticipé »)
 *
 * Pour l'instant, on vérifie uniquement que la facture contient au moins une note
 * et on émet un avertissement si les mentions clés semblent absentes.
 */
function validateFrenchMentions(invoice: Invoice): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Seller VAT ID is mandatory in France for standard invoices
  if (invoice.seller.vatId === undefined || !invoice.seller.vatId.trim()) {
    issues.push(issue(
      'FR_MISSING_SELLER_VAT',
      'error',
      'seller.vatId',
      'Le numéro de TVA intracommunautaire du vendeur est obligatoire sur les factures françaises.',
    ));
  }

  // Check for presence of key French legal mentions in notes
  const allNotesText = invoice.notes.map((n) => n.content.toLowerCase()).join(' ');

  const hasPenaltyMention = allNotesText.includes('pénalité') || allNotesText.includes('retard');
  const hasRecoveryMention = allNotesText.includes('indemnité') || allNotesText.includes('recouvrement') || allNotesText.includes('40');
  const hasDiscountMention = allNotesText.includes('escompte');

  if (!hasPenaltyMention) {
    issues.push(issue(
      'FR_MISSING_PENALTY_MENTION',
      'warning',
      'notes',
      'Mention recommandée absente : pénalités de retard (obligatoire sur les factures françaises).',
      // TODO(spec): ruleRef from CIUS-FR
    ));
  }
  if (!hasRecoveryMention) {
    issues.push(issue(
      'FR_MISSING_RECOVERY_MENTION',
      'warning',
      'notes',
      'Mention recommandée absente : indemnité forfaitaire de recouvrement de 40 € (obligatoire sur les factures françaises).',
      // TODO(spec): ruleRef from CIUS-FR
    ));
  }
  if (!hasDiscountMention) {
    issues.push(issue(
      'FR_MISSING_DISCOUNT_MENTION',
      'warning',
      'notes',
      'Mention recommandée absente : conditions d\'escompte (obligatoire sur les factures françaises).',
      // TODO(spec): ruleRef from CIUS-FR
    ));
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

/**
 * Exécute toutes les règles métier (hors arithmétique, traitée dans arithmetic.ts).
 * Retourne la liste complète des problèmes détectés.
 */
export function validateBusinessRules(invoice: Invoice): readonly ValidationIssue[] {
  return [
    ...validateProfile(invoice),
    ...validateMandatoryHeader(invoice),
    ...validateHasLines(invoice),
    ...validateParty(invoice.seller, 'seller'),
    ...validateParty(invoice.buyer, 'buyer'),
    ...validateCreditNote(invoice),
    ...validateVatExemptionReasons(invoice),
    ...validateVatRates(invoice),
    ...validatePayment(invoice),
    ...validateFrenchMentions(invoice),
  ];
}
