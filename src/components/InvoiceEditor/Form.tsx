"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InvoiceSchema } from '../../core/validation/schema';
import type { VerificationResult, VerifiedField } from '../../core/verify/verifyDraft';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

interface FormProps {
  extractedData?: VerificationResult | null;
  file?: File | null;
}

export function Form({ extractedData, file }: FormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    mode: 'onChange',
    resolver: (zodResolver as any)(InvoiceSchema),
    defaultValues: {
      profile: 'EN16931',
      number: '',
      typeCode: '380',
      currency: 'EUR',
      issueDate: '',
      seller: { name: '', siren: '', address: { line1: '', postalCode: '', city: '', country: 'FR' } },
      buyer: { name: '', siren: '', address: { line1: '', postalCode: '', city: '', country: 'FR' } },
      lines: [],
      vatBreakdown: [],
      totals: { lineNet: '', taxExclusive: '', taxTotal: '', taxInclusive: '', payable: '' },
      payment: {},
      notes: [],
    }
  });

  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (extractedData?.fields) {
      const f = extractedData.fields;
      
      const newValues: any = {};
      
      const safeVal = (key: string) => f[key]?.value;
      const safeAmount = (key: string) => f[key]?.value || '0.00';

      if (safeVal('invoiceNumber')) newValues.number = safeVal('invoiceNumber');
      if (safeVal('issueDate')) newValues.issueDate = safeVal('issueDate');
      if (safeVal('dueDate')) newValues.dueDate = safeVal('dueDate');
      if (safeVal('deliveryDate')) newValues.deliveryDate = safeVal('deliveryDate');
      if (safeVal('currency')) newValues.currency = safeVal('currency');
      if (safeVal('operationCategory')) newValues.operationCategory = safeVal('operationCategory');
      if (f['vatOnDebits']?.value !== undefined && f['vatOnDebits']?.value !== null) {
        newValues.vatOnDebits = f['vatOnDebits'].value === 'true' || (f['vatOnDebits'].value as unknown) === true;
      }

      newValues.seller = { ...newValues.seller };
      if (safeVal('seller.name')) newValues.seller.name = safeVal('seller.name');
      if (safeVal('seller.siren')) newValues.seller.siren = safeVal('seller.siren');
      if (safeVal('seller.siret')) newValues.seller.siret = safeVal('seller.siret');
      if (safeVal('seller.vatId')) newValues.seller.vatId = safeVal('seller.vatId');
      
      newValues.seller.address = { ...newValues.seller?.address };
      if (safeVal('seller.addressLine1')) newValues.seller.address.line1 = safeVal('seller.addressLine1');
      if (safeVal('seller.postalCode')) newValues.seller.address.postalCode = safeVal('seller.postalCode');
      if (safeVal('seller.city')) newValues.seller.address.city = safeVal('seller.city');
      newValues.seller.address.country = 'FR';

      newValues.buyer = { ...newValues.buyer };
      if (safeVal('buyer.name')) newValues.buyer.name = safeVal('buyer.name');
      if (safeVal('buyer.siren')) newValues.buyer.siren = safeVal('buyer.siren');
      if (safeVal('buyer.siret')) newValues.buyer.siret = safeVal('buyer.siret');
      if (safeVal('buyer.vatId')) newValues.buyer.vatId = safeVal('buyer.vatId');
      
      newValues.buyer.address = { ...newValues.buyer?.address };
      if (safeVal('buyer.addressLine1')) newValues.buyer.address.line1 = safeVal('buyer.addressLine1');
      if (safeVal('buyer.postalCode')) newValues.buyer.address.postalCode = safeVal('buyer.postalCode');
      if (safeVal('buyer.city')) newValues.buyer.address.city = safeVal('buyer.city');
      newValues.buyer.address.country = 'FR';

      // Totals
      const htVal = safeAmount('totals.excludingVat');
      const ttcVal = safeAmount('totals.includingVat');
      newValues.totals = {
        lineNet: htVal,
        taxExclusive: htVal,
        taxTotal: safeAmount('totals.vatTotal'),
        taxInclusive: ttcVal,
        payable: ttcVal,
      };

      // Payment
      newValues.payment = { ...newValues.payment };
      if (safeVal('payment.iban')) newValues.payment.iban = safeVal('payment.iban');
      if (safeVal('payment.bic')) newValues.payment.bic = safeVal('payment.bic');
      if (safeVal('payment.terms')) newValues.payment.terms = safeVal('payment.terms');

      // Arrays (lines, vatBreakdown, notes) requires looking at indices
      const lines = [];
      let i = 0;
      while (f[`lines.${i}.description`]) {
        lines.push({
          id: String(i + 1),
          name: safeVal(`lines.${i}.description`) || '',
          quantity: safeVal(`lines.${i}.quantity`) || '1',
          unit: safeVal(`lines.${i}.unit`) || 'C62',
          unitPriceNet: safeAmount(`lines.${i}.unitPriceNet`),
          lineNetAmount: safeAmount(`lines.${i}.lineNetAmount`),
          vat: {
            category: safeVal(`lines.${i}.vatCategory`) || 'S',
            percent: safeVal(`lines.${i}.vatRate`) || '20.00'
          }
        });
        i++;
      }
      if (lines.length > 0) newValues.lines = lines;

      const vats = [];
      let j = 0;
      while (f[`vatBreakdown.${j}.rate`]) {
        vats.push({
          category: safeVal(`vatBreakdown.${j}.category`) || 'S',
          percent: safeVal(`vatBreakdown.${j}.rate`) || '20.00',
          taxableAmount: safeAmount(`vatBreakdown.${j}.taxableAmount`),
          taxAmount: safeAmount(`vatBreakdown.${j}.vatAmount`)
        });
        j++;
      }
      if (vats.length > 0) newValues.vatBreakdown = vats;

      const notes = [];
      let k = 0;
      while (f[`notes.${k}`]) {
        notes.push({ content: safeVal(`notes.${k}`) || '' });
        k++;
      }
      if (notes.length > 0) newValues.notes = notes;

      if (Object.keys(newValues).length > 0) {
        reset((prev: any) => ({
          ...prev,
          ...newValues,
          seller: { ...prev.seller, ...newValues.seller },
          buyer: { ...prev.buyer, ...newValues.buyer },
          totals: { ...prev.totals, ...newValues.totals }
        }));
      }
      
      if (extractedData.globalStatus === 'error') {
        setGlobalError("Des erreurs ont été détectées. Veuillez les corriger avant de valider.");
      } else {
        setGlobalError(null);
      }
    }
  }, [extractedData, reset]);

  const onSubmit = async (data: any) => {
    try {
      let sourcePdfBase64 = undefined;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        // Convert to base64
        sourcePdfBase64 = Buffer.from(arrayBuffer).toString('base64');
      }

      const response = await fetch('/api/facturx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invoice: data, 
          saveToHistory: false,
          sourcePdfBase64
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        console.error('API Error:', err);
        setGlobalError(`Échec de la génération : ${err.message || 'Erreur inconnue'}`);
        return;
      }
      
      setGlobalError(null);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${data.number || 'export'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Facture générée et téléchargée avec succès !');
    } catch (err) {
      console.error('Network Error:', err);
      alert('Erreur réseau.');
    }
  };

  const renderFieldStatus = (fieldPath: string) => {
    const field = extractedData?.fields[fieldPath];
    if (!field) return null;

    let icon = null;
    let colorClass = '';
    let label = '';

    switch (field.status) {
      case 'verified':
        icon = <CheckCircle2 className="w-4 h-4 text-green-600" />;
        colorClass = 'text-green-600';
        label = 'Vérifié';
        break;
      case 'warning':
        icon = <AlertCircle className="w-4 h-4 text-orange-500" />;
        colorClass = 'text-orange-500';
        label = 'Avertissement';
        break;
      case 'error':
        icon = <XCircle className="w-4 h-4 text-red-600" />;
        colorClass = 'text-red-600';
        label = 'Erreur';
        break;
      case 'missing':
        icon = <HelpCircle className="w-4 h-4 text-zinc-400" />;
        colorClass = 'text-zinc-500';
        label = 'Non trouvé';
        break;
    }

    return (
      <div className="mt-1 text-xs space-y-1">
        <div className={`flex items-center gap-1 font-medium ${colorClass}`}>
          {icon} <span>{label}</span>
          {field.printedLabel && <span className="text-zinc-400 font-normal ml-1">({field.printedLabel})</span>}
        </div>
        {field.issues.length > 0 && (
          <div className="text-red-600 ml-5">
            {field.issues.map((iss, i) => <div key={i}>{iss}</div>)}
          </div>
        )}
        {field.note && (
          <div className="text-orange-600 ml-5 italic">{field.note}</div>
        )}
      </div>
    );
  };

  const getBorderClass = (fieldPath: string) => {
    const status = extractedData?.fields[fieldPath]?.status;
    if (status === 'error') return 'border-red-500 focus-visible:ring-red-500';
    if (status === 'warning') return 'border-orange-500 focus-visible:ring-orange-500';
    if (status === 'missing') return 'border-dashed border-zinc-300';
    return '';
  };

  const flattenErrors = (errs: any, prefix = ''): Record<string, string> => {
    let flat: Record<string, string> = {};
    for (const key in errs) {
      if (errs[key]?.message) {
        flat[prefix + key] = errs[key].message;
      } else if (typeof errs[key] === 'object') {
        Object.assign(flat, flattenErrors(errs[key], prefix + key + '.'));
      }
    }
    return flat;
  };

  const flatErrors = flattenErrors(errors);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Détails de la Facture</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm font-medium whitespace-pre-wrap">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="number">Numéro de facture</Label>
              <Input id="number" {...register('number')} className={getBorderClass('invoiceNumber')} placeholder={extractedData?.fields['invoiceNumber']?.status === 'missing' ? 'Non trouvé' : ''} />
              {renderFieldStatus('invoiceNumber')}
              {errors.number?.message && <span className="text-sm text-red-500">{String(errors.number.message)}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">Date d'émission (AAAA-MM-JJ)</Label>
              <Input id="issueDate" {...register('issueDate')} className={getBorderClass('issueDate')} placeholder={extractedData?.fields['issueDate']?.status === 'missing' ? 'Non trouvé' : ''} />
              {renderFieldStatus('issueDate')}
              {errors.issueDate?.message && <span className="text-sm text-red-500">{String(errors.issueDate.message)}</span>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Vendeur</h3>
            
            <div className="space-y-2">
              <Label htmlFor="seller.name">Nom de l'entreprise</Label>
              <Input id="seller.name" {...register('seller.name')} className={getBorderClass('seller.name')} placeholder={extractedData?.fields['seller.name']?.status === 'missing' ? 'Non trouvé' : ''} />
              {renderFieldStatus('seller.name')}
              {(errors.seller as any)?.name?.message && <span className="text-sm text-red-500">{String((errors.seller as any).name.message)}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller.siren">SIREN</Label>
              <Input id="seller.siren" {...register('seller.siren')} className={getBorderClass('seller.siren')} placeholder={extractedData?.fields['seller.siren']?.status === 'missing' ? 'Non trouvé' : ''} />
              {renderFieldStatus('seller.siren')}
              {(errors.seller as any)?.siren?.message && <span className="text-sm text-red-500">{String((errors.seller as any).siren.message)}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller.address.line1">Adresse</Label>
              <Input id="seller.address.line1" {...register('seller.address.line1')} className={getBorderClass('seller.addressLine1')} placeholder={extractedData?.fields['seller.addressLine1']?.status === 'missing' ? 'Non trouvé' : ''} />
              {renderFieldStatus('seller.addressLine1')}
              {(errors.seller as any)?.address?.line1?.message && <span className="text-sm text-red-500">{String((errors.seller as any).address.line1.message)}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seller.address.postalCode">Code Postal</Label>
                <Input id="seller.address.postalCode" {...register('seller.address.postalCode')} className={getBorderClass('seller.postalCode')} />
                {renderFieldStatus('seller.postalCode')}
                {(errors.seller as any)?.address?.postalCode?.message && <span className="text-sm text-red-500">{String((errors.seller as any).address.postalCode.message)}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller.address.city">Ville</Label>
                <Input id="seller.address.city" {...register('seller.address.city')} className={getBorderClass('seller.city')} />
                {renderFieldStatus('seller.city')}
                {(errors.seller as any)?.address?.city?.message && <span className="text-sm text-red-500">{String((errors.seller as any).address.city.message)}</span>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Acheteur</h3>
            
            <div className="space-y-2">
              <Label htmlFor="buyer.name">Nom de l'entreprise</Label>
              <Input id="buyer.name" {...register('buyer.name')} className={getBorderClass('buyer.name')} placeholder={extractedData?.fields['buyer.name']?.status === 'missing' ? 'Non trouvé' : ''} />
              {renderFieldStatus('buyer.name')}
              {(errors.buyer as any)?.name?.message && <span className="text-sm text-red-500">{String((errors.buyer as any).name.message)}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer.siren">SIREN</Label>
              <Input id="buyer.siren" {...register('buyer.siren')} className={getBorderClass('buyer.siren')} placeholder={extractedData?.fields['buyer.siren']?.status === 'missing' ? 'Non trouvé' : ''} />
              {renderFieldStatus('buyer.siren')}
              {(errors.buyer as any)?.siren?.message && <span className="text-sm text-red-500">{String((errors.buyer as any).siren.message)}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer.address.line1">Adresse</Label>
              <Input id="buyer.address.line1" {...register('buyer.address.line1')} className={getBorderClass('buyer.addressLine1')} placeholder={extractedData?.fields['buyer.addressLine1']?.status === 'missing' ? 'Non trouvé' : ''} />
              {renderFieldStatus('buyer.addressLine1')}
              {(errors.buyer as any)?.address?.line1?.message && <span className="text-sm text-red-500">{String((errors.buyer as any).address.line1.message)}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyer.address.postalCode">Code Postal</Label>
                <Input id="buyer.address.postalCode" {...register('buyer.address.postalCode')} className={getBorderClass('buyer.postalCode')} />
                {renderFieldStatus('buyer.postalCode')}
                {(errors.buyer as any)?.address?.postalCode?.message && <span className="text-sm text-red-500">{String((errors.buyer as any).address.postalCode.message)}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyer.address.city">Ville</Label>
                <Input id="buyer.address.city" {...register('buyer.address.city')} className={getBorderClass('buyer.city')} />
                {renderFieldStatus('buyer.city')}
                {(errors.buyer as any)?.address?.city?.message && <span className="text-sm text-red-500">{String((errors.buyer as any).address.city.message)}</span>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Totaux</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totals.taxExclusive">Total HT</Label>
                <Input id="totals.taxExclusive" {...register('totals.taxExclusive')} className={getBorderClass('totals.excludingVat')} placeholder={extractedData?.fields['totals.excludingVat']?.status === 'missing' ? 'Non trouvé' : ''} />
                {renderFieldStatus('totals.excludingVat')}
                {(errors.totals as any)?.taxExclusive?.message && <span className="text-sm text-red-500">{String((errors.totals as any).taxExclusive.message)}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="totals.taxInclusive">Total TTC</Label>
                <Input id="totals.taxInclusive" {...register('totals.taxInclusive')} className={getBorderClass('totals.includingVat')} placeholder={extractedData?.fields['totals.includingVat']?.status === 'missing' ? 'Non trouvé' : ''} />
                {renderFieldStatus('totals.includingVat')}
                {(errors.totals as any)?.taxInclusive?.message && <span className="text-sm text-red-500">{String((errors.totals as any).taxInclusive.message)}</span>}
              </div>
            </div>
          </div>

          {Object.keys(flatErrors).length > 0 && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
              <p className="font-bold mb-2">Erreurs de validation (Schéma Factur-X) :</p>
              <ul className="list-disc pl-5">
                {Object.entries(flatErrors).map(([key, msg]: any) => (
                  <li key={key}>{key} : {msg}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-md text-sm text-orange-800">
            <strong>Avertissement Réglementaire :</strong> Ce document Factur-X est généré sous votre entière responsabilité. Vous devez vous assurer que toutes les mentions légales obligatoires (art. 242 nonies A du CGI) sont présentes, exactes et correspondent au PDF d'origine avant toute transmission à l'administration fiscale (PPF) ou à un PDP. En cliquant sur "Télécharger", vous validez juridiquement la conformité des données structurées extraites.
          </div>

          <Button type="submit" className="w-full" disabled={Object.keys(errors).length > 0}>
            Générer et Télécharger (Factur-X)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
