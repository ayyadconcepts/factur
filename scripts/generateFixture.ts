import fs from 'fs';
import path from 'path';
import { generateFacturxDocument } from '../src/core/facturx/roundTrip';
import { toAmount, toDecimal4, ZERO_AMOUNT } from '../src/core/domain/money';

async function run() {
  const iccProfileBytes = fs.readFileSync(path.join(process.cwd(), 'assets/icc/sRGB.icc'));
  const fontBytes = fs.readFileSync(path.join(process.cwd(), 'assets/fonts/Roboto-Regular.ttf'));
  const boldFontBytes = fs.readFileSync(path.join(process.cwd(), 'assets/fonts/Roboto-Bold.ttf'));

  const invoice = {
    profile: 'EN16931' as any,
    number: 'INV-123',
    typeCode: '380' as any,
    issueDate: '2024-01-01' as any,
    currency: 'EUR' as any,
    seller: {
      name: 'Test Corp',
      siren: '552120222',
      vatId: 'FR27552120222',
      address: {
        line1: '1 Rue de la Paix',
        postalCode: '75000',
        city: 'Paris',
        country: 'FR' as any
      },
      electronicAddress: { schemeId: '0002', value: '552120222' }
    },
    buyer: {
      name: 'Client SARL',
      siren: '552120222',
      vatId: 'FR27552120222',
      address: {
        line1: '2 Rue du Commerce',
        postalCode: '69000',
        city: 'Lyon',
        country: 'FR' as any
      },
      electronicAddress: { schemeId: '0002', value: '552120222' }
    },
    lines: [
      { id: '1', name: 'Service web', quantity: toDecimal4('1'), unit: 'C62' as any, unitPriceNet: toDecimal4('100'), lineNetAmount: toAmount('100'), vat: { category: 'S' as any, percent: toDecimal4('20') } }
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
      iban: 'FR7630001000011234567890189'
    },
    notes: [
      { content: 'Merci pour votre confiance.' }
    ]
  };

  const result = await generateFacturxDocument({
    invoice,
    iccProfileBytes,
    fontBytes,
    boldFontBytes
  });

  fs.writeFileSync(path.join(process.cwd(), 'tests/fixtures/pdf/facture-simple.pdf'), result.pdfBytes);
  console.log('Generated tests/fixtures/pdf/facture-simple.pdf');
}

run().catch(console.error);
