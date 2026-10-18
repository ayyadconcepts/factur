"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserSubscriptionStatus } from '@/server/subscriptions/quota';

export function useSubscription() {
  const [data, setData] = useState<UserSubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/user/subscription');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else if (res.status === 401) {
        // Utilisateur non connecté
        setData(null);
      } else {
        setError('Impossible de récupérer votre abonnement');
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription: data,
    isLoading,
    error,
    refresh: fetchSubscription,
    isQuotaExceeded: data?.isQuotaExceeded ?? false,
    canBulkConvert: data?.canBulkConvert ?? false,
    remainingInvoices: data?.remainingInvoices ?? 0,
    usageCount: data?.usageCount ?? 0,
    invoiceQuota: data?.invoiceQuota ?? 1,
    planName: data?.plan.name ?? 'Essai gratuit',
  };
}
