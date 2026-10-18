export interface ValidationIssue {
  code: string;                // ex "ARITH_TOTAL_MISMATCH"
  severity: 'error' | 'warning';
  path: string;                // chemin du champ, ex "totals.taxTotal"
  message: string;             // en français, actionnable
  ruleRef?: string;            // ex "BR-CO-15"
}
