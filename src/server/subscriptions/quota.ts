import { createAdminClient } from '@/server/supabase/admin';
import { getPlan, PlanDefinition, isQuotaExceeded, getRemainingInvoices } from '@/config/plans';

export interface UserSubscriptionStatus {
  plan: PlanDefinition;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  usageCount: number;
  invoiceQuota: number;
  remainingInvoices: number;
  isQuotaExceeded: boolean;
  canBulkConvert: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  paddleSubscriptionId?: string | null;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  status: UserSubscriptionStatus;
}

/**
 * Récupère le statut d'abonnement et la consommation actuelle de factures pour un utilisateur.
 * Gère gracieusement le cas où la table subscriptions n'est pas encore migrée ou vide.
 */
export async function getUserSubscriptionAndUsage(userId: string): Promise<UserSubscriptionStatus> {
  const admin = createAdminClient();

  try {
    // 1. Tenter d'appeler la fonction RPC atomique si elle existe
    const { data: rpcData, error: rpcError } = await admin.rpc('get_user_subscription_usage', {
      p_user_id: userId,
    });

    if (!rpcError && rpcData) {
      const plan = getPlan(rpcData.plan_id);
      const usageCount = Number(rpcData.usage_count) || 0;

      return {
        plan,
        status: rpcData.status || 'active',
        usageCount,
        invoiceQuota: plan.invoiceQuota,
        remainingInvoices: getRemainingInvoices(usageCount, plan.id),
        isQuotaExceeded: isQuotaExceeded(usageCount, plan.id),
        canBulkConvert: plan.canBulkConvert,
        currentPeriodStart: rpcData.current_period_start || new Date().toISOString(),
        currentPeriodEnd: rpcData.current_period_end || new Date().toISOString(),
        paddleSubscriptionId: rpcData.paddle_subscription_id,
      };
    }
  } catch (err) {
    console.warn('[quota] RPC get_user_subscription_usage failed, falling back to direct query:', err);
  }

  // 2. Repli : Requête directe sur la table subscriptions
  try {
    const { data: sub } = await admin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const planId = sub?.plan_id || 'free';
    const plan = getPlan(planId);
    const periodStart = sub?.current_period_start || new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const periodEnd = sub?.current_period_end || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    // Compter les factures créées dans la période
    const { count } = await admin
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', periodStart)
      .lt('created_at', periodEnd);

    const usageCount = count || 0;

    return {
      plan,
      status: sub?.status || 'active',
      usageCount,
      invoiceQuota: plan.invoiceQuota,
      remainingInvoices: getRemainingInvoices(usageCount, plan.id),
      isQuotaExceeded: isQuotaExceeded(usageCount, plan.id),
      canBulkConvert: plan.canBulkConvert,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      paddleSubscriptionId: sub?.paddle_subscription_id,
    };
  } catch (fallbackErr) {
    console.error('[quota] Failed to fetch subscription/usage, defaulting to free plan:', fallbackErr);
    const defaultPlan = getPlan('free');
    return {
      plan: defaultPlan,
      status: 'active',
      usageCount: 0,
      invoiceQuota: defaultPlan.invoiceQuota,
      remainingInvoices: defaultPlan.invoiceQuota,
      isQuotaExceeded: false,
      canBulkConvert: false,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    };
  }
}

/**
 * Vérifie si l'utilisateur est autorisé à convertir une facture supplémentaire selon son quota.
 */
export async function checkCanConvertInvoice(userId: string): Promise<QuotaCheckResult> {
  const status = await getUserSubscriptionAndUsage(userId);

  if (status.isQuotaExceeded) {
    return {
      allowed: false,
      reason: `Votre quota de ${status.invoiceQuota} factures pour le forfait ${status.plan.name} est atteint pour cette période. Veuillez passer à une offre supérieure pour continuer.`,
      status,
    };
  }

  return {
    allowed: true,
    status,
  };
}

/**
 * Vérifie si l'utilisateur a accès à la fonctionnalité de conversion par lot (Bulk conversion).
 */
export async function checkCanBulkConvert(userId: string): Promise<QuotaCheckResult> {
  const status = await getUserSubscriptionAndUsage(userId);

  if (!status.canBulkConvert) {
    return {
      allowed: false,
      reason: `La conversion par lot (Bulk conversion) est réservée aux forfaits Volume / Batch (20 €) et Intensif (50 €).`,
      status,
    };
  }

  return {
    allowed: true,
    status,
  };
}
