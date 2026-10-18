import { PDFDocument, PDFName, PDFString } from 'pdf-lib';

/**
 * Adds a PDF/A OutputIntent to the PDFDocument to make it PDF/A-3b compliant.
 * This is required for Factur-X / veraPDF validation.
 * The sRGB ICC profile bytes must be provided (e.g. from assets/icc/sRGB.icc).
 */
export function addPdfaOutputIntent(pdfDoc: PDFDocument, iccProfileBytes: Uint8Array): void {
  const profileStream = pdfDoc.context.stream(iccProfileBytes, {
    N: 3,
    Alternate: PDFName.of('DeviceRGB'),
    Length: iccProfileBytes.length
  });
  const profileStreamRef = pdfDoc.context.register(profileStream);

  const outputIntent = pdfDoc.context.obj({
    Type: 'OutputIntent',
    S: 'GTS_PDFA1',
    OutputConditionIdentifier: PDFString.of('sRGB'),
    RegistryName: PDFString.of('http://www.color.org'),
    Info: PDFString.of('sRGB IEC61966-2.1'),
    DestOutputProfile: profileStreamRef,
  });
  const outputIntentRef = pdfDoc.context.register(outputIntent);

  pdfDoc.catalog.set(PDFName.of('OutputIntents'), pdfDoc.context.obj([outputIntentRef]));

  const xmp = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.6-c015 81.159809, 2016/11/11-01:42:16">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>3</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
  
  const metadataStream = pdfDoc.context.stream(xmp, {
    Type: PDFName.of('Metadata'),
    Subtype: PDFName.of('XML'),
    Length: xmp.length
  });
  const metadataStreamRef = pdfDoc.context.register(metadataStream);
  pdfDoc.catalog.set(PDFName.of('Metadata'), metadataStreamRef);
}
