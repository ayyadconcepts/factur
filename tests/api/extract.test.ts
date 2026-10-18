import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../src/app/api/extract/route';
import { NextResponse } from 'next/server';

// Mocks
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    getAll: () => [],
    setAll: () => {},
  }))
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } }, error: null }))
    }
  }))
}));

const mockExtractInvoice = vi.fn();
vi.mock('../../src/server/extract/geminiClient', () => {
  return {
    GeminiClient: class {
      extractInvoice = mockExtractInvoice;
    }
  };
});

describe('POST /api/extract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects files larger than 4MB', async () => {
    const formData = new FormData();
    const largeBuffer = new ArrayBuffer(5 * 1024 * 1024);
    const blob = new Blob([largeBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'test.pdf');

    const req = new Request('http://localhost/api/extract', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error).toMatch(/dépasse la limite de 4 Mo/);
  });

  it('rejects invalid PDF magic bytes', async () => {
    const formData = new FormData();
    // starts with something other than %PDF-
    const fakeBuffer = new TextEncoder().encode('HTML-fake-pdf');
    const blob = new Blob([fakeBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'test.pdf');

    const req = new Request('http://localhost/api/extract', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    expect(res.status).toBe(415);
  });

  it('calls GeminiClient and returns the draft for a valid PDF', async () => {
    const formData = new FormData();
    const pdfBuffer = new TextEncoder().encode('%PDF-1.4 mock content');
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, 'test.pdf');

    const mockDraft = { documentType: 'invoice' };
    mockExtractInvoice.mockResolvedValueOnce(mockDraft);

    const req = new Request('http://localhost/api/extract', {
      method: 'POST',
      body: formData
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.documentType).toBe('invoice');
    expect(mockExtractInvoice).toHaveBeenCalledTimes(1);
  });
});
