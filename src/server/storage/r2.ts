import { AwsClient } from 'aws4fetch';
import type { FileStore, FileStoreOptions } from './fileStore';

let _client: { aws: AwsClient; endpoint: string; bucket: string } | null = null;

function getClient() {
  if (!_client) {
    const accountId = process.env.R2_ACCOUNT_ID || '';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
    const bucket = process.env.R2_BUCKET || '';

    const aws = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: 's3',
      region: 'auto',
    });

    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    _client = { aws, endpoint, bucket };
  }
  return _client;
}

export class R2Store implements FileStore {
  async put(key: string, bytes: Uint8Array, opts?: FileStoreOptions): Promise<void> {
    const { aws, endpoint, bucket } = getClient();
    const url = `${endpoint}/${bucket}/${key}`;
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
    const { aws, endpoint, bucket } = getClient();
    const url = `${endpoint}/${bucket}/${key}`;
    const response = await aws.fetch(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Failed to get from R2: ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  async head(key: string): Promise<{ size: number; contentType?: string } | null> {
    const { aws, endpoint, bucket } = getClient();
    const url = `${endpoint}/${bucket}/${key}`;
    const response = await aws.fetch(url, {
      method: 'HEAD',
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
    const { aws, endpoint, bucket } = getClient();
    const url = new URL(`${endpoint}/${bucket}/${key}`);
    url.searchParams.set('X-Amz-Expires', ttlSeconds.toString());

    const request = await aws.sign(url.toString(), {
      method: 'GET',
      aws: { signQuery: true },
    });

    return request.url;
  }

  async delete(key: string): Promise<void> {
    const { aws, endpoint, bucket } = getClient();
    const url = `${endpoint}/${bucket}/${key}`;
    const response = await aws.fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete from R2: ${response.statusText}`);
    }
  }
}

export const r2Store = new R2Store();
