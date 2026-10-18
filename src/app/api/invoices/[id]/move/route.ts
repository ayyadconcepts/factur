import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/server/supabase/admin';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { folder_id } = await req.json();
    const { id } = await context.params;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('invoices')
      .update({ folder_id: folder_id || null })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error("Erreur SQL déplacement:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn("Aucune facture mise à jour pour id:", id);
      return NextResponse.json({ error: "Facture introuvable ou non mise à jour" }, { status: 404 });
    }

    return NextResponse.json({ success: true, updated: data[0] });
  } catch (error: any) {
    console.error("Erreur déplacement:", error);
    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}
