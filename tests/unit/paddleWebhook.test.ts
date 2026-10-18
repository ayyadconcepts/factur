import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
});
const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: 'user-existing-456' }, error: null }),
  }),
});

vi.mock('@/server/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      upsert: mockUpsert,
      update: mockUpdate,
      select: mockSelect,
    }),
  }),
}));

const mockUnmarshal = vi.fn();
vi.mock('@/lib/paddle/server', () => ({
  getPaddleServer: () => ({
    webhooks: {
      unmarshal: mockUnmarshal,
    },
  }),
}));

import { POST } from '@/app/api/webhooks/paddle/route';
import { PADDLE_CONFIG } from '@/lib/paddle/config';

describe('POST /api/webhooks/paddle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    PADDLE_CONFIG.webhookSecret = 'test_webhook_secret_123';
    PADDLE_CONFIG.prices.volume = 'pri_01m500nh66g7883564s4dgckds';
    PADDLE_CONFIG.prices.essentiel = 'pri_01m500jmvh28xg713f81bak8ag';
  });

  it('rejects requests missing the paddle-signature header with 400', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/paddle', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Missing paddle-signature/i);
  });

  it('rejects requests with invalid signature with 401', async () => {
    mockUnmarshal.mockRejectedValueOnce(new Error('Invalid signature'));

    const req = new NextRequest('http://localhost/api/webhooks/paddle', {
      method: 'POST',
      headers: {
        'paddle-signature': 'ts=12345;h1=fake_hash',
      },
      body: JSON.stringify({ test: true }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid webhook signature/i);
  });

  it('processes subscription.created and upserts plan into Supabase', async () => {
    mockUnmarshal.mockResolvedValueOnce({
      eventType: 'subscription.created',
      data: {
        id: 'sub_01h_volume_test',
        customerId: 'ctm_test_999',
        status: 'active',
        currentBillingPeriod: {
          startsAt: '2026-10-15T12:00:00Z',
          endsAt: '2026-11-15T12:00:00Z',
        },
        items: [
          {
            price: {
              id: 'pri_01m500nh66g7883564s4dgckds',
            },
          },
        ],
        customData: {
          userId: 'user-uuid-123',
        },
      },
    });

    const req = new NextRequest('http://localhost/api/webhooks/paddle', {
      method: 'POST',
      headers: {
        'paddle-signature': 'ts=12345;h1=valid_hash',
      },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-uuid-123',
        plan_id: 'volume',
        status: 'active',
        paddle_subscription_id: 'sub_01h_volume_test',
        paddle_customer_id: 'ctm_test_999',
      }),
      { onConflict: 'user_id' }
    );
  });

  it('processes subscription.canceled and reverts user to free plan', async () => {
    mockUnmarshal.mockResolvedValueOnce({
      eventType: 'subscription.canceled',
      data: {
        id: 'sub_01h_cancel_test',
        customerId: 'ctm_test_999',
        status: 'canceled',
        customData: {
          userId: 'user-uuid-999',
        },
      },
    });

    const req = new NextRequest('http://localhost/api/webhooks/paddle', {
      method: 'POST',
      headers: {
        'paddle-signature': 'ts=12345;h1=valid_hash',
      },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'canceled',
        plan_id: 'free',
      })
    );
  });
});
