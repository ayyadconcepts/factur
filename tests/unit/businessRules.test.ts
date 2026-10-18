/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { validateBusinessRules } from '@/core/validation/businessRules';
import type { Invoice, Party } from '@/core/domain/invoice';
import { toAmount, toDecimal4, ZERO_AMOUNT } from '@/core/domain/money';

describe('businessRules validation', () => {
  const getValidParty = (role: 'seller' | 'buyer'): Party => ({
    name: 'Test Corp',
    siren: '552120222',
    vatId: role === 'seller' ? 'FR27552120222' : undefined,
    siret: '55212022200013',
    address: {
      line1: '1 Rue de la Paix',
      postalCode: '75000',
      city: 'Paris',
      country: 'FR' as any
    },
    electronicAddress: {
      schemeId: '0002',
      value: '552120222'
    }
  });

  const getValidInvoice = (): Invoice => ({
    profile: 'EN16931' as any,
    number: 'INV-123',
    typeCode: '380' as any,
    issueDate: '2024-01-01' as any,
    currency: 'EUR' as any,
    seller: getValidParty('seller'),
    buyer: getValidParty('buyer'),
    lines: [
      { id: '1', name: 'Service', quantity: toDecimal4('1'), unit: 'C62' as any, unitPriceNet: toDecimal4('100'), lineNetAmount: toAmount('100'), vat: { category: 'S' as any, percent: toDecimal4('20') } }
    ],
    vatBreakdown: [
      { category: 'S' as any, percent: toDecimal4('20'), taxableAmount: toAmount('100'), taxAmount: toAmount('20') }
    ],
    totals: {
      lineNetTotal: toAmount('100'),
      taxExclusiveTotal: toAmount('100'),
      taxTotal: toAmount('20'),
      taxInclusiveTotal: toAmount('120'),
      prepaid: ZERO_AMOUNT,
      payable: toAmount('120')
    },
    payment: {
      meansCode: '30',
      iban: 'FR7630006000011234567890189'
    },
    notes: [
      { content: 'Pénalités de retard: 3 fois le taux légal. Indemnité forfaitaire pour frais de recouvrement: 40 €. Aucun escompte consenti.' }
    ]
  });

  it('should pass on valid invoice', () => {
    const invoice = getValidInvoice();
    const issues = validateBusinessRules(invoice);
    expect(issues.length).toBe(0);
  });

  it('should fail if missing mandatory header fields', () => {
    const invoice = getValidInvoice();
    invoice.number = '';
    invoice.issueDate = '' as any;
    invoice.typeCode = '' as any;
    invoice.currency = '' as any;
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'MISSING_NUMBER')).toBe(true);
    expect(issues.some(i => i.code === 'MISSING_ISSUE_DATE')).toBe(true);
    expect(issues.some(i => i.code === 'MISSING_TYPE_CODE')).toBe(true);
    expect(issues.some(i => i.code === 'MISSING_CURRENCY')).toBe(true);
  });
  
  it('should fail if missing profile', () => {
    const invoice = getValidInvoice();
    invoice.profile = '' as any;
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'MISSING_PROFILE')).toBe(true);
  });

  it('should fail if missing lines', () => {
    const invoice = getValidInvoice();
    (invoice as any).lines = [];
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'NO_LINES')).toBe(true);
  });
  
  it('should fail if credit note has no precedingInvoiceNumber', () => {
    const invoice = getValidInvoice();
    invoice.typeCode = '381' as any;
    invoice.precedingInvoiceNumber = '';
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'CREDIT_NOTE_NO_REF')).toBe(true);
  });

  it('should fail on invalid party fields', () => {
    const invoice = getValidInvoice();
    invoice.seller.name = '';
    invoice.seller.siren = '123'; // invalid
    invoice.seller.siret = '123'; // invalid
    invoice.seller.vatId = 'FR12'; // invalid
    invoice.seller.address.line1 = '';
    invoice.seller.address.postalCode = '';
    invoice.seller.address.city = '';
    invoice.seller.address.country = ' ' as any;
    invoice.seller.electronicAddress.value = '';
    invoice.seller.electronicAddress.schemeId = '';
    
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'MISSING_SELLER_NAME')).toBe(true);
    expect(issues.some(i => i.code === 'INVALID_SIREN')).toBe(true);
    expect(issues.some(i => i.code === 'INVALID_SIRET')).toBe(true);
    expect(issues.some(i => i.code === 'INVALID_VAT_FR')).toBe(true);
    expect(issues.some(i => i.code === 'MISSING_ADDRESS_LINE1')).toBe(true);
    expect(issues.some(i => i.code === 'MISSING_POSTAL_CODE')).toBe(true);
    expect(issues.some(i => i.code === 'MISSING_CITY')).toBe(true);
    expect(issues.some(i => i.code === 'MISSING_COUNTRY')).toBe(true);
    expect(issues.some(i => i.code === 'MISSING_ELECTRONIC_ADDRESS')).toBe(true);
    expect(issues.some(i => i.code === 'MISSING_ELECTRONIC_ADDRESS_SCHEME')).toBe(true);
  });

  it('should fail if missing seller VAT ID (French rule)', () => {
    const invoice = getValidInvoice();
    invoice.seller.vatId = '';
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'FR_MISSING_SELLER_VAT')).toBe(true);
  });

  it('should fail if missing payment means', () => {
    const invoice = getValidInvoice();
    invoice.payment.meansCode = '';
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'MISSING_PAYMENT_MEANS')).toBe(true);
  });
  
  it('should fail if invalid IBAN', () => {
    const invoice = getValidInvoice();
    invoice.payment.iban = 'FR123';
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'INVALID_IBAN')).toBe(true);
  });

  it('should enforce exemption reasons', () => {
    const invoice = getValidInvoice();
    invoice.vatBreakdown = [
      { category: 'E' as any, percent: toDecimal4('0'), taxableAmount: toAmount('100'), taxAmount: ZERO_AMOUNT }
    ];
    invoice.lines[0].vat = { category: 'E' as any, percent: toDecimal4('0') };
    
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'MISSING_EXEMPTION_REASON')).toBe(true);
    expect(issues.some(i => i.code === 'MISSING_LINE_EXEMPTION_REASON')).toBe(true);
  });
  
  it('should ignore undefined vatBreakdown lines when enforcing exemption reasons', () => {
    const invoice = getValidInvoice();
    invoice.vatBreakdown = [undefined as any];
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'MISSING_EXEMPTION_REASON')).toBe(false);
  });

  it('should enforce VAT rate rules', () => {
    const invoice = getValidInvoice();
    invoice.vatBreakdown = [
      { category: 'S' as any, percent: toDecimal4('0'), taxableAmount: toAmount('100'), taxAmount: ZERO_AMOUNT },
      { category: 'Z' as any, percent: toDecimal4('20'), taxableAmount: toAmount('100'), taxAmount: toAmount('20') },
      { category: 'E' as any, percent: toDecimal4('20'), taxableAmount: toAmount('100'), taxAmount: toAmount('20'), exemptionReason: 'Test' }
    ];
    
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'VAT_S_ZERO_RATE')).toBe(true);
    expect(issues.some(i => i.code === 'VAT_Z_NONZERO_RATE')).toBe(true);
    expect(issues.some(i => i.code === 'VAT_E_NONZERO_RATE')).toBe(true);
  });
  
  it('should detect missing French mentions', () => {
    const invoice = getValidInvoice();
    invoice.notes = [{ content: 'Rien de spécial' }];
    const issues = validateBusinessRules(invoice);
    expect(issues.some(i => i.code === 'FR_MISSING_PENALTY_MENTION')).toBe(true);
    expect(issues.some(i => i.code === 'FR_MISSING_RECOVERY_MENTION')).toBe(true);
    expect(issues.some(i => i.code === 'FR_MISSING_DISCOUNT_MENTION')).toBe(true);
  });
});
