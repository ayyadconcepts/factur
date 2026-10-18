import { describe, it, expect } from 'vitest';
import { InvoiceSchema } from '../../../src/core/validation/schema';

describe('InvoiceSchema', () => {
  it('valide une facture complète', () => {
    const validInvoice = {
      profile: 'EN16931',
      number: 'FA-2026-10-0042',
      typeCode: '380',
      issueDate: '2026-10-08',
      dueDate: '2026-11-07',
      deliveryDate: '2026-10-05',
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

    const result = InvoiceSchema.safeParse(validInvoice);
    if (!result.success) {
      console.error(result.error.format());
    }
    expect(result.success).toBe(true);
  });
});
