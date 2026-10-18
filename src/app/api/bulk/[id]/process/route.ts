import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/server/supabase/admin';
import { r2Store } from '@/server/storage/r2';
import { GeminiClient } from '@/server/extract/geminiClient';
import { convertDraftToInvoice } from '@/server/bulk/convertDraftToInvoice';
import { generateFacturxDocument } from '@/core/facturx/roundTrip';
import { saveInvoiceToHistory } from '@/server/supabase/saveInvoice';
import { createZipArchive, FileToZip } from '@/server/bulk/createBatchZip';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s max execution for batch chunk

const CHUNK_SIZE = 3; // Traite par salves de 3 fichiers pour rester sous les timeouts

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: batchId } = await params;

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

    const admin = createAdminClient();

    // 1. Récupérer le lot et vérifier qu'il appartient bien à l'utilisateur
    const { data: batch, error: batchErr } = await admin
      .from('batch_jobs')
      .select('*')
      .eq('id', batchId)
      .eq('user_id', user.id)
      .single();

    if (batchErr || !batch) {
      return NextResponse.json({ error: 'Lot introuvable' }, { status: 404 });
    }

    if (batch.status === 'completed') {
      let zipDownloadUrl: string | null = null;
      if (batch.zip_r2_key) {
        zipDownloadUrl = await r2Store.getSignedUrl(batch.zip_r2_key, 3600);
      }
      return NextResponse.json({
        completed: true,
        batch,
        zipUrl: zipDownloadUrl,
      });
    }

    // Récupérer d'éventuels éléments bloqués en 'processing' depuis plus de 2 minutes (crash / timeout précédent)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    await admin
      .from('batch_items')
      .update({ status: 'pending', updated_at: new Date().toISOString() })
      .eq('batch_id', batchId)
      .eq('status', 'processing')
      .lt('updated_at', twoMinutesAgo);

    // Mettre à jour le statut du lot en 'processing'
    if (batch.status === 'pending') {
      await admin.from('batch_jobs').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', batchId);
    }

    // 2. Sélectionner la prochaine tranche d'éléments à traiter
    const { data: pendingItems, error: itemsErr } = await admin
      .from('batch_items')
      .select('*')
      .eq('batch_id', batchId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(CHUNK_SIZE);

    if (itemsErr) {
      console.error('[bulk/process] Error fetching pending items:', itemsErr);
      return NextResponse.json({ error: 'Erreur lors de la lecture des fichiers du lot' }, { status: 500 });
    }

    // Précharger les polices et le profil ICC
    const iccProfileBytes = fs.readFileSync(path.join(process.cwd(), 'assets/icc/sRGB.icc'));
    const fontBytes = fs.readFileSync(path.join(process.cwd(), 'assets/fonts/Roboto-Regular.ttf'));
    const boldFontBytes = fs.readFileSync(path.join(process.cwd(), 'assets/fonts/Roboto-Bold.ttf'));

    const gemini = new GeminiClient();

    // Déterminer ou créer le dossier dédié pour ce lot dans la page Dossiers (public.folders)
    let targetFolderId: string | undefined = batch.folder_id || undefined;
    if (!targetFolderId) {
      try {
        const { data: existingFolder } = await admin
          .from('folders')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', batch.name)
          .maybeSingle();

        if (existingFolder) {
          targetFolderId = existingFolder.id;
        } else {
          const newFid = crypto.randomUUID();
          const { error: fErr } = await admin.from('folders').insert({
            id: newFid,
            user_id: user.id,
            name: batch.name,
            parent_id: null,
          });
          if (!fErr) {
            targetFolderId = newFid;
            try {
              await admin.from('batch_jobs').update({ folder_id: newFid }).eq('id', batchId);
            } catch {}
          }
        }
      } catch (err) {
        console.warn('[bulk/process] Failed to ensure folder for batch:', err);
      }
    }

    // 3. Traiter les fichiers de cette tranche
    if (pendingItems && pendingItems.length > 0) {
      for (const item of pendingItems) {
        // Marquer l'élément en cours
        await admin.from('batch_items').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', item.id);

        try {
          // Télécharger le PDF brut depuis R2
          const rawPdfBytes = await r2Store.get(item.raw_r2_key);

          // Extraction LLM
          const draft = await gemini.extractInvoice(Buffer.from(rawPdfBytes), 'application/pdf');

          // Conversion en Invoice EN16931 strictement conforme
          const invoice = convertDraftToInvoice(draft);

          // Génération du Factur-X
          const facturxResult = await generateFacturxDocument({
            invoice,
            sourcePdfBytes: rawPdfBytes,
            iccProfileBytes,
            fontBytes,
            boldFontBytes,
          });

          // Sauvegarde dans l'historique utilisateur Supabase avec rattachement au dossier du lot
          const facturxSha256 = Buffer.from(await crypto.subtle.digest('SHA-256', Buffer.from(facturxResult.pdfBytes))).toString('hex');
          const invoiceId = await saveInvoiceToHistory({
            userId: user.id,
            number: invoice.number,
            typeCode: invoice.typeCode,
            issueDate: invoice.issueDate,
            ...(invoice.dueDate ? { dueDate: invoice.dueDate } : {}),
            currency: invoice.currency,
            buyerName: invoice.buyer.name,
            ...(invoice.buyer.siren ? { buyerSiren: invoice.buyer.siren } : {}),
            totalExclVat: parseFloat(invoice.totals.taxExclusive),
            totalVat: parseFloat(invoice.totals.taxTotal),
            totalInclVat: parseFloat(invoice.totals.taxInclusive),
            profile: invoice.profile,
            mode: 'FIDELE',
            invoiceData: invoice,
            reportData: { xmlValid: facturxResult.xmlValid, warnings: facturxResult.warnings },
            facturxPdfBytes: facturxResult.pdfBytes,
            facturxSha256,
            ...(targetFolderId ? { folderId: targetFolderId } : {}),
          });

          // Stocker le Factur-X généré dans R2 sous le dossier du lot
          const outputKey = `batches/${user.id}/${batchId}/outputs/${item.id}-${invoice.number}.pdf`;
          await r2Store.put(outputKey, facturxResult.pdfBytes, { contentType: 'application/pdf' });

          // Succès
          await admin.from('batch_items').update({
            status: 'success',
            facturx_r2_key: outputKey,
            invoice_id: invoiceId,
            invoice_number: invoice.number,
            total_incl_vat: parseFloat(invoice.totals.taxInclusive),
            updated_at: new Date().toISOString(),
          }).eq('id', item.id);

        } catch (itemError: any) {
          console.error(`[bulk/process] Error processing item ${item.id}:`, itemError);

          const rawMsg = itemError.message || String(itemError);
          const errorMsg = rawMsg.includes('503') || rawMsg.includes('high demand')
            ? "Serveur IA temporairement surchargé (503). Veuillez réessayer ce fichier."
            : rawMsg.includes('fetch failed')
            ? "Erreur de connexion réseau lors de l'extraction."
            : rawMsg;

          // Résilience : on note l'erreur sans bloquer le reste du lot !
          await admin.from('batch_items').update({
            status: 'error',
            error_message: errorMsg,
            updated_at: new Date().toISOString(),
          }).eq('id', item.id);
        }
      }
    }

    // 4. Recalculer les compteurs exacts depuis la base
    const { data: allItems } = await admin
      .from('batch_items')
      .select('status, file_name, invoice_number, facturx_r2_key, error_message')
      .eq('batch_id', batchId);

    const itemsList = allItems || [];
    const successCount = itemsList.filter((i) => i.status === 'success').length;
    const errorCount = itemsList.filter((i) => i.status === 'error').length;
    const processedCount = successCount + errorCount;
    const pendingCount = itemsList.filter((i) => i.status === 'pending' || i.status === 'processing').length;

    await admin.from('batch_jobs').update({
      processed_count: processedCount,
      success_count: successCount,
      error_count: errorCount,
      updated_at: new Date().toISOString(),
    }).eq('id', batchId);

    const isFinished = pendingCount === 0;

    // 5. Si tout est terminé, générer l'archive ZIP
    let zipUrl: string | null = null;
    if (isFinished) {
      const filesToZip: FileToZip[] = [];
      const errorLog: string[] = [];

      for (const it of itemsList) {
        if (it.status === 'success' && it.facturx_r2_key) {
          try {
            const pdfData = await r2Store.get(it.facturx_r2_key);
            const cleanName = it.invoice_number ? `${it.invoice_number}-facturx.pdf` : it.file_name;
            filesToZip.push({ name: cleanName, bytes: pdfData });
          } catch (err) {
            console.warn(`[bulk/zip] Could not read output ${it.facturx_r2_key}:`, err);
          }
        } else if (it.status === 'error') {
          errorLog.push(`- Fichier "${it.file_name}" : ${it.error_message || 'Erreur inconnue'}`);
        }
      }

      if (errorLog.length > 0) {
        const reportContent =
          `RAPPORT DU LOT "${batch.name}"\n` +
          `Date : ${new Date().toLocaleString('fr-FR')}\n` +
          `Total : ${batch.total_files} factures | Succès : ${successCount} | Erreurs : ${errorCount}\n\n` +
          `DÉTAIL DES ERREURS :\n` +
          errorLog.join('\n');
        filesToZip.push({
          name: 'rapport-erreurs.txt',
          bytes: new TextEncoder().encode(reportContent),
        });
      }

      if (filesToZip.length > 0) {
        const zipBytes = await createZipArchive(filesToZip);
        const zipKey = `batches/${user.id}/${batchId}/facturx-${batchId.slice(0, 8)}.zip`;
        await r2Store.put(zipKey, zipBytes, { contentType: 'application/zip' });

        await admin.from('batch_jobs').update({
          status: 'completed',
          zip_r2_key: zipKey,
          updated_at: new Date().toISOString(),
        }).eq('id', batchId);

        zipUrl = await r2Store.getSignedUrl(zipKey, 3600);
      } else {
        await admin.from('batch_jobs').update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        }).eq('id', batchId);
      }
    }

    return NextResponse.json({
      success: true,
      batchId,
      processedInThisChunk: pendingItems?.length || 0,
      totalFiles: batch.total_files,
      processedCount,
      remainingCount: pendingCount,
      completed: isFinished,
      zipUrl,
    });
  } catch (error: any) {
    console.error('[bulk/process] Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
