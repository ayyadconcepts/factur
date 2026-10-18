// @ts-nocheck
import type { Invoice } from '../domain/invoice';
import type { PdfTextItem, ExtractionResult } from './types';
import { buildLines } from './buildLines';
import { findIdentifiers, findAmountAfterKeyword } from './anchors';
import { toAmount, ZERO_AMOUNT } from '../domain/money';

/**
 * Extrait les données d'une facture à partir des mots PDF (déterministe).
 */
export function extractInvoice(items: PdfTextItem[]): ExtractionResult {
  const pages = buildLines(items);
  const allLines = pages.flatMap(p => p.lines);

  const identifiers = findIdentifiers(allLines);
  
  // Heuristiques basiques
  const totalTtcRaw = findAmountAfterKeyword(allLines, /TOTAL\s+TTC|NET\s+A\s+PAYER/i);
  const totalHtRaw = findAmountAfterKeyword(allLines, /TOTAL\s+HT|TOTAL\s+H\.T/i);
  const tvaRaw = findAmountAfterKeyword(allLines, /TVA|T\.V\.A/i);

  const totalTtc = totalTtcRaw ? toAmount(totalTtcRaw) : ZERO_AMOUNT;
  const totalHt = totalHtRaw ? toAmount(totalHtRaw) : ZERO_AMOUNT;
  const tva = tvaRaw ? toAmount(tvaRaw) : ZERO_AMOUNT;

  // On suppose que le premier SIREN trouvé est le vendeur, le 2eme est l'acheteur, ou l'inverse.
  // C'est un MVP : on remplit juste ce qu'on peut
  const sellerSiren = identifiers.sirens[0] || identifiers.sirets[0]?.substring(0, 9);
  const buyerSiren = identifiers.sirens[1] || identifiers.sirets[1]?.substring(0, 9);

  return {
    hasTextLayer: items.length > 0,
    pageCount: pages.length,
    fields: {
      sellerSiren: { status: sellerSiren ? 'found' : 'missing', candidates: sellerSiren ? [{ value: sellerSiren, raw: sellerSiren, bbox: [], rule: 'regex' }] : [] },
      buyerSiren: { status: buyerSiren ? 'found' : 'missing', candidates: buyerSiren ? [{ value: buyerSiren, raw: buyerSiren, bbox: [], rule: 'regex' }] : [] },
      totalTtc: { status: totalTtcRaw ? 'found' : 'missing', candidates: totalTtcRaw ? [{ value: totalTtc, raw: totalTtcRaw, bbox: [], rule: 'keyword' }] : [] },
      totalHt: { status: totalHtRaw ? 'found' : 'missing', candidates: totalHtRaw ? [{ value: totalHt, raw: totalHtRaw, bbox: [], rule: 'keyword' }] : [] },
    },
    warnings: []
  };
}
