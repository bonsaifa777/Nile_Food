import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const TYPE_LABELS = {
  delivery: 'Delivery',
  dine_in: 'Dine-in',
  pickup: 'Pickup'
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Served',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export function exportOrdersPdf({ title, periodLabel, orders, count, revenue }) {
  const doc = new jsPDF({ orientation: 'landscape' });

  const headerColor = [99, 102, 241];
  doc.setFillColor(...headerColor);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 34, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Nile Food', 14, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${title} Order Report`, 14, 24);
  doc.setFontSize(9);
  doc.text(`Period: ${periodLabel}`, 14, 30);
  doc.setFontSize(9);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, doc.internal.pageSize.getWidth() - 14, 15, { align: 'right' });

  const rows = orders.map((o) => [
    o.orderId || o._id || '-',
    format(new Date(o.createdAt), 'MMM d, yyyy h:mm a'),
    TYPE_LABELS[o.type] || o.type || '-',
    STATUS_LABELS[o.status] || o.status || '-',
    o.paymentStatus || '-',
    `ETB ${Number(o.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['Order ID', 'Date & Time', 'Type', 'Status', 'Payment', 'Total']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: headerColor, fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { cellPadding: 3.5, valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 40 },
      5: { halign: 'right', fontStyle: 'bold', textColor: [99, 102, 241] }
    },
    margin: { left: 14, right: 14 },
    didDrawPage: () => {}
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  const tableWidth = doc.internal.pageSize.getWidth() - 28;

  doc.setDrawColor(...headerColor);
  doc.setLineWidth(0.5);
  doc.line(14, finalY - 8, 14 + tableWidth, finalY - 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...headerColor);
  doc.text(`Total Orders: ${count}`, 14, finalY);
  doc.text(`Grand Total: ETB ${Number(revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14 + tableWidth, finalY, { align: 'right' });

  const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-orders-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}