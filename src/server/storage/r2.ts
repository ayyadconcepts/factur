import { AwsClient } from 'aws4fetch';
import { z } from 'zod';
import type { FileStore, FileStoreOptions } from './fileStore';

const envSchema = z.object({
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1)
});

const env = envSchema.parse({
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET: process.env.R2_BUCKET
});

const aws = new AwsClient({
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  service: 's3',
  region: 'auto'
});

const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export class R2Store implements FileStore {
  async put(key: string, bytes: Uint8Array, opts?: FileStoreOptions): Promise<void> {
    const url = `${endpoint}/${env.R2_BUCKET}/${key}`;
    const buffer = Buffer.isBuffer(bytes)
      ? bytes
      : Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    const headers: Record<string, string> = {};
    if (opts?.contentType) {
      headers['Content-Type'] = opts.contentType;
    }

    let lastError: Error | null = null;
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await aws.fetch(url, {
          method: 'PUT',
          body: new Uint8Array(buffer),
          headers,
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Failed to upload to R2 (${response.status} ${response.statusText}): ${errText || response.statusText}`);
        }

        return;
      } catch (err: any) {
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error(`Failed to upload to R2 key ${key}`);
  }

  async get(key: string): Promise<Uint8Array> {
    const url = `${endpoint}/${env.R2_BUCKET}/${key}`;
    const response = await aws.fetch(url, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`Failed to get from R2: ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  async head(key: string): Promise<{ size: number; contentType?: string } | null> {
    const url = `${endpoint}/${env.R2_BUCKET}/${key}`;
    const response = await aws.fetch(url, {
      method: 'HEAD'
    });
    if (!response.ok) {
      return null;
    }
    const len = response.headers.get('content-length');
    const ct = response.headers.get('content-type');
    return {
      size: len ? parseInt(len, 10) : 0,
      ...(ct ? { contentType: ct } : {}),
    };
  }

  async getSignedUrl(key: string, ttlSeconds: number): Promise<string> {
    const url = new URL(`${endpoint}/${env.R2_BUCKET}/${key}`);
    url.searchParams.set('X-Amz-Expires', ttlSeconds.toString());
    
    const request = await aws.sign(url.toString(), {
      method: 'GET',
      aws: { signQuery: true }
    });
    
    return request.url;
  }

  async delete(key: string): Promise<void> {
    const url = `${endpoint}/${env.R2_BUCKET}/${key}`;
    const response = await aws.fetch(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete from R2: ${response.statusText}`);
    }
  }
}

export const r2Store = new R2Store();
