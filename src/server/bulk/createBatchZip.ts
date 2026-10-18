import { ZipArchive } from 'archiver';
import { PassThrough } from 'stream';

export interface FileToZip {
  name: string;
  bytes: Uint8Array;
}

/**
 * Crée une archive ZIP en mémoire à partir d'une liste de fichiers.
 */
export async function createZipArchive(files: FileToZip[]): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const archive = new ZipArchive({ zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    const passthrough = new PassThrough();
    passthrough.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    passthrough.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
    passthrough.on('error', (err: any) => reject(err));

    archive.on('error', (err: any) => reject(err));
    archive.pipe(passthrough);

    for (const file of files) {
      archive.append(Buffer.from(file.bytes), { name: file.name });
    }

    archive.finalize().catch(reject);
  });
}
