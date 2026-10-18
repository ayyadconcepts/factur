"use client";

import React, { useMemo, useState } from 'react';
import { Viewer } from './Viewer';
import { Overview } from './Overview';
import { MinimalForm } from './MinimalForm';
import { usePdfExtraction } from '../../client/hooks/usePdfExtraction';
import type { BBox } from '../../core/extraction/types';
import InvoiceLoadingState from '../kokonutui/ai-loading';
export function InvoiceEditor({ file, onInvoiceGenerated, initialData }: { file: File | null, onInvoiceGenerated?: () => void, initialData?: any }) {
  const { extractionResult, rawItems, isExtracting, error } = usePdfExtraction(file, initialData);
  const [view, setView] = useState<'overview' | 'edit'>('overview');

  const highlightBboxes = useMemo(() => {
    if (!extractionResult?.fields) return [];
    
    const bboxes: BBox[] = [];
    Object.values(extractionResult.fields).forEach((field: any) => {
      if (field.bbox && field.bbox.length >= 4) {
        bboxes.push(field.bbox as BBox);
      }
    });
    return bboxes;
  }, [extractionResult]);

  const mappedData = useMemo(() => {
    if (initialData) return initialData;
    if (!extractionResult?.fields) return {};
    const f = extractionResult.fields;
    const newValues: any = {
      profile: 'EN16931',
      number: '',
      typeCode: '380',
      currency: 'EUR',
      issueDate: '',
      seller: { name: '', siren: '', address: { line1: '', postalCode: '', city: '', country: 'FR' } },
      buyer: { name: '', siren: '', address: { line1: '', postalCode: '', city: '', country: 'FR' } },
      lines: [],
      vatBreakdown: [],
      totals: { lineNet: '0.00', taxExclusive: '0.00', taxTotal: '0.00', taxInclusive: '0.00', payable: '0.00' },
      payment: {},
      notes: [],
    };
    
    const safeVal = (key: string) => f[key]?.value;
    const safeAmount = (key: string) => {
      const val = f[key]?.value;
      if (!val) return '0.00';
      const num = parseFloat(val.replace(/,/g, '.').replace(/[^\d.-]/g, ''));
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    if (safeVal('invoiceNumber')) newValues.number = safeVal('invoiceNumber');
    if (safeVal('issueDate')) newValues.issueDate = safeVal('issueDate');
    if (safeVal('dueDate')) newValues.dueDate = safeVal('dueDate');
    if (safeVal('deliveryDate')) newValues.deliveryDate = safeVal('deliveryDate');
    if (safeVal('currency')) newValues.currency = safeVal('currency');
    if (safeVal('operationCategory')) newValues.operationCategory = safeVal('operationCategory');
    if (f['vatOnDebits']?.value !== undefined && f['vatOnDebits']?.value !== null) {
      newValues.vatOnDebits = f['vatOnDebits'].value === 'true' || (f['vatOnDebits'].value as unknown) === true;
    }

    if (safeVal('seller.name')) newValues.seller.name = safeVal('seller.name');
    if (safeVal('seller.siren')) newValues.seller.siren = safeVal('seller.siren');
    if (safeVal('seller.siret')) newValues.seller.siret = safeVal('seller.siret');
    if (safeVal('seller.vatId')) newValues.seller.vatId = safeVal('seller.vatId');
    if (safeVal('seller.addressLine1')) newValues.seller.address.line1 = safeVal('seller.addressLine1');
    if (safeVal('seller.postalCode')) newValues.seller.address.postalCode = safeVal('seller.postalCode');
    if (safeVal('seller.city')) newValues.seller.address.city = safeVal('seller.city');

    if (safeVal('buyer.name')) newValues.buyer.name = safeVal('buyer.name');
    if (safeVal('buyer.siren')) newValues.buyer.siren = safeVal('buyer.siren');
    if (safeVal('buyer.siret')) newValues.buyer.siret = safeVal('buyer.siret');
    if (safeVal('buyer.vatId')) newValues.buyer.vatId = safeVal('buyer.vatId');
    if (safeVal('buyer.addressLine1')) newValues.buyer.address.line1 = safeVal('buyer.addressLine1');
    if (safeVal('buyer.postalCode')) newValues.buyer.address.postalCode = safeVal('buyer.postalCode');
    if (safeVal('buyer.city')) newValues.buyer.address.city = safeVal('buyer.city');

    const htVal = safeAmount('totals.excludingVat');
    const ttcVal = safeAmount('totals.includingVat');
    newValues.totals = {
      lineNet: htVal,
      taxExclusive: htVal,
      taxTotal: safeAmount('totals.vatTotal'),
      taxInclusive: ttcVal,
      payable: ttcVal,
    };

    if (safeVal('payment.iban')) newValues.payment.iban = safeVal('payment.iban');
    if (safeVal('payment.bic')) newValues.payment.bic = safeVal('payment.bic');
    if (safeVal('payment.terms')) newValues.payment.terms = safeVal('payment.terms');

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
          percent: safeAmount(`lines.${i}.vatRate`) || '20.00'
        }
      });
      i++;
    }
    if (lines.length > 0) {
      newValues.lines = lines;
    } else {
      newValues.lines = [{
        id: '1',
        name: 'Prestation',
        quantity: '1',
        unit: 'C62',
        unitPriceNet: htVal,
        lineNetAmount: htVal,
        vat: { category: 'S', percent: '20.00' }
      }];
    }

    const vats = [];
    let j = 0;
    while (f[`vatBreakdown.${j}.rate`]) {
      vats.push({
        category: safeVal(`vatBreakdown.${j}.category`) || 'S',
        percent: safeAmount(`vatBreakdown.${j}.rate`) || '20.00',
        taxableAmount: safeAmount(`vatBreakdown.${j}.taxableAmount`),
        taxAmount: safeAmount(`vatBreakdown.${j}.vatAmount`),
      });
      j++;
    }
    if (vats.length > 0) {
      newValues.vatBreakdown = vats;
    } else {
      newValues.vatBreakdown = [{
        category: 'S',
        percent: '20.00',
        taxableAmount: htVal,
        taxAmount: safeAmount('totals.vatTotal') || '0.00',
      }];
    }

    let k = 0;
    const notes = [];
    while (f[`notes.${k}`]) {
      notes.push({ content: safeVal(`notes.${k}`) });
      k++;
    }
    if (notes.length > 0) newValues.notes = notes;

    return newValues;
  }, [extractionResult]);

  if (isExtracting) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed rounded-xl bg-muted/5">
        <InvoiceLoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed border-red-500 rounded-xl bg-red-50">
        <p className="text-red-600 font-medium mb-2">Erreur lors de l'extraction</p>
        <p className="text-red-500 text-sm mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white border rounded shadow-sm text-sm font-medium hover:bg-gray-50"
        >
          Retour au convertisseur
        </button>
      </div>
    );
  }

  return (
    <div className="flex bg-background border rounded-xl overflow-hidden min-h-[600px] h-full shadow-sm">
      <div className="w-1/2 border-r bg-muted/10 relative h-full overflow-hidden">
        <Viewer file={file} highlightBboxes={highlightBboxes} />
      </div>
      <div className="w-1/2 bg-background overflow-y-auto">
        {view === 'overview' ? (
          <Overview 
            extractionResult={mappedData}
            onEdit={() => setView('edit')}
            file={file}
            onSuccess={onInvoiceGenerated}
          />
        ) : (
          <MinimalForm 
            extractedData={{ data: mappedData }} 
            file={file} 
            onCancel={() => setView('overview')}
          />
        )}
      </div>
    </div>
  );
}
