import { ValidationIssue } from '../validation/types';

export interface PdfTextItem { str: string; page: number; x: number; y: number; w: number; h: number }
export interface BBox { page: number; x0: number; y0: number; x1: number; y1: number }

export type FieldOrigin = 'extracted' | 'edited' | 'manual';

export interface FieldCandidate<T> {
  value: T;
  raw: string;                 // texte brut source
  bbox: readonly BBox[];       // provenance affichable dans le viewer
  rule: string;                // identifiant de la règle qui l'a produit
  checksumValid?: boolean;     // Luhn, clé TVA, IBAN...
}

export interface ExtractedField<T> {
  status: 'found' | 'ambiguous' | 'missing';
  candidates: readonly FieldCandidate<T>[];   // JAMAIS de choix silencieux si ambigu
}

export interface ExtractionResult {
  hasTextLayer: boolean;       // false => scan : saisie manuelle, pas d'OCR
  pageCount: number;
  fields: Record<string, ExtractedField<unknown>>;  // typer par champ dans l'implémentation
  warnings: readonly ValidationIssue[];
}
