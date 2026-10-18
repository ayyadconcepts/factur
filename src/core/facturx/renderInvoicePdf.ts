import { PDFDocument, rgb, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Invoice } from '../domain/invoice';
import { formatFR } from '../domain/money';
import { VAT_CATEGORY_LABELS, COMMON_UNIT_CODES } from '../domain/codes';

export async function renderInvoicePdf(
  invoice: Invoice,
  fontBytes: Uint8Array,
  boldFontBytes: Uint8Array
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const font = await pdfDoc.embedFont(fontBytes);
  const boldFont = await pdfDoc.embedFont(boldFontBytes);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const margin = 50;
  
  let y = height - margin;

  const drawText = (text: string | undefined, x: number, yPos: number, f: PDFFont = font, size = 10, align: 'left' | 'right' = 'left') => {
    if (text) {
      const textWidth = f.widthOfTextAtSize(text, size);
      const finalX = align === 'right' ? x - textWidth : x;
      page.drawText(text, { x: finalX, y: yPos, size, font: f, color: rgb(0, 0, 0) });
    }
  };

  const getInvoiceTypeLabel = (code: string) => {
    if (code === '381') return 'AVOIR';
    if (code === '386') return "FACTURE D'ACOMPTE";
    return 'FACTURE';
  };

  // Header
  drawText(`${getInvoiceTypeLabel(invoice.typeCode)} N° ${invoice.number}`, margin, y, boldFont, 16);
  y -= 20;
  drawText(`Date d'émission : ${invoice.issueDate}`, margin, y, font, 10);
  if (invoice.dueDate) {
    y -= 15;
    drawText(`Date d'échéance : ${invoice.dueDate}`, margin, y, font, 10);
  }
  y -= 30;

  // Seller & Buyer
  const buyerX = width / 2 + 20;
  drawText('ÉMETTEUR', margin, y, boldFont, 10);
  drawText('CLIENT', buyerX, y, boldFont, 10);
  y -= 15;

  drawText(invoice.seller.name, margin, y, boldFont, 12);
  drawText(invoice.buyer.name, buyerX, y, boldFont, 12);
  y -= 15;
  
  if (invoice.seller.address.line1) drawText(invoice.seller.address.line1, margin, y, font, 10);
  if (invoice.buyer.address.line1) drawText(invoice.buyer.address.line1, buyerX, y, font, 10);
  y -= 15;

  const sellerZipCity = [invoice.seller.address.postalCode, invoice.seller.address.city].filter(Boolean).join(' ');
  if (sellerZipCity) drawText(sellerZipCity, margin, y, font, 10);
  const buyerZipCity = [invoice.buyer.address.postalCode, invoice.buyer.address.city].filter(Boolean).join(' ');
  if (buyerZipCity) drawText(buyerZipCity, buyerX, y, font, 10);
  y -= 15;
  
  if (invoice.seller.address.country) drawText(invoice.seller.address.country, margin, y, font, 10);
  if (invoice.buyer.address.country) drawText(invoice.buyer.address.country, buyerX, y, font, 10);
  y -= 20;

  if (invoice.seller.siren) drawText(`SIREN : ${invoice.seller.siren}`, margin, y, font, 10);
  if (invoice.buyer.siren) drawText(`SIREN : ${invoice.buyer.siren}`, buyerX, y, font, 10);
  y -= 15;

  if (invoice.seller.vatId) drawText(`N° TVA : ${invoice.seller.vatId}`, margin, y, font, 10);
  if (invoice.buyer.vatId) drawText(`N° TVA : ${invoice.buyer.vatId}`, buyerX, y, font, 10);
  y -= 40;

  // Lignes
  const colDesc = margin;
  const colQty = margin + 250;
  const colUnit = margin + 290;
  const colPrice = margin + 350;
  const colVat = margin + 410;
  const colTotal = margin + 490;

  drawText('Désignation', colDesc, y, boldFont, 9);
  drawText('Qté', colQty, y, boldFont, 9, 'right');
  drawText('Unité', colUnit, y, boldFont, 9);
  drawText('PU HT', colPrice, y, boldFont, 9, 'right');
  drawText('TVA', colVat, y, boldFont, 9, 'right');
  drawText('Total HT', colTotal, y, boldFont, 9, 'right');
  y -= 15;
  
  // Ligne de séparation
  page.drawLine({ start: { x: margin, y: y + 10 }, end: { x: width - margin, y: y + 10 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) });

  for (const line of invoice.lines) {
    // Basic word wrap for description
    const desc = line.name.substring(0, 50); // limit to avoid overlapping
    drawText(desc, colDesc, y, font, 9);
    drawText(line.quantity, colQty, y, font, 9, 'right');
    const unitLabel = Object.values(COMMON_UNIT_CODES).find(u => u.code === line.unit)?.label || line.unit;
    drawText(unitLabel, colUnit, y, font, 9);
    drawText(formatFR(line.unitPriceNet), colPrice, y, font, 9, 'right');
    const vatStr = line.vat?.percent ? `${line.vat.percent} %` : (line.vat?.category || '');
    drawText(vatStr, colVat, y, font, 9, 'right');
    drawText(formatFR(line.lineNetAmount), colTotal, y, font, 9, 'right');
    
    y -= 15;
    // Handle page break
    if (y < 150) {
      // In a real app we'd add a new page here. For prototype, we skip.
      break;
    }
  }

  y -= 20;
  page.drawLine({ start: { x: margin, y: y + 15 }, end: { x: width - margin, y: y + 15 }, thickness: 0.5, color: rgb(0.5, 0.5, 0.5) });

  // Totaux
  const totalsXLabel = width - margin - 150;
  const totalsXValue = width - margin;
  
  drawText('Total HT', totalsXLabel, y, font, 10);
  drawText(formatFR(invoice.totals.taxExclusive), totalsXValue, y, font, 10, 'right');
  y -= 15;

  if (invoice.totals.taxTotal) {
    drawText('Total TVA', totalsXLabel, y, font, 10);
    drawText(formatFR(invoice.totals.taxTotal), totalsXValue, y, font, 10, 'right');
    y -= 15;
  }

  drawText('Total TTC', totalsXLabel, y, boldFont, 11);
  drawText(formatFR(invoice.totals.taxInclusive), totalsXValue, y, boldFont, 11, 'right');
  y -= 15;
  
  drawText('Net à payer', totalsXLabel, y, boldFont, 12);
  drawText(formatFR(invoice.totals.payable), totalsXValue, y, boldFont, 12, 'right');
  y -= 40;

  // Mentions légales (TVA, Nature)
  let mentions = [];
  if (invoice.operationCategory === 'services') mentions.push('Nature : Prestation de services');
  else if (invoice.operationCategory === 'goods') mentions.push('Nature : Livraison de biens');
  else if (invoice.operationCategory === 'mixed') mentions.push('Nature : Mixte');

  if (invoice.vatOnDebits === true) mentions.push('TVA acquittée sur les débits');
  else if (invoice.vatOnDebits === false) mentions.push('TVA acquittée sur les encaissements');

  if (mentions.length > 0) {
    drawText('Mentions Légales :', margin, y, boldFont, 9);
    y -= 15;
    for (const m of mentions) {
      drawText(`- ${m}`, margin, y, font, 9);
      y -= 12;
    }
  }

  return await pdfDoc.save();
}
