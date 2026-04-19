import jsPDF from 'jspdf';
import { formatPdfCurrency, formatPdfDate } from '@/lib/pdfFormatters';

interface VehicleTransaction {
  brand: string;
  model: string;
  year: number;
  vin: string;
  sellingPrice?: number | null;
  amountPaid?: number | null;
  paymentStatus?: string | null;
}

interface ClientInfo {
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  company?: string;
}

interface SaleInfo {
  saleDate: string | Date;
  totalSellingPrice: number;
  amountPaid: number;
  debt: number;
  carriedDebt: number;
}

interface SaleGroup {
  date: string | Date;
  totalSellingPrice: number;
  amountPaid: number;
  debt: number;
  carriedDebt: number;
  vehicles: VehicleTransaction[];
}

export function exportClientTransactionsPDF(
  client: ClientInfo,
  vehicles: VehicleTransaction[],
  saleInfo?: SaleInfo,
  sales?: SaleGroup[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(saleInfo ? 'Facture de Vente' : 'Relevé des Transactions', pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Client info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Client: ${client.nom} ${client.prenom}`, 14, y);
  y += 7;
  doc.text(`Téléphone: ${client.telephone}`, 14, y);
  y += 7;
  if (client.company) {
    doc.text(`Société: ${client.company}`, 14, y);
    y += 7;
  }
  if (saleInfo) {
    doc.text(`Date de vente: ${formatPdfDate(saleInfo.saleDate)}`, 14, y);
    y += 7;
  }
  doc.text(`Date d'édition: ${formatPdfDate(new Date())}`, 14, y);
  y += 12;

  if (saleInfo) {
    // --- Single sale PDF ---
    // Vehicles table
    const cols = [14, 120];
    const colLabels = ['Véhicule', 'Prix de vente'];

    doc.setFillColor(41, 41, 41);
    doc.rect(12, y - 5, pageWidth - 24, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    colLabels.forEach((label, i) => doc.text(label, cols[i], y));
    doc.setTextColor(0, 0, 0);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    vehicles.forEach((v) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const sp = Number(v.sellingPrice || 0);
      const name = `${v.brand} ${v.model} (${v.year}) — ${v.vin}`;
      doc.text(name.substring(0, 60), cols[0], y);
      doc.text(formatPdfCurrency(sp, 'DZD'), cols[1], y);
      y += 7;
    });

    // Separator
    y += 3;
    doc.setDrawColor(100);
    doc.line(12, y, pageWidth - 12, y);
    y += 10;

    // Summary box
    doc.setFillColor(245, 245, 245);
    const boxH = saleInfo.carriedDebt > 0 ? 46 : 38;
    doc.roundedRect(12, y - 5, pageWidth - 24, boxH, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Récapitulatif', 18, y + 2);
    doc.setFont('helvetica', 'normal');
    y += 10;
    doc.text(`Total vente: ${formatPdfCurrency(saleInfo.totalSellingPrice, 'DZD')}`, 18, y);
    y += 8;
    if (saleInfo.carriedDebt > 0) {
      doc.text(`Dette reportée: ${formatPdfCurrency(saleInfo.carriedDebt, 'DZD')}`, 18, y);
      y += 8;
    }
    doc.text(`Montant payé: ${formatPdfCurrency(saleInfo.amountPaid, 'DZD')}`, 18, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(`Reste à payer: ${formatPdfCurrency(saleInfo.debt, 'DZD')}`, 18, y);

    doc.save(`vente-${client.nom}-${client.prenom}-${formatPdfDate(saleInfo.saleDate).replace(/\//g, '-')}.pdf`);
  } else if (sales && sales.length > 0) {
    // --- Grouped-by-sale PDF ---
    let totalInvoiced = 0;
    let totalPaidAll = 0;
    let totalRemainingAll = 0;

    sales.forEach((sale) => {
      const vehiclesCount = sale.vehicles.length;
      const blockHeight = 14 /* header */ + vehiclesCount * 6 + 14 /* footer */ + 6;
      if (y + blockHeight > 285) { doc.addPage(); y = 20; }

      // Sale header
      doc.setFillColor(41, 41, 41);
      doc.rect(12, y - 5, pageWidth - 24, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`Vente du ${formatPdfDate(sale.date)}`, 14, y);
      doc.text(`Total: ${formatPdfCurrency(sale.totalSellingPrice, 'DZD')}`, pageWidth - 14, y, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      y += 10;

      // Vehicle rows
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Désignation', 18, y);
      doc.text('VIN', 95, y);
      doc.text('Prix de vente', pageWidth - 14, y, { align: 'right' });
      y += 5;
      doc.setFont('helvetica', 'normal');

      sale.vehicles.forEach((v) => {
        if (y > 275) { doc.addPage(); y = 20; }
        const sp = Number(v.sellingPrice || 0);
        const name = `${v.brand} ${v.model} (${v.year})`;
        doc.text(name.substring(0, 40), 18, y);
        doc.text((v.vin || '').substring(0, 22), 95, y);
        doc.text(formatPdfCurrency(sp, 'DZD'), pageWidth - 14, y, { align: 'right' });
        y += 6;
      });

      // Sale footer
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setDrawColor(180);
      doc.line(14, y, pageWidth - 14, y);
      y += 6;

      const status = sale.debt <= 0 ? 'Soldé' : sale.amountPaid > 0 ? 'Versement' : 'En attente';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(
        `Total vente: ${formatPdfCurrency(sale.totalSellingPrice, 'DZD')}   |   Payé: ${formatPdfCurrency(sale.amountPaid, 'DZD')}   |   Reste: ${formatPdfCurrency(sale.debt, 'DZD')}   |   ${status}`,
        14,
        y
      );
      doc.setFont('helvetica', 'normal');
      y += 10;

      totalInvoiced += sale.totalSellingPrice;
      totalPaidAll += sale.amountPaid;
      totalRemainingAll += sale.debt;
    });

    // Global summary
    if (y + 40 > 285) { doc.addPage(); y = 20; }
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(12, y - 5, pageWidth - 24, 38, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Récapitulatif global', 18, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Nombre de ventes: ${sales.length}`, 18, y + 10);
    doc.text(`Total facturé: ${formatPdfCurrency(totalInvoiced, 'DZD')}`, 18, y + 18);
    doc.text(`Total payé: ${formatPdfCurrency(totalPaidAll, 'DZD')}`, 18, y + 26);
    doc.setFont('helvetica', 'bold');
    doc.text(`Reste à payer: ${formatPdfCurrency(totalRemainingAll, 'DZD')}`, pageWidth - 18, y + 26, { align: 'right' });

    doc.save(`transactions-${client.nom}-${client.prenom}-${new Date().toISOString().split('T')[0]}.pdf`);
  } else {
    // --- All transactions PDF (legacy fallback) ---
    const cols = [14, 70, 105, 140, 170];
    const colLabels = ['Véhicule', 'Prix vente', 'Payé', 'Reste', 'Statut'];

    doc.setFillColor(41, 41, 41);
    doc.rect(12, y - 5, pageWidth - 24, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    colLabels.forEach((label, i) => doc.text(label, cols[i], y));
    doc.setTextColor(0, 0, 0);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    let totalSelling = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    vehicles.forEach((v) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const sp = Number(v.sellingPrice || 0);
      const ap = Number(v.amountPaid || 0);
      const remaining = Math.max(0, sp - ap);
      totalSelling += sp;
      totalPaid += ap;
      totalRemaining += remaining;
      const name = `${v.brand} ${v.model} (${v.year})`;
      const status = v.paymentStatus === 'solde' ? 'Soldé' : v.paymentStatus === 'versement' ? 'Versement' : 'En attente';
      doc.text(name.substring(0, 30), cols[0], y);
      doc.text(formatPdfCurrency(sp, 'DZD'), cols[1], y);
      doc.text(formatPdfCurrency(ap, 'DZD'), cols[2], y);
      doc.text(formatPdfCurrency(remaining, 'DZD'), cols[3], y);
      doc.text(status, cols[4], y);
      y += 7;
    });

    y += 3;
    doc.setDrawColor(100);
    doc.line(12, y, pageWidth - 12, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAUX', cols[0], y);
    doc.text(formatPdfCurrency(totalSelling, 'DZD'), cols[1], y);
    doc.text(formatPdfCurrency(totalPaid, 'DZD'), cols[2], y);
    doc.text(formatPdfCurrency(totalRemaining, 'DZD'), cols[3], y);

    doc.save(`transactions-${client.nom}-${client.prenom}-${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
