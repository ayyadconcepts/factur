import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InvoiceSchema } from '@/core/validation/schema';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface MinimalFormProps {
  extractedData: any;
  file: File | null;
  onCancel: () => void;
}

const MinimalInput = ({ label, name, register, errors }: { label: string, name: string, register: any, errors: any }) => {
  const error = name.split('.').reduce((acc, part) => acc && acc[part], errors);
  
  return (
    <div className="group flex flex-col gap-1 py-2 border-b border-border/40 hover:bg-muted/20 px-4 -mx-4 transition-colors">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground w-1/3">{label}</label>
        <div className="flex-1 flex items-center gap-2">
          <input 
            {...register(name)}
            className="w-full bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/50 hover:bg-muted/50 rounded px-1.5 py-1 text-sm font-medium transition-all"
            placeholder={`Saisir ${label.toLowerCase()}...`}
          />
          {error ? (
            <XCircle className="w-4 h-4 text-red-500 shrink-0" title={error.message} />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
      {error && <span className="text-[10px] text-red-500 font-medium ml-[33%] px-1.5">{error.message}</span>}
    </div>
  );
};

export function MinimalForm({ extractedData, file, onCancel }: MinimalFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { register, handleSubmit, reset, trigger, formState: { errors } } = useForm<any>({
    mode: 'all',
    resolver: zodResolver(InvoiceSchema),
    defaultValues: extractedData?.data || {}
  });

  useEffect(() => {
    trigger();
  }, [trigger]);

  useEffect(() => {
    if (extractedData?.data) {
      reset(extractedData.data);
      trigger();
    }
  }, [extractedData, reset, trigger]);

  const onSubmit = async (data: any) => {
    if (!file) return;
    setIsGenerating(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
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
        const errJson = await response.json().catch(() => ({}));
        console.error("API error:", errJson);
        throw new Error(errJson.message || errJson.error || 'Erreur API');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.number}-facturx.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      onCancel(); // Retour à l'overview après succès
    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de la génération: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 px-6 py-4 border-b flex flex-col gap-1">
        <h2 className="text-base font-semibold tracking-tight">Édition des données</h2>
        <p className="text-xs text-muted-foreground">Cliquez sur une valeur pour la modifier.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 p-4 border border-red-200 rounded-md text-red-700 text-sm mb-6">
            <p className="font-bold mb-2">Champs obligatoires manquants ou invalides :</p>
            <pre className="whitespace-pre-wrap">{JSON.stringify(errors, null, 2)}</pre>
          </div>
        )}
        <form id="minimal-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          
          <div className="space-y-1">
            <h3 className="text-sm font-semibold mb-2">Informations Générales</h3>
            <MinimalInput label="Numéro" name="number" register={register} errors={errors} />
            <MinimalInput label="Date d'émission" name="issueDate" register={register} errors={errors} />
            <MinimalInput label="Date d'échéance" name="dueDate" register={register} errors={errors} />
            <MinimalInput label="Devise" name="currency" register={register} errors={errors} />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold mb-2 mt-4">Émetteur</h3>
            <MinimalInput label="Nom" name="seller.name" register={register} errors={errors} />
            <MinimalInput label="SIREN" name="seller.siren" register={register} errors={errors} />
            <MinimalInput label="TVA Intra" name="seller.vatId" register={register} errors={errors} />
            <MinimalInput label="Adresse" name="seller.address.line1" register={register} errors={errors} />
            <MinimalInput label="Code Postal" name="seller.address.postalCode" register={register} errors={errors} />
            <MinimalInput label="Ville" name="seller.address.city" register={register} errors={errors} />
            <MinimalInput label="Pays" name="seller.address.country" register={register} errors={errors} />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold mb-2 mt-4">Récepteur</h3>
            <MinimalInput label="Nom" name="buyer.name" register={register} errors={errors} />
            <MinimalInput label="SIREN" name="buyer.siren" register={register} errors={errors} />
            <MinimalInput label="TVA Intra" name="buyer.vatId" register={register} errors={errors} />
            <MinimalInput label="Adresse" name="buyer.address.line1" register={register} errors={errors} />
            <MinimalInput label="Code Postal" name="buyer.address.postalCode" register={register} errors={errors} />
            <MinimalInput label="Ville" name="buyer.address.city" register={register} errors={errors} />
            <MinimalInput label="Pays" name="buyer.address.country" register={register} errors={errors} />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold mb-2 mt-4">Totaux</h3>
            <MinimalInput label="Total HT" name="totals.taxExclusive" register={register} errors={errors} />
            <MinimalInput label="Total TVA" name="totals.taxTotal" register={register} errors={errors} />
            <MinimalInput label="Total TTC" name="totals.taxInclusive" register={register} errors={errors} />
            <MinimalInput label="À payer" name="totals.payable" register={register} errors={errors} />
          </div>

        </form>
      </div>

      <div className="p-4 border-t bg-background flex items-center justify-end gap-3 sticky bottom-0">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" form="minimal-form" disabled={isGenerating}>
          {isGenerating ? "Enregistrement..." : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
}
