import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { CheckCircle2, AlertCircle, Edit2, Download, Building2, User, FileText, Euro, Calendar } from 'lucide-react';
import type { Invoice } from '@/core/domain/invoice';

interface OverviewProps {
  extractionResult: any;
  onEdit: () => void;
  file: File | null;
  onSuccess?: (() => void) | undefined;
}

export function Overview({ extractionResult, onEdit, file, onSuccess }: OverviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const data = extractionResult || {};
  
  const sellerName = data.seller?.name || 'Inconnu';
  const buyerName = data.buyer?.name || 'Inconnu';
  const invoiceNumber = data.number || 'N/A';
  const totalTTC = data.totals?.taxInclusive || '0.00';
  const issueDate = data.issueDate || 'N/A';

  // Count fields missing or invalid (very basic check)
  const missingCriticalFields = !data.seller?.name || !data.buyer?.name || !data.number;

  const handleDownload = async () => {
    if (!file) return;
    setIsGenerating(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      const response = await fetch('/api/facturx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: data,
          sourcePdfBase64: base64,
          saveToHistory: true,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        console.error("Erreur de génération:", errJson);
        throw new Error(errJson.details ? JSON.stringify(errJson.details) : (errJson.message || errJson.error || 'Erreur de génération inconnue'));
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}-facturx.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      alert("Erreur de validation des données requises par la norme Factur-X :\n" + err.message + "\n\nVeuillez cliquer sur 'Éditer les données' pour remplir les champs manquants.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Résumé de la conversion</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">Vérifiez les données clés avant de finaliser.</p>
        </div>
        <div className="flex items-center gap-2">
          {missingCriticalFields ? (
            <StatusBadge status="in-process" label="En cours" />
          ) : (
            <StatusBadge status="done" label="Converti" />
          )}
        </div>
      </div>

      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between py-3 border-b border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Building2 className="w-4 h-4" /> Émetteur
          </div>
          <div className="font-medium text-sm text-right truncate max-w-[60%]">{sellerName}</div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <User className="w-4 h-4" /> Récepteur
          </div>
          <div className="font-medium text-sm text-right truncate max-w-[60%]">{buyerName}</div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <FileText className="w-4 h-4" /> N° Facture
          </div>
          <div className="font-medium text-sm text-right">{invoiceNumber}</div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <Euro className="w-4 h-4" /> Montant TTC
          </div>
          <div className="font-medium text-sm text-right">{totalTTC} €</div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onEdit}>
          <Edit2 className="w-4 h-4 mr-2" />
          Éditer les données
        </Button>
        <Button onClick={handleDownload} disabled={isGenerating}>
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? "Génération..." : "Enregistrer & Télécharger"}
        </Button>
      </div>
    </div>
  );
}
