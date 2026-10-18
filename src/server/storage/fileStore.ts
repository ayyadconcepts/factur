export interface FileStoreOptions {
  contentType?: string;
}

export interface FileStore {
  put(key: string, bytes: Uint8Array, opts?: FileStoreOptions): Promise<void>;
  get(key: string): Promise<Uint8Array>;
  getSignedUrl(key: string, ttlSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
}
