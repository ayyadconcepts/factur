"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Download,
  Copy,
  Check,
  UploadCloud,
  Loader2,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
  Euro,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { savePendingUpload } from '@/lib/pendingUpload';
import { toast } from 'sonner';

interface ParsedParty {
  name: string;
  siren?: string;
  siret?: string;
  vatId?: string;
  address: {
    line1?: string;
    line2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
}

interface ParsedLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalHt: number;
  vatRate: number;
}

interface ParsedTotals {
  totalHt: number;
  totalVat: number;
  totalTtc: number;
  duePayable: number;
}

interface ParsedCiiInvoice {
  profile: string;
  guideline: string;
  number: string;
  typeCode: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  notes: string[];
  seller: ParsedParty;
  buyer: ParsedParty;
  totals: ParsedTotals;
  lines: ParsedLineItem[];
}

interface ValidationResponse {
  isValid: boolean;
  hasEmbeddedXml: boolean;
  filename?: string;
  profile?: string;
  guideline?: string;
  errors?: string[];
  warnings?: string[];
  invoice?: ParsedCiiInvoice;
  xmlContent?: string;
  error?: string;
}

function formatMoney(amount?: number | null, currency = 'EUR'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '--';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateFR(dateStr?: string | null): string {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function ValidatorPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'xml'>('details');
  const [copied, setCopied] = useState(false);

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      toast.error('Veuillez sélectionner un fichier PDF valide.');
      return;
    }

    setFile(selectedFile);
    setIsValidating(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/validator', {
        method: 'POST',
        body: formData,
      });

      const data: ValidationResponse = await res.json();
      setResult(data);

      if (data.isValid) {
        toast.success('Facture Factur-X valide !');
      } else if (!data.hasEmbeddedXml) {
        toast.info('Document PDF classique (non Factur-X).');
      } else {
        toast.warning('Facture Factur-X avec des erreurs de conformité.');
      }
    } catch (err: any) {
      toast.error('Erreur lors de la validation du fichier.');
      setResult({
        isValid: false,
        hasEmbeddedXml: false,
        error: 'Erreur réseau ou problème de communication avec le serveur.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConvertToFacturx = async () => {
    if (!file) return;
    try {
      await savePendingUpload(file);
      router.push('/dashboard/convert');
    } catch (err) {
      console.error('Erreur lors du transfert du fichier:', err);
      router.push('/dashboard/convert');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setActiveTab('details');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyXmlToClipboard = () => {
    if (!result?.xmlContent) return;
    navigator.clipboard.writeText(result.xmlContent);
    setCopied(true);
    toast.success('Code XML copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadXmlFile = () => {
    if (!result?.xmlContent) return;
    const blob = new Blob([result.xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename || 'factur-x.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Validateur Factur-X
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vérifiez la conformité réglementaire (PDF/A-3, XSD & Schematron) de vos factures sans IA.
            </p>
          </div>
          {file && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs rounded-lg border-border bg-card hover:bg-muted w-fit shrink-0"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Tester un autre fichier
            </Button>
          )}
        </div>

        {/* 1. Zone de Dépôt (si aucun résultat ou en attente) */}
        {!file && (
          <div className="max-w-3xl">
            <div
              className={`border-2 border-dashed rounded-xl p-10 sm:p-14 transition-colors flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[320px] shadow-2xs ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-cream-light hover:border-primary/50 hover:bg-cream-light/80'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 bg-card rounded-full shadow-2xs border border-border">
                <ShieldCheck className="size-8 text-emerald-600" />
              </div>
              <div className="text-center max-w-md">
                <p className="font-medium text-base text-foreground">
                  Déposez votre facture PDF à vérifier
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Détection automatique du fichier <code className="font-mono text-[11px] bg-card px-1 py-0.5 rounded border border-border">factur-x.xml</code>, contrôle du profil (MINIMUM à EXTENDED) et validation du schéma CII EN 16931.
                </p>
              </div>
              <Button
                size="sm"
                className="mt-2 h-8 text-xs bg-[#02b282] hover:bg-[#01946c] text-white rounded-lg"
              >
                <UploadCloud className="size-3.5 mr-1.5" />
                Sélectionner un fichier PDF
              </Button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
          </div>
        )}

        {/* 2. État d'Analyse en cours */}
        {isValidating && (
          <div className="max-w-2xl">
            <div className="rounded-xl border border-border bg-cream-light p-10 flex flex-col items-center justify-center gap-3 text-center shadow-2xs">
              <Loader2 className="size-8 animate-spin text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Analyse de conformité en cours...
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Inspection des flux XML embarqués et vérification des règles Schematron EN 16931.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Résultat : ÉCHEC DE CONFORMITÉ (PDF classique ou XML invalide) */}
        {!isValidating && result && !result.isValid && (
          <div className="flex flex-col gap-4 max-w-3xl">
            {/* Bannière Alerte */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <XCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                      {!result.hasEmbeddedXml
                        ? 'Document non conforme Factur-X'
                        : 'Facture Factur-X non conforme aux spécifications'}
                    </h2>
                    <Badge variant="outline" className="text-[10px] border-rose-500/30 text-rose-600">
                      Non conforme
                    </Badge>
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                    {result.error ||
                      "Ce fichier ne respecte pas les critères obligatoires de la facturation électronique Factur-X."}
                  </p>
                </div>
              </div>

              {/* Liste détaillée des erreurs si XML corrompu */}
              {result.errors && result.errors.length > 0 && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 flex flex-col gap-1.5 text-xs">
                  <span className="font-semibold text-rose-900 dark:text-rose-200 text-[11px] uppercase tracking-wider">
                    Détail des erreurs de validation :
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-rose-800 dark:text-rose-300">
                    {result.errors.map((err, idx) => (
                      <li key={idx} className="font-mono text-[11px] break-all">
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Passerelle vers le Convertisseur */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-rose-500/20">
                <div className="text-xs text-rose-800 dark:text-rose-300">
                  Besoin d&apos;émettre cette facture au format officiel pour vos clients ou Chorus Pro ?
                </div>
                <Button
                  onClick={handleConvertToFacturx}
                  size="sm"
                  className="h-8 text-xs bg-[#02b282] hover:bg-[#01946c] text-white rounded-lg shrink-0 flex items-center gap-1.5"
                >
                  Convertir cette facture en Factur-X
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* XML brut si disponible malgré les erreurs */}
            {result.xmlContent && (
              <div className="rounded-xl border border-border bg-cream-light p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <FileCode className="size-4 text-muted-foreground" />
                    Contenu XML extrait du fichier
                  </span>
                  <Button variant="outline" size="sm" onClick={downloadXmlFile} className="h-7 text-xs">
                    <Download className="size-3 mr-1" />
                    Télécharger
                  </Button>
                </div>
                <pre className="text-[11px] font-mono bg-card p-3 rounded-lg border border-border overflow-x-auto max-h-60 text-muted-foreground">
                  {result.xmlContent}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 4. Résultat : SUCCÈS (Facture Factur-X 100% Conforme) */}
        {!isValidating && result && result.isValid && result.invoice && (
          <div className="flex flex-col gap-4">
            {/* Certificat / Bannière de Conformité */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
                      Facture Factur-X Valide & Conforme
                    </h2>
                    <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-medium">
                      {result.profile || 'EN 16931'}
                    </Badge>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Structure PDF/A-3 certifiée, pièce jointe <code className="font-mono text-[11px]">{result.filename}</code> conforme aux règles XSD et Schematron.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadXmlFile}
                  className="h-8 text-xs rounded-lg border-border bg-card hover:bg-muted"
                >
                  <Download className="size-3.5 mr-1.5" />
                  Télécharger le XML
                </Button>
              </div>
            </div>

            {/* Navigation par Onglets : Données structurées vs Code XML */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full flex-col gap-4">
              <TabsList className="w-fit border border-border bg-muted/40 p-1 rounded-lg">
                <TabsTrigger value="details" className="text-xs">
                  Données de la facture
                </TabsTrigger>
                <TabsTrigger value="xml" className="text-xs flex items-center gap-1.5">
                  <FileCode className="size-3.5" />
                  Code XML ({result.filename})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-0 flex flex-col gap-4">
                {/* Grille 2 lignes x 2 colonnes avec nos cartes bicolores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Carte 1 : Émetteur (Vendeur) */}
                  <div className="rounded-xl overflow-hidden flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
                    <div className="bg-cream-light p-4 flex flex-col gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Building2 className="size-3.5 text-primary" />
                        Émetteur (Vendeur)
                      </span>
                      <p className="text-base font-semibold tracking-tight text-foreground">
                        {result.invoice.seller.name || 'Nom non spécifié'}
                      </p>
                    </div>
                    <div className="bg-cream-dark px-4 py-2.5 flex flex-col gap-1 text-xs">
                      {result.invoice.seller.siren && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-[11px]">SIREN :</span>
                          <span className="font-mono text-[11px] font-medium">{result.invoice.seller.siren}</span>
                        </div>
                      )}
                      {result.invoice.seller.vatId && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-[11px]">N° TVA :</span>
                          <span className="font-mono text-[11px] font-medium">{result.invoice.seller.vatId}</span>
                        </div>
                      )}
                      {result.invoice.seller.address.city && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-[11px]">Ville :</span>
                          <span className="text-[11px]">{result.invoice.seller.address.postalCode} {result.invoice.seller.address.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Carte 2 : Destinataire (Acheteur) */}
                  <div className="rounded-xl overflow-hidden flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
                    <div className="bg-cream-light p-4 flex flex-col gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Building2 className="size-3.5 text-primary" />
                        Destinataire (Acheteur)
                      </span>
                      <p className="text-base font-semibold tracking-tight text-foreground">
                        {result.invoice.buyer.name || 'Client non spécifié'}
                      </p>
                    </div>
                    <div className="bg-cream-dark px-4 py-2.5 flex flex-col gap-1 text-xs">
                      {result.invoice.buyer.siren && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-[11px]">SIREN :</span>
                          <span className="font-mono text-[11px] font-medium">{result.invoice.buyer.siren}</span>
                        </div>
                      )}
                      {result.invoice.buyer.vatId && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-[11px]">N° TVA :</span>
                          <span className="font-mono text-[11px] font-medium">{result.invoice.buyer.vatId}</span>
                        </div>
                      )}
                      {result.invoice.buyer.address.city && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-[11px]">Ville :</span>
                          <span className="text-[11px]">{result.invoice.buyer.address.postalCode} {result.invoice.buyer.address.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Carte 3 : Références & Dates */}
                  <div className="rounded-xl overflow-hidden flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
                    <div className="bg-cream-light p-4 flex flex-col gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar className="size-3.5 text-primary" />
                        Facture & Échéance
                      </span>
                      <p className="text-base font-semibold tracking-tight text-foreground">
                        N° {result.invoice.number}
                      </p>
                    </div>
                    <div className="bg-cream-dark px-4 py-2.5 flex flex-col gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-[11px]">Date d&apos;émission :</span>
                        <span className="text-[11px] font-medium">{formatDateFR(result.invoice.issueDate)}</span>
                      </div>
                      {result.invoice.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-[11px]">Date d&apos;échéance :</span>
                          <span className="text-[11px] font-medium">{formatDateFR(result.invoice.dueDate)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-[11px]">Type de pièce :</span>
                        <span className="text-[11px]">{result.invoice.typeCode === '381' ? 'Avoir (381)' : 'Facture de vente (380)'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Carte 4 : Totaux Financiers */}
                  <div className="rounded-xl overflow-hidden flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
                    <div className="bg-cream-light p-4 flex flex-col gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Euro className="size-3.5 text-primary" />
                        Montant Total TTC
                      </span>
                      <p className="text-base font-semibold tracking-tight tabular-nums text-foreground">
                        {formatMoney(result.invoice.totals.totalTtc, result.invoice.currency)}
                      </p>
                    </div>
                    <div className="bg-cream-dark px-4 py-2.5 flex flex-col gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-[11px]">Total Hors Taxes (HT) :</span>
                        <span className="font-semibold tabular-nums text-[11px]">{formatMoney(result.invoice.totals.totalHt, result.invoice.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-[11px]">Total TVA :</span>
                        <span className="font-semibold tabular-nums text-[11px]">{formatMoney(result.invoice.totals.totalVat, result.invoice.currency)}</span>
                      </div>
                      <div className="flex justify-between border-t border-border/50 pt-0.5">
                        <span className="text-muted-foreground text-[11px]">Net à payer :</span>
                        <span className="font-bold text-primary tabular-nums text-[11px]">{formatMoney(result.invoice.totals.duePayable, result.invoice.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tableau des lignes d'articles */}
                {result.invoice.lines && result.invoice.lines.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold tracking-tight text-foreground">
                      Lignes d&apos;articles ({result.invoice.lines.length})
                    </h3>
                    <div className="overflow-hidden rounded-xl bg-cream-light shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
                      <Table>
                        <TableHeader className="bg-cream-dark/60 border-b border-border">
                          <TableRow className="bg-cream-dark/60 hover:bg-cream-dark/70">
                            <TableHead className="w-12 text-xs">#</TableHead>
                            <TableHead className="text-xs">Description</TableHead>
                            <TableHead className="text-right text-xs">Quantité</TableHead>
                            <TableHead className="text-right text-xs">Prix unit. HT</TableHead>
                            <TableHead className="text-right text-xs">TVA</TableHead>
                            <TableHead className="text-right text-xs">Total HT</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-cream-light">
                          {result.invoice.lines.map((line, idx) => (
                            <TableRow key={idx} className="bg-cream-light hover:bg-cream-dark/40 transition-colors border-b border-border">
                              <TableCell className="font-mono text-[11px] text-muted-foreground">
                                {line.id || idx + 1}
                              </TableCell>
                              <TableCell className="font-medium text-xs text-foreground">
                                {line.description}
                              </TableCell>
                              <TableCell className="text-right text-xs tabular-nums">
                                {line.quantity}
                              </TableCell>
                              <TableCell className="text-right text-xs tabular-nums">
                                {formatMoney(line.unitPrice, result.invoice?.currency)}
                              </TableCell>
                              <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                                {line.vatRate}%
                              </TableCell>
                              <TableCell className="text-right text-xs font-semibold tabular-nums text-foreground">
                                {formatMoney(line.totalHt, result.invoice?.currency)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="xml" className="mt-0">
                <div className="rounded-xl border border-border bg-cream-light p-4 flex flex-col gap-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Pièce jointe officielle <code className="font-mono text-[11px] text-foreground font-semibold">{result.filename}</code>
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={copyXmlToClipboard} className="h-7 text-xs border-border bg-card hover:bg-muted">
                        {copied ? <Check className="size-3 mr-1 text-emerald-600" /> : <Copy className="size-3 mr-1" />}
                        {copied ? 'Copié' : 'Copier'}
                      </Button>
                      <Button size="sm" onClick={downloadXmlFile} className="h-7 text-xs bg-[#02b282] hover:bg-[#01946c] text-white">
                        <Download className="size-3 mr-1" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                  <pre className="text-[11px] font-mono bg-card p-4 rounded-lg border border-border overflow-x-auto max-h-[500px] text-foreground leading-relaxed">
                    {result.xmlContent}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
