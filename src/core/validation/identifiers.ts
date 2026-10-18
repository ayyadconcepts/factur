/**
 * identifiers.ts — Pure validation for French business identifiers.
 *
 * SIREN, SIRET, TVA intracommunautaire (FR), and IBAN.
 * All functions are pure: no I/O, no side effects.
 */
import type { ValidationIssue } from './types';

// ---------------------------------------------------------------------------
// Luhn algorithm (mod-10 checksum)
// ---------------------------------------------------------------------------

/**
 * Standard Luhn mod-10 checksum validation.
 * Returns true if the digit string passes the Luhn check.
 */
export function luhnCheck(digits: string): boolean {
  if (!/^\d+$/.test(digits)) {
    return false;
  }
  const len = digits.length;
  let sum = 0;
  let alternate = false;

  for (let i = len - 1; i >= 0; i--) {
    const ch = digits[i];
    if (ch === undefined) return false;
    let n = Number(ch);

    if (alternate) {
      n *= 2;
      if (n > 9) {
        n -= 9;
      }
    }

    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

// ---------------------------------------------------------------------------
// SIREN (9 digits, Luhn valid)
// ---------------------------------------------------------------------------

/**
 * Validate a French SIREN number (9 digits, Luhn checksum).
 * Returns null if valid, or a ValidationIssue with code 'INVALID_SIREN'.
 */
export function validateSiren(siren: string): ValidationIssue | null {
  if (!/^\d{9}$/.test(siren)) {
    return {
      code: 'INVALID_SIREN',
      severity: 'error',
      path: 'siren',
      message: `Le SIREN doit contenir exactement 9 chiffres. Valeur reçue : « ${siren} ».`,

    };
  }

  if (!luhnCheck(siren)) {
    return {
      code: 'INVALID_SIREN',
      severity: 'error',
      path: 'siren',
      message: `Le SIREN « ${siren} » ne passe pas la vérification Luhn (chiffre de contrôle invalide).`,

    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// SIRET (14 digits, Luhn valid — with La Poste exception)
// ---------------------------------------------------------------------------

/**
 * Validate a French SIRET number (14 digits).
 *
 * - The first 9 digits must form a valid SIREN.
 * - The full 14 digits must pass the Luhn check.
 * - **La Poste exception**: SIRENs starting with '356000000' use a
 *   different rule — the sum of all 14 digits must be divisible by 5
 *   instead of the standard Luhn check on the full 14 digits.
 */
export function validateSiret(siret: string): ValidationIssue | null {
  if (!/^\d{14}$/.test(siret)) {
    return {
      code: 'INVALID_SIRET',
      severity: 'error',
      path: 'siret',
      message: `Le SIRET doit contenir exactement 14 chiffres. Valeur reçue : « ${siret} ».`,

    };
  }

  const siren = siret.substring(0, 9);

  // First 9 digits must be a valid SIREN
  const sirenIssue = validateSiren(siren);
  if (sirenIssue !== null) {
    return {
      code: 'INVALID_SIRET',
      severity: 'error',
      path: 'siret',
      message: `Le SIRET « ${siret} » contient un SIREN invalide (${sirenIssue.message}).`,

    };
  }

  // La Poste exception: SIREN starts with '356000000'
  const isLaPoste = siren === '356000000';

  if (isLaPoste) {
    // Sum of all 14 digits must be divisible by 5
    let digitSum = 0;
    for (let i = 0; i < 14; i++) {
      digitSum += Number(siret[i]);
    }
    if (digitSum % 5 !== 0) {
      return {
        code: 'INVALID_SIRET',
        severity: 'error',
        path: 'siret',
        message: `Le SIRET La Poste « ${siret} » est invalide (la somme des chiffres n'est pas divisible par 5).`,
  
      };
    }
  } else {
    // Standard Luhn check on all 14 digits
    if (!luhnCheck(siret)) {
      return {
        code: 'INVALID_SIRET',
        severity: 'error',
        path: 'siret',
        message: `Le SIRET « ${siret} » ne passe pas la vérification Luhn (chiffre de contrôle invalide).`,
  
      };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// TVA intracommunautaire FR
// ---------------------------------------------------------------------------

/**
 * Validate a French intra-community VAT ID (TVA intracommunautaire).
 *
 * Format: "FR" + 2-digit key + 9-digit SIREN
 * Key formula: key = (12 + 3 × (SIREN mod 97)) mod 97
 */
export function validateVatIdFR(vatId: string): ValidationIssue | null {
  // Must match FR + 2 digits + 9 digits
  const match = /^FR(\d{2})(\d{9})$/.exec(vatId);
  if (match === null) {
    return {
      code: 'INVALID_VAT_FR',
      severity: 'error',
      path: 'vatId',
      message: `Le numéro de TVA intracommunautaire doit être au format FR + 2 chiffres clé + 9 chiffres SIREN. Valeur reçue : « ${vatId} ».`,

    };
  }

  const keyStr = match[1] as string;
  const sirenStr = match[2] as string;

  // The SIREN part must be Luhn-valid
  const sirenIssue = validateSiren(sirenStr);
  if (sirenIssue !== null) {
    return {
      code: 'INVALID_VAT_FR',
      severity: 'error',
      path: 'vatId',
      message: `Le numéro de TVA « ${vatId} » contient un SIREN invalide.`,

    };
  }

  // Key verification: key = (12 + 3 * (siren % 97)) % 97
  const sirenNum = Number(sirenStr); // Safe: 9 digits fits in Number (max ~9×10^8)
  const expectedKey = (12 + 3 * (sirenNum % 97)) % 97;
  const actualKey = Number(keyStr);

  if (actualKey !== expectedKey) {
    return {
      code: 'INVALID_VAT_FR',
      severity: 'error',
      path: 'vatId',
      message: `La clé de contrôle du numéro de TVA « ${vatId} » est incorrecte (attendue : ${String(expectedKey).padStart(2, '0')}).`,

    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// IBAN (ISO 13616)
// ---------------------------------------------------------------------------

/**
 * Validate an IBAN using the ISO 13616 mod-97 algorithm.
 *
 * Steps:
 * 1. Remove spaces and convert to uppercase.
 * 2. Check length (15–34 characters) and format (country + check + BBAN).
 * 3. Move the first 4 characters to the end.
 * 4. Replace each letter with its numeric value (A=10, B=11, ..., Z=35).
 * 5. The resulting number mod 97 must equal 1.
 *
 * Uses BigInt for the mod-97 computation on the large number.
 */
export function validateIban(iban: string): ValidationIssue | null {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();

  if (cleaned.length < 15 || cleaned.length > 34) {
    return {
      code: 'INVALID_IBAN',
      severity: 'error',
      path: 'iban',
      message: `L'IBAN doit contenir entre 15 et 34 caractères (espaces exclus). Longueur reçue : ${String(cleaned.length)}.`,

    };
  }

  // Must be: 2 letters (country) + 2 digits (check) + alphanumeric BBAN
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) {
    return {
      code: 'INVALID_IBAN',
      severity: 'error',
      path: 'iban',
      message: `L'IBAN « ${cleaned} » a un format invalide (attendu : 2 lettres pays + 2 chiffres clé + BBAN alphanumérique).`,

    };
  }

  // Move first 4 characters to the end
  const rearranged = cleaned.substring(4) + cleaned.substring(0, 4);

  // Replace letters with numbers: A=10, B=11, ..., Z=35
  let numericStr = '';
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      // Letter A-Z → 10-35
      numericStr += String(code - 55);
    } else {
      numericStr += ch;
    }
  }

  // Mod 97 using BigInt (the number can be very large)
  const remainder = BigInt(numericStr) % 97n;

  if (remainder !== 1n) {
    return {
      code: 'INVALID_IBAN',
      severity: 'error',
      path: 'iban',
      message: `L'IBAN « ${cleaned} » est invalide (échec de la vérification mod 97).`,

    };
  }

  return null;
}
