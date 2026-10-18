import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { r2Store } from '@/server/storage/r2';
import { createAdminClient } from '@/server/supabase/admin';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('facturx_key, report')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !invoice || !invoice.facturx_key) {
      return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
    }

    const pdfBytes = await r2Store.get(invoice.facturx_key);

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBytes.byteLength.toString(),
        'Content-Disposition': `inline; filename="facture-${id}.pdf"`
      }
    });
  } catch (error: any) {
    console.error("Erreur téléchargement PDF:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function HEAD(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse(null, { status: 401 });
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('facturx_key, report')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !invoice || !invoice.facturx_key) {
      return new NextResponse(null, { status: 404 });
    }

    const cachedSize = invoice.report?.fileSize || invoice.report?.file_size;
    if (cachedSize && typeof cachedSize === 'number') {
      return new NextResponse(null, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': cachedSize.toString(),
        }
      });
    }

    // Query R2 head
    const meta = await r2Store.head(invoice.facturx_key);
    if (!meta) {
      return new NextResponse(null, { status: 404 });
    }

    // Persist to DB for next time
    try {
      const admin = createAdminClient();
      await admin
        .from('invoices')
        .update({
          report: {
            ...(invoice.report || {}),
            fileSize: meta.size,
            file_size: meta.size,
          }
        })
        .eq('id', id);
    } catch {
      // Non-fatal if update fails
    }

    return new NextResponse(null, {
      headers: {
        'Content-Type': meta.contentType || 'application/pdf',
        'Content-Length': meta.size.toString(),
      }
    });
  } catch (error: any) {
    console.error("Erreur HEAD PDF:", error);
    return new NextResponse(null, { status: 500 });
  }
}
