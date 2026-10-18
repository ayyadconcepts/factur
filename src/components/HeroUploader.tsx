"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRightIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/20/solid';
import { CloudUpload } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function HeroUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [memoryFallbackWarning, setMemoryFallbackWarning] = useState(false);

  useEffect(() => {
    import('@/lib/pendingUpload').then(({ getPendingUpload, clearPendingUpload }) => {
      getPendingUpload().then((data) => {
        if (data?.file) {
          setFile(data.file);
          clearPendingUpload();
        }
      });
    });
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validatePdf = async (f: File): Promise<string | null> => {
    if (f.type !== 'application/pdf') return 'Veuillez déposer un fichier PDF valide.';
    if (f.size > 10 * 1024 * 1024) return 'La taille du fichier ne doit pas dépasser 10 Mo.';
    
    try {
      const buffer = await f.slice(0, 5).arrayBuffer();
      const text = new TextDecoder('utf-8').decode(buffer);
      if (text !== '%PDF-') return "Le fichier semble corrompu ou n'est pas un vrai PDF.";
    } catch {
      return "Impossible de lire le fichier.";
    }
    return null;
  };

  const processAndRedirect = async (selectedFile: File) => {
    setErrorMsg(null);
    const err = await validatePdf(selectedFile);
    if (err) {
      setErrorMsg(err);
      return;
    }

    setFile(selectedFile);
    setIsConverting(true);

    try {
      const { savePendingUpload, isUsingMemoryFallback } = await import('@/lib/pendingUpload');
      await savePendingUpload(selectedFile);
      
      if (isUsingMemoryFallback) {
        setMemoryFallbackWarning(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        router.push('/dashboard/convert');
      } else {
        router.push('/signup?next=/dashboard/convert');
      }
    } catch (error) {
      console.error('Erreur préparation fichier:', error);
      setErrorMsg('Erreur inattendue lors de la préparation du fichier.');
      setIsConverting(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMsg(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      await processAndRedirect(droppedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      await processAndRedirect(selectedFile);
    }
  };

  const handleStartConversion = async () => {
    if (!file) return;
    await processAndRedirect(file);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {errorMsg && (
        <div className="mb-4 p-4 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl border border-rose-200/50 dark:border-rose-900/50" role="alert" aria-live="assertive">
          {errorMsg}
        </div>
      )}
      {memoryFallbackWarning && (
        <div className="mb-4 p-4 text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 rounded-xl border border-amber-200/50 dark:border-amber-900/50" role="alert" aria-live="polite">
          Votre fichier ne pourra pas être conservé pendant l'inscription (navigation privée ou quota atteint). Vous devrez le renvoyer après la connexion. Redirection en cours...
        </div>
      )}
      {/* Fenêtre principale sans les titres retirés */}
      <div className="relative rounded-2xl md:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl shadow-sage-950/10 dark:shadow-black/60 overflow-hidden transition-all duration-300">
        
        {/* Barre supérieure minimale avec uniquement les contrôles macOS */}
        <div className="flex items-center px-5 py-3.5 bg-zinc-50/60 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
        </div>

        {/* Corps principal : Zone d'upload */}
        <div className="p-6 sm:p-10 md:p-12">
          {isConverting ? (
            <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
              <ArrowPathIcon className="w-8 h-8 text-sage-600 animate-spin" />
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Facture reçue ! Préparation en cours...
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Redirection vers l'inscription pour lancer la conversion automatique.
                </p>
              </div>
            </div>
          ) : !file ? (
            /* Zone de dépôt inactive : STRICTEMENT AUCUN STROKE / BORDER / BACKGROUND */
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
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
              />

              {/* L'icône PDF avec l'annotation manuscrite */}
              <div className="mb-5 relative flex justify-center">
                {/* Annotation manuscrite pointant vers l'icône */}
                <div className="absolute -top-10 -left-32 sm:-left-40 md:-left-48 z-30 flex flex-row items-center gap-2 pointer-events-none -rotate-6 select-none opacity-80 sm:opacity-100">
                  <span
                    className={`${handlee.className} text-[13px] md:text-[15px] text-right text-sage-600 dark:text-sage-400 font-normal tracking-wide leading-tight whitespace-nowrap drop-shadow-xs`}
                  >
                    Commence par télécharger<br />ta facture PDF ici
                  </span>
                  <SubtleHandDrawnArrow className="translate-y-2" />
                </div>
                
                <img 
                  src="/assets/pdf-icon.webp" 
                  alt="Icône PDF" 
                  className="w-28 h-28 drop-shadow-sm object-contain"
                />
              </div>

              <div className="max-w-md mt-2">
                <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Déposez simplement votre facture classique.<br />
                  Taille maximale : 10 Mo.
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
          ) : (
            /* État fichier sélectionné */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="shrink-0 flex items-center justify-center w-12 h-12">
                    <img 
                      src="/assets/pdf-icon.webp" 
                      alt="Icône PDF" 
                      className="w-12 h-12 drop-shadow-sm object-contain"
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
                        {file.name}
                      </h4>
                      <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-sage-50 text-sage-700 dark:bg-sage-950 dark:text-sage-300 border border-sage-200/50 dark:border-sage-800/50">
                        PDF Prêt
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Taille : {(file.size / 1024 / 1024).toFixed(2)} Mo • Format original prêt à être enrichi
                    </p>
                  </div>
                </div>

                {!isConverting && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="shrink-0 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                  >
                    <XMarkIcon className="w-4 h-4 mr-1.5" />
                    Changer de fichier
                  </Button>
                )}
              </div>

              {/* Bouton de conversion vers l'éditeur */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 rounded-xl text-base font-medium shadow-md shadow-sage-500/20 hover:shadow-sage-500/30 transition-all bg-sage-600 hover:bg-sage-700 text-white gap-2"
                  onClick={handleStartConversion}
                  disabled={isConverting}
                >
                  {isConverting ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Extraction des données en cours...
                    </>
                  ) : (
                    <>
                      <span>Convertir en Factur-X</span>
                      <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
