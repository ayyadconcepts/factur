"use client";

import React from 'react';
import Link from 'next/link';
import { useSubscription } from '@/client/hooks/useSubscription';
import { ArrowUpRight } from 'lucide-react';

export function SidebarQuotaWidget() {
  const { subscription, isLoading, usageCount, invoiceQuota, planName, isQuotaExceeded } = useSubscription();

  if (isLoading || !subscription) {
    return null;
  }

  const percentage = invoiceQuota > 0 ? Math.min(100, Math.round((usageCount / invoiceQuota) * 100)) : 0;
  const isNearLimit = percentage >= 80 && !isQuotaExceeded;
  const remaining = Math.max(0, invoiceQuota - usageCount);
  const isTopPlan = subscription.plan.id === 'intensif';

  return (
    <div className="group-data-[collapsible=icon]:hidden rounded-xl bg-cream-base dark:bg-zinc-900/90 border border-border/80 dark:border-zinc-800 p-3.5 flex flex-col gap-2.5 text-xs transition-all">
      {/* Ligne 1 : Nom du forfait & Action Upgrader */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="size-2 rounded-full bg-[#02b282] shrink-0" />
          <span className="font-semibold text-xs text-foreground tracking-tight truncate">
            {planName}
          </span>
        </div>
        <Link
          href="/dashboard/subscription"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#02b282]/10 text-[#02b282] hover:bg-[#02b282]/20 border border-[#02b282]/25 transition-all shrink-0"
        >
          <span>{isTopPlan ? 'Gérer' : 'Upgrader'}</span>
          <ArrowUpRight className="size-2.5" />
        </Link>
      </div>

      {/* Ligne 2 : Compteur et barre de progression regroupés */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between text-[11px] leading-tight">
          <span className="text-muted-foreground font-medium">Factures converties</span>
          <span className="tabular-nums">
            <strong className={isQuotaExceeded ? 'text-rose-600 font-bold' : 'text-foreground font-semibold'}>
              {usageCount}
            </strong>
            <span className="text-muted-foreground font-normal"> / {invoiceQuota}</span>
          </span>
        </div>

        {/* Barre de progression */}
        <div className="w-full h-1.5 bg-cream-dark dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isQuotaExceeded ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-[#02b282]'
            }`}
            style={{ width: `${Math.max(percentage, usageCount > 0 ? 3 : 0)}%` }}
          />
        </div>

        {/* Sous-texte d'état : factures restantes et % */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground leading-none pt-0.5">
          <span>
            {isQuotaExceeded
              ? 'Quota atteint'
              : `${remaining} restante${remaining > 1 ? 's' : ''}`}
          </span>
          <span className="tabular-nums font-medium">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}
