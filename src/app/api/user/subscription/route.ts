import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getUserSubscriptionAndUsage } from '@/server/subscriptions/quota';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const subscriptionStatus = await getUserSubscriptionAndUsage(user.id);

    return NextResponse.json(subscriptionStatus);
  } catch (error: any) {
    console.error('[api/user/subscription] Error fetching subscription:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération du forfait' }, { status: 500 });
  }
}
