"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Layers,
  UploadCloud,
  FileText,
  AlertCircle,
  Loader2,
  Trash2,
  FileArchive,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QuotaWidget } from '@/components/dashboard/QuotaWidget';
import { useSubscription } from '@/client/hooks/useSubscription';
import { StatusBadge } from '@/components/ui/status-badge';
import InvoiceLoadingState from '@/components/kokonutui/ai-loading';

// Visualiseur de résultats split 50/50 avec carrousel (chargé côté client pour react-pdf)
const BulkResultsViewer = dynamic(
  () => import('@/components/bulk/BulkResultsViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center text-xs text-muted-foreground border rounded-xl bg-card">
        <Loader2 className="size-4 animate-spin mr-2" />
        Chargement des résultats de conversion...
      </div>
    ),
  }
);

interface BatchItem {
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
  invoice?: any;
}

interface BatchJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_files: number;
  processed_count: number;
  success_count: number;
  error_count: number;
  created_at: string;
  zip_r2_key?: string;
}

export default function BulkPage() {
  const { isLoading: isSubLoading, canBulkConvert, isQuotaExceeded, remainingInvoices, planName, refresh: refreshSub } = useSubscription();

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Lot actif en cours de suivi/traitement
  const [activeBatch, setActiveBatch] = useState<BatchJob | null>(null);
  const [activeItems, setActiveItems] = useState<BatchItem[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Historique des lots précédents
  const [pastBatches, setPastBatches] = useState<BatchJob[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingBatchIdRef = useRef<string | null>(null);

  // 1. Charger l'historique et vérifier s'il y a un lot en cours
  const fetchBatches = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await fetch('/api/bulk');
      if (res.ok) {
        const data = await res.json();
        setPastBatches(data.batches || []);

        // Reprendre automatiquement un lot en cours si l'utilisateur revient sur la page
        const running = data.batches?.find(
          (b: BatchJob) => b.status === 'processing' || b.status === 'pending'
        );
        if (running && !activeBatch) {
          fetchBatchDetails(running.id);
        }
      }
    } catch (err) {
      console.error('Erreur chargement des lots:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchBatchDetails = async (batchId: string) => {
    try {
      const res = await fetch(`/api/bulk/${batchId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveBatch(data.batch);
        setActiveItems(data.items || []);
        if (data.zipUrl) {
          setZipUrl(data.zipUrl);
        }
      }
    } catch (err) {
      console.error('Erreur détails du lot:', err);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // 2. Boucle de traitement par salves sur le serveur (robuste et sans course critique)
  useEffect(() => {
    if (!activeBatch || activeBatch.status === 'completed' || activeBatch.status === 'failed') {
      processingBatchIdRef.current = null;
      setIsProcessing(false);
      return;
    }

    const currentBatchId = activeBatch.id;

    if (processingBatchIdRef.current === currentBatchId) {
      return;
    }

    processingBatchIdRef.current = currentBatchId;
    let isCancelled = false;

    async function runLoop() {
      setIsProcessing(true);

      while (!isCancelled && processingBatchIdRef.current === currentBatchId) {
        try {
          const res = await fetch(`/api/bulk/${currentBatchId}/process`, { method: 'POST' });
          if (!res.ok) {
            console.error('[bulk/page] Erreur lors du traitement d’une salve:', res.status);
            break;
          }

          const data = await res.json();
          if (isCancelled) break;

          await fetchBatchDetails(currentBatchId);

          if (data.completed) {
            if (data.zipUrl) setZipUrl(data.zipUrl);
            refreshSub();
            fetchBatches();
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 800));
        } catch (err) {
          console.error('[bulk/page] Erreur inattendue dans la boucle de traitement:', err);
          break;
        }
      }

      if (!isCancelled && processingBatchIdRef.current === currentBatchId) {
        setIsProcessing(false);
        processingBatchIdRef.current = null;
      }
    }

    runLoop();

    return () => {
      isCancelled = true;
      if (processingBatchIdRef.current === currentBatchId) {
        processingBatchIdRef.current = null;
      }
    };
  }, [activeBatch?.id, activeBatch?.status]);

  // Gestion des fichiers déposés
  const handleFilesAdded = (newFiles: FileList | File[]) => {
    const validPdfs = Array.from(newFiles).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validPdfs.length === 0) {
      alert('Veuillez sélectionner uniquement des fichiers au format PDF.');
      return;
    }

    setFiles((prev) => {
      const combined = [...prev, ...validPdfs];
      const unique = combined.filter(
        (file, idx, arr) => arr.findIndex((f) => f.name === file.name && f.size === file.size) === idx
      );
      return unique.slice(0, 200);
    });
    setUploadError(null);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
    if (e.dataTransfer.files) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  // Lancement du lot
  const handleStartBatch = async () => {
    if (files.length === 0) return;

    if (files.length > remainingInvoices) {
      setUploadError(
        `Votre quota restant (${remainingInvoices} factures) est insuffisant pour traiter ce lot de ${files.length} factures.`
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      if (batchName.trim()) {
        formData.append('name', batchName.trim());
      }
      files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/bulk/create', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Erreur lors de la création du lot');
        setIsUploading(false);
        return;
      }

      setFiles([]);
      setBatchName('');
      setIsUploading(false);

      await fetchBatchDetails(data.batchId);
    } catch (err: any) {
      console.error('Erreur création du lot:', err);
      setUploadError(err.message || 'Erreur lors de l\'envoi des fichiers');
      setIsUploading(false);
    }
  };

  // Calcul du pourcentage et index du lot en cours
  const progressPercent = activeBatch && activeBatch.total_files > 0
    ? Math.round((activeBatch.processed_count / activeBatch.total_files) * 100)
    : 0;

  const currentInvoiceIndex = activeBatch
    ? Math.min(activeBatch.processed_count + 1, activeBatch.total_files)
    : 1;

  const isCompleted = activeBatch?.status === 'completed';
  const isInProgress = activeBatch && (activeBatch.status === 'processing' || activeBatch.status === 'pending');

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Conversion Groupée
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Convertissez jusqu&apos;à 200 factures en une seule archive ZIP certifiée.
          </p>
        </div>
        {(activeBatch || files.length > 0) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveBatch(null);
              setActiveItems([]);
              setZipUrl(null);
              setFiles([]);
            }}
            className="text-xs h-8 rounded-lg border-border bg-card hover:bg-muted w-fit shrink-0"
          >
            Nouveau lot
          </Button>
        )}
      </div>

      {/* Alerte Paywall si forfait insuffisant - styling identique à convert/page.tsx */}
      {!isSubLoading && !canBulkConvert && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Réservé aux forfaits Volume & Intensif.</strong> Votre forfait actuel (<strong>{planName}</strong>) est conçu pour la conversion individuelle. Passez à l'offre Volume (20 €/mois) ou Intensif pour débloquer la conversion par lot.
            </span>
          </div>
          <Button
            nativeButton={false}
            size="sm"
            className="bg-[#02b282] hover:bg-[#01946c] text-white shrink-0"
            render={
              <Link href="/#pricing">Mettre à niveau mon forfait</Link>
            }
          />
        </div>
      )}

      {/* Alerte Quota Dépassé - styling identique à convert/page.tsx */}
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

      {/* Grille principale - styling identique à convert/page.tsx */}
      <div className="grid gap-8 md:gap-12">
        {/* CAS 1 : LOT EN COURS DE TRAITEMENT -> ÉCRAN DE CHARGEMENT */}
        {isInProgress && (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
              <div>
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <h2 className="text-base font-semibold tracking-tight">
                    Traitement du lot : facture {currentInvoiceIndex} sur {activeBatch.total_files}
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeBatch.processed_count} sur {activeBatch.total_files} factures traitées ({activeBatch.success_count} réussies{activeBatch.error_count > 0 ? `, ${activeBatch.error_count} erreurs` : ''})
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-foreground border border-border">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex flex-col items-center justify-center min-h-[450px] border-2 border-dashed rounded-xl bg-muted/5">
              <InvoiceLoadingState />
            </div>
          </div>
        )}

        {/* CAS 2 : LOT TERMINÉ -> MÊME CADRE ET AFFICHAGE QUE LE CONVERTISSEUR */}
        {isCompleted && (
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden min-h-[700px] flex flex-col">
            <BulkResultsViewer
              items={activeItems}
              batchName={activeBatch.name}
              zipUrl={zipUrl}
              onNewBatch={() => {
                setActiveBatch(null);
                setActiveItems([]);
                setZipUrl(null);
              }}
            />
          </div>
        )}

        {/* CAS 3 : FORMULAIRE D'IMPORT PAR LOT (quand aucun lot n'est actif) */}
        {!isInProgress && !isCompleted && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Nouvel Import Groupé</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Glissez-déposez plusieurs factures PDF pour extraire leurs données et générer vos formats Factur-X officiels en un clic.
              </p>
            </div>

            <div className="max-w-2xl flex flex-col gap-4">
              {/* Dropzone identique à convert/page.tsx */}
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
                  <p className="font-medium text-base text-foreground">Cliquez pour importer vos factures</p>
                  <p className="text-sm text-muted-foreground mt-1">ou glissez-déposez vos PDF ici (jusqu'à 200 fichiers)</p>
                </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple
                accept=".pdf,application/pdf"
                onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
              />

              {/* Fichiers sélectionnés prêts à convertir */}
              {files.length > 0 && (
                <div className="flex flex-col gap-3 p-4 border border-border rounded-xl bg-cream-light shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                    <div>
                      <span className="font-medium text-sm">{files.length} fichiers sélectionnés</span>
                      <p className="text-xs text-muted-foreground">Prêts pour la conversion par lot</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nom du lot (optionnel)"
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-56"
                      />
                      <button
                        onClick={() => setFiles([])}
                        className="text-muted-foreground hover:text-rose-600 p-1.5 text-xs flex items-center gap-1 rounded-md hover:bg-muted transition-colors"
                        title="Tout vider"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Liste déroulante des fichiers */}
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border/50 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="size-4 text-muted-foreground shrink-0" />
                          <span className="truncate font-medium">{file.name}</span>
                          <span className="text-muted-foreground text-[11px]">
                            ({(file.size / 1024).toFixed(0)} Ko)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="text-muted-foreground hover:text-rose-600 p-1"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {uploadError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0 text-rose-600" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleStartBatch}
                      disabled={isUploading}
                      className="bg-[#02b282] hover:bg-[#01946c] text-white"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="size-4 animate-spin mr-2" />
                          Téléversement en cours...
                        </>
                      ) : (
                        <>
                          <Layers className="size-4 mr-2" />
                          Lancer la conversion ({files.length} factures)
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Historique des lots de conversion - styling identique à convert/page.tsx */}
        <div className="flex flex-col gap-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Historique des lots</h2>
              <p className="text-sm text-muted-foreground mt-1">Retrouvez vos lots récemment convertis et téléchargez vos archives ZIP.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchBatches}
              className="text-xs text-muted-foreground"
            >
              <RefreshCw className="size-3.5 mr-1" /> Actualiser
            </Button>
          </div>

          <div>
            {isLoadingHistory ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : pastBatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg">
                Aucun lot de conversion pour le moment.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl bg-cream-light shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
                <Table>
                  <TableHeader className="bg-cream-dark/60 border-b border-border">
                    <TableRow className="bg-cream-dark/60 hover:bg-cream-dark/70">
                      <TableHead>Nom du lot</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead>Factures</TableHead>
                      <TableHead className="text-center">Statut</TableHead>
                      <TableHead className="w-[80px] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-cream-light">
                    {pastBatches.map((batch) => (
                      <TableRow key={batch.id} className="bg-cream-light hover:bg-cream-dark/40 transition-colors border-b border-border">
                        <TableCell className="font-medium">
                          <button
                            onClick={() => fetchBatchDetails(batch.id)}
                            className="flex items-center gap-2 hover:underline hover:text-primary transition-colors text-left"
                          >
                            <FileArchive className="w-4 h-4 text-muted-foreground" />
                            {batch.name}
                          </button>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(batch.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>{batch.total_files} factures</TableCell>
                        <TableCell className="text-center">
                          {(() => {
                            if (batch.status === 'processing' || batch.status === 'pending') {
                              return (
                                <StatusBadge
                                  status="in-process"
                                  label={`En cours (${batch.processed_count}/${batch.total_files})`}
                                />
                              );
                            }
                            if (batch.status === 'failed' || batch.success_count === 0) {
                              return (
                                <StatusBadge
                                  status="error"
                                  label={
                                    batch.error_count > 0
                                      ? `Échec (${batch.error_count} ${batch.error_count > 1 ? 'erreurs' : 'erreur'})`
                                      : 'Échec'
                                  }
                                />
                              );
                            }
                            if (batch.error_count > 0) {
                              const word = batch.success_count > 1 ? 'réussies' : 'réussie';
                              return (
                                <StatusBadge
                                  status="warning"
                                  label={`${batch.success_count} ${word} (${batch.error_count} err.)`}
                                />
                              );
                            }
                            const word = batch.success_count > 1 ? 'réussies' : 'réussie';
                            return (
                              <StatusBadge
                                status="done"
                                label={`${batch.success_count} ${word}`}
                              />
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchBatchDetails(batch.id)}
                            className="text-xs h-7"
                          >
                            Consulter
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
