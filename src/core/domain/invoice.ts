export type Amount = string;
export type IsoDate = string;

export interface Address {
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string; /* "FR" */
}

export interface Party {
  name: string;
  siren: string;                 // obligatoire, 9 chiffres, Luhn
  siret?: string;                // facultatif, 14 chiffres, commence par le SIREN
  vatId?: string;                // TVA intracommunautaire
  address: Address;
  electronicAddress?: { schemeId: string; value: string };   // TODO(spec) : valeurs autorisées
}

export interface InvoiceLine {
  id: string;
  name: string;
  quantity: string;
  unit: string;  // unité UN/ECE (ex. "C62")
  unitPriceNet: Amount;
  lineNetAmount: Amount;
  vat: { category: 'S' | 'Z' | 'E'; percent: string };       // MVP : S, Z, E
}

export interface VatBreakdownLine {
  category: 'S' | 'Z' | 'E';
  percent: string;
  taxableAmount: Amount;
  taxAmount: Amount;
  exemptionReason?: string;
}

export interface Invoice {
  profile: 'EN16931';
  number: string;
  typeCode: '380' | '381';
  issueDate: IsoDate;
  dueDate?: IsoDate;
  deliveryDate?: IsoDate;
  currency: string;
  seller: Party;
  buyer: Party;
  lines: InvoiceLine[];                       // au moins 1
  vatBreakdown: VatBreakdownLine[];           // au moins 1
  totals: { lineNet: Amount; taxExclusive: Amount; taxTotal: Amount; taxInclusive: Amount; payable: Amount };
  payment: { meansCode?: string; iban?: string; bic?: string; terms?: string };
  operationCategory?: 'goods' | 'services' | 'mixed';   // nature de l'opération (mention obligatoire en 2026)
  vatOnDebits?: boolean;                                 // option TVA sur les débits ; false = TVA sur les encaissements
  notes: { subjectCode?: string; content: string }[];    // mentions légales (pénalités, indemnité de 40 €, escompte…)
}
