"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { createClient } from '@/client/supabaseBrowser';
import { StatusBadge } from '@/components/ui/status-badge';
import { QuotaWidget } from '@/components/dashboard/QuotaWidget';
import { useSubscription } from '@/client/hooks/useSubscription';

const InvoiceEditor = dynamic(
  () => import('@/components/InvoiceEditor').then(mod => ({ default: mod.InvoiceEditor })),
  { ssr: false }
);

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isQuotaExceeded, refresh: refreshSubscription } = useSubscription();

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (!error && data) {
          setRecentInvoices(data);
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'historique", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    import('@/lib/pendingUpload').then(({ getPendingUpload, clearPendingUpload }) => {
      getPendingUpload().then(data => {
        if (data?.file) {
          setFile(data.file);
          clearPendingUpload();
        }
      });
    });

    fetchHistory();
  }, [file]); // Re-fetch when file state changes (e.g., when closing the editor)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
    } else {
      alert("Veuillez sélectionner un fichier PDF valide.");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = e.dataTransfer.files[0];
      if (dropped && (dropped.type === 'application/pdf' || dropped.name.toLowerCase().endsWith('.pdf'))) {
        setFile(dropped);
      } else {
        alert("Veuillez déposer un fichier PDF valide.");
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Convertir une Facture
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Générez un fichier Factur-X certifié conforme.
          </p>
        </div>
        {file && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFile(null)}
            className="text-xs h-8 rounded-lg border-border bg-card hover:bg-muted w-fit shrink-0"
          >
            Changer de fichier
          </Button>
        )}
      </div>

      {isQuotaExceeded && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/80 dark:bg-rose-950/30 dark:border-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-300">
            <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>
              <strong>Quota mensuel atteint.</strong> Vous avez atteint la limite de factures incluses dans votre forfait pour ce mois.
            </span>
          </div>
          <Button
            nativeButton={false}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white shrink-0"
            render={
              <Link href="/#pricing">Changer de forfait</Link>
            }
          />
        </div>
      )}

      <div className="grid gap-8 md:gap-12">
        {file ? (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden min-h-[700px] flex flex-col">
            <InvoiceEditor file={file} onInvoiceGenerated={() => { fetchHistory(); refreshSubscription(); }} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Nouvel Import</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Glissez-déposez une facture PDF standard pour extraire ses données et générer un format Factur-X officiel.
              </p>
            </div>
            <div className="max-w-2xl">
              <div 
                className={`border-2 border-dashed rounded-xl p-12 transition-colors flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[300px] shadow-2xs
                  ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-cream-light hover:border-primary/50 hover:bg-cream-light/80'}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-4 bg-card rounded-full shadow-2xs border border-border">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-base text-foreground">Cliquez pour importer</p>
                  <p className="text-sm text-muted-foreground mt-1">ou glissez-déposez votre PDF ici</p>
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 pt-4 border-t border-border/50">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Historique des conversions</h2>
            <p className="text-sm text-muted-foreground mt-1">Retrouvez vos factures récemment converties.</p>
          </div>
          <div>
            {isLoadingHistory ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border border-border rounded-lg bg-cream-light p-6">
                Aucune facture convertie pour le moment.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl bg-cream-light shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
                <Table>
                  <TableHeader className="bg-cream-dark/60 border-b border-border">
                    <TableRow className="bg-cream-dark/60 hover:bg-cream-dark/70">
                      <TableHead>N° Facture</TableHead>
                      <TableHead>Date d'émission</TableHead>
                      <TableHead>Émetteur</TableHead>
                      <TableHead>Récepteur</TableHead>
                      <TableHead className="text-right">Montant TTC</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-cream-light">
                    {recentInvoices.map((item) => (
                      <TableRow key={item.id} className="bg-cream-light hover:bg-cream-dark/40 transition-colors border-b border-border">
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/invoices/${item.id}`} className="flex items-center gap-2 hover:underline hover:text-primary transition-colors">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            {item.number}
                          </Link>
                        </TableCell>
                        <TableCell>{item.issue_date}</TableCell>
                        <TableCell>{item.invoice?.seller?.name || 'N/A'}</TableCell>
                        <TableCell>{item.buyer_name}</TableCell>
                        <TableCell className="text-right font-medium">{item.total_incl_vat?.toFixed(2)} {item.currency}</TableCell>
                        <TableCell className="text-center">
                          <StatusBadge 
                            status={item.report?.xmlValid ? 'done' : 'in-process'} 
                            label={item.report?.xmlValid ? 'Converti' : 'En cours'} 
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <a href={`/api/invoices/${item.id}/pdf`} download={`${item.number}-facturx.pdf`} title="Télécharger la facture">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
