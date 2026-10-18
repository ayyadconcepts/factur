import { z } from 'zod';
import type { Invoice } from '../domain/invoice';
import type { ValidationIssue } from './types';
import { validateSiren, validateSiret, validateVatIdFR, validateIban } from './identifiers';

export type InvoiceData = Invoice;

export const AmountSchema = z.string().regex(/^-?\d+\.\d{2}$/, { message: "Le montant doit avoir exactement 2 décimales (ex: 1200.00)" });
export const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date ISO requise (YYYY-MM-DD)" });

const SirenSchema = z.string().superRefine((val, ctx) => {
  if (val.trim() === '') return; // Let min(1) or required handle empty if needed, wait, siren is required
  const issue = validateSiren(val);
  if (issue) ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue.message });
});

const SiretSchema = z.string().superRefine((val, ctx) => {
  if (!val) return;
  const issue = validateSiret(val);
  if (issue) ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue.message });
});

const VatIdSchema = z.string().superRefine((val, ctx) => {
  if (!val) return;
  const issue = validateVatIdFR(val);
  if (issue) ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue.message });
});

const IbanSchema = z.string().superRefine((val, ctx) => {
  if (!val) return;
  const issue = validateIban(val);
  if (issue) ctx.addIssue({ code: z.ZodIssueCode.custom, message: issue.message });
});

export const AddressSchema = z.object({
  line1: z.string().min(1, "L'adresse est obligatoire"),
  line2: z.string().optional(),
  postalCode: z.string().min(1, "Le code postal est obligatoire"),
  city: z.string().min(1, "La ville est obligatoire"),
  country: z.string().min(2).max(2).default('FR'), // ISO 3166-1 alpha-2
});

export const PartySchema = z.object({
  name: z.string().min(1, "Le nom de l'entreprise est obligatoire"),
  siren: SirenSchema,
  siret: SiretSchema.optional(),
  vatId: VatIdSchema.optional(),
  address: AddressSchema,
  electronicAddress: z.object({
    schemeId: z.string().min(1, "schemeId requis"),
    value: z.string().min(1, "Valeur requise"),
  }).optional(),
});

export const InvoiceLineSchema = z.object({
  id: z.string().min(1, "ID ligne requis"),
  name: z.string().min(1, "Nom ligne requis"),
  quantity: z.string().regex(/^-?\d+(\.\d{1,4})?$/, "Format quantité invalide"),
  unit: z.string().min(1, "Code unité UN/ECE requis"),
  unitPriceNet: AmountSchema,
  lineNetAmount: AmountSchema,
  vat: z.object({
    category: z.enum(['S', 'Z', 'E']),
    percent: z.string().regex(/^-?\d+(\.\d{1,4})?$/, "Format pourcentage invalide"),
  }),
});

export const VatBreakdownLineSchema = z.object({
  category: z.enum(['S', 'Z', 'E']),
  percent: z.string().regex(/^-?\d+(\.\d{1,4})?$/),
  taxableAmount: AmountSchema,
  taxAmount: AmountSchema,
  exemptionReason: z.string().optional(),
});

export const InvoiceSchema = z.object({
  profile: z.literal('EN16931'),
  number: z.string().min(1, "Le numéro de facture est obligatoire"),
  typeCode: z.enum(['380', '381']),
  issueDate: IsoDateSchema,
  dueDate: IsoDateSchema.optional(),
  deliveryDate: IsoDateSchema.optional(),
  currency: z.literal('EUR'),
  seller: PartySchema,
  buyer: PartySchema,
  lines: z.array(InvoiceLineSchema).min(1, "Au moins une ligne est requise"),
  vatBreakdown: z.array(VatBreakdownLineSchema).min(1, "Au moins un total de TVA est requis"),
  totals: z.object({
    lineNet: AmountSchema,
    taxExclusive: AmountSchema,
    taxTotal: AmountSchema,
    taxInclusive: AmountSchema,
    payable: AmountSchema,
  }),
  payment: z.object({
    meansCode: z.string().optional(),
    iban: IbanSchema.optional(),
    bic: z.string().optional(),
    terms: z.string().optional(),
  }),
  operationCategory: z.enum(['goods', 'services', 'mixed']).optional(),
  vatOnDebits: z.boolean().optional(),
  notes: z.array(
    z.object({
      subjectCode: z.string().optional(),
      content: z.string().min(1, "Le contenu de la note est obligatoire"),
    })
  ).default([]),
}) as unknown as z.ZodType<Invoice>;

export function parseInvoice(data: unknown): { success: true; data: Invoice } | { success: false; issues: readonly ValidationIssue[] } {
  const result = InvoiceSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as unknown as Invoice };
  } else {
    const issues: ValidationIssue[] = result.error.issues.map((err: z.ZodIssue) => ({
      code: 'SCHEMA_ERROR',
      severity: 'error',
      path: err.path.join('.'),
      message: err.message,
    }));
    return { success: false, issues };
  }
}
