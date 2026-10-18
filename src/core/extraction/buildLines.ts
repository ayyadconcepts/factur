import type { PdfTextItem, BBox } from './types';

export interface TextLine {
  text: string;
  items: PdfTextItem[];
  bbox: BBox;
}

export interface TextPage {
  pageIndex: number;
  lines: TextLine[];
}

/**
 * Regroupe les mots isolés (PdfTextItem) en lignes de texte par page.
 * Utilise un clustering sur l'axe Y pour fusionner les mots sur la même ligne physique,
 * puis les trie sur l'axe X pour respecter le sens de lecture.
 */
export function buildLines(items: PdfTextItem[], yTolerance = 4): TextPage[] {
  const pages = new Map<number, PdfTextItem[]>();

  // 1. Grouper par page
  for (const item of items) {
    if (!pages.has(item.page)) {
      pages.set(item.page, []);
    }
    pages.get(item.page)!.push(item);
  }

  const result: TextPage[] = [];

  // 2. Traiter chaque page
  const sortedPages = Array.from(pages.keys()).sort((a, b) => a - b);
  for (const pageIndex of sortedPages) {
    const pageItems = pages.get(pageIndex)!;
    // Trier de haut en bas (Y ascendant ou descendant selon l'origine, pdf.js est généralement bas->haut, mais supposons ici que Y est uniformisé, trions par Y)
    // pdf.js: origin is bottom-left, so smaller Y is bottom, larger Y is top. But let's just sort by Y.
    // Wait, let's sort descending Y so top-to-bottom.
    pageItems.sort((a, b) => b.y - a.y);

    const lines: TextLine[] = [];
    let currentLineItems: PdfTextItem[] = [];
    let currentLineY: number | null = null;

    for (const item of pageItems) {
      if (currentLineY === null) {
        currentLineItems.push(item);
        currentLineY = item.y;
      } else {
        if (Math.abs(item.y - currentLineY) <= yTolerance) {
          currentLineItems.push(item);
          // Mettre à jour le Y moyen de la ligne ou garder le premier
        } else {
          // Finaliser la ligne courante
          lines.push(finalizeLine(currentLineItems, pageIndex));
          currentLineItems = [item];
          currentLineY = item.y;
        }
      }
    }
    if (currentLineItems.length > 0) {
      lines.push(finalizeLine(currentLineItems, pageIndex));
    }

    result.push({ pageIndex, lines });
  }

  return result;
}

function finalizeLine(items: PdfTextItem[], page: number): TextLine {
  // Trier de gauche à droite
  items.sort((a, b) => a.x - b.x);
  
  let text = '';
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    
    minX = Math.min(minX, item.x);
    minY = Math.min(minY, item.y);
    maxX = Math.max(maxX, item.x + item.w);
    maxY = Math.max(maxY, item.y + item.h);

    // Ajouter un espace si les mots sont éloignés
    if (i > 0) {
      const prev = items[i - 1];
      if (prev) {
        const gap = item.x - (prev.x + prev.w);
        // Si l'espace est plus grand que 20% de la hauteur, ajouter un espace
        if (gap > item.h * 0.2) {
          text += ' ';
        }
      }
    }
    text += item.str.trim();
  }

  return {
    text: text.trim(),
    items,
    bbox: { page, x0: minX, y0: minY, x1: maxX, y1: maxY }
  };
}
