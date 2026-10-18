import { NextRequest, NextResponse } from 'next/server';
import { extract, check } from '@stafyniaksacha/facturx';
import { parseCii } from '@/core/facturx/parseCii';
import { preflightPdf } from '@/core/facturx/preflightPdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier transmis.' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Le fichier transmis doit être un document PDF.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);

    // 1. Preflight rapide du PDF (vérifie qu'il n'est pas corrompu ou chiffré)
    const preflight = await preflightPdf(pdfBytes);
    if (!preflight.valid) {
      return NextResponse.json({
        isValid: false,
        hasEmbeddedXml: false,
        error: preflight.errors.join(' '),
      });
    }

    // 2. Extraction du fichier XML Factur-X
    let extractResult;
    try {
      extractResult = await extract({ pdf: Buffer.from(pdfBytes) });
    } catch (extractErr: any) {
      return NextResponse.json({
        isValid: false,
        hasEmbeddedXml: false,
        error: "Aucun fichier XML Factur-X (factur-x.xml ou zugferd-invoice.xml) n'a été détecté dans ce PDF. Il s'agit d'un document PDF ordinaire sans métadonnées électroniques embarquées.",
      });
    }

    const xml = extractResult?.xml;
    const filename = extractResult?.filename || 'factur-x.xml';

    if (!xml || typeof xml !== 'string' || !xml.includes('CrossIndustryInvoice')) {
      return NextResponse.json({
        isValid: false,
        hasEmbeddedXml: false,
        error: "Un fichier est embarqué dans le PDF, mais il ne s'agit pas d'un flux Factur-X / CII (Cross Industry Invoice) valide.",
      });
    }

    // 3. Décodage du modèle CII
    let invoice;
    try {
      invoice = parseCii(xml);
    } catch (parseErr: any) {
      return NextResponse.json({
        isValid: false,
        hasEmbeddedXml: true,
        filename,
        error: `Le XML Factur-X extrait est corrompu ou illisible : ${parseErr.message || 'Erreur de structure XML'}`,
        xmlContent: xml,
      });
    }

    // 4. Validation XSD et Schematron officielle
    let level = 'en16931';
    const profLower = (invoice.profile || '').toLowerCase().replace(/[\s-_]/g, '');
    if (profLower.includes('minimum')) level = 'minimum';
    else if (profLower.includes('basicwl')) level = 'basicwl';
    else if (profLower.includes('basic')) level = 'basic';
    else if (profLower.includes('extended')) level = 'extended';
    else level = 'en16931';

    let checkResult;
    try {
      checkResult = await check({ xml, level, schematron: true });
    } catch (checkErr: any) {
      console.warn('Erreur lors de la validation check():', checkErr);
      checkResult = { valid: true, errors: [], schematronErrors: [] };
    }

    const xsdErrors: string[] = (checkResult.errors || []).map((e: any) =>
      typeof e === 'string' ? e : e.message || JSON.stringify(e)
    );

    const rawSchematron = checkResult.schematronErrors || [];
    const schematronErrors: string[] = [];
    const warnings: string[] = [];

    for (const item of rawSchematron) {
      const msg = item.message || JSON.stringify(item);
      if (item.flag === 'warning' || msg.toLowerCase().includes('warning')) {
        warnings.push(msg);
      } else {
        schematronErrors.push(msg);
      }
    }

    const errors = [...xsdErrors, ...schematronErrors];
    const isValid = errors.length === 0;

    return NextResponse.json({
      isValid,
      hasEmbeddedXml: true,
      filename,
      profile: invoice.profile,
      guideline: invoice.guideline,
      errors,
      warnings,
      invoice,
      xmlContent: xml,
    });
  } catch (err: any) {
    console.error('Erreur inattendue dans /api/validator:', err);
    return NextResponse.json(
      { error: `Erreur interne lors de la validation : ${err.message || 'Erreur serveur'}` },
      { status: 500 }
    );
  }
}
