import Decimal from 'decimal.js';

export function parseFrenchAmount(raw: string): string | null {
  if (!raw) return null;

  let cleaned = raw
    .replace(/[€$£a-zA-Z]/g, '')
    .replace(/[\s\u00A0\u202F]/g, '');

  if (!cleaned) return null;

  const isNegative = cleaned.startsWith('-') || cleaned.endsWith('-');
  cleaned = cleaned.replace(/-/g, '');

  const separators = cleaned.replace(/[0-9]/g, '');

  let normalized = '';

  if (separators.length === 0) {
    normalized = cleaned;
  } else if (separators.length === 1) {
    const sep = separators[0] as string;
    const sepIndex = cleaned.indexOf(sep);
    const decimals = cleaned.length - sepIndex - 1;

    if (decimals === 3) {
      return null;
    } else {
      normalized = cleaned.replace(sep, '.');
    }
  } else {
    const lastSepIndex = Math.max(cleaned.lastIndexOf(','), cleaned.lastIndexOf('.'));
    if (lastSepIndex === -1) return null;

    const withoutOtherSeps = cleaned.slice(0, lastSepIndex).replace(/[,.]/g, '') + '.' + cleaned.slice(lastSepIndex + 1);
    normalized = withoutOtherSeps;
  }

  try {
    const val = new Decimal(isNegative ? '-' + normalized : normalized);
    if (val.isNaN()) return null;
    return val.toFixed(2);
  } catch {
    return null;
  }
}

export function parseDateFR(raw: string): string | null {
  if (!raw) return null;

  const cleaned = raw.trim().toLowerCase();

  const matchNumeric = cleaned.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2}|\d{4})$/);
  if (matchNumeric) {
    let [_, day, month, year] = matchNumeric as string[];
    if (year!.length === 2) {
      year = '20' + year;
    }
    return `${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`;
  }

  const monthsStr = ['jan', 'fév', 'fev', 'mar', 'avr', 'mai', 'jun', 'juin', 'jul', 'juil', 'aoû', 'aou', 'sep', 'oct', 'nov', 'déc', 'dec'];
  const matchText = cleaned.match(/^(\d{1,2})\s+([a-zûé]+\.?)\s+(\d{4})$/);
  if (matchText) {
    const [_, day, monthStr, year] = matchText as string[];
    let monthIdx = -1;
    for (let i = 0; i < monthsStr.length; i++) {
      const m = monthsStr[i] as string;
      if (monthStr!.startsWith(m)) {
        if (['jan'].includes(m)) monthIdx = 1;
        if (['fév', 'fev'].includes(m)) monthIdx = 2;
        if (['mar'].includes(m)) monthIdx = 3;
        if (['avr'].includes(m)) monthIdx = 4;
        if (['mai'].includes(m)) monthIdx = 5;
        if (['jun', 'juin'].includes(m)) monthIdx = 6;
        if (['jul', 'juil'].includes(m)) monthIdx = 7;
        if (['aoû', 'aou'].includes(m)) monthIdx = 8;
        if (['sep'].includes(m)) monthIdx = 9;
        if (['oct'].includes(m)) monthIdx = 10;
        if (['nov'].includes(m)) monthIdx = 11;
        if (['déc', 'dec'].includes(m)) monthIdx = 12;
        break;
      }
    }
    if (monthIdx !== -1) {
      return `${year}-${String(monthIdx).padStart(2, '0')}-${day!.padStart(2, '0')}`;
    }
  }

  return null;
}
