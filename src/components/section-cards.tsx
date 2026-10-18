"use client"

import React from "react"
import { TrendingUpIcon, TrendingDownIcon, FileCheck2, Euro, Building2, ShieldCheck } from "lucide-react"

import { cn } from "cn"

export interface DashboardStats {
  totalInvoices: number;
  invoicesThisMonth: number;
  invoicesGrowthPct: number;
  totalVolumeEur: number;
  volumeGrowthPct: number;
  uniqueClients: number;
  quotaRemaining: number;
  quotaTotal: number;
  complianceRate: number;
}

interface SectionCardsProps {
  stats?: Partial<DashboardStats>;
  className?: string;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function SectionCards({ stats, className }: SectionCardsProps) {
  const totalInvoices = stats?.totalInvoices ?? 0;
  const invoicesThisMonth = stats?.invoicesThisMonth ?? 0;
  const invoicesGrowthPct = stats?.invoicesGrowthPct ?? 0;
  const totalVolumeEur = stats?.totalVolumeEur ?? 0;
  const volumeGrowthPct = stats?.volumeGrowthPct ?? 0;
  const uniqueClients = stats?.uniqueClients ?? 0;
  const quotaRemaining = stats?.quotaRemaining ?? 0;
  const quotaTotal = stats?.quotaTotal ?? 0;
  const complianceRate = stats?.complianceRate ?? 100;

  const avgPerInvoice = totalInvoices > 0 ? totalVolumeEur / totalInvoices : 0;

  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {/* 1. Factures converties */}
      <div className="rounded-xl bg-cream-light dark:bg-zinc-900/90 border border-border/50 dark:border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)] transition-all">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Factures converties
          </span>
          <div className="size-8 rounded-lg bg-cream-base dark:bg-zinc-800/80 border border-border/40 flex items-center justify-center text-[#02b282] shrink-0">
            <FileCheck2 className="size-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {totalInvoices}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {invoicesGrowthPct !== 0 ? (
              <>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-semibold",
                    invoicesGrowthPct >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"
                  )}
                >
                  {invoicesGrowthPct >= 0 ? (
                    <TrendingUpIcon className="size-3" />
                  ) : (
                    <TrendingDownIcon className="size-3" />
                  )}
                  {invoicesGrowthPct >= 0 ? `+${invoicesGrowthPct}%` : `${invoicesGrowthPct}%`}
                </span>
                <span>vs mois dernier</span>
              </>
            ) : (
              <span>{invoicesThisMonth} ce mois-ci</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Volume facturé */}
      <div className="rounded-xl bg-cream-light dark:bg-zinc-900/90 border border-border/50 dark:border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)] transition-all">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Volume facturé (TTC)
          </span>
          <div className="size-8 rounded-lg bg-cream-base dark:bg-zinc-800/80 border border-border/40 flex items-center justify-center text-[#02b282] shrink-0">
            <Euro className="size-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums truncate">
            {formatMoney(totalVolumeEur)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {volumeGrowthPct !== 0 ? (
              <>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-semibold",
                    volumeGrowthPct >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"
                  )}
                >
                  {volumeGrowthPct >= 0 ? (
                    <TrendingUpIcon className="size-3" />
                  ) : (
                    <TrendingDownIcon className="size-3" />
                  )}
                  {volumeGrowthPct >= 0 ? `+${volumeGrowthPct}%` : `${volumeGrowthPct}%`}
                </span>
                <span>vs mois dernier</span>
              </>
            ) : avgPerInvoice > 0 ? (
              <span>Moyenne : {formatMoney(avgPerInvoice)}</span>
            ) : (
              <span>Total des transactions</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Clients destinataires */}
      <div className="rounded-xl bg-cream-light dark:bg-zinc-900/90 border border-border/50 dark:border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)] transition-all">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Clients destinataires
          </span>
          <div className="size-8 rounded-lg bg-cream-base dark:bg-zinc-800/80 border border-border/40 flex items-center justify-center text-[#02b282] shrink-0">
            <Building2 className="size-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {uniqueClients}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>
              {uniqueClients > 1 ? `${uniqueClients} entreprises distinctes` : `${uniqueClients} entreprise enregistrée`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Conformité Factur-X */}
      <div className="rounded-xl bg-cream-light dark:bg-zinc-900/90 border border-border/50 dark:border-zinc-800/80 p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)] transition-all">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Conformité Factur-X
          </span>
          <div className="size-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="size-4" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {complianceRate}%
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-500 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Norme EN 16931 & CIUS-FR</span>
          </div>
        </div>
      </div>
    </div>
  )
}
