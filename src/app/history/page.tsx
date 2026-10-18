import { createClient } from '@/server/supabase/server';
import { redirect } from 'next/navigation';
import { InvoiceTable } from '@/components/History/InvoiceTable';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, number, issue_date, buyer_name, total_incl_vat, currency, type_code')
    .order('issue_date', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
  }

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Historique des factures</h1>
        <div className="flex gap-4">
          <Link href="/api/history/export" target="_blank" className={buttonVariants({ variant: 'outline' })}>
            Exporter ZIP
          </Link>
          <Link href="/editor-test" className={buttonVariants()}>
            Nouvelle facture
          </Link>
        </div>
      </header>

      <main>
        <InvoiceTable invoices={invoices || []} />
      </main>
    </div>
  );
}
