"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { InvoiceEditor } from '@/components/InvoiceEditor';
import { createBrowserClient } from '@supabase/ssr';

export default function HistoricInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Fetch metadata
        const { data: record, error } = await supabase
          .from('invoices')
          .select('invoice')
          .eq('id', params.id)
          .single();

        if (error || !record) throw new Error("Facture introuvable");

        // Fetch PDF blob
        const pdfRes = await fetch(`/api/invoices/${params.id}/pdf`);
        if (!pdfRes.ok) throw new Error("Erreur lors du téléchargement du PDF");
        
        const blob = await pdfRes.blob();
        const downloadedFile = new File([blob], `facture-${params.id}.pdf`, { type: 'application/pdf' });
        
        setFile(downloadedFile);
        setInvoiceData(record.invoice);
      } catch (err: any) {
        console.error("Erreur détaillée:", err);
        alert(`Impossible de charger cette facture: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [params.id]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 h-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-base font-semibold tracking-tight">
          {isLoading ? "Chargement..." : `Facture ${invoiceData?.number || params.id}`}
        </h1>
      </div>
      
      <div className="flex-1 bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[700px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p>Chargement de la facture...</p>
          </div>
        ) : file && invoiceData ? (
          <InvoiceEditor file={file} initialData={invoiceData} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Erreur lors du chargement.</p>
          </div>
        )}
      </div>
    </div>
  );
}
