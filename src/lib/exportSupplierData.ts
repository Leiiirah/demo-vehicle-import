import jsPDF from 'jspdf';
import type { Payment, Vehicle } from '@/services/api';
import { formatCurrency } from '@/lib/utils';

interface DossierWithConteneurs {
  id: string;
  reference: string;
  dateCreation: string;
  status: string;
  conteneurs?: { id: string; numero: string; vehicles?: Vehicle[] }[];
}

const statusLabels: Record<string, string> = { en_cours: 'En cours', termine: 'Terminé', annule: 'Annulé' };
const vStatusLabels: Record<string, string> = { ordered: 'En stock', in_transit: 'En transit', arrived: 'Arrivé', sold: 'Vendu' };
const typeLabels: Record<string, string> = { supplier_payment: 'Paiement fournisseur', client_payment: 'Paiement client', transport: 'Transport', fees: 'Frais' };

function addHeader(doc: jsPDF, title: string, supplierName: string) {
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fournisseur: ${supplierName}`, 14, 28);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 35);
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

export function exportSupplierDossiers(supplierName: string, dossiers: DossierWithConteneurs[], vehicles: Vehicle[]) {
  const doc = new jsPDF();
  let y = addHeader(doc, 'Rapport Dossiers', supplierName);

  if (dossiers.length === 0) {
    doc.text('Aucun dossier pour ce fournisseur.', 14, y);
    doc.save(`${supplierName}_dossiers.pdf`);
    return;
  }

  for (const dossier of dossiers) {
    y = checkPage(doc, y, 30);

    // Dossier header
    doc.setFillColor(240, 240, 245);
    doc.rect(14, y - 5, 182, 10, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${dossier.reference}`, 16, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}  |  ${statusLabels[dossier.status] || dossier.status}`, 100, y + 2);
    y += 12;

    const conteneurs = dossier.conteneurs || [];
    if (conteneurs.length === 0) {
      doc.setFontSize(9);
      doc.text('Aucun conteneur', 18, y);
      y += 8;
      continue;
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

      // Table header
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(230, 230, 235);
      doc.rect(18, y - 3.5, 174, 6, 'F');
      const cols = [18, 55, 85, 105, 125, 150, 170];
      const headers = ['Véhicule', 'VIN', 'Statut', 'Achat ($)', 'Transport', 'Coût Total', 'Vente DZD'];
      headers.forEach((h, i) => doc.text(h, cols[i], y));
      y += 6;

      doc.setFont('helvetica', 'normal');
      for (const v of contVehicles) {
        y = checkPage(doc, y, 8);
        doc.text(`${v.brand} ${v.model} ${v.year}`, cols[0], y);
        doc.text(v.vin?.slice(-8) || '', cols[1], y);
        doc.text(vStatusLabels[v.status] || v.status, cols[2], y);
        doc.text(String(v.purchasePrice || 0), cols[3], y);
        doc.text(String(v.transportCost || 0), cols[4], y);
        doc.text(String(v.totalCost || 0), cols[5], y);
        doc.text(v.sellingPrice ? String(v.sellingPrice) : '-', cols[6], y);
        y += 5;
      }
      y += 4;
    }
    y += 4;
  }

  doc.save(`${supplierName}_dossiers.pdf`);
}

export function exportSupplierTransactions(supplierName: string, payments: Payment[], supplier: { totalPaid?: number; remainingDebt?: number; creditBalance?: number }) {
  const doc = new jsPDF();
  let y = addHeader(doc, 'Rapport Transactions', supplierName);

  // Summary box
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(14, y, 182, 28, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Résumé Financier', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Total Payé: ${formatCurrency(supplier.totalPaid || 0, 'USD')}`, 20, y + 14);
  doc.text(`Dette Restante: ${formatCurrency(supplier.remainingDebt || 0, 'USD')}`, 85, y + 14);
  doc.text(`Solde Crédit: ${formatCurrency(supplier.creditBalance || 0, 'USD')}`, 150, y + 14);
  doc.text(`Nombre de transactions: ${payments.length}`, 20, y + 21);
  y += 36;

  if (payments.length === 0) {
    doc.text('Aucune transaction pour ce fournisseur.', 14, y);
    doc.save(`${supplierName}_transactions.pdf`);
    return;
  }

  // Table header
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
      // Re-draw header on new page
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(230, 230, 235);
      doc.rect(14, y - 3.5, 182, 6, 'F');
      headers.forEach((h, i) => doc.text(h, cols[i], y));
      y += 6;
      doc.setFont('helvetica', 'normal');
    }
    doc.text(new Date(p.date).toLocaleDateString('fr-FR'), cols[0], y);
    doc.text(p.reference?.slice(0, 15) || '', cols[1], y);
    doc.text(typeLabels[p.type] || p.type, cols[2], y);
    doc.text(String(p.amount), cols[3], y);
    doc.text(p.currency, cols[4], y);
    doc.text(String(p.exchangeRate), cols[5], y);
    doc.text(p.status === 'completed' ? 'Complété' : 'En attente', cols[6], y);
    y += 5;
  }

  doc.save(`${supplierName}_transactions.pdf`);
}
