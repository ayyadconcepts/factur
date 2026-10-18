import { get, set, del } from 'idb-keyval';

export interface PendingUpload {
  file: File;
  name: string;
  size: number;
  createdAt: number;
}

const STORE_KEY = 'pending-upload';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

// Fallback in-memory storage if IndexedDB fails (e.g. private mode, quota)
let memoryFallback: PendingUpload | null = null;
export let isUsingMemoryFallback = false;

export async function savePendingUpload(file: File): Promise<void> {
  const data: PendingUpload = {
    file,
    name: file.name,
    size: file.size,
    createdAt: Date.now(),
  };

  try {
    await set(STORE_KEY, data);
    isUsingMemoryFallback = false;
  } catch (err) {
    console.warn('IndexedDB not available, using in-memory fallback for pending upload', err);
    memoryFallback = data;
    isUsingMemoryFallback = true;
  }
}

export async function getPendingUpload(): Promise<PendingUpload | null> {
  let data: PendingUpload | null = null;

  if (memoryFallback) {
    data = memoryFallback;
  } else {
    try {
      data = (await get<PendingUpload>(STORE_KEY)) || null;
    } catch (err) {
      console.warn('Failed to read from IndexedDB', err);
    }
  }

  if (data) {
    if (Date.now() - data.createdAt > EXPIRY_MS) {
      await clearPendingUpload();
      return null;
    }

    // Ensure data.file is a valid File instance even after IndexedDB deserialization
    if (data.file && (!(data.file instanceof File) || !data.file.name)) {
      data.file = new File([data.file], data.name, { type: 'application/pdf' });
    }
    return data;
  }

  return null;
}

export async function clearPendingUpload(): Promise<void> {
  memoryFallback = null;
  isUsingMemoryFallback = false;
  try {
    await del(STORE_KEY);
  } catch (err) {
    // Ignore
  }
}
