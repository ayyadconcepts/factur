"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Building2,
  User,
  FileText,
  Euro,
  Calendar,
  AlertTriangle,
  FileArchive,
  Clock,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';

const Viewer = dynamic(
  () => import('@/components/InvoiceEditor/Viewer').then((mod) => mod.Viewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        Chargement du visualiseur PDF...
      </div>
    ),
  }
);

export interface BatchItemWithInvoice {
  id: string;
  batch_id: string;
  file_name: string;
  raw_r2_key: string;
  facturx_r2_key?: string | null;
  invoice_id?: string | null;
  status: 'pending' | 'processing' | 'success' | 'error';
  error_message?: string | null;
  invoice_number?: string | null;
  total_incl_vat?: number | null;
  invoice?: {
    id: string;
    number: string;
    issue_date: string;
    due_date?: string;
    currency: string;
    buyer_name: string;
    total_excl_vat: number;
    total_vat: number;
    total_incl_vat: number;
    invoice?: any;
    facturx_key?: string;
  } | null;
}

interface BulkResultsViewerProps {
  items: BatchItemWithInvoice[];
  batchName: string;
  zipUrl?: string | null;
  onNewBatch?: () => void;
}

export function BulkResultsViewer({
  items,
  batchName,
  zipUrl,
}: BulkResultsViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!items || items.length === 0) {
    return null;
  }

  const selectedItem = items[currentIndex] ?? items[0];
  if (!selectedItem) {
    return null;
  }
  const currentItem = selectedItem;
  const invoiceData = currentItem.invoice?.invoice || {};

  // Données extraites de la facture courante
  const sellerName = invoiceData.seller?.name || 'Inconnu';
  const buyerName = invoiceData.buyer?.name || currentItem.invoice?.buyer_name || 'Inconnu';
  const invoiceNumber = currentItem.invoice_number || currentItem.invoice?.number || invoiceData.number || 'N/A';
  const issueDate = currentItem.invoice?.issue_date || invoiceData.issueDate || 'N/A';
  const totalHT = currentItem.invoice?.total_excl_vat !== undefined
    ? Number(currentItem.invoice.total_excl_vat).toFixed(2)
    : invoiceData.totals?.taxExclusive || '0.00';
  const totalTVA = currentItem.invoice?.total_vat !== undefined
    ? Number(currentItem.invoice.total_vat).toFixed(2)
    : invoiceData.totals?.taxTotal || '0.00';
  const totalTTC = currentItem.total_incl_vat !== undefined && currentItem.total_incl_vat !== null
    ? Number(currentItem.total_incl_vat).toFixed(2)
    : currentItem.invoice?.total_incl_vat !== undefined
    ? Number(currentItem.invoice.total_incl_vat).toFixed(2)
    : invoiceData.totals?.taxInclusive || '0.00';

  const isSuccess = currentItem.status === 'success';

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const pdfUrl = currentItem.invoice_id
    ? `/api/invoices/${currentItem.invoice_id}/pdf`
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Barre d'en-tête globale du lot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-card rounded-full shadow-sm border">
            <FileArchive className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight">{batchName}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                {items.filter(i => i.status === 'success').length} / {items.length} converties
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Factures Factur-X certifiées conformes EN 16931
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {zipUrl && (
            <a
              href={zipUrl}
              download
              className={buttonVariants({
                size: 'sm',
                className: 'bg-[#02b282] hover:bg-[#01946c] text-white font-medium',
              })}
            >
              <Download className="size-3.5 mr-1.5" />
              Télécharger tout le lot (ZIP)
            </a>
          )}
        </div>
      </div>

      {/* Conteneur principal 50/50 identique au convertisseur individuel */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-[620px]">
        {/* Colonne gauche : Visualiseur PDF avec Carrousel */}
        <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r bg-muted/10 relative h-full flex flex-col">
          {/* Barre du carrousel avec flèches de navigation en haut à droite */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-background/80 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2 truncate max-w-[65%]">
              <FileText className="size-4 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium truncate" title={currentItem.file_name}>
                {currentItem.file_name}
              </span>
            </div>

            {/* Navigation carrousel avec flèches en haut à droite */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded bg-muted/60">
                {currentIndex + 1} / {items.length}
              </span>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                aria-label="Facture précédente"
                className="p-1 rounded-md border border-border hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === items.length - 1}
                aria-label="Facture suivante"
                className="p-1 rounded-md border border-border hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Affichage du PDF ou message d'erreur */}
          <div className="flex-1 overflow-hidden relative">
            {isSuccess && pdfUrl ? (
              <Viewer file={pdfUrl} />
            ) : currentItem.status === 'error' ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-rose-50/40 dark:bg-rose-950/20">
                <AlertTriangle className="size-10 text-rose-500 mb-3" />
                <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                  Erreur de conversion
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  {currentItem.error_message || 'Le document PDF est illisible ou ne respecte pas le format de facture.'}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                <Clock className="size-4 animate-spin mr-2" />
                Document en attente de traitement...
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite : Overview de l'extraction (identique à Overview.tsx) */}
        <div className="w-full lg:w-1/2 bg-background overflow-y-auto flex flex-col p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Résumé de la conversion</h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Facture {currentIndex + 1} sur {items.length} • {currentItem.file_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSuccess ? (
                <StatusBadge status="done" label="Converti" />
              ) : currentItem.status === 'error' ? (
                <StatusBadge status="canceled" label="Erreur" />
              ) : (
                <StatusBadge status="in-process" label="En cours" />
              )}
            </div>
          </div>

          {/* Données clés extraites - identique à Overview.tsx */}
          <div className="flex flex-col mb-6">
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <Building2 className="w-4 h-4" /> Émetteur
              </div>
              <div className="font-medium text-sm text-right truncate max-w-[60%]">
                {sellerName}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <User className="w-4 h-4" /> Récepteur
              </div>
              <div className="font-medium text-sm text-right truncate max-w-[60%]">
                {buyerName}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <FileText className="w-4 h-4" /> N° Facture
              </div>
              <div className="font-medium text-sm text-right">
                {invoiceNumber}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <Calendar className="w-4 h-4" /> Date d'émission
              </div>
              <div className="font-medium text-sm text-right">
                {issueDate}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <Euro className="w-4 h-4" /> Total HT
              </div>
              <div className="font-medium text-sm text-right">
                {totalHT} €
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <Euro className="w-4 h-4" /> Total TVA
              </div>
              <div className="font-medium text-sm text-right">
                {totalTVA} €
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border/50 bg-muted/20 px-2 rounded-lg">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Euro className="w-4 h-4 text-emerald-600" /> Montant TTC
              </div>
              <div className="font-bold text-base text-right text-emerald-600 dark:text-emerald-400">
                {totalTTC} €
              </div>
            </div>
          </div>

          {/* Boutons d'actions en bas de l'overview - styling identique à Overview.tsx */}
          <div className="flex items-center justify-end gap-3 mt-auto pt-4 border-t border-border/50">
            {isSuccess && pdfUrl && (
              <a
                href={pdfUrl}
                download={`${invoiceNumber}-facturx.pdf`}
                className={buttonVariants({ variant: 'outline' })}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger ce PDF
              </a>
            )}
            {zipUrl && (
              <a
                href={zipUrl}
                download
                className={buttonVariants({
                  className: 'bg-[#02b282] hover:bg-[#01946c] text-white',
                })}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger le lot (ZIP)
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkResultsViewer;
