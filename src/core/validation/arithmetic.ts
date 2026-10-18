
import type { Invoice, InvoiceLine,} from '../domain/invoice';
import { toAmount, asDecimal, multiplyAndRound2, sumAmounts,} from '../domain/money';
import type { ValidationIssue } from './types';

function issue(
  code: string,
  severity: 'error' | 'warning',
  path: string,
  message: string,
  ruleRef?: string,
): ValidationIssue {
  return ruleRef !== undefined
    ? { code, severity, path, message, ruleRef }
    : { code, severity, path, message };
}

export function validateLineNetAmount(line: InvoiceLine): ValidationIssue | null {
  const computed = multiplyAndRound2(line.quantity, line.unitPriceNet);
  if (computed !== line.lineNetAmount) {
    return issue(
      'ARITH_LINE_NET',
      'error',
      `lines[${line.id}].lineNetAmount`,
      `Montant net de ligne incorrect (calculé: ${computed}, déclaré: ${line.lineNetAmount})`,
      'BR-CO-10'
    );
  }
  return null;
}

export function validateVatBreakdown(invoice: Invoice): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (let i = 0; i < invoice.vatBreakdown.length; i++) {
    const breakdown = invoice.vatBreakdown[i];
    if (!breakdown) continue;

    // Filter lines matching category and percent
    const matchingLines = invoice.lines.filter(
      (line) => line.vat.category === breakdown.category && line.vat.percent === breakdown.percent
    );

    // BR-CO-17: taxableAmount = sum of lineNetAmounts
    const computedTaxableAmount = sumAmounts(matchingLines.map(l => l.lineNetAmount));
    if (computedTaxableAmount !== breakdown.taxableAmount) {
      issues.push(
        issue(
          'ARITH_VAT_TAXABLE',
          'error',
          `vatBreakdown[${i}].taxableAmount`,
          `Base imposable TVA incorrecte (calculée: ${computedTaxableAmount}, déclarée: ${breakdown.taxableAmount})`,
          'BR-CO-17'
        )
      );
    }

    // BR-CO-14: taxAmount = round2(taxableAmount * percent / 100)
    const rate = asDecimal(breakdown.percent).dividedBy(100);
    const computedTaxAmount = toAmount(asDecimal(breakdown.taxableAmount).times(rate));
    
    if (computedTaxAmount !== breakdown.taxAmount) {
      issues.push(
        issue(
          'ARITH_VAT_AMOUNT',
          'error',
          `vatBreakdown[${i}].taxAmount`,
          `Montant de TVA incorrect (calculé: ${computedTaxAmount}, déclaré: ${breakdown.taxAmount})`,
          'BR-CO-14'
        )
      );
    }
  }

  return issues;
}

export function validateTotals(invoice: Invoice): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const t = invoice.totals;
  const lineNet = t.lineNet ?? t.lineNetTotal ?? '0.00';
  const taxExclusive = t.taxExclusive ?? t.taxExclusiveTotal ?? '0.00';
  const taxInclusive = t.taxInclusive ?? t.taxInclusiveTotal ?? '0.00';
  const prepaid = t.prepaid ?? '0.00';

  const lineNetPath = t.lineNet !== undefined ? 'totals.lineNet' : 'totals.lineNetTotal';
  const taxExclusivePath = t.taxExclusive !== undefined ? 'totals.taxExclusive' : 'totals.taxExclusiveTotal';
  const taxInclusivePath = t.taxInclusive !== undefined ? 'totals.taxInclusive' : 'totals.taxInclusiveTotal';

  // BR-CO-10: lineNetTotal = sum of line lineNetAmounts
  const computedLineNetTotal = sumAmounts(invoice.lines.map(l => l.lineNetAmount));
  if (computedLineNetTotal !== lineNet) {
    issues.push(issue('ARITH_TOTAL_MISMATCH', 'error', lineNetPath, `Total net des lignes incorrect (calculé: ${computedLineNetTotal}, déclaré: ${lineNet})`, 'BR-CO-10'));
  }

  // BR-CO-11: taxExclusiveTotal = lineNetTotal (no allowances/charges MVP)
  if (computedLineNetTotal !== taxExclusive) {
    issues.push(issue('ARITH_TOTAL_MISMATCH', 'error', taxExclusivePath, `Total HT incorrect (calculé: ${computedLineNetTotal}, déclaré: ${taxExclusive})`, 'BR-CO-11'));
  }

  // BR-CO-15: taxTotal = sum of vatBreakdown taxAmounts
  const computedTaxTotal = sumAmounts(invoice.vatBreakdown.map(b => b.taxAmount));
  if (computedTaxTotal !== t.taxTotal) {
    issues.push(issue('ARITH_TOTAL_MISMATCH', 'error', 'totals.taxTotal', `Total TVA incorrect (calculé: ${computedTaxTotal}, déclaré: ${t.taxTotal})`, 'BR-CO-15'));
  }

  // BR-CO-16: taxInclusiveTotal = taxExclusiveTotal + taxTotal
  const computedTaxInclusiveTotal = toAmount(asDecimal(taxExclusive).plus(asDecimal(t.taxTotal)));
  if (computedTaxInclusiveTotal !== taxInclusive) {
    issues.push(issue('ARITH_TOTAL_MISMATCH', 'error', taxInclusivePath, `Total TTC incorrect (calculé: ${computedTaxInclusiveTotal}, déclaré: ${taxInclusive})`, 'BR-CO-16'));
  }

  // Cross-check: taxInclusiveTotal - taxExclusiveTotal must equal taxTotal (CONTROL)
  const difference = toAmount(asDecimal(taxInclusive).minus(asDecimal(taxExclusive)));
  if (difference !== t.taxTotal) {
    issues.push(issue('ARITH_TOTAL_MISMATCH', 'error', 'totals', `Cohérence TTC-HT != TVA (calculé: ${difference}, déclaré TVA: ${t.taxTotal})`));
  }

  // BR-CO-16: payable = taxInclusiveTotal - prepaid (in EN16931 this is actually BR-CO-16 too or related)
  // Let's check BR-CO-16 payable
  const computedPayable = toAmount(asDecimal(taxInclusive).minus(asDecimal(prepaid)));
  if (computedPayable !== t.payable) {
    issues.push(issue('ARITH_TOTAL_MISMATCH', 'error', 'totals.payable', `Net à payer incorrect (calculé: ${computedPayable}, déclaré: ${t.payable})`, 'BR-CO-16'));
  }

  return issues;
}

export function validateAllArithmetic(invoice: Invoice): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const line of invoice.lines) {
    const issue = validateLineNetAmount(line);
    if (issue) issues.push(issue);
  }

  issues.push(...validateVatBreakdown(invoice));
  issues.push(...validateTotals(invoice));

  return issues;
}
