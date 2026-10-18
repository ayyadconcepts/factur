// @ts-nocheck
import type { TextLine } from './buildLines';
import type { PdfTextItem } from './types';

/**
 * Recherche des identifiants (SIREN, SIRET, TVA, IBAN) par regex dans le texte brut.
 */
export function findIdentifiers(lines: TextLine[]) {
  const siretRegex = /\b\d{3}[ \.\-]?\d{3}[ \.\-]?\d{3}[ \.\-]?\d{5}\b/g;
  const sirenRegex = /\b\d{3}[ \.\-]?\d{3}[ \.\-]?\d{3}\b/g;
  const tvaRegex = /\bFR[ \.\-]?\d{2}[ \.\-]?\d{9}\b/g;
  const ibanRegex = /\bFR\d{2}[ \.\-]?\d{4}[ \.\-]?\d{4}[ \.\-]?\d{4}[ \.\-]?\d{4}[ \.\-]?\d{2,3}\b/g;

  const foundSirets: string[] = [];
  const foundSirens: string[] = [];
  const foundTvas: string[] = [];
  const foundIbans: string[] = [];

  for (const line of lines) {
    let match;
    while ((match = siretRegex.exec(line.text)) !== null) foundSirets.push(match[0].replace(/[\s\.\-]/g, ''));
    while ((match = sirenRegex.exec(line.text)) !== null) foundSirens.push(match[0].replace(/[\s\.\-]/g, ''));
    while ((match = tvaRegex.exec(line.text)) !== null) foundTvas.push(match[0].replace(/[\s\.\-]/g, ''));
    while ((match = ibanRegex.exec(line.text)) !== null) foundIbans.push(match[0].replace(/[\s\.\-]/g, ''));
  }

  return {
    sirets: Array.from(new Set(foundSirets)),
    sirens: Array.from(new Set(foundSirens)),
    tvas: Array.from(new Set(foundTvas)),
    ibans: Array.from(new Set(foundIbans))
  };
}

/**
 * Recherche des montants qui suivent un mot clé donné (ex: "TOTAL TTC", "Net à payer").
 */
export function findAmountAfterKeyword(lines: TextLine[], keywordRegex: RegExp): string | null {
  const amountRegex = /[\d\s]+[.,]\d{2}\s*(?:€|EUR)?/g;
  
  for (const line of lines) {
    if (keywordRegex.test(line.text)) {
      // Chercher le montant dans la même ligne
      const matches = Array.from(line.text.matchAll(amountRegex));
      if (matches.length > 0) {
        // Prendre le dernier montant de la ligne (généralement la valeur)
        const lastMatch = matches[matches.length - 1];
        if (lastMatch && lastMatch[0]) {
          return cleanAmount(lastMatch[0]);
        }
      }
    }
  }
  return null;
}

function cleanAmount(raw: string): string {
  // Garder seulement chiffres, points, virgules
  let cleaned = raw.replace(/[^\d.,]/g, '');
  // Remplacer la virgule par un point
  cleaned = cleaned.replace(',', '.');
  return cleaned;
}
