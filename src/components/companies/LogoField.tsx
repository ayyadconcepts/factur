"use client";

import { useState, useRef, useEffect } from "react";
import { processLogoClient } from "@/lib/logoProcessing";
import { Button } from "@/components/ui/button";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/20/solid";

interface LogoFieldProps {
  onLogoSelected: (file: File | null) => void;
  initialPreviewUrl?: string | null;
}

export function LogoField({ onLogoSelected, initialPreviewUrl }: LogoFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
    }
  }, [initialPreviewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const processedBlob = await processLogoClient(file);
      const processedFile = new File([processedBlob], file.name, { type: processedBlob.type });
      
      const objectUrl = URL.createObjectURL(processedBlob);
      setPreviewUrl(objectUrl);
      onLogoSelected(processedFile);
    } catch (err: any) {
      setError(err.message || "Erreur lors du traitement de l'image.");
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    onLogoSelected(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative inline-block border border-border rounded-xl p-2 bg-cream-light">
          <img src={previewUrl} alt="Aperçu du logo" className="max-h-24 max-w-[200px] object-contain rounded-md" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 rounded-full p-1 shadow-sm hover:bg-rose-200 dark:hover:bg-rose-800 transition-colors"
            title="Retirer le logo"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl bg-sage-50 text-sage-700 border-sage-200 hover:bg-sage-100 hover:text-sage-800 dark:bg-sage-950 dark:text-sage-300 dark:border-sage-800"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
          >
            <PhotoIcon className="w-5 h-5 mr-2" />
            {isProcessing ? "Traitement..." : "Ajouter un logo"}
          </Button>
          <span className="text-xs text-zinc-500">PNG ou JPEG (max 600x200px)</span>
        </div>
      )}
      
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-sm text-rose-600" aria-live="polite">{error}</p>}
    </div>
  );
}
