import jsPDF from 'jspdf';
import type { Payment, Vehicle } from '@/services/api';
import { formatPdfCurrency, formatPdfDate, formatPdfNumber } from '@/lib/pdfFormatters';

interface DossierWithConteneurs {
  id: string;
  reference: string;
  dateCreation: string;
  status: string;
  conteneurs?: { id: string; numero: string; vehicles?: Vehicle[] }[];
}

const statusLabels: Record<string, string> = { en_cours: 'En cours', solde: 'Soldé', annule: 'Annulé' };
const typeLabels: Record<string, string> = { supplier_payment: 'Paiement fournisseur', client_payment: 'Paiement client', transport: 'Transport', fees: 'Frais' };

function addHeader(doc: jsPDF, title: string, supplierName: string) {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fournisseur: ${supplierName}`, 14, 28);
  doc.text(`Date: ${formatPdfDate(new Date())}`, 14, 35);
  doc.setDrawColor(200);
  doc.line(14, 38, 196, 38);
  return 44;
}

function checkPage(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 280) {
    doc.addPage();
    return 20;
  }
  return y;
}

function getDossierTotal(dossier: DossierWithConteneurs, vehicles: Vehicle[]): number {
  let total = 0;
  const conteneurs = dossier.conteneurs || [];
  for (const cont of conteneurs) {
    const contVehicles = (cont.vehicles || []).length > 0
      ? cont.vehicles!
      : vehicles.filter(v => v.conteneurId === cont.id);
    for (const v of contVehicles) {
      total += Number(v.purchasePrice || 0) + Number(v.transportCost || 0);
    }
  }
  return total;
}

function addDossierVehiclesTable(doc: jsPDF, y: number, dossier: DossierWithConteneurs, vehicles: Vehicle[]): { y: number; dossierTotal: number } {
  let dossierTotal = 0;
  const conteneurs = dossier.conteneurs || [];

  if (conteneurs.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Aucun conteneur', 18, y);
    return { y: y + 8, dossierTotal: 0 };
  }

  for (const cont of conteneurs) {
    y = checkPage(doc, y, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Conteneur: ${cont.numero}`, 18, y);
    y += 6;

    const contVehicles = (cont.vehicles || []).length > 0
      ? cont.vehicles!
      : vehicles.filter(v => v.conteneurId === cont.id);

    if (contVehicles.length === 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Aucun véhicule', 22, y);
      y += 7;
      continue;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(230, 230, 235);
    doc.rect(18, y - 3.5, 174, 6, 'F');
    const cols = [18, 60, 100, 130, 160];
    const headers = ['Véhicule', 'VIN', 'Achat ($)', 'Transport ($)', 'Coût Total ($)'];
    headers.forEach((h, i) => doc.text(h, cols[i], y));
    y += 6;

    doc.setFont('helvetica', 'normal');
    for (const v of contVehicles) {
      y = checkPage(doc, y, 8);
      doc.text(`${v.brand} ${v.model} ${v.year}`, cols[0], y);
      doc.text(v.vin?.slice(-8) || '', cols[1], y);
      const coutTotalUSD = Number(v.purchasePrice || 0) + Number(v.transportCost || 0);
      doc.text(formatPdfNumber(Number(v.purchasePrice || 0), { minimumFractionDigits: 2, maximumFractionDigits: 2 }), cols[2], y);
      doc.text(formatPdfNumber(Number(v.transportCost || 0), { minimumFractionDigits: 2, maximumFractionDigits: 2 }), cols[3], y);
      doc.text(formatPdfNumber(coutTotalUSD, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), cols[4], y);
      dossierTotal += coutTotalUSD;
      y += 5;
    }
    y += 4;
  }

  return { y, dossierTotal };
}

function addDossiersSection(doc: jsPDF, y: number, dossiers: DossierWithConteneurs[], vehicles: Vehicle[]): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dossiers', 14, y);
  y += 8;

  if (dossiers.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Aucun dossier pour ce fournisseur.', 14, y);
    return y + 10;
  }

  let grandTotal = 0;

  for (const dossier of dossiers) {
    const dossierCostTotal = getDossierTotal(dossier, vehicles);
    
    y = checkPage(doc, y, 30);
    doc.setFillColor(240, 240, 245);
    doc.rect(14, y - 5, 182, 10, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${dossier.reference}`, 16, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${formatPdfDate(dossier.dateCreation)}  |  ${statusLabels[dossier.status] || dossier.status}`, 80, y + 2);
    // Dossier total on same line
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${formatPdfCurrency(dossierCostTotal, 'USD')}`, 155, y + 2);
    doc.setFont('helvetica', 'normal');
    y += 12;

    const result = addDossierVehiclesTable(doc, y, dossier, vehicles);
    y = result.y;
    grandTotal += result.dossierTotal;
    y += 4;
  }

  // Grand total for all dossiers
  y = checkPage(doc, y, 15);
  doc.setFillColor(220, 220, 230);
  doc.rect(14, y - 4, 182, 10, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Général Dossiers: ${formatPdfCurrency(grandTotal, 'USD')}`, 16, y + 3);
  y += 14;

  return y;
}

function addTransactionsSection(doc: jsPDF, y: number, payments: Payment[], supplier: { totalPaid?: number; remainingDebt?: number; creditBalance?: number }): number {
  doc.addPage();
  y = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Transactions', 14, y);
  y += 10;

  doc.setFillColor(245, 245, 250);
  doc.roundedRect(14, y, 182, 28, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Résumé Financier', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Total Payé: ${formatPdfCurrency(supplier.totalPaid || 0, 'USD')}`, 20, y + 14);
  doc.text(`Dette Restante: ${formatPdfCurrency(supplier.remainingDebt || 0, 'USD')}`, 85, y + 14);
  doc.text(`Solde Crédit: ${formatPdfCurrency(supplier.creditBalance || 0, 'USD')}`, 150, y + 14);
  doc.text(`Nombre de transactions: ${payments.length}`, 20, y + 21);
  y += 36;

  if (payments.length === 0) {
    doc.text('Aucune transaction pour ce fournisseur.', 14, y);
    return y + 10;
  }

  const cols = [14, 40, 75, 110, 135, 155, 175];
  const headers = ['Date', 'Référence', 'Type', 'Montant', 'Devise', 'Taux', 'Statut'];
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(230, 230, 235);
  doc.rect(14, y - 3.5, 182, 6, 'F');
  headers.forEach((h, i) => doc.text(h, cols[i], y));
  y += 6;

  doc.setFont('helvetica', 'normal');
  for (const p of payments) {
    y = checkPage(doc, y, 8);
    if (y === 20) {
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(230, 230, 235);
      doc.rect(14, y - 3.5, 182, 6, 'F');
      headers.forEach((h, i) => doc.text(h, cols[i], y));
      y += 6;
      doc.setFont('helvetica', 'normal');
    }
    doc.text(formatPdfDate(p.date), cols[0], y);
    doc.text(p.reference?.slice(0, 15) || '', cols[1], y);
    doc.text(typeLabels[p.type] || p.type, cols[2], y);
    doc.text(formatPdfNumber(Number(p.amount || 0), { minimumFractionDigits: 0, maximumFractionDigits: 2 }), cols[3], y);
    doc.text(p.currency, cols[4], y);
    doc.text(formatPdfNumber(Number(p.exchangeRate || 0), { minimumFractionDigits: 2, maximumFractionDigits: 2 }), cols[5], y);
    doc.text(p.status === 'completed' ? 'Complété' : 'En attente', cols[6], y);
    y += 5;
  }

  return y;
}

export function exportSupplierFullReport(
  supplierName: string,
  dossiers: DossierWithConteneurs[],
  vehicles: Vehicle[],
  payments: Payment[],
  supplier: { totalPaid?: number; remainingDebt?: number; creditBalance?: number }
) {
  const doc = new jsPDF();
  let y = addHeader(doc, 'Rapport Complet', supplierName);

  y = addDossiersSection(doc, y, dossiers, vehicles);
  addTransactionsSection(doc, y, payments, supplier);

  doc.save(`${supplierName}_rapport.pdf`);
}

/**
 * Export a single dossier PDF for a supplier
 */
export function exportSupplierDossierReport(
  supplierName: string,
  dossier: DossierWithConteneurs,
  vehicles: Vehicle[],
  payments: Payment[] = [],
) {
  const doc = new jsPDF();
  let y = addHeader(doc, `Dossier ${dossier.reference}`, supplierName);

  const dossierCostTotal = getDossierTotal(dossier, vehicles);
  const dossierPayments = payments.filter(p => p.dossierId === dossier.id);
  const totalVersements = dossierPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const reste = dossierCostTotal - totalVersements;

  // Dossier header
  doc.setFillColor(240, 240, 245);
  doc.rect(14, y - 5, 182, 10, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dossier.reference}`, 16, y + 2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${formatPdfDate(dossier.dateCreation)}  |  ${statusLabels[dossier.status] || dossier.status}`, 80, y + 2);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${formatPdfCurrency(dossierCostTotal, 'USD')}`, 155, y + 2);
  doc.setFont('helvetica', 'normal');
  y += 12;

  const result = addDossierVehiclesTable(doc, y, dossier, vehicles);
  y = result.y + 6;

  // Payment summary section
  y = checkPage(doc, y, 40);
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(14, y, 182, 24, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Résumé des versements', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Total dû: ${formatPdfCurrency(dossierCostTotal, 'USD')}`, 20, y + 14);
  doc.text(`Versements effectués: ${formatPdfCurrency(totalVersements, 'USD')}`, 85, y + 14);
  if (reste > 0) {
    doc.setTextColor(200, 0, 0);
    doc.text(`Reste à payer: ${formatPdfCurrency(reste, 'USD')}`, 20, y + 21);
    doc.setTextColor(0, 0, 0);
  } else if (reste < 0) {
    doc.setTextColor(0, 150, 0);
    doc.text(`Crédit: +${formatPdfCurrency(Math.abs(reste), 'USD')}`, 20, y + 21);
    doc.setTextColor(0, 0, 0);
  } else {
    doc.setTextColor(0, 150, 0);
    doc.text(`Soldé`, 20, y + 21);
    doc.setTextColor(0, 0, 0);
  }
  doc.text(`Nombre de versements: ${dossierPayments.length}`, 85, y + 21);
  y += 30;

  // Payment details table
  if (dossierPayments.length > 0) {
    y = checkPage(doc, y, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des versements', 14, y);
    y += 6;

    const cols = [14, 40, 80, 115, 145, 170];
    const headers = ['Date', 'Référence', 'Montant ($)', 'Taux', 'Équiv. DZD', 'Statut'];
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(230, 230, 235);
    doc.rect(14, y - 3.5, 182, 6, 'F');
    headers.forEach((h, i) => doc.text(h, cols[i], y));
    y += 6;

    doc.setFont('helvetica', 'normal');
    for (const p of dossierPayments) {
      y = checkPage(doc, y, 8);
      doc.text(formatPdfDate(p.date), cols[0], y);
      doc.text(p.reference?.slice(0, 18) || '', cols[1], y);
      doc.text(formatPdfNumber(Number(p.amount || 0), { minimumFractionDigits: 0, maximumFractionDigits: 2 }), cols[2], y);
      doc.text(formatPdfNumber(Number(p.exchangeRate || 0), { minimumFractionDigits: 2, maximumFractionDigits: 2 }), cols[3], y);
      const dzd = Number(p.amount) * Number(p.exchangeRate);
      doc.text(formatPdfNumber(dzd), cols[4], y);
      doc.text(p.status === 'completed' ? 'Complété' : 'En attente', cols[5], y);
      y += 5;
    }
    y += 6;
  }

  // Total line
  y = checkPage(doc, y, 12);
  doc.setFillColor(220, 220, 230);
  doc.rect(14, y - 4, 182, 10, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Dossier: ${formatPdfCurrency(result.dossierTotal, 'USD')}`, 16, y + 3);
  doc.text(`Versé: ${formatPdfCurrency(totalVersements, 'USD')}  |  Reste: ${formatPdfCurrency(Math.max(reste, 0), 'USD')}`, 100, y + 3);

  doc.save(`${supplierName}_${dossier.reference}.pdf`);
}
