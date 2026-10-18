import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/server/supabase/admin';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Le nom du dossier est requis" }, { status: 400 });
    }

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

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('folders')
      .update({ name })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error("Erreur renommage dossier:", error);
      throw error;
    }

    return NextResponse.json({ success: true, folder: data });
  } catch (error: any) {
    console.error("Erreur renommage dossier:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const admin = createAdminClient();

    // Detach invoices so they are not deleted
    await admin
      .from('invoices')
      .update({ folder_id: null })
      .eq('folder_id', id)
      .eq('user_id', user.id);

    // Delete folder (CASCADE will delete subfolders)
    const { error } = await admin
      .from('folders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error("Erreur suppression dossier:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur suppression dossier:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
