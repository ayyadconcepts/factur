"use client";

import { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import type { PdfTextItem } from '../../core/extraction/types';
import type { VerificationResult } from '../../core/verify/verifyDraft';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const extractionCache = new WeakMap<File, any>();
const rawItemsCache = new WeakMap<File, PdfTextItem[]>();

export function usePdfExtraction(file: File | null, initialData?: any) {
  const [extractionResult, setExtractionResult] = useState<VerificationResult | null>(() => {
    if (initialData) return { data: initialData } as any;
    return file ? (extractionCache.get(file) || null) : null;
  });
  const [rawItems, setRawItems] = useState<PdfTextItem[]>(() => {
    return file ? (rawItemsCache.get(file) || []) : [];
  });
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (initialData) return;
    
    if (!file) {
      setExtractionResult(null);
      setRawItems([]);
      setError(null);
      setIsExtracting(false);
      return;
    }

    if (extractionCache.has(file)) {
      console.log("[usePdfExtraction] Using cached extraction result for this file!");
      setExtractionResult(extractionCache.get(file));
      setRawItems(rawItemsCache.get(file) || []);
      return;
    }

    let isCancelled = false;
    setIsExtracting(true);
    setError(null);

    async function extract() {
      console.log("[usePdfExtraction] Starting extract...");
      try {
        console.log("[usePdfExtraction] Reading arrayBuffer...");
        const arrayBuffer = await file!.arrayBuffer();
        console.log("[usePdfExtraction] Starting pdfjs getDocument...");
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        console.log("[usePdfExtraction] PDF loaded, numPages:", pdf.numPages);
        const items: PdfTextItem[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          for (const item of textContent.items) {
            if ('str' in item && 'transform' in item) {
              const x = item.transform[4];
              const y = item.transform[5];
              items.push({
                str: item.str,
                page: i,
                x,
                y,
                w: item.width,
                h: item.height,
              });
            }
          }
        }
        console.log("[usePdfExtraction] Text extracted, items count:", items.length);
        
        if (!isCancelled) {
          setRawItems(items);
          console.log("[usePdfExtraction] Reading file as base64...");
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
            reader.readAsDataURL(file!);
          });
          const base64 = await base64Promise;
          console.log("[usePdfExtraction] Base64 done, calling API...");

          const res = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileBase64: base64, mimeType: file!.type })
          });
          console.log("[usePdfExtraction] API responded, status:", res.status);
          
          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            console.error("API Error Response:", res.status, errText);
            let errMsg = 'Erreur lors de l’extraction (API)';
            try {
              const errJson = JSON.parse(errText);
              if (errJson.error) errMsg = errJson.error;
            } catch (e) {}
            throw new Error(errMsg);
          }

          const draft = await res.json();
          console.log("[usePdfExtraction] Verifying draft...");
          const { verifyDraft } = await import('../../core/verify/verifyDraft');
          const result = verifyDraft(draft, items);
          console.log("[usePdfExtraction] Verification done, setting result.");
          
          extractionCache.set(file!, result);
          rawItemsCache.set(file!, items);
          setExtractionResult(result as any);
        } else {
           console.log("[usePdfExtraction] Cancelled before API call.");
        }
      } catch (err) {
        console.error("[usePdfExtraction] Caught error:", err);
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        console.log("[usePdfExtraction] Finally block. isCancelled:", isCancelled);
        if (!isCancelled) {
          setIsExtracting(false);
        }
      }
    }

    extract();

    return () => {
      console.log("[usePdfExtraction] Cleanup function called! isCancelled becomes true.");
      isCancelled = true;
    };
  }, [file]);

  return { extractionResult, rawItems, isExtracting, error };
}
