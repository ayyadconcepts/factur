import { describe, it, expect } from 'vitest';
import {
  PLANS,
  getPlan,
  canPerformBulkConvert,
  isQuotaExceeded,
  getRemainingInvoices,
} from '@/config/plans';
import { getPlanIdFromPaddlePriceId, PADDLE_CONFIG } from '@/lib/paddle/config';

describe('Subscription Plans & Quota Configuration', () => {
  it('defines the 4 official plans with correct quotas and pricing', () => {
    expect(PLANS.free.invoiceQuota).toBe(1);
    expect(PLANS.free.price).toBe(0);
    expect(PLANS.free.canBulkConvert).toBe(false);

    expect(PLANS.essentiel.invoiceQuota).toBe(100);
    expect(PLANS.essentiel.price).toBe(10);
    expect(PLANS.essentiel.canBulkConvert).toBe(false);

    expect(PLANS.volume.invoiceQuota).toBe(200);
    expect(PLANS.volume.price).toBe(20);
    expect(PLANS.volume.canBulkConvert).toBe(true);

    expect(PLANS.intensif.invoiceQuota).toBe(500);
    expect(PLANS.intensif.price).toBe(50);
    expect(PLANS.intensif.canBulkConvert).toBe(true);
  });

  it('defaults to free plan for unknown or missing planId', () => {
    expect(getPlan(null).id).toBe('free');
    expect(getPlan(undefined).id).toBe('free');
    expect(getPlan('unknown_tier').id).toBe('free');
    expect(getPlan('essentiel').id).toBe('essentiel');
  });

  it('correctly verifies bulk conversion permissions', () => {
    expect(canPerformBulkConvert('free')).toBe(false);
    expect(canPerformBulkConvert('essentiel')).toBe(false);
    expect(canPerformBulkConvert('volume')).toBe(true);
    expect(canPerformBulkConvert('intensif')).toBe(true);
  });

  it('correctly checks if quota is exceeded', () => {
    expect(isQuotaExceeded(0, 'free')).toBe(false);
    expect(isQuotaExceeded(1, 'free')).toBe(true);
    expect(isQuotaExceeded(2, 'free')).toBe(true);

    expect(isQuotaExceeded(99, 'essentiel')).toBe(false);
    expect(isQuotaExceeded(100, 'essentiel')).toBe(true);
  });

  it('correctly calculates remaining invoices', () => {
    expect(getRemainingInvoices(0, 'free')).toBe(1);
    expect(getRemainingInvoices(1, 'free')).toBe(0);
    expect(getRemainingInvoices(5, 'free')).toBe(0); // never negative

    expect(getRemainingInvoices(45, 'essentiel')).toBe(55);
    expect(getRemainingInvoices(20, 'volume')).toBe(180);
  });

  it('maps Paddle Price IDs back to plan ids', () => {
    PADDLE_CONFIG.prices.volume = 'pri_test_volume_123';
    expect(getPlanIdFromPaddlePriceId('pri_test_volume_123')).toBe('volume');
    expect(getPlanIdFromPaddlePriceId('pri_non_existent')).toBeUndefined();
  });
});
