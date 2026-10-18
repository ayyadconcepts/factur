import { describe, it, expect } from 'vitest';
import { buildLines } from '@/core/extraction/buildLines';
import { findIdentifiers, findAmountAfterKeyword } from '@/core/extraction/anchors';

describe('Extraction Phase 4', () => {
  it('should build lines from PdfTextItems', () => {
    const items = [
      { str: 'Hello', x: 10, y: 100, w: 20, h: 10, page: 1 },
      { str: 'World', x: 35, y: 101, w: 25, h: 10, page: 1 },
      { str: 'Line 2', x: 10, y: 50, w: 30, h: 10, page: 1 },
    ];
    
    const pages = buildLines(items, 4);
    expect(pages).toHaveLength(1);
    expect(pages[0].lines).toHaveLength(2);
    // Y descending: 100 first, 50 second
    expect(pages[0].lines[0].text).toBe('Hello World');
    expect(pages[0].lines[1].text).toBe('Line 2');
  });

  it('should extract identifiers', () => {
    const lines = [
      { text: 'Siret: 123 456 789 00012', items: [], bbox: {} as any },
      { text: 'TVA: FR 12 123456789', items: [], bbox: {} as any }
    ];
    
    const ids = findIdentifiers(lines);
    expect(ids.sirets).toContain('12345678900012');
    expect(ids.tvas).toContain('FR12123456789');
  });

  it('should extract amounts', () => {
    const lines = [
      { text: 'TOTAL TTC : 1 234.56 €', items: [], bbox: {} as any }
    ];
    
    const amount = findAmountAfterKeyword(lines, /TOTAL\s+TTC/i);
    expect(amount).toBe('1234.56');
  });
});
