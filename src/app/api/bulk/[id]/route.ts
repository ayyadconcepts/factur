import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/server/supabase/admin';
import { r2Store } from '@/server/storage/r2';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: batchId } = await params;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const admin = createAdminClient();

    const { data: batch, error: batchErr } = await admin
      .from('batch_jobs')
      .select('*')
      .eq('id', batchId)
      .eq('user_id', user.id)
      .single();

    if (batchErr || !batch) {
      return NextResponse.json({ error: 'Lot introuvable' }, { status: 404 });
    }

    let items: any[] = [];
    const { data: joinedItems, error: joinErr } = await admin
      .from('batch_items')
      .select('*, invoice:invoices(*)')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: true });

    if (!joinErr && joinedItems) {
      items = joinedItems;
    } else {
      const { data: simpleItems } = await admin
        .from('batch_items')
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: true });
      items = simpleItems || [];
    }

    let zipUrl: string | null = null;
    if (batch.zip_r2_key) {
      try {
        zipUrl = await r2Store.getSignedUrl(batch.zip_r2_key, 3600);
      } catch (err) {
        console.warn('[bulk/get] Error generating zip signed url:', err);
      }
    }

    return NextResponse.json({
      batch,
      items: items || [],
      zipUrl,
    });
  } catch (error: any) {
    console.error('[bulk/get] Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
