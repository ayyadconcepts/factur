"use client";

import React from 'react';
import Link from 'next/link';
import { useSubscription } from '@/client/hooks/useSubscription';
import { Sparkles, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuotaWidgetProps {
  compact?: boolean;
}

export function QuotaWidget({ compact = false }: QuotaWidgetProps) {
  const { subscription, isLoading, usageCount, invoiceQuota, planName, isQuotaExceeded } = useSubscription();

  if (isLoading || !subscription) {
    return null;
  }

  const percentage = Math.min(100, Math.round((usageCount / invoiceQuota) * 100));
  const isNearLimit = percentage >= 80 && !isQuotaExceeded;

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-border bg-card/60 text-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-medium">
            <span>{planName}</span>
            <span className="text-muted-foreground">•</span>
            <span className={isQuotaExceeded ? 'text-rose-600 font-semibold' : 'text-foreground'}>
              {usageCount} / {invoiceQuota}
            </span>
          </div>
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isQuotaExceeded ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <Link
          href="/#pricing"
          className="text-primary hover:underline text-[11px] font-medium flex items-center ml-1"
        >
          Upgrader
        </Link>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isQuotaExceeded 
        ? 'border-rose-200 bg-rose-50/60 dark:bg-rose-950/20 dark:border-rose-900/50' 
        : isNearLimit 
        ? 'border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/50' 
        : 'border-border bg-card'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isQuotaExceeded ? (
            <AlertTriangle className="size-4 text-rose-600 dark:text-rose-400" />
          ) : (
            <Sparkles className="size-4 text-primary" />
          )}
          <span className="font-semibold text-sm text-foreground">
            Forfait {planName}
          </span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {usageCount} / {invoiceQuota} factures
        </span>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-2 bg-muted/80 rounded-full overflow-hidden mt-2.5">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isQuotaExceeded ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {isQuotaExceeded
            ? 'Quota mensuel atteint'
            : isNearLimit
            ? 'Plus que quelques conversions restantes'
            : 'Renouvellement automatique chaque mois'}
        </span>
        <Button
          nativeButton={false}
          size="sm"
          variant={isQuotaExceeded ? 'default' : 'outline'}
          className="h-7 text-xs px-2.5 gap-1"
          render={
            <Link href="/#pricing">
              <span>Passer au supérieur</span>
              <ArrowUpRight className="size-3" />
            </Link>
          }
        />
      </div>
    </div>
  );
}
