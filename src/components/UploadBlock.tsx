"use client";

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Handlee } from 'next/font/google';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const handlee = Handlee({ subsets: ['latin'], weight: '400' });

const PdfIcon = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
    <defs>
      <filter id="red-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="doc-grad" x1="35" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#F1F5F9" />
      </linearGradient>
    </defs>
    
    {/* Base Document */}
    <rect x="35" y="10" width="55" height="80" rx="16" fill="url(#doc-grad)" stroke="#E2E8F0" strokeWidth="1" />

    {/* Red Capsule Glow */}
    <rect x="12" y="35" width="60" height="32" rx="16" fill="#EF4444" opacity="0.6" filter="url(#red-glow)" />

    {/* Red Capsule (Base/Shadow) */}
    <rect x="12" y="37" width="60" height="30" rx="15" fill="#B91C1C" />
    {/* Red Capsule (Top face) */}
    <rect x="12" y="35" width="60" height="30" rx="15" fill="#EF4444" />

    {/* PDF Text */}
    <text x="42" y="55" fill="white" fontSize="18" fontWeight="600" fontFamily="sans-serif" textAnchor="middle">PDF</text>
  </svg>
);

const HandDrawnArrow = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground rotate-[10deg]">
    <path d="M20 20 Q 50 10, 80 75" />
    <path d="M75 55 L 80 75 L 55 70" />
  </svg>
);

export function UploadBlock() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        handleFileSelect(droppedFile);
      } else {
        alert('Veuillez sélectionner un fichier PDF.');
      }
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleStartConversion = () => {
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      router.push('/editor-test');
    }, 1500);
  };

  return (
    <section className="py-16 md:py-32 relative overflow-visible" id="upload">
      <div className="absolute inset-0 bg-muted/30 -z-10" />
      <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
        <div className="max-w-2xl mx-auto relative mt-16">
          
          {/* Texte stylisé script et flèche */}
          <div className="absolute -top-20 left-0 md:-left-44 flex flex-col items-end -rotate-[15deg] opacity-80 pointer-events-none z-50">
            <span className={`${handlee.className} text-2xl md:text-3xl text-primary drop-shadow-sm text-right`}>
              Commence par glisser<br/>ta facture PDF ici
            </span>
            <div className="mt-1 mr-4">
              <HandDrawnArrow />
            </div>
          </div>

          <div
            className={`relative rounded-[2rem] p-12 md:p-20 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[350px] md:min-h-[400px] shadow-xl z-20 ${
              isDragging ? 'bg-primary/5 scale-105 shadow-2xl' : 'bg-cream-light border border-border hover:shadow-2xl hover:-translate-y-1'
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
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            
            {!file ? (
              <>
                <div className="mb-8 transform transition-transform group-hover:scale-110">
                  <PdfIcon />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">Cliquez ou glissez un PDF</h3>
                <p className="text-base text-muted-foreground max-w-sm text-balance">
                  Déposez simplement votre facture classique. Taille maximale : 10 Mo.
                </p>
              </>
            ) : (
              <div className="flex flex-col gap-8 items-center w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center gap-4 bg-muted/20 p-8 rounded-2xl w-full max-w-sm">
                  <PdfIcon />
                  <div className="text-center">
                    <h4 className="font-semibold text-lg text-foreground truncate max-w-[250px]">{file.name}</h4>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
                  </div>
                  {!isUploading && (
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4 mr-2" /> Retirer
                    </Button>
                  )}
                </div>

                <Button size="lg" className="w-full max-w-sm h-14 text-lg gap-2 shadow-lg hover:shadow-xl transition-all" onClick={handleStartConversion} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      Démarrer la conversion
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
