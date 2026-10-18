import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { SectionCards, DashboardStats } from "@/components/section-cards"
import { ChartAreaInteractive, ChartDataPoint } from "@/components/chart-area-interactive"
import { DataTable, InvoiceItem } from "@/components/data-table"
import { getUserSubscriptionAndUsage } from '@/server/subscriptions/quota';
import { buttonVariants } from '@/components/ui/button';
import { Plus, UploadCloud, Layers } from 'lucide-react';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }

  // 1. Récupération des factures réelles de l'utilisateur
  const { data: rawInvoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const invoices = rawInvoices || [];

  // 2. Récupération du quota d'abonnement
  let quota = {
    remainingInvoices: 5,
    invoiceQuota: 5,
  };
  try {
    const subStatus = await getUserSubscriptionAndUsage(user.id);
    quota = {
      remainingInvoices: subStatus.remainingInvoices,
      invoiceQuota: subStatus.invoiceQuota,
    };
  } catch (quotaErr) {
    console.warn("Could not fetch subscription quota:", quotaErr);
  }

  // 3. Calcul des métriques réelles du SaaS
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const invoicesThisMonth = invoices.filter(i => (i.created_at || '').startsWith(currentMonthStr)).length;
  const invoicesPrevMonth = invoices.filter(i => (i.created_at || '').startsWith(prevMonthStr)).length;
  const invoicesGrowthPct = invoicesPrevMonth > 0
    ? Math.round(((invoicesThisMonth - invoicesPrevMonth) / invoicesPrevMonth) * 100)
    : (invoicesThisMonth > 0 ? 100 : 0);

  const totalVolumeEur = invoices.reduce((sum, i) => sum + (Number(i.total_incl_vat) || 0), 0);
  const volumeThisMonth = invoices
    .filter(i => (i.created_at || '').startsWith(currentMonthStr))
    .reduce((sum, i) => sum + (Number(i.total_incl_vat) || 0), 0);
  const volumePrevMonth = invoices
    .filter(i => (i.created_at || '').startsWith(prevMonthStr))
    .reduce((sum, i) => sum + (Number(i.total_incl_vat) || 0), 0);
  const volumeGrowthPct = volumePrevMonth > 0
    ? Math.round(((volumeThisMonth - volumePrevMonth) / volumePrevMonth) * 100)
    : (volumeThisMonth > 0 ? 100 : 0);

  const uniqueClients = new Set(
    invoices.map(i => i.buyer_name || i.buyer_siren).filter(Boolean)
  ).size;

  const stats: DashboardStats = {
    totalInvoices: invoices.length,
    invoicesThisMonth,
    invoicesGrowthPct,
    totalVolumeEur,
    volumeGrowthPct,
    uniqueClients,
    quotaRemaining: quota.remainingInvoices,
    quotaTotal: quota.invoiceQuota,
    complianceRate: 100,
  };

  // 4. Construction des séries temporelles réelles pour le graphique (90 derniers jours)
  const dateMap = new Map<string, { conversions: number; volume: number }>();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0] ?? '';
    if (dateStr) {
      dateMap.set(dateStr, { conversions: 0, volume: 0 });
    }
  }

  for (const inv of invoices) {
    if (!inv.created_at) continue;
    const dateStr = inv.created_at.split('T')[0] ?? '';
    if (dateStr && dateMap.has(dateStr)) {
      const entry = dateMap.get(dateStr)!;
      entry.conversions += 1;
      entry.volume += Number(inv.total_incl_vat) || 0;
    }
  }

  const chartData: ChartDataPoint[] = Array.from(dateMap.entries()).map(([date, val]) => ({
    date,
    conversions: val.conversions,
    volume: Math.round(val.volume),
  }));

  // 5. Transformation des factures pour la DataTable
  const tableData: InvoiceItem[] = invoices.map(i => ({
    id: i.id,
    number: i.number,
    buyer_name: i.buyer_name,
    buyer_siren: i.buyer_siren,
    issue_date: i.issue_date,
    due_date: i.due_date,
    created_at: i.created_at,
    type_code: i.type_code,
    total_excl_vat: Number(i.total_excl_vat) || 0,
    total_vat: Number(i.total_vat) || 0,
    total_incl_vat: Number(i.total_incl_vat) || 0,
    currency: i.currency || 'EUR',
    profile: i.profile || 'EN 16931',
    mode: i.mode || 'GARANTI',
    status: 'done',
    report: i.report,
  }));

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {/* En-tête de la page Vue d'ensemble */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Vue d&apos;ensemble
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Suivi en temps réel de vos conversions et de votre conformité Factur-X.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/bulk"
              className={buttonVariants({
                variant: 'outline',
                size: 'sm',
                className: 'h-8 text-xs rounded-lg border-border bg-card hover:bg-muted',
              })}
            >
              <Layers className="size-3.5 mr-1.5" />
              Conversion groupée
            </Link>
            <Link
              href="/dashboard/convert"
              className={buttonVariants({
                size: 'sm',
                className: 'h-8 text-xs rounded-lg bg-[#02b282] hover:bg-[#01946c] text-white',
              })}
            >
              <Plus className="size-3.5 mr-1.5" />
              Convertir une facture
            </Link>
          </div>
        </div>

        {/* 1. Les 4 Cartes d'indicateurs (KPI) */}
        <SectionCards stats={stats} />

        {/* 2. Graphique d'activité interactif */}
        <div>
          <ChartAreaInteractive data={chartData} />
        </div>

        {/* 3. Tableau TanStack de l'historique complet des conversions */}
        <DataTable data={tableData} />
      </div>
    </div>
  );
}
