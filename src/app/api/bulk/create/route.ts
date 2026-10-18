import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/server/supabase/admin';
import { r2Store } from '@/server/storage/r2';
import { checkCanBulkConvert } from '@/server/subscriptions/quota';

export const maxDuration = 60; // Allow sufficient time for file uploads

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 1. Vérification du forfait : seuls Volume et Intensif ont accès au bulk
    const bulkCheck = await checkCanBulkConvert(user.id);
    if (!bulkCheck.allowed) {
      return NextResponse.json({
        error: bulkCheck.reason,
        code: 'BULK_NOT_ALLOWED',
        subscription: bulkCheck.status,
      }, { status: 403 });
    }

    const formData = await req.formData();
    const rawFiles = formData.getAll('files') as File[];
    const files = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);
    const rawName = formData.get('name') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier PDF fourni' }, { status: 400 });
    }

    if (files.length > 200) {
      return NextResponse.json({
        error: 'Un lot ne peut pas contenir plus de 200 factures à la fois.',
      }, { status: 400 });
    }

    // 2. Vérification du quota restant
    const remaining = bulkCheck.status.remainingInvoices;
    if (files.length > remaining) {
      return NextResponse.json({
        error: `Votre quota restant (${remaining} factures) est insuffisant pour traiter ce lot de ${files.length} factures.`,
        code: 'QUOTA_EXCEEDED',
        remaining,
        required: files.length,
      }, { status: 403 });
    }

    const batchId = crypto.randomUUID();
    const batchName = rawName?.trim() || `Lot du ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

    const admin = createAdminClient();

    // 2.5 Création du dossier dédié pour le lot dans public.folders (page Dossiers)
    let folderId: string | undefined = undefined;
    try {
      const newFolderId = crypto.randomUUID();
      const { error: folderInsertErr } = await admin.from('folders').insert({
        id: newFolderId,
        user_id: user.id,
        name: batchName,
        parent_id: null,
      });
      if (!folderInsertErr) {
        folderId = newFolderId;
      } else {
        console.warn('[bulk/create] Warning creating folder for batch:', folderInsertErr);
      }
    } catch (fErr) {
      console.warn('[bulk/create] Failed to create folder for batch:', fErr);
    }

    // 3. Création du lot dans batch_jobs
    const batchPayload: any = {
      id: batchId,
      user_id: user.id,
      name: batchName,
      status: 'pending',
      total_files: files.length,
      processed_count: 0,
      success_count: 0,
      error_count: 0,
    };
    if (folderId) {
      batchPayload.folder_id = folderId;
    }

    let { error: batchInsertErr } = await admin.from('batch_jobs').insert(batchPayload);

    // Fallback si la colonne folder_id n'existe pas encore sur batch_jobs
    if (batchInsertErr && batchInsertErr.message?.includes('folder_id') && folderId) {
      delete batchPayload.folder_id;
      const retry = await admin.from('batch_jobs').insert(batchPayload);
      batchInsertErr = retry.error;
    }

    if (batchInsertErr) {
      console.error('[bulk/create] Error creating batch_jobs record:', batchInsertErr);
      return NextResponse.json({ error: 'Erreur lors de la création du lot' }, { status: 500 });
    }

    // 4. Téléversement des fichiers dans R2 et insertion des batch_items
    const itemsToInsert = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      const itemId = crypto.randomUUID();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const r2Key = `batches/${user.id}/${batchId}/inputs/${itemId}-${safeFileName}`;

      const bytes = new Uint8Array(await file.arrayBuffer());
      await r2Store.put(r2Key, bytes, { contentType: 'application/pdf' });

      itemsToInsert.push({
        id: itemId,
        batch_id: batchId,
        file_name: file.name,
        raw_r2_key: r2Key,
        status: 'pending',
      });
    }

    const { error: itemsInsertErr } = await admin.from('batch_items').insert(itemsToInsert);
    if (itemsInsertErr) {
      console.error('[bulk/create] Error creating batch_items:', itemsInsertErr);
      return NextResponse.json({ error: 'Erreur lors de l\'enregistrement des fichiers du lot' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      batchId,
      name: batchName,
      totalFiles: files.length,
    });
  } catch (error: any) {
    console.error('[bulk/create] Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
