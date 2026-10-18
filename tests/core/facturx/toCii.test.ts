import { describe, it, expect, beforeAll } from 'vitest';
import { toCii, MissingMandatoryFieldsError } from '../../../src/core/facturx/toCii';
import { engine } from '../../../src/core/facturx/engine';
import { Invoice } from '../../../src/core/domain/invoice';

describe('toCii', () => {
  // No init needed

  const validInvoice: Invoice = {
    profile: 'EN16931',
    number: 'FA-2026-10-0042',
    typeCode: '380',
    issueDate: '2026-10-08',
    deliveryDate: '2026-10-05',
    dueDate: '2026-11-07',
    currency: 'EUR',
    operationCategory: 'services',
    vatOnDebits: false,
    seller: {
      name: 'TECH LAB SOLUTIONS SAS',
      siren: '834567893',
      siret: '83456789300013',
      vatId: 'FR25834567893',
      address: { line1: '12 Rue de la Paix', postalCode: '75002', city: 'Paris', country: 'FR' }
    },
    buyer: {
      name: 'ATELIER DU DIGITAL SARL',
      siren: '912345675',
      siret: '91234567500025',
      vatId: 'FR65912345675',
      address: { line1: '45 Avenue Jean Jaurès', postalCode: '69007', city: 'Lyon', country: 'FR' }
    },
    lines: [
      {
        id: '1', name: "Audit d'intégration API Factur-X & Tests de charge",
        quantity: '1', unit: 'C62', unitPriceNet: '1200.00', lineNetAmount: '1200.00',
        vat: { category: 'S', percent: '20.00' }
      },
      {
        id: '2', name: 'Abonnement annuel infrastructure Cloud sécurisée',
        quantity: '1', unit: 'C62', unitPriceNet: '300.00', lineNetAmount: '300.00',
        vat: { category: 'S', percent: '20.00' }
      }
    ],
    vatBreakdown: [
      { category: 'S', percent: '20.00', taxableAmount: '1500.00', taxAmount: '300.00' }
    ],
    totals: {
      lineNet: '1500.00', taxExclusive: '1500.00', taxTotal: '300.00', taxInclusive: '1800.00', payable: '1800.00'
    },
    payment: {
      meansCode: '30', iban: 'FR7630004000010024567890185', bic: 'BNPAFRPPXXX', terms: 'Virement bancaire sous 30 jours à réception.'
    },
    notes: [
      { content: 'pénalités de retard (taux d\'intérêt légal majoré de 10 points)' },
      { content: 'indemnité forfaitaire de recouvrement de 40 € (Art. D. 441-5 du Code de commerce)' },
      { content: 'pas d\'escompte pour règlement anticipé.' }
    ]
  };

  it('génère un XML qui passe la validation Schematron de la bibliothèque', async () => {
    const xml = toCii(validInvoice);
    const result = await engine.checkXml(xml, 'en16931');
    if (!result.valid) {
      console.error(result.messages);
    }
    expect(result.valid).toBe(true);
  });

  it('ne contient aucune balise vide', () => {
    const xml = toCii(validInvoice);
    const hasEmptyTags = /<[^/>]+\/>/.test(xml);
    expect(hasEmptyTags).toBe(false);
  });

  it('lève une erreur si des champs obligatoires sont manquants', () => {
    const invalid = { ...validInvoice, lines: [] };
    expect(() => toCii(invalid)).toThrowError(MissingMandatoryFieldsError);
    expect(() => toCii(invalid)).toThrowError(/lines/);
    
    const invalidAddress = JSON.parse(JSON.stringify(validInvoice));
    invalidAddress.seller.address.line1 = '';
    expect(() => toCii(invalidAddress)).toThrowError(/seller\.address\.line1/);
  });
});
