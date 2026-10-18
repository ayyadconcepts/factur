import { NextRequest, NextResponse } from 'next/server';
import { getPaddleServer } from '@/lib/paddle/server';
import { PADDLE_CONFIG, getPlanIdFromPaddlePriceId } from '@/lib/paddle/config';
import { createAdminClient } from '@/server/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('paddle-signature');
    if (!signature) {
      console.warn('[paddle-webhook] Missing paddle-signature header');
      return NextResponse.json(
        { error: 'Missing paddle-signature header' },
        { status: 400 }
      );
    }

    if (!PADDLE_CONFIG.webhookSecret) {
      console.error('[paddle-webhook] PADDLE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const paddle = getPaddleServer();

    let event: any;
    try {
      event = await paddle.webhooks.unmarshal(rawBody, PADDLE_CONFIG.webhookSecret, signature);
    } catch (unmarshalErr: any) {
      console.error('[paddle-webhook] Signature verification failed:', unmarshalErr?.message || unmarshalErr);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const eventType = event.eventType;
    const data = event.data;
    console.log(`[paddle-webhook] Received event: ${eventType} (ID: ${event.eventId || data?.id})`);

    const admin = createAdminClient();

    // 1. Événements d'activation ou mise à jour d'abonnements
    if (
      eventType === 'subscription.created' ||
      eventType === 'subscription.updated' ||
      eventType === 'subscription.activated' ||
      eventType === 'subscription.resumed' ||
      eventType === 'subscription.past_due'
    ) {
      const subscriptionId = data.id;
      const customerId = data.customerId;
      const status = data.status || 'active';
      const items = data.items || [];
      const priceId = items[0]?.price?.id;
      const planId = (priceId ? getPlanIdFromPaddlePriceId(priceId) : undefined) || 'free';

      let userId = data.customData?.userId;

      // Si l'userId n'est pas dans customData, chercher dans la base si l'abonnement existe déjà
      if (!userId && subscriptionId) {
        const { data: existingSub } = await admin
          .from('subscriptions')
          .select('user_id')
          .eq('paddle_subscription_id', subscriptionId)
          .maybeSingle();

        if (existingSub?.user_id) {
          userId = existingSub.user_id;
        }
      }

      // Si toujours pas trouvé, chercher par paddle_customer_id
      if (!userId && customerId) {
        const { data: existingCust } = await admin
          .from('subscriptions')
          .select('user_id')
          .eq('paddle_customer_id', customerId)
          .maybeSingle();

        if (existingCust?.user_id) {
          userId = existingCust.user_id;
        }
      }

      if (userId) {
        const startsAt = data.currentBillingPeriod?.startsAt || new Date().toISOString();
        const endsAt = data.currentBillingPeriod?.endsAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

        const { error: upsertErr } = await admin
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              plan_id: planId,
              status: status,
              paddle_customer_id: customerId || null,
              paddle_subscription_id: subscriptionId,
              current_period_start: startsAt,
              current_period_end: endsAt,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );

        if (upsertErr) {
          console.error(`[paddle-webhook] Failed to upsert subscription for user ${userId}:`, upsertErr);
        } else {
          console.log(`[paddle-webhook] Subscription updated for user ${userId} -> Plan: ${planId}, Status: ${status}`);
        }
      } else {
        console.warn(`[paddle-webhook] Could not determine userId for subscription ${subscriptionId}`);
      }
    } else if (eventType === 'subscription.canceled') {
      // 2. Résiliation d'abonnement
      const subscriptionId = data.id;
      let userId = data.customData?.userId;

      if (!userId && subscriptionId) {
        const { data: existingSub } = await admin
          .from('subscriptions')
          .select('user_id')
          .eq('paddle_subscription_id', subscriptionId)
          .maybeSingle();

        if (existingSub?.user_id) {
          userId = existingSub.user_id;
        }
      }

      if (userId) {
        await admin
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan_id: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        console.log(`[paddle-webhook] Subscription canceled for user ${userId}, reverted to free plan.`);
      }
    } else if (eventType === 'transaction.completed') {
      // 3. Transaction complétée
      const userId = data.customData?.userId;
      const customerId = data.customerId;
      const subscriptionId = data.subscriptionId;

      if (userId && (customerId || subscriptionId)) {
        await admin
          .from('subscriptions')
          .update({
            paddle_customer_id: customerId || undefined,
            paddle_subscription_id: subscriptionId || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[paddle-webhook] Unhandled error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
