import { createAdminClient } from './admin';
import { r2Store } from '../storage/r2';

interface SaveInvoiceParams {
  userId: string;
  number: string;
  typeCode: '380' | '381';
  relatedInvoiceId?: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  buyerName: string;
  buyerSiren?: string;
  totalExclVat: number;
  totalVat: number;
  totalInclVat: number;
  profile: string;
  mode: 'GARANTI' | 'FIDELE';
  invoiceData: any;
  reportData: any;
  facturxPdfBytes: Uint8Array;
  facturxSha256: string;
  folderId?: string;
}

export async function saveInvoiceToHistory(params: SaveInvoiceParams) {
  const admin = createAdminClient();
  
  // 1. Upload du Factur-X dans R2
  const invoiceId = crypto.randomUUID();
  const r2Key = `invoices/${params.userId}/${invoiceId}.pdf`;
  
  try {
    await r2Store.put(r2Key, params.facturxPdfBytes, { contentType: 'application/pdf' });
  } catch (uploadError: any) {
    throw new Error(`Failed to upload invoice PDF to R2: ${uploadError.message}`);
  }

  // 2. Insertion de la ligne
  const insertPayload: any = {
    id: invoiceId,
    user_id: params.userId,
    number: params.number,
    type_code: params.typeCode,
    related_invoice_id: params.relatedInvoiceId,
    issue_date: params.issueDate,
    due_date: params.dueDate,
    currency: params.currency,
    buyer_name: params.buyerName,
    buyer_siren: params.buyerSiren,
    total_excl_vat: params.totalExclVat,
    total_vat: params.totalVat,
    total_incl_vat: params.totalInclVat,
    profile: params.profile,
    mode: params.mode,
    invoice: params.invoiceData,
    report: {
      ...params.reportData,
      fileSize: params.facturxPdfBytes.byteLength,
      file_size: params.facturxPdfBytes.byteLength,
    },
    facturx_key: r2Key,
    facturx_sha256: params.facturxSha256
  };

  if (params.folderId) {
    insertPayload.folder_id = params.folderId;
  }

  let { error: insertError } = await admin.from('invoices').insert(insertPayload);

  // Fallback si la colonne folder_id n'a pas encore été créée dans la base
  if (insertError && insertError.message?.includes('folder_id') && params.folderId) {
    delete insertPayload.folder_id;
    const retry = await admin.from('invoices').insert(insertPayload);
    insertError = retry.error;
  }

  // 3. Rollback si erreur
  if (insertError) {
    // Delete the orphaned file
    await r2Store.delete(r2Key).catch(console.error);
    throw new Error(`Failed to insert invoice record: ${insertError.message}`);
  }

  return invoiceId;
}
