import { PlanId } from '@/config/plans';

/**
 * Configuration et correspondance des prix Paddle Billing.
 * À alimenter avec les Price IDs créés dans le Dashboard Paddle (Sandbox ou Production).
 */
export const PADDLE_CONFIG = {
  environment: (process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox') as 'sandbox' | 'production',
  clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
  apiKey: process.env.PADDLE_API_KEY || '',
  webhookSecret: process.env.PADDLE_WEBHOOK_SECRET || '',

  // Identifiants des prix Paddle (ex: 'pri_01h...')
  prices: {
    essentiel: process.env.NEXT_PUBLIC_PADDLE_PRICE_ESSENTIEL || '',
    volume: process.env.NEXT_PUBLIC_PADDLE_PRICE_VOLUME || '',
    intensif: process.env.NEXT_PUBLIC_PADDLE_PRICE_INTENSIF || '',
  } as Record<Exclude<PlanId, 'free'>, string>,
};

/**
 * Récupère le Price ID Paddle associé à un plan.
 */
export function getPaddlePriceId(planId: PlanId): string | undefined {
  if (planId === 'free') return undefined;
  return PADDLE_CONFIG.prices[planId] || undefined;
}

/**
 * Retrouve notre PlanId interne à partir d'un Price ID reçu de Paddle (ex: dans un webhook).
 */
export function getPlanIdFromPaddlePriceId(priceId: string): PlanId | undefined {
  for (const [planId, paddlePriceId] of Object.entries(PADDLE_CONFIG.prices)) {
    if (paddlePriceId && paddlePriceId === priceId) {
      return planId as PlanId;
    }
  }
  return undefined;
}

/**
 * Indique si la configuration client Paddle est présente.
 */
export function isPaddleConfigured(): boolean {
  return Boolean(PADDLE_CONFIG.clientToken);
}
