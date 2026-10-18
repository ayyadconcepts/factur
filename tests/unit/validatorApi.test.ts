import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/validator/route';

describe('/api/validator API route', () => {
  it('successfully validates a compliant Factur-X PDF', async () => {
    const fixturePath = path.resolve(process.cwd(), 'tests/fixtures/pdf/facture-simple.pdf');
    const pdfBuffer = fs.readFileSync(fixturePath);
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const file = new File([blob], 'facture-simple.pdf', { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('file', file);

    const req = new NextRequest('http://localhost:3000/api/validator', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.isValid).toBe(true);
    expect(json.hasEmbeddedXml).toBe(true);
    expect(json.filename).toBe('factur-x.xml');
    expect(json.profile).toBe('EN 16931');
    expect(json.invoice).toBeDefined();
    expect(json.invoice.number).toBe('INV-123');
    expect(json.invoice.seller.name).toBe('Test Corp');
    expect(json.invoice.buyer.name).toBe('Client SARL');
    expect(json.invoice.totals.totalTtc).toBe(120);
    expect(json.xmlContent).toContain('CrossIndustryInvoice');
  }, 15000);

  it('correctly detects a non-Factur-X ordinary PDF and returns helpful rejection', async () => {
    const fixturePath = path.resolve(process.cwd(), 'tests/fixtures/pdfs/sample.pdf');
    const pdfBuffer = fs.readFileSync(fixturePath);
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const file = new File([blob], 'sample.pdf', { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('file', file);

    const req = new NextRequest('http://localhost:3000/api/validator', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.isValid).toBe(false);
    expect(json.hasEmbeddedXml).toBe(false);
    expect(json.error).toContain("Aucun fichier XML Factur-X");
  });
});
