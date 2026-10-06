import type { jsPDF as JsPDF } from 'jspdf';
import type { Factura } from '../types';

type InvoicePdfData = Pick<Factura, 'codigo' | 'clienteNombre' | 'vehiculoPlaca' | 'tipo' | 'total' | 'items' | 'fecha'>;

const formatMoney = (value: number) => `$${value.toFixed(2)}`;

async function loadWorkshopLogo(): Promise<string> {
  const response = await fetch('/assets/logo_taller.png');
  if (!response.ok) {
    throw new Error(`No se pudo cargar el logo del taller (${response.status}).`);
  }

  const logo = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('No se pudo procesar el logo del taller.'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo procesar el logo del taller.'));
    reader.readAsDataURL(logo);
  });
}

export async function createInvoicePdf(invoice: InvoicePdfData, cashierName = 'Caja'): Promise<JsPDF> {
  const logo = await loadWorkshopLogo();
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  const right = pageWidth - margin;
  const itemNameWidth = 300;
  const amountColumn = right - 12;
  const quantityColumn = right - 116;

  const drawHeader = (includeInvoiceInfo: boolean) => {
    doc.addImage(logo, 'PNG', margin, 30, 54, 54);
    doc.setTextColor(28, 11, 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('TALLER RODRÍGUEZ, S.A. DE C.V.', margin + 66, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('AUTOPROP, EL SALVADOR', margin + 66, 67);
    doc.text('TEL: 2121-2828 • NIT: 0614-121218-101-1', margin + 66, 82);

    doc.setTextColor(234, 88, 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(invoice.tipo.toUpperCase(), right, 48, { align: 'right' });
    doc.setTextColor(24, 12, 52);
    doc.setFontSize(14);
    doc.text(invoice.codigo, right, 68, { align: 'right' });

    doc.setDrawColor(215, 221, 232);
    doc.line(margin, 101, right, 101);

    let y = 120;
    if (includeInvoiceInfo) {
      doc.setTextColor(71, 66, 104);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('FECHA:', margin + 8, y);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.fecha, margin + 62, y);

      y += 16;
      doc.setFont('helvetica', 'bold');
      doc.text('CLIENTE:', margin + 8, y);
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(invoice.clienteNombre, 420), margin + 62, y);

      if (invoice.vehiculoPlaca) {
        y += 16;
        doc.setFont('helvetica', 'bold');
        doc.text('VEHÍCULO:', margin + 8, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`Placa ${invoice.vehiculoPlaca}`, margin + 74, y);
      }

      y += 16;
      doc.setFont('helvetica', 'bold');
      doc.text('CAJERO:', margin + 8, y);
      doc.setFont('helvetica', 'normal');
      doc.text(cashierName, margin + 62, y);
      y += 13;
      doc.setDrawColor(215, 221, 232);
      doc.line(margin, y, right, y);
      y += 20;
    }

    doc.setTextColor(73, 66, 104);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CONCEPTO', margin + 8, y);
    doc.text('CANT.', quantityColumn, y, { align: 'center' });
    doc.text('PRECIO', amountColumn, y, { align: 'right' });
    return y + 16;
  };

  let y = drawHeader(true);
  doc.setTextColor(28, 12, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  for (const item of invoice.items) {
    const itemName = doc.splitTextToSize(item.nombre, itemNameWidth);
    const rowHeight = Math.max(16, itemName.length * 12 + 4);
    if (y + rowHeight > pageHeight - 150) {
      doc.addPage();
      y = drawHeader(false);
      doc.setTextColor(28, 12, 52);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
    }

    doc.text(itemName, margin + 8, y);
    doc.text(String(item.cantidad), quantityColumn, y, { align: 'center' });
    doc.text(formatMoney(item.precioUnitario * item.cantidad), amountColumn, y, { align: 'right' });
    y += rowHeight;
  }

  if (y + 105 > pageHeight - margin) {
    doc.addPage();
    y = drawHeader(false);
  }

  y += 8;
  doc.setDrawColor(215, 221, 232);
  doc.line(margin, y, right, y);
  y += 21;

  const subtotal = invoice.total / 1.13;
  doc.setTextColor(71, 66, 104);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`SUBTOTAL: ${formatMoney(subtotal)}`, right, y, { align: 'right' });
  y += 18;
  doc.text(`IVA (13%): ${formatMoney(invoice.total - subtotal)}`, right, y, { align: 'right' });
  y += 24;

  doc.setDrawColor(215, 221, 232);
  doc.line(margin, y, right, y);
  y += 22;
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`TOTAL A PAGAR: ${formatMoney(invoice.total)}`, right, y, { align: 'right' });

  y += 42;
  doc.setTextColor(71, 66, 104);
  doc.setFontSize(9);
  doc.text('*** Gracias por su preferencia ***', pageWidth / 2, y, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Visite tallerrodriguez.com • Control System', pageWidth / 2, y + 16, { align: 'center' });

  return doc;
}

export async function downloadInvoicePdf(invoice: InvoicePdfData, cashierName = 'Caja'): Promise<void> {
  const doc = await createInvoicePdf(invoice, cashierName);
  const safeCode = invoice.codigo.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
  doc.save(`factura-${safeCode}.pdf`);
}
