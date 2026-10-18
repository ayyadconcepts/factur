import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateSiret } from '@/core/validation/identifiers';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ companies: data });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, siret } = body;

    if (!name || typeof name !== 'string' || name.length < 1 || name.length > 200) {
      return NextResponse.json({ error: 'Nom invalide.' }, { status: 400 });
    }

    if (!siret || typeof siret !== 'string') {
      return NextResponse.json({ error: 'SIRET requis.' }, { status: 400 });
    }

    const siretClean = siret.replace(/\s/g, '');
    const issue = validateSiret(siretClean);
    if (issue) {
      return NextResponse.json({ error: issue.message }, { status: 400 });
    }

    // Call the security definer RPC function
    const { data, error } = await supabase.rpc('create_company', {
      p_name: name,
      p_siret: siretClean
    });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Cette entreprise existe déjà pour ce compte.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
