import { get, set, del } from 'idb-keyval';

export interface PendingOnboardingCompany {
  name: string;
  siret: string;
  logo?: File; // Stored as File in idb
}

export interface PendingOnboarding {
  company: PendingOnboardingCompany;
  createdAt: number;
}

const STORE_KEY = 'pending-onboarding';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

let memoryFallback: PendingOnboarding | null = null;
export let isUsingOnboardingMemoryFallback = false;

export async function savePendingOnboarding(company: PendingOnboardingCompany): Promise<void> {
  const data: PendingOnboarding = {
    company,
    createdAt: Date.now(),
  };

  try {
    await set(STORE_KEY, data);
    isUsingOnboardingMemoryFallback = false;
  } catch (err) {
    console.warn('IndexedDB not available, using in-memory fallback for onboarding', err);
    memoryFallback = data;
    isUsingOnboardingMemoryFallback = true;
  }
}

export async function getPendingOnboarding(): Promise<PendingOnboarding | null> {
  if (memoryFallback) {
    const data = memoryFallback;
    if (Date.now() - data.createdAt > EXPIRY_MS) {
      memoryFallback = null;
      return null;
    }
    return data;
  }

  try {
    const data = await get<PendingOnboarding>(STORE_KEY);
    if (data) {
      if (Date.now() - data.createdAt > EXPIRY_MS) {
        await del(STORE_KEY);
        return null;
      }
      return data;
    }
  } catch (err) {
    console.warn('Failed to read from IndexedDB', err);
  }
  return null;
}

export async function clearPendingOnboarding(): Promise<void> {
  memoryFallback = null;
  isUsingOnboardingMemoryFallback = false;
  try {
    await del(STORE_KEY);
  } catch (err) {
    // Ignore
  }
}
