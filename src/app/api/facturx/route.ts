import { NextResponse } from 'next/server';
import { InvoiceSchema } from '@/core/validation/schema';
import { generateFacturxDocument } from '@/core/facturx/roundTrip';
import { saveInvoiceToHistory } from '@/server/supabase/saveInvoice';
import { createClient } from '@/server/supabase/server';
import { checkCanConvertInvoice } from '@/server/subscriptions/quota';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Vérification préalable du quota si l'utilisateur est connecté et enregistre
    if (body.saveToHistory) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const quotaCheck = await checkCanConvertInvoice(user.id);
          if (!quotaCheck.allowed) {
            return NextResponse.json({
              error: quotaCheck.reason,
              code: 'QUOTA_EXCEEDED',
              subscription: quotaCheck.status,
            }, { status: 403 });
          }
        }
      } catch (authErr) {
        console.warn('[facturx] Quota check failed to authenticate user:', authErr);
      }
    }

    const { data: invoice, success, error } = InvoiceSchema.safeParse(body.invoice);
    
    if (!success) {
      return NextResponse.json({ error: 'Invalid invoice data', details: error.format() }, { status: 400 });
    }

    // Load assets
    const iccProfileBytes = fs.readFileSync(path.join(process.cwd(), 'assets/icc/sRGB.icc'));
    const fontBytes = fs.readFileSync(path.join(process.cwd(), 'assets/fonts/Roboto-Regular.ttf'));
    const boldFontBytes = fs.readFileSync(path.join(process.cwd(), 'assets/fonts/Roboto-Bold.ttf'));

    let sourcePdfBytes: Uint8Array | undefined = undefined;
    if (body.sourcePdfBase64) {
      sourcePdfBytes = new Uint8Array(Buffer.from(body.sourcePdfBase64, 'base64'));
    }

    const result = await generateFacturxDocument({
      invoice,
      sourcePdfBytes,
      iccProfileBytes,
      fontBytes,
      boldFontBytes
    });

    if (body.saveToHistory) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await saveInvoiceToHistory({
            userId: user.id,
            number: invoice.number,
            typeCode: invoice.typeCode as '380' | '381',
            ...(invoice.precedingInvoiceNumber ? { relatedInvoiceId: invoice.precedingInvoiceNumber } : {}),
            issueDate: invoice.issueDate,
            ...(invoice.dueDate ? { dueDate: invoice.dueDate } : {}),
            currency: invoice.currency,
            buyerName: invoice.buyer.name,
            ...(invoice.buyer.siren ? { buyerSiren: invoice.buyer.siren } : {}),
            totalExclVat: parseFloat(invoice.totals.taxExclusive),
            totalVat: parseFloat(invoice.totals.taxTotal),
            totalInclVat: parseFloat(invoice.totals.taxInclusive),
            profile: invoice.profile,
            mode: sourcePdfBytes ? 'FIDELE' : 'GARANTI',
            invoiceData: invoice,
            reportData: { xmlValid: result.xmlValid, warnings: result.warnings },
            facturxPdfBytes: result.pdfBytes,
            facturxSha256: Buffer.from(await crypto.subtle.digest('SHA-256', Buffer.from(result.pdfBytes))).toString('hex')
          });
        }
      } catch (historyErr) {
        console.error("Warning: Could not save to history:", historyErr);
        // Continue and return the generated PDF anyway!
      }
    }

    // Return the PDF file
    return new NextResponse(result.pdfBytes as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.number}-facturx.pdf"`,
        'X-FacturX-XML-Valid': String(result.xmlValid)
      }
    });

  } catch (err: any) {
    console.error('Factur-X generation error:', err);
    
    if (err.name === 'XmlValidationError' || err.name === 'MissingMandatoryFieldsError') {
      return NextResponse.json({ 
        error: 'Validation Error', 
        message: err.message,
        details: err.messages || err.paths 
      }, { status: 422 });
    }
    
    if (err.name === 'PreflightError') {
      return NextResponse.json({ 
        error: 'Preflight Error', 
        message: err.message 
      }, { status: 400 });
    }

    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
