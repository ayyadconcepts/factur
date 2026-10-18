import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const FieldSchema = z.object({
  value: z.string().nullable().describe("Valeur NORMALISÉE : montant '1500.00', date ISO '2026-10-08', identifiants en chiffres sans espaces. null si absent."),
  raw: z.string().nullable().describe("Texte EXACT tel qu'imprimé (ex. '1 500,00 €'). null si absent."),
  quote: z.string().nullable().describe("Extrait EXACT du document source contenant `raw`. null si absent."),
  printedLabel: z.string().nullable().describe("Libellé imprimé à côté de la valeur (ex. 'Net à payer (TTC)'). null si absent."),
  ambiguous: z.boolean().describe("true si plusieurs valeurs plausibles ou lecture incertaine."),
  note: z.string().nullable().describe("Explication courte si ambiguous est true (ex. 'deux totaux différents').")
}).describe("Un champ extrait de la facture");

export const PartyDraftSchema = z.object({
  name: FieldSchema,
  siret: FieldSchema,
  siren: FieldSchema,
  vatId: FieldSchema,
  legalForm: FieldSchema,
  addressLine1: FieldSchema,
  postalCode: FieldSchema,
  city: FieldSchema,
  country: FieldSchema,
});

export const BooleanFieldSchema = z.object({
  value: z.boolean().nullable().describe("Valeur NORMALISÉE"),
  raw: z.string().nullable().describe("Texte EXACT"),
  quote: z.string().nullable(),
  printedLabel: z.string().nullable(),
  ambiguous: z.boolean(),
  note: z.string().nullable()
});

export const LineDraftSchema = z.object({
  description: FieldSchema,
  quantity: FieldSchema,
  unit: FieldSchema,
  unitPriceNet: FieldSchema,
  vatCategory: FieldSchema,
  vatRate: FieldSchema,
  lineNetAmount: FieldSchema,
});

export const LlmInvoiceDraftSchema = z.object({
  documentType: z.enum(['invoice', 'credit_note', 'other']).describe("Type de document (facture, avoir, autre)"),
  invoiceNumber: FieldSchema,
  issueDate: FieldSchema,
  dueDate: FieldSchema,
  deliveryDate: FieldSchema,
  currency: FieldSchema,
  seller: PartyDraftSchema,
  buyer: PartyDraftSchema,
  lines: z.array(LineDraftSchema),
  totals: z.object({
    excludingVat: FieldSchema,
    vatTotal: FieldSchema,
    includingVat: FieldSchema,
    amountDue: FieldSchema,
  }),
  vatBreakdown: z.array(z.object({
    category: FieldSchema,
    rate: FieldSchema,
    taxableAmount: FieldSchema,
    vatAmount: FieldSchema,
  })),
  payment: z.object({
    iban: FieldSchema,
    bic: FieldSchema,
    terms: FieldSchema,
  }),
  operationCategory: FieldSchema,
  vatOnDebits: BooleanFieldSchema,
  legalNotes: z.array(FieldSchema).describe("Mentions légales imprimées (pénalités, indemnité, escompte, etc.)"),
});

export type LlmInvoiceDraft = z.infer<typeof LlmInvoiceDraftSchema>;

export const llmInvoiceJsonSchema = zodToJsonSchema(LlmInvoiceDraftSchema as any, {
  target: 'jsonSchema7',
  $refStrategy: 'none'
});
