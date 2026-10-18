import { Type, Schema } from '@google/genai';

const fieldSchema: Schema = {
  type: Type.OBJECT,
  description: "Un champ extrait de la facture",
  properties: {
    value: { type: Type.STRING, description: "Valeur NORMALISÉE : montant '1500.00', date ISO '2026-10-08', identifiants en chiffres sans espaces. null si absent.", nullable: true },
    raw: { type: Type.STRING, description: "Texte EXACT tel qu'imprimé (ex. '1 500,00 €'). null si absent.", nullable: true },
    quote: { type: Type.STRING, description: "Extrait EXACT du document source contenant `raw`. null si absent.", nullable: true },
    printedLabel: { type: Type.STRING, description: "Libellé imprimé à côté de la valeur (ex. 'Net à payer (TTC)'). null si absent.", nullable: true },
    ambiguous: { type: Type.BOOLEAN, description: "true si plusieurs valeurs plausibles ou lecture incertaine." },
    note: { type: Type.STRING, description: "Explication courte si ambiguous est true (ex. 'deux totaux différents').", nullable: true }
  },
  required: ['value', 'raw', 'quote', 'printedLabel', 'ambiguous'] // note is optional
};

const partyDraftSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: fieldSchema,
    siret: fieldSchema,
    siren: fieldSchema,
    vatId: fieldSchema,
    legalForm: fieldSchema,
    addressLine1: fieldSchema,
    postalCode: fieldSchema,
    city: fieldSchema,
    country: fieldSchema,
  }
};

const lineDraftSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    description: fieldSchema,
    quantity: fieldSchema,
    unit: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "Code unité UN/ECE (ex: 'C62' pour unité/pièce, 'HUR' pour heure, 'DAY' pour jour, 'KGM' pour kg, 'MTR' pour mètre).", nullable: true },
        raw: { type: Type.STRING, nullable: true },
        quote: { type: Type.STRING, nullable: true },
        printedLabel: { type: Type.STRING, nullable: true },
        ambiguous: { type: Type.BOOLEAN },
        note: { type: Type.STRING, nullable: true }
      },
      required: ['value', 'raw', 'quote', 'printedLabel', 'ambiguous']
    },
    unitPriceNet: fieldSchema,
    vatCategory: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "Catégorie TVA : 'S' (Standard), 'Z' (Zéro), 'E' (Exonéré).", nullable: true },
        raw: { type: Type.STRING, nullable: true },
        quote: { type: Type.STRING, nullable: true },
        printedLabel: { type: Type.STRING, nullable: true },
        ambiguous: { type: Type.BOOLEAN },
        note: { type: Type.STRING, nullable: true }
      },
      required: ['value', 'raw', 'quote', 'printedLabel', 'ambiguous']
    },
    vatRate: fieldSchema,
    lineNetAmount: fieldSchema,
  }
};

export const geminiInvoiceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    documentType: { type: Type.STRING, description: "Type de document (invoice, credit_note, other)" },
    invoiceNumber: fieldSchema,
    issueDate: fieldSchema,
    dueDate: fieldSchema,
    deliveryDate: fieldSchema,
    currency: fieldSchema,
    seller: partyDraftSchema,
    buyer: partyDraftSchema,
    lines: { type: Type.ARRAY, items: lineDraftSchema },
    totals: {
      type: Type.OBJECT,
      properties: {
        excludingVat: fieldSchema,
        vatTotal: fieldSchema,
        includingVat: fieldSchema,
        amountDue: fieldSchema,
      }
    },
    vatBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.OBJECT,
            properties: {
              value: { type: Type.STRING, description: "Catégorie TVA : 'S' (Standard), 'Z' (Zéro), 'E' (Exonéré).", nullable: true },
              raw: { type: Type.STRING, nullable: true },
              quote: { type: Type.STRING, nullable: true },
              printedLabel: { type: Type.STRING, nullable: true },
              ambiguous: { type: Type.BOOLEAN },
              note: { type: Type.STRING, nullable: true }
            },
            required: ['value', 'raw', 'quote', 'printedLabel', 'ambiguous']
          },
          rate: fieldSchema,
          taxableAmount: fieldSchema,
          vatAmount: fieldSchema,
        }
      }
    },
    payment: {
      type: Type.OBJECT,
      properties: {
        iban: fieldSchema,
        bic: fieldSchema,
        terms: fieldSchema,
      }
    },
    legalNotes: {
      type: Type.ARRAY,
      items: fieldSchema,
      description: "Mentions légales imprimées (pénalités, indemnité, escompte, etc.)"
    },
    operationCategory: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "Valeur NORMALISÉE : 'goods', 'services' ou 'mixed'.", nullable: true },
        raw: { type: Type.STRING, description: "Texte EXACT", nullable: true },
        quote: { type: Type.STRING, nullable: true },
        printedLabel: { type: Type.STRING, nullable: true },
        ambiguous: { type: Type.BOOLEAN },
        note: { type: Type.STRING, nullable: true }
      },
      required: ['value', 'raw', 'quote', 'printedLabel', 'ambiguous']
    },
    vatOnDebits: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.BOOLEAN, description: "true si TVA sur les débits, false si TVA sur les encaissements ou indéfini.", nullable: true },
        raw: { type: Type.STRING, nullable: true },
        quote: { type: Type.STRING, nullable: true },
        printedLabel: { type: Type.STRING, nullable: true },
        ambiguous: { type: Type.BOOLEAN },
        note: { type: Type.STRING, nullable: true }
      },
      required: ['value', 'raw', 'quote', 'printedLabel', 'ambiguous']
    }
  }
};
