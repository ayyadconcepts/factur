import { PDFDocument, PDFName, PDFDict, PDFArray, PDFRef, PDFString } from 'pdf-lib';

export class PreflightError extends Error {
  constructor(message: string) {
    super(`Preflight échoué: ${message}`);
    this.name = 'PreflightError';
  }
}

export async function checkPreflight(pdfBytes: Uint8Array): Promise<PDFDocument> {
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: false });
  } catch (err: any) {
    if (err.message?.includes('encrypted') || err.message?.includes('password')) {
      throw new PreflightError("Le PDF est chiffré ou protégé par mot de passe.");
    }
    throw new PreflightError("Impossible de lire le fichier PDF.");
  }

  if (doc.isEncrypted) {
    throw new PreflightError("Le PDF est chiffré.");
  }

  if (doc.getPageCount() > 10) {
    throw new PreflightError(`Le PDF contient trop de pages (${doc.getPageCount()}). Limite: 10.`);
  }

  // Check for JavaScript (Names -> JavaScript or OpenAction with JS)
  const catalog = doc.catalog;
  const names = catalog.lookupMaybe(PDFName.of('Names'), PDFDict);
  if (names && names.has(PDFName.of('JavaScript'))) {
    throw new PreflightError("Le PDF contient du code JavaScript interdit.");
  }
  
  // Also check OpenAction just in case
  const openAction = catalog.lookupMaybe(PDFName.of('OpenAction'), PDFDict);
  if (openAction) {
    const s = openAction.lookupMaybe(PDFName.of('S'), PDFName);
    if (s?.asString() === '/JavaScript') {
      throw new PreflightError("Le PDF contient une action d'ouverture JavaScript.");
    }
  }

  // Check if Factur-X XML is already embedded
  // Usually it's in AssociatedFiles (AF) in the Catalog
  const af = catalog.lookupMaybe(PDFName.of('AF'), PDFArray);
  if (af) {
    for (let i = 0; i < af.size(); i++) {
      const fileSpec = af.lookupMaybe(i, PDFDict);
      if (fileSpec) {
        const fName = fileSpec.lookupMaybe(PDFName.of('F'), PDFString)?.decodeText() 
                   || fileSpec.lookupMaybe(PDFName.of('UF'), PDFString)?.decodeText();
        if (fName === 'factur-x.xml') {
          af.remove(i);
          i--;
        }
      }
    }
  }

  return doc;
}
