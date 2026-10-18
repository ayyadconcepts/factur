/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { validateLineNetAmount, validateVatBreakdown, validateTotals, validateAllArithmetic } from '@/core/validation/arithmetic';
import type { Invoice, InvoiceLine, VatBreakdownLine, DocumentTotals } from '@/core/domain/invoice';
import { toAmount, toDecimal4, ZERO_AMOUNT } from '@/core/domain/money';

describe('arithmetic validation', () => {
  describe('validateLineNetAmount', () => {
    it('should pass for correctly computed line net amount', () => {
      const line = {
        id: '1',
        quantity: toDecimal4('2.5'),
        unitPriceNet: toDecimal4('10.00'),
        lineNetAmount: toAmount('25.00')
      } as InvoiceLine;
      expect(validateLineNetAmount(line)).toBeNull();
    });

    it('should fail for incorrect line net amount', () => {
      const line = {
        id: '1',
        quantity: toDecimal4('2.5'),
        unitPriceNet: toDecimal4('10.00'),
        lineNetAmount: toAmount('26.00')
      } as InvoiceLine;
      const issue = validateLineNetAmount(line);
      expect(issue).not.toBeNull();
      expect(issue?.code).toBe('ARITH_LINE_NET');
    });
  });

  describe('validateVatBreakdown', () => {
    it('should pass for correctly computed vat breakdown', () => {
      const invoice = {
        lines: [
          { vat: { category: 'S', percent: toDecimal4('20.00') }, lineNetAmount: toAmount('100.00') },
          { vat: { category: 'S', percent: toDecimal4('20.00') }, lineNetAmount: toAmount('50.00') }
        ] as InvoiceLine[],
        vatBreakdown: [
          { category: 'S', percent: toDecimal4('20.00'), taxableAmount: toAmount('150.00'), taxAmount: toAmount('30.00') }
        ] as VatBreakdownLine[]
      } as Invoice;
      
      const issues = validateVatBreakdown(invoice);
      expect(issues.length).toBe(0);
    });

    it('should detect taxableAmount mismatch', () => {
      const invoice = {
        lines: [
          { vat: { category: 'S', percent: toDecimal4('20.00') }, lineNetAmount: toAmount('100.00') }
        ] as InvoiceLine[],
        vatBreakdown: [
          { category: 'S', percent: toDecimal4('20.00'), taxableAmount: toAmount('150.00'), taxAmount: toAmount('30.00') }
        ] as VatBreakdownLine[]
      } as Invoice;
      
      const issues = validateVatBreakdown(invoice);
      expect(issues.some(i => i.code === 'ARITH_VAT_TAXABLE')).toBe(true);
    });

    it('should detect taxAmount mismatch', () => {
      const invoice = {
        lines: [
          { vat: { category: 'S', percent: toDecimal4('20.00') }, lineNetAmount: toAmount('100.00') }
        ] as InvoiceLine[],
        vatBreakdown: [
          { category: 'S', percent: toDecimal4('20.00'), taxableAmount: toAmount('100.00'), taxAmount: toAmount('25.00') }
        ] as VatBreakdownLine[]
      } as Invoice;
      
      const issues = validateVatBreakdown(invoice);
      expect(issues.some(i => i.code === 'ARITH_VAT_AMOUNT')).toBe(true);
    });
    
    it('should ignore undefined breakdown lines', () => {
      const invoice = {
        lines: [],
        vatBreakdown: [undefined as any]
      } as Invoice;
      
      const issues = validateVatBreakdown(invoice);
      expect(issues.length).toBe(0);
    });
  });

  describe('validateTotals', () => {
    it('should pass correctly computed totals', () => {
      const invoice = {
        lines: [
          { lineNetAmount: toAmount('100.00') },
          { lineNetAmount: toAmount('50.00') }
        ] as InvoiceLine[],
        vatBreakdown: [
          { taxAmount: toAmount('30.00') }
        ] as VatBreakdownLine[],
        totals: {
          lineNetTotal: toAmount('150.00'),
          taxExclusiveTotal: toAmount('150.00'),
          taxTotal: toAmount('30.00'),
          taxInclusiveTotal: toAmount('180.00'),
          prepaid: toAmount('0.00'),
          payable: toAmount('180.00')
        } as DocumentTotals
      } as Invoice;

      const issues = validateTotals(invoice);
      expect(issues.length).toBe(0);
    });

    it('should detect mismatch in lineNetTotal', () => {
      const invoice = {
        lines: [{ lineNetAmount: toAmount('100.00') }] as InvoiceLine[],
        vatBreakdown: [],
        totals: {
          lineNetTotal: toAmount('150.00'),
          taxExclusiveTotal: toAmount('100.00'),
          taxTotal: ZERO_AMOUNT,
          taxInclusiveTotal: toAmount('100.00'),
          prepaid: ZERO_AMOUNT,
          payable: toAmount('100.00')
        } as DocumentTotals
      } as Invoice;

      const issues = validateTotals(invoice);
      expect(issues.some(i => i.path === 'totals.lineNetTotal')).toBe(true);
    });

    it('should detect mismatch in taxExclusiveTotal', () => {
      const invoice = { lines: [{ lineNetAmount: toAmount('100.00') }], vatBreakdown: [], totals: { lineNetTotal: toAmount('100.00'), taxExclusiveTotal: toAmount('101.00'), taxTotal: ZERO_AMOUNT, taxInclusiveTotal: toAmount('101.00'), prepaid: ZERO_AMOUNT, payable: toAmount('101.00') } } as any;
      expect(validateTotals(invoice).some(i => i.path === 'totals.taxExclusiveTotal')).toBe(true);
    });
    
    it('should detect mismatch in taxTotal', () => {
      const invoice = { lines: [], vatBreakdown: [{ taxAmount: toAmount('30.00') }], totals: { lineNetTotal: ZERO_AMOUNT, taxExclusiveTotal: ZERO_AMOUNT, taxTotal: toAmount('31.00'), taxInclusiveTotal: toAmount('31.00'), prepaid: ZERO_AMOUNT, payable: toAmount('31.00') } } as any;
      expect(validateTotals(invoice).some(i => i.path === 'totals.taxTotal')).toBe(true);
    });
    
    it('should detect mismatch in taxInclusiveTotal', () => {
      const invoice = { lines: [], vatBreakdown: [], totals: { lineNetTotal: ZERO_AMOUNT, taxExclusiveTotal: ZERO_AMOUNT, taxTotal: ZERO_AMOUNT, taxInclusiveTotal: toAmount('1.00'), prepaid: ZERO_AMOUNT, payable: toAmount('1.00') } } as any;
      expect(validateTotals(invoice).some(i => i.path === 'totals.taxInclusiveTotal')).toBe(true);
    });
    
    it('should detect mismatch in payable', () => {
      const invoice = { lines: [], vatBreakdown: [], totals: { lineNetTotal: ZERO_AMOUNT, taxExclusiveTotal: ZERO_AMOUNT, taxTotal: ZERO_AMOUNT, taxInclusiveTotal: ZERO_AMOUNT, prepaid: ZERO_AMOUNT, payable: toAmount('1.00') } } as any;
      expect(validateTotals(invoice).some(i => i.path === 'totals.payable')).toBe(true);
    });
    
    it('should detect coherence mismatch (TTC - HT != TVA)', () => {
      const invoice = { lines: [], vatBreakdown: [], totals: { lineNetTotal: ZERO_AMOUNT, taxExclusiveTotal: ZERO_AMOUNT, taxTotal: toAmount('1.00'), taxInclusiveTotal: ZERO_AMOUNT, prepaid: ZERO_AMOUNT, payable: ZERO_AMOUNT } } as any;
      expect(validateTotals(invoice).some(i => i.path === 'totals' && i.message.includes('Cohérence'))).toBe(true);
    });
  });

  describe('validateAllArithmetic', () => {
    it('should orchestrate all rules', () => {
      const invoice = { lines: [{ quantity: toDecimal4('1'), unitPriceNet: toDecimal4('100'), lineNetAmount: toAmount('101'), vat: { category: 'S', percent: toDecimal4('20') } }], vatBreakdown: [], totals: { lineNetTotal: ZERO_AMOUNT, taxExclusiveTotal: ZERO_AMOUNT, taxTotal: ZERO_AMOUNT, taxInclusiveTotal: ZERO_AMOUNT, prepaid: ZERO_AMOUNT, payable: ZERO_AMOUNT } } as any;
      expect(validateAllArithmetic(invoice).length).toBeGreaterThan(0);
    });
  });
});
