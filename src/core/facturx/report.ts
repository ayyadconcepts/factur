import { FacturXProfile } from '../domain/invoice';

export interface GenerationReport {
  mode: 'GARANTI' | 'FIDELE';
  profile: FacturXProfile;
  inputPdfSha256: string;
  validatedInvoiceSha256: string;      // JSON canonique (clés triées)
  xmlSha256: string;
  outputPdfSha256: string;
  libs: Record<string, string>;        // versions épinglées
  checks: { xsd: boolean; schematron: boolean; pdfPreflight: boolean; roundTrip: boolean };
  attestations: readonly string[];
  generatedAt: string;                 // ISO 8601
}
