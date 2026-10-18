import { NextResponse } from 'next/server';
import { createClient } from '@/server/supabase/server';
import { r2Store } from '@/server/storage/r2';
import { ZipArchive } from 'archiver';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .order('issue_date', { ascending: false });

  if (error || !invoices) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }

  // Set up the ZIP stream
  const archive = new ZipArchive({ zlib: { level: 9 } });
  
  // Transform the Node stream to a Web ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      archive.on('data', (chunk: any) => {
        controller.enqueue(chunk);
      });
      archive.on('end', () => {
        controller.close();
      });
      archive.on('error', (err: any) => {
        controller.error(err);
      });

      // Fetch all PDFs and add to zip
      let csvIndex = "ID,Numéro,Date,Client,TotalTTC,Devise\n";

      for (const inv of invoices) {
        try {
          const pdfBytes = await r2Store.get(inv.facturx_key);
          const filename = `facture_${inv.number}_${inv.issue_date}.pdf`;
          archive.append(Buffer.from(pdfBytes), { name: filename });
          
          csvIndex += `${inv.id},${inv.number},${inv.issue_date},"${inv.buyer_name}",${inv.total_incl_vat},${inv.currency}\n`;
        } catch (err) {
          console.error(`Failed to get invoice ${inv.id} from R2`, err);
        }
      }
      
      archive.append(csvIndex, { name: 'index.csv' });
      await archive.finalize();
    }
  });

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="facturx_export_${new Date().toISOString().slice(0,10)}.zip"`
    }
  });
}
