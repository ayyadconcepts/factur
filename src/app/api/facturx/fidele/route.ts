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
    const formData = await req.formData();
    const invoiceJson = formData.get('invoice');
    const pdfFile = formData.get('pdf') as File | null;
    const saveToHistory = formData.get('saveToHistory') === 'true';
    
    if (!invoiceJson || typeof invoiceJson !== 'string' || !pdfFile) {
      return NextResponse.json({ error: 'Missing invoice or pdf data' }, { status: 400 });
    }

    // Vérification préalable du quota si l'utilisateur enregistre
    if (saveToHistory) {
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
        console.warn('[facturx/fidele] Quota check failed to authenticate user:', authErr);
      }
    }

    const { data: invoice, success, error } = InvoiceSchema.safeParse(JSON.parse(invoiceJson));
    
    if (!success) {
      return NextResponse.json({ error: 'Invalid invoice data', details: error.format() }, { status: 400 });
    }

    const sourcePdfBytes = new Uint8Array(await pdfFile.arrayBuffer());

    // Load assets
    const iccProfileBytes = fs.readFileSync(path.join(process.cwd(), 'assets/icc/sRGB.icc'));

    const result = await generateFacturxDocument({
      invoice,
      sourcePdfBytes,
      iccProfileBytes,
    });

    if (saveToHistory) {
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
          totalExclVat: parseFloat(invoice.totals.taxExclusiveTotal),
          totalVat: parseFloat(invoice.totals.taxTotal),
          totalInclVat: parseFloat(invoice.totals.taxInclusiveTotal),
          profile: invoice.profile,
          mode: 'FIDELE',
          invoiceData: invoice,
          reportData: { xmlValid: result.xmlValid, warnings: result.warnings },
          facturxPdfBytes: result.pdfBytes,
          facturxSha256: Buffer.from(await crypto.subtle.digest('SHA-256', Buffer.from(result.pdfBytes))).toString('hex')
        });
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
    console.error('Factur-X FIDELE generation error:', err);
    return NextResponse.json({ error: 'Internal server error', message: err.message }, { status: 500 });
  }
}
