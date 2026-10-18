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
  Loader2,
  ArrowRight,
  RefreshCw,
  FileCode,
  Building2,
  Calendar,
  Euro,
  CloudUpload,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { savePendingUpload } from '@/lib/pendingUpload';
import { handlee } from '@/lib/fonts';

// Flèche manuscrite discrète et fluide pointant vers le centre
const SubtleHandDrawnArrow = ({ className = "mt-0.5" }: { className?: string }) => (
  <svg
    width="42"
    height="34"
    viewBox="0 0 42 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`text-sage-500/90 dark:text-sage-400 ${className}`}
  >
    <path
      d="M10 2 C 20 2, 30 8, 33 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M26 19 L 33 24 L 35 15"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

interface ParsedParty {
  name: string;
  siren?: string;
  siret?: string;
  vatId?: string;
  address?: {
    line1?: string;
    line2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
}

interface ParsedTotals {
  totalHt: number;
  totalVat: number;
  totalTtc: number;
  duePayable: number;
}

interface ParsedCiiInvoice {
  profile: string;
  guideline?: string;
  number: string;
  typeCode?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string[];
  seller?: ParsedParty;
  buyer?: ParsedParty;
  totals?: ParsedTotals;
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

export function PublicValidator() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showXmlPreview, setShowXmlPreview] = useState(false);

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setResult({
        isValid: false,
        hasEmbeddedXml: false,
        error: 'Veuillez déposer un fichier au format PDF valide.',
      });
      return;
    }

    setFile(selectedFile);
    setIsValidating(true);
    setResult(null);
    setShowXmlPreview(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/validator', {
        method: 'POST',
        body: formData,
      });

      const data: ValidationResponse = await res.json();
      setResult(data);
    } catch {
      setResult({
        isValid: false,
        hasEmbeddedXml: false,
        error: 'Erreur réseau ou problème de communication avec le serveur lors de la validation.',
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleConvertToFacturx = async () => {
    if (!file) return;
    setIsRedirecting(true);
    try {
      await savePendingUpload(file);
      router.push('/#uploader');
    } catch (err) {
      console.error('Erreur lors du transfert du fichier:', err);
      router.push('/#uploader');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsRedirecting(false);
    setShowXmlPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyXmlToClipboard = () => {
    if (!result?.xmlContent) return;
    navigator.clipboard.writeText(result.xmlContent);
    setCopied(true);
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
    <div className="relative w-full max-w-4xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Fenêtre principale style macOS */}
      <div className="relative rounded-2xl md:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl shadow-sage-950/10 dark:shadow-black/60 overflow-hidden transition-all duration-300">
        
        {/* Barre supérieure minimale avec contrôles macOS */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="text-[11px] font-mono text-muted-foreground/80 flex items-center gap-1.5 select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            <span>Validateur Officiel <span className="whitespace-nowrap">Factur-X</span> &bull; EN 16931</span>
          </div>
          <div className="w-12" />
        </div>

        {/* Corps principal */}
        <div className="p-6 sm:p-10 md:p-12">
          
          {/* ÉTAT 1 : ZONE DE DÉPÔT INACTIVE (ZÉRO POINTILLÉ, ICÔNE 3D & ANNOTATION MANUSCRITE) */}
          {!file && !isValidating && (
            <div
              className={`group relative rounded-2xl transition-all duration-300 cursor-pointer p-8 sm:p-12 flex flex-col items-center justify-center text-center ${
                isDragging
                  ? 'bg-sage-50/60 dark:bg-sage-950/30 scale-[1.01]'
                  : 'bg-transparent hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {/* L'icône PDF avec l'annotation manuscrite */}
              <div className="mb-5 relative flex justify-center">
                {/* Annotation manuscrite pointant vers l'icône */}
                <div className="absolute -top-10 -left-32 sm:-left-40 md:-left-48 z-30 flex flex-row items-center gap-2 pointer-events-none -rotate-6 select-none opacity-80 sm:opacity-100">
                  <span
                    className={`${handlee.className} text-[13px] md:text-[15px] text-right text-sage-600 dark:text-sage-400 font-normal tracking-wide leading-tight whitespace-nowrap drop-shadow-xs`}
                  >
                    Glisse ta facture ici<br />pour tester sa conformité
                  </span>
                  <SubtleHandDrawnArrow className="translate-y-2" />
                </div>
                
                <img 
                  src="/assets/pdf-icon.webp" 
                  alt="Icône PDF Facture" 
                  className="w-28 h-28 drop-shadow-sm object-contain"
                />
              </div>

              <div className="max-w-md mt-2">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Déposez votre facture à analyser
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Test instantané : structure PDF/A-3, conformité XML UN/CEFACT et règles Schematron EN 16931.
                </p>
              </div>

              <div className="mt-5 flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="group/btn inline-flex items-center justify-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-xs sm:text-sm tracking-tight border border-zinc-200/60 dark:border-zinc-800 shadow-2xs transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                  <span>Ou parcourir mes documents</span>
                  <CloudUpload className="size-4 text-zinc-800 dark:text-zinc-200 stroke-[2.2] group-hover/btn:translate-y-[-1px] transition-transform duration-150" />
                </button>
              </div>
            </div>
          )}

          {/* ÉTAT 2 : ANALYSE EN COURS */}
          {isValidating && (
            <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
              <Loader2 className="w-8 h-8 text-sage-600 dark:text-sage-400 animate-spin" />
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Analyse réglementaire en cours...
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Extraction du flux XML CII, contrôle de la structure PDF/A-3 et vérification des règles EN 16931.
                </p>
              </div>
            </div>
          )}

          {/* ÉTAT 3 : RÉSULTATS DE VALIDATION (INSPECTEUR DE FINITION PRO) */}
          {result && !isValidating && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* En-tête du document inspecté */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="shrink-0 flex items-center justify-center w-11 h-11">
                    <img 
                      src="/assets/pdf-icon.webp" 
                      alt="Icône PDF" 
                      className="w-11 h-11 drop-shadow-sm object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                        {file?.name || 'facture.pdf'}
                      </h4>
                      {result.isValid && (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase">
                          {result.profile || 'EN 16931'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} Mo` : 'Document analysé'} &bull; Rapport généré instantanément
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="shrink-0 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium gap-1.5 self-end sm:self-auto"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
                  Tester un autre fichier
                </Button>
              </div>

              {/* SCÉNARIO A : FACTUR-X 100% CONFORME */}
              {result.isValid && (
                <div className="space-y-5">
                  <div className="rounded-2xl p-5 sm:p-6 bg-emerald-500/10 border border-emerald-500/25">
                    <div className="flex items-start gap-3.5">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                          Facture <span className="whitespace-nowrap">Factur-X</span> 100% Conforme
                        </h3>
                        <p className="text-xs sm:text-sm text-emerald-900/90 dark:text-emerald-200 mt-1 leading-relaxed">
                          Ce document hybride respecte l&apos;intégralité des exigences réglementaires (PDF/A-3, schémas XSD et règles de calcul Schematron EN 16931). Il est prêt pour transmission sur Chorus Pro et les plateformes agréées (PDP / PPF).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Données clés extraites du XML */}
                  {result.invoice && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-3.5 border border-zinc-200/80 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-sage-600" /> N° Facture
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-foreground truncate block mt-1">
                          {result.invoice.number || '--'}
                        </span>
                      </div>

                      <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-3.5 border border-zinc-200/80 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-sage-600" /> Date d&apos;émission
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-foreground truncate block mt-1">
                          {formatDateFR(result.invoice.issueDate)}
                        </span>
                      </div>

                      <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-3.5 border border-zinc-200/80 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-sage-600" /> Vendeur
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-foreground truncate block mt-1">
                          {result.invoice.seller?.name || result.invoice.seller?.siret || '--'}
                        </span>
                      </div>

                      <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-3.5 border border-zinc-200/80 dark:border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                          <Euro className="h-3 w-3 text-sage-600" /> Total TTC
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-foreground truncate block mt-1">
                          {formatMoney(result.invoice.totals?.totalTtc, result.invoice.currency)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Contrôles validés */}
                  <div className="rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 p-4 border border-zinc-200/60 dark:border-zinc-800 text-xs space-y-2">
                    <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wide">
                      Points de contrôle validés :
                    </span>
                    <div className="grid sm:grid-cols-3 gap-2 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>PDF/A-3 (ISO 19005-3)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Schéma UN/CEFACT CII</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Arithmétique EN 16931</span>
                      </div>
                    </div>
                  </div>

                  {/* Barre d'action XML */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={downloadXmlFile}
                        className="bg-sage-600 hover:bg-sage-700 text-white text-xs rounded-xl shadow-xs gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Télécharger le XML extrait ({result.filename || 'factur-x.xml'})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyXmlToClipboard}
                        className="text-xs rounded-xl border-zinc-200 dark:border-zinc-800 gap-1.5"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copié !' : 'Copier le XML'}
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowXmlPreview(!showXmlPreview)}
                      className="text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                      <FileCode className="h-3.5 w-3.5" />
                      {showXmlPreview ? 'Masquer le code' : 'Inspecter le XML'}
                      {showXmlPreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              )}

              {/* SCÉNARIO B : SIMPLE PDF BUREAUTIQUE (PAS DE FACTUR-X) */}
              {!result.isValid && !result.hasEmbeddedXml && (
                <div className="space-y-5">
                  <div className="rounded-2xl p-5 sm:p-6 bg-amber-500/10 border border-amber-500/25">
                    <div className="flex items-start gap-3.5">
                      <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-base font-bold text-amber-950 dark:text-amber-100">
                          Document non conforme : aucun fichier <span className="whitespace-nowrap">Factur-X</span> détecté
                        </h3>
                        <p className="text-xs sm:text-sm text-amber-900/90 dark:text-amber-200 mt-1 leading-relaxed">
                          Ce document est un <strong>PDF classique bureautique</strong>. Il ne contient aucun flux XML structuré (<code>factur-x.xml</code>). En l&apos;état, ce document sera automatiquement rejeté par Chorus Pro et les plateformes de facturation 2026.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CARTE PASSERELLE ÉLÉGANTE VERS LA CONVERSION */}
                  <div className="rounded-2xl p-6 bg-cream-light dark:bg-zinc-900/70 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2 text-foreground font-bold text-base">
                        <ShieldCheck className="h-5 w-5 text-sage-600 dark:text-sage-400" />
                        <span>Rendez cette facture 100% conforme en 1 clic</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        Notre moteur conserve rigoureusement le visuel de votre document et y intègre le flux XML Factur-X officiel EN 16931 exigé par la réforme, sans aucune ressaisie.
                      </p>
                    </div>

                    <Button
                      size="lg"
                      disabled={isRedirecting}
                      onClick={handleConvertToFacturx}
                      className="bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm px-6 py-5 rounded-xl shadow-md shadow-sage-500/20 shrink-0 gap-2"
                    >
                      {isRedirecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Préparation...</span>
                        </>
                      ) : (
                        <>
                          <span>Convertir en <span className="whitespace-nowrap">Factur-X</span></span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* SCÉNARIO C : XML DÉTECTÉ MAIS ERREURS DE CONFORMITÉ */}
              {!result.isValid && result.hasEmbeddedXml && (
                <div className="space-y-5">
                  <div className="rounded-2xl p-5 sm:p-6 bg-rose-500/10 border border-rose-500/25">
                    <div className="flex items-start gap-3.5">
                      <XCircle className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-rose-950 dark:text-rose-100">
                            <span className="whitespace-nowrap">Factur-X</span> non conforme ({result.errors?.length || 1} anomalie{(result.errors?.length || 1) > 1 ? 's' : ''})
                          </h3>
                          {result.profile && (
                            <Badge className="bg-rose-600 text-white border-0 text-[10px] font-mono uppercase">
                              {result.profile}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-rose-900/90 dark:text-rose-200 mt-1 leading-relaxed">
                          Un fichier XML a été détecté, mais il ne respecte pas l&apos;ensemble des contraintes de la norme européenne EN 16931 ou du schéma syntaxique UN/CEFACT CII.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Liste des anomalies détectées */}
                  {result.errors && result.errors.length > 0 && (
                    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200/80 dark:border-zinc-800 max-h-52 overflow-y-auto">
                      <span className="text-[11px] font-bold uppercase text-muted-foreground block mb-2">
                        Détail des règles enfreintes :
                      </span>
                      <ul className="space-y-2 text-xs font-mono text-foreground/90">
                        {result.errors.map((err, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold shrink-0">&bull;</span>
                            <span>{err}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CARTE PASSERELLE POUR CORRIGER */}
                  <div className="rounded-2xl p-6 bg-cream-light dark:bg-zinc-900/70 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2 text-foreground font-bold text-base">
                        <ShieldCheck className="h-5 w-5 text-sage-600 dark:text-sage-400" />
                        <span>Régénérez une facture 100% conforme</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        Passez votre document dans notre convertisseur : il corrigera automatiquement la structure XML et recalculera les règles arithmétiques pour garantir son acceptation.
                      </p>
                    </div>

                    <Button
                      size="lg"
                      disabled={isRedirecting}
                      onClick={handleConvertToFacturx}
                      className="bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm px-6 py-5 rounded-xl shadow-md shadow-sage-500/20 shrink-0 gap-2"
                    >
                      {isRedirecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Préparation...</span>
                        </>
                      ) : (
                        <>
                          <span>Corriger et Reconvertir</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* INSPECTEUR DE CODE XML (DÉPLIABLE) */}
              {showXmlPreview && result.xmlContent && (
                <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 transition-all duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
                      <FileCode className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                      {result.filename || 'factur-x.xml'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyXmlToClipboard}
                      className="text-xs h-7 px-2.5 rounded-lg"
                    >
                      {copied ? <Check className="h-3 w-3 mr-1 text-emerald-600" /> : <Copy className="h-3 w-3 mr-1" />}
                      {copied ? 'Copié' : 'Copier'}
                    </Button>
                  </div>
                  <pre className="mt-3 text-[11px] font-mono text-muted-foreground bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 overflow-x-auto max-h-64">
                    {result.xmlContent}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
