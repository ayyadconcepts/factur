import { createClient } from '@/server/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { r2Store } from '@/server/storage/r2';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, CopyPlus, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !invoice) {
    return <div className="container py-10">Facture introuvable.</div>;
  }

  // Generate a short-lived download URL from R2
  const downloadUrl = await r2Store.getSignedUrl(invoice.facturx_key, 60);

  return (
    <div className="container max-w-3xl mx-auto py-10 space-y-6">
      <Link href="/history" className={buttonVariants({ variant: "ghost", className: "-ml-4" })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à l'historique
      </Link>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {invoice.type_code === '381' ? 'Avoir' : 'Facture'} {invoice.number}
          </h1>
          <p className="text-muted-foreground mt-2">
            Émise le {invoice.issue_date}
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Détails de la facture</CardTitle>
          <CardDescription>Informations extraites et vérifiées (Mode {invoice.mode})</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground block">Client</span>
              <span className="font-medium">{invoice.buyer_name}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block">SIREN Client</span>
              <span className="font-medium">{invoice.buyer_siren || 'Non renseigné'}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block">Total HT</span>
              <span className="font-medium">{Number(invoice.total_excl_vat).toFixed(2)} {invoice.currency}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block">Total TTC</span>
              <span className="font-medium">{Number(invoice.total_incl_vat).toFixed(2)} {invoice.currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <a href={downloadUrl} download className={buttonVariants()}>
          <Download className="mr-2 h-4 w-4" />
          Télécharger le PDF Factur-X
        </a>
        {invoice.type_code === '380' && (
          <Button variant="outline" disabled title="Bientôt disponible">
            <CopyPlus className="mr-2 h-4 w-4" />
            Créer un avoir
          </Button>
        )}
      </div>
    </div>
  );
}
