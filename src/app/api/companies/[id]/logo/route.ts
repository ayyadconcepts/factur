import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { r2Store } from '@/server/storage/r2';
import sizeOf from 'image-size';

// Helper to check magic bytes
function checkMagicBytes(buffer: Buffer): 'png' | 'jpeg' | null {
  if (buffer.length < 4) return null;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'png';
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }
  return null;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify membership
  const { data: isMember, error: memberError } = await supabase.rpc('is_company_member', { cid: id });
  if (memberError || !isMember) {
    return NextResponse.json({ error: 'Entreprise introuvable ou accès refusé' }, { status: 404 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (file.size > 512 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (512 Ko max)' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check magic bytes
    const format = checkMagicBytes(buffer);
    if (!format) {
      return NextResponse.json({ error: 'Format invalide, PNG ou JPEG attendu' }, { status: 400 });
    }

    // Check dimensions using image-size
    try {
      const dimensions = sizeOf(buffer);
      if (!dimensions.width || !dimensions.height) throw new Error();
      if (dimensions.width > 600 || dimensions.height > 200) {
        return NextResponse.json({ error: 'Dimensions trop grandes (max 600x200)' }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: 'Impossible de lire les dimensions de l\'image' }, { status: 400 });
    }

    const key = `logos/${id}/logo.${format}`;

    // Upload to R2
    await r2Store.put(key, new Uint8Array(buffer), { contentType: `image/${format}` });

    // Update database
    const { error: updateError } = await supabase
      .from('companies')
      .update({ logo_key: key, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour de la base de données' }, { status: 500 });
    }

    return NextResponse.json({ success: true, key });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify membership
  const { data: isMember, error: memberError } = await supabase.rpc('is_company_member', { cid: id });
  if (memberError || !isMember) {
    return NextResponse.json({ error: 'Entreprise introuvable ou accès refusé' }, { status: 404 });
  }

  // Get company logo_key
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('logo_key')
    .eq('id', id)
    .single();

  if (companyError || !company?.logo_key) {
    return NextResponse.json({ error: 'Logo introuvable' }, { status: 404 });
  }

  try {
    const signedUrl = await r2Store.getSignedUrl(company.logo_key, 60);
    return NextResponse.json({ url: signedUrl });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erreur lors de la génération de l\'URL' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: isMember, error: memberError } = await supabase.rpc('is_company_member', { cid: id });
  if (memberError || !isMember) return NextResponse.json({ error: 'Accès refusé' }, { status: 404 });

  const { data: company } = await supabase.from('companies').select('logo_key').eq('id', id).single();
  
  if (company?.logo_key) {
    try {
      await r2Store.delete(company.logo_key);
      await supabase.from('companies').update({ logo_key: null, updated_at: new Date().toISOString() }).eq('id', id);
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
