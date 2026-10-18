import { generate, extract, check } from '@stafyniaksacha/facturx';
import { Buffer } from 'node:buffer';

export interface CheckResult {
    valid: boolean;
    errors: any[];
    flavor: string;
    level: string;
    schematronValid?: boolean;
    schematronErrors?: any[];
}

export interface FacturXEngine {
  /** 
   * Valide le XML contre les XSD et les règles Schematron.
   * `profile` peut être 'minimum', 'basicwl', 'basic', 'en16931', 'extended'.
   */
  checkXml(xml: string, profile?: string): Promise<CheckResult>;
  
  /** 
   * Intègre le XML dans le PDF existant (qui DOIT déjà être au format PDF/A-3).
   * Retourne le PDF/A-3 Factur-X final sous forme d'Uint8Array.
   */
  generateFacturX(pdfBytes: Uint8Array, xml: string): Promise<Uint8Array>;
  
  /**
   * Extrait le XML d'un fichier Factur-X.
   */
  extractXml(pdfBytes: Uint8Array): Promise<string>;
}

export const engine: FacturXEngine = {
  checkXml: async (xml: string, profile: string = 'en16931') => {
    // La lib interne de `@stafyniaksacha/facturx` gère XSD + Schematron via WASM
    // profile attendu en minuscules.
    return check({ xml, flavor: 'facturx', level: profile as any });
  },
  
  generateFacturX: async (pdfBytes: Uint8Array, xml: string) => {
    return generate({ pdf: Buffer.from(pdfBytes), xml, language: 'fr-FR' });
  },
  
  extractXml: async (pdfBytes: Uint8Array) => {
    const result = await extract({ pdf: Buffer.from(pdfBytes) });
    if (!result.xml) {
      throw new Error("Impossible d'extraire le XML du PDF Factur-X");
    }
    return result.xml;
  }
};
