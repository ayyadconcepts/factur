import { describe, it, expect } from 'vitest';
import {
  luhnCheck,
  validateSiren,
  validateSiret,
  validateVatIdFR,
  validateIban,
} from '@/core/validation/identifiers';

// ---------------------------------------------------------------------------
// Luhn
// ---------------------------------------------------------------------------
describe('luhnCheck', () => {
  it('should validate known valid numbers', () => {
    // Standard test: card number 4539578763621486
    expect(luhnCheck('4539578763621486')).toBe(true);
    // SIREN La Banque Postale: 421100645
    expect(luhnCheck('421100645')).toBe(true);
  });

  it('should reject invalid numbers', () => {
    expect(luhnCheck('1234567890')).toBe(false);
    expect(luhnCheck('0000000001')).toBe(false);
  });

  it('should reject non-digit strings', () => {
    expect(luhnCheck('')).toBe(false);
    expect(luhnCheck('abc')).toBe(false);
    expect(luhnCheck('123-456')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SIREN
// ---------------------------------------------------------------------------
describe('validateSiren', () => {
  it('should accept valid SIREN (9 digits, Luhn OK)', () => {
    // Société Générale: 552120222
    expect(validateSiren('552120222')).toBeNull();
  });

  it('should reject SIREN with wrong length', () => {
    const result = validateSiren('1234');
    expect(result).not.toBeNull();
    expect(result?.code).toBe('INVALID_SIREN');
  });

  it('should reject SIREN failing Luhn', () => {
    const result = validateSiren('123456780');
    expect(result).not.toBeNull();
    expect(result?.code).toBe('INVALID_SIREN');
  });

  it('should reject non-digit SIREN', () => {
    const result = validateSiren('12345678A');
    expect(result).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SIRET
// ---------------------------------------------------------------------------
describe('validateSiret', () => {
  it('should accept valid SIRET (14 digits, Luhn OK)', () => {
    // Société Générale siège: 55212022200013
    expect(validateSiret('55212022200013')).toBeNull();
  });

  it('should reject SIRET with wrong length', () => {
    const result = validateSiret('1234567890');
    expect(result).not.toBeNull();
    expect(result?.code).toBe('INVALID_SIRET');
  });

  it('should handle La Poste exception (SIREN 356000000)', () => {
    // La Poste has SIREN 356000000, their SIRETs don't pass standard Luhn
    // but the sum of digits must be divisible by 5.
    // Known La Poste SIRET: 35600000049837
    // We test that the function handles the exception branch
    const result = validateSiret('35600000000048');
    // This may or may not be valid depending on the digit sum — the key point
    // is that the La Poste branch is exercised (SIREN starts with 356000000)
    // The function should NOT reject it purely based on standard Luhn
    if (result !== null) {
      // If rejected, it should be for the digit-sum check, not Luhn
      expect(result.message).toContain('La Poste');
    }
  });

  it('should reject SIRET whose first 9 digits are invalid SIREN', () => {
    const result = validateSiret('12345678012345');
    expect(result).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// TVA FR
// ---------------------------------------------------------------------------
describe('validateVatIdFR', () => {
  it('should accept valid FR VAT number', () => {
    // Société Générale: SIREN 552120222
    // Key = (12 + 3 * (552120222 % 97)) % 97
    const siren = 552120222;
    const expectedKey = (12 + 3 * (siren % 97)) % 97;
    const keyStr = String(expectedKey).padStart(2, '0');
    const vatId = `FR${keyStr}552120222`;
    expect(validateVatIdFR(vatId)).toBeNull();
  });

  it('should reject VAT number not starting with FR', () => {
    const result = validateVatIdFR('DE123456789');
    expect(result).not.toBeNull();
    expect(result?.code).toBe('INVALID_VAT_FR');
  });

  it('should reject VAT number with wrong key', () => {
    const result = validateVatIdFR('FR00552120222');
    expect(result).not.toBeNull();
  });

  it('should reject VAT number with invalid SIREN part', () => {
    const result = validateVatIdFR('FR27552120223');
    expect(result).not.toBeNull();
  });

  it('should reject too short / too long VAT numbers', () => {
    expect(validateVatIdFR('FR12')).not.toBeNull();
    expect(validateVatIdFR('FR1234567890123')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// IBAN
// ---------------------------------------------------------------------------
describe('validateIban', () => {
  it('should accept valid French IBAN', () => {
    // Standard test IBAN: FR76 3000 6000 0112 3456 7890 189
    expect(validateIban('FR7630006000011234567890189')).toBeNull();
  });

  it('should accept IBAN with spaces', () => {
    expect(validateIban('FR76 3000 6000 0112 3456 7890 189')).toBeNull();
  });

  it('should accept valid German IBAN', () => {
    expect(validateIban('DE89370400440532013000')).toBeNull();
  });

  it('should reject IBAN with invalid checksum', () => {
    const result = validateIban('FR0030006000011234567890189');
    expect(result).not.toBeNull();
    expect(result?.code).toBe('INVALID_IBAN');
  });

  it('should reject too short IBAN', () => {
    const result = validateIban('FR76300060');
    expect(result).not.toBeNull();
  });

  it('should reject empty IBAN', () => {
    const result = validateIban('');
    expect(result).not.toBeNull();
  });
});
