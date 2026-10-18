import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  vat_id: z.string().optional(),
  address: z.record(z.string(), z.any()).optional(),
  legal_notes: z.any().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
    const parsed = updateSchema.parse(body);
    
    if (Object.keys(parsed).length === 0) {
      return NextResponse.json({ error: 'Aucune donnée à mettre à jour' }, { status: 400 });
    }

    // RLS will ensure we can only update if we are a member
    const { data, error } = await supabase
      .from('companies')
      .update({
        ...(parsed.name && { name: parsed.name }),
        ...(parsed.vat_id !== undefined && { vat_id: parsed.vat_id }),
        ...(parsed.address !== undefined && { address: parsed.address }),
        ...(parsed.legal_notes !== undefined && { legal_notes: parsed.legal_notes }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Entreprise introuvable ou accès refusé' }, { status: 404 });
    }

    return NextResponse.json({ company: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
