import { PDFDocument } from 'pdf-lib';

export interface PreflightResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates an incoming PDF for FIDÈLE mode.
 * For MVP, we just check if it can be parsed by pdf-lib and isn't encrypted.
 */
export async function preflightPdf(pdfBytes: Uint8Array): Promise<PreflightResult> {
  try {
    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: false });
    if (doc.isEncrypted) {
      return { valid: false, errors: ['Le PDF est protégé par mot de passe ou chiffré.'] };
    }
    return { valid: true, errors: [] };
  } catch (error) {
    return { valid: false, errors: ['Impossible de lire le fichier PDF fourni. Ce n\'est pas un PDF valide.'] };
  }
}
