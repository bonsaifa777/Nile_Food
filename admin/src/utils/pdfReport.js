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

const MOVEMENT_LABELS = {
  stock_in: 'Stock In',
  stock_out: 'Stock Out',
  adjustment: 'Adjustment',
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted'
};

export function exportInventoryPdf({ title, periodLabel, items, movements, snapshot, movementSummary }) {
  const doc = new jsPDF({ orientation: 'landscape' });

  const headerColor = [16, 185, 129];
  const accentColor = [5, 150, 105];
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...headerColor);
  doc.rect(0, 0, pageWidth, 34, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Nile Food', 14, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${title} Inventory Report`, 14, 24);
  doc.setFontSize(9);
  doc.text(`Period: ${periodLabel}`, 14, 30);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, pageWidth - 14, 15, { align: 'right' });

  let y = 42;

  const block = (label, value, x, w, color) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, w, 20, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x + 6, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...color);
    doc.text(value, x + 6, y + 16);
  };

  const snap = snapshot || {};
  block('Items', String(snap.itemCount ?? items?.length ?? 0), 14, (pageWidth - 28) / 4, accentColor);
  block('Stock Value (ETB)', Number(snap.totalValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 }), 14 + (pageWidth - 28) / 4, (pageWidth - 28) / 4, headerColor);
  block('Total Units', String(snap.totalUnits ?? 0), 14 + ((pageWidth - 28) / 4) * 2, (pageWidth - 28) / 4, [245, 158, 11]);
  block('Low Stock', String(snap.lowStockCount ?? 0), 14 + ((pageWidth - 28) / 4) * 3, (pageWidth - 28) / 4, [239, 68, 68]);

  y += 28;

  if (movementSummary) {
    const m = movementSummary;
    block('Restocked (units)', String(m.addedUnits ?? 0), 14, (pageWidth - 28) / 4, [16, 185, 129]);
    block('Consumed (units)', String(m.consumedUnits ?? 0), 14 + (pageWidth - 28) / 4, (pageWidth - 28) / 4, [239, 68, 68]);
    block(
      'Net Change',
      `${m.netChange >= 0 ? '+' : ''}${m.netChange ?? 0}`,
      14 + ((pageWidth - 28) / 4) * 2,
      (pageWidth - 28) / 4,
      (m.netChange ?? 0) >= 0 ? [16, 185, 129] : [239, 68, 68]
    );
    block('Movements', String(m.count ?? 0), 14 + ((pageWidth - 28) / 4) * 3, (pageWidth - 28) / 4, [99, 102, 241]);

    y += 28;

    const movementRows = (movements || []).map((mov) => [
      mov.itemName || mov.item?.name || '-',
      MOVEMENT_LABELS[mov.type] || mov.type || '-',
      `${mov.qtyBefore}  →  ${mov.qtyAfter}`,
      `${mov.change >= 0 ? '+' : ''}${mov.change}`,
      mov.reason || '-',
      mov.createdBy || 'System',
      format(new Date(mov.createdAt), 'MMM d, h:mm a')
    ]);

    if (movementRows.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Item', 'Type', 'Qty (Before → After)', 'Change', 'Reason', 'By', 'Date']],
        body: movementRows,
        theme: 'grid',
        headStyles: { fillColor: headerColor, fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { cellPadding: 3, valign: 'middle' },
        columnStyles: {
          3: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] },
          4: { fontStyle: 'italic' }
        },
        margin: { left: 14, right: 14 }
      });
      y = doc.lastAutoTable.finalY + 12;
    }
  }

  doc.setFillColor(...headerColor);
  doc.rect(14, y - 6, pageWidth - 28, 0.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Current Stock Levels', 14, y);
  y += 4;

  const itemRows = (items || []).map((i) => [
    i.name || '-',
    i.category || 'Other',
    String(i.quantity ?? 0),
    i.unit || 'pcs',
    `ETB ${Number(i.pricePerUnit || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    `ETB ${Number((i.quantity || 0) * (i.pricePerUnit || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    (i.quantity ?? 0) <= (i.minStockLevel ?? 0) ? 'Low' : 'OK'
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Category', 'Quantity', 'Unit', 'Unit Price', 'Stock Value', 'Status']],
    body: itemRows,
    theme: 'grid',
    headStyles: { fillColor: headerColor, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { cellPadding: 3, valign: 'middle' },
    columnStyles: {
      2: { halign: 'right', fontStyle: 'bold' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold', textColor: accentColor },
      6: {
        halign: 'center',
        fontStyle: 'bold',
        textColor: [16, 185, 129],
        cellWidth: 24
      }
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const status = data.cell.raw;
        data.cell.styles.textColor = status === 'Low' ? [239, 68, 68] : [16, 185, 129];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setDrawColor(...headerColor);
  doc.setLineWidth(0.5);
  doc.line(14, finalY - 8, 14 + (pageWidth - 28), finalY - 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...headerColor);
  doc.text(`Total Items: ${items?.length || 0}`, 14, finalY);
  doc.text(
    `Total Stock Value: ETB ${Number(snap.totalValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    14 + (pageWidth - 28),
    finalY,
    { align: 'right' }
  );

  const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-inventory-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}

const EMPLOYEE_STATUS_COLORS = {
  Active: [16, 185, 129],
  'On Leave': [245, 158, 11],
  Terminated: [239, 68, 68],
  Suspended: [148, 163, 184]
};

export function exportEmployeesPdf({ title = 'Nile Employees', employees }) {
  const doc = new jsPDF({ orientation: 'landscape' });

  const headerColor = [99, 102, 241];
  const accentColor = [139, 92, 246];
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...headerColor);
  doc.rect(0, 0, pageWidth, 34, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Nile Food', 14, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 24);
  doc.setFontSize(9);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, pageWidth - 14, 15, { align: 'right' });

  let y = 42;

  const block = (label, value, x, w, color) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, w, 20, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x + 6, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...color);
    doc.text(value, x + 6, y + 16);
  };

  const active = employees.filter((e) => e.status === 'Active').length;
  const payroll = employees.reduce((s, e) => s + Number(e.monthlySalary || 0), 0);
  const labs = [
    ['Total Employees', String(employees.length), headerColor],
    ['Active', String(active), [16, 185, 129]],
    ['On Leave', String(employees.filter((e) => e.status === 'On Leave').length), [245, 158, 11]],
    ['Monthly Payroll (ETB)', Number(payroll).toLocaleString(undefined, { maximumFractionDigits: 2 }), accentColor]
  ];
  labs.forEach(([label, value, color], i) => {
    block(label, value, 14 + i * ((pageWidth - 28) / 4), (pageWidth - 28) / 4, color);
  });
  y += 28;

  doc.setFillColor(...headerColor);
  doc.rect(14, y - 6, pageWidth - 28, 0.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Employee Directory', 14, y);
  y += 4;

  const rows = employees.map((e) => [
    e.employeeCode || '-',
    e.name || '-',
    e.position || '-',
    e.department || '-',
    e.phone || '-',
    e.email || '-',
    `ETB ${Number(e.monthlySalary || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    e.hireDate ? format(new Date(e.hireDate), 'MMM d, yyyy') : '-',
    e.status || '-'
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Code', 'Name', 'Position', 'Department', 'Phone', 'Email', 'Monthly Salary', 'Hire Date', 'Status']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: headerColor, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { cellPadding: 3, valign: 'middle' },
    columnStyles: {
      6: { halign: 'right', fontStyle: 'bold', textColor: accentColor },
      8: { halign: 'center' }
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 8) {
        const status = data.cell.raw;
        data.cell.styles.textColor = EMPLOYEE_STATUS_COLORS[status] || [51, 65, 85];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setDrawColor(...headerColor);
  doc.setLineWidth(0.5);
  doc.line(14, finalY - 8, 14 + (pageWidth - 28), finalY - 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...headerColor);
  doc.text(`Total Employees: ${employees.length}`, 14, finalY);
  doc.text(
    `Total Monthly Payroll: ETB ${Number(payroll).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    14 + (pageWidth - 28),
    finalY,
    { align: 'right' }
  );

  const filename = `nile-employees-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}