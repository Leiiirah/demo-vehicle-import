import type { Payment, Vehicle } from '@/services/api';
import { formatCurrency } from '@/lib/utils';

function downloadCSV(filename: string, rows: string[][]) {
  const bom = '\uFEFF';
  const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface DossierWithConteneurs {
  id: string;
  reference: string;
  dateCreation: string;
  status: string;
  conteneurs?: { id: string; numero: string; vehicles?: Vehicle[] }[];
}

export function exportSupplierDossiers(supplierName: string, dossiers: DossierWithConteneurs[], vehicles: Vehicle[]) {
  const header = [
    'Dossier Réf', 'Date Création', 'Statut', 'Conteneur',
    'Marque', 'Modèle', 'Année', 'VIN', 'Statut Véhicule',
    'Prix Achat ($)', 'Transport ($)', 'Frais Locaux ($)', 'Coût Total ($)', 'Prix Vente (DZD)',
  ];

  const rows: string[][] = [header];

  for (const dossier of dossiers) {
    const statusLabel: Record<string, string> = { en_cours: 'En cours', termine: 'Terminé', annule: 'Annulé' };
    const conteneurs = dossier.conteneurs || [];

    if (conteneurs.length === 0) {
      rows.push([dossier.reference, new Date(dossier.dateCreation).toLocaleDateString('fr-FR'), statusLabel[dossier.status] || dossier.status, '', '', '', '', '', '', '', '', '', '', '']);
      continue;
    }

    for (const cont of conteneurs) {
      const contVehicles = (cont.vehicles || []).length > 0
        ? cont.vehicles!
        : vehicles.filter(v => v.conteneurId === cont.id);

      if (contVehicles.length === 0) {
        rows.push([dossier.reference, new Date(dossier.dateCreation).toLocaleDateString('fr-FR'), statusLabel[dossier.status] || dossier.status, cont.numero, '', '', '', '', '', '', '', '', '', '']);
        continue;
      }

      for (const v of contVehicles) {
        const vStatus: Record<string, string> = { ordered: 'En stock', in_transit: 'En transit', arrived: 'Arrivé', sold: 'Vendu' };
        rows.push([
          dossier.reference,
          new Date(dossier.dateCreation).toLocaleDateString('fr-FR'),
          statusLabel[dossier.status] || dossier.status,
          cont.numero,
          v.brand, v.model, String(v.year), v.vin,
          vStatus[v.status] || v.status,
          String(v.purchasePrice || 0),
          String(v.transportCost || 0),
          String(v.localFees || 0),
          String(v.totalCost || 0),
          String(v.sellingPrice || ''),
        ]);
      }
    }
  }

  downloadCSV(`${supplierName}_dossiers.csv`, rows);
}

export function exportSupplierTransactions(supplierName: string, payments: Payment[], supplier: { totalPaid?: number; remainingDebt?: number; creditBalance?: number }) {
  const header = ['Date', 'Référence', 'Type', 'Montant', 'Devise', 'Taux Change', 'Équivalent USD', 'Statut'];
  const rows: string[][] = [header];

  const typeLabels: Record<string, string> = {
    supplier_payment: 'Paiement fournisseur',
    client_payment: 'Paiement client',
    transport: 'Transport',
    fees: 'Frais',
  };

  for (const p of payments) {
    const eqUsd = p.currency === 'DZD' ? (Number(p.amount) / Number(p.exchangeRate)).toFixed(2) : String(p.amount);
    rows.push([
      new Date(p.date).toLocaleDateString('fr-FR'),
      p.reference,
      typeLabels[p.type] || p.type,
      String(p.amount),
      p.currency,
      String(p.exchangeRate),
      eqUsd,
      p.status === 'completed' ? 'Complété' : 'En attente',
    ]);
  }

  // Summary rows
  rows.push([]);
  rows.push(['RÉSUMÉ']);
  rows.push(['Total Payé', formatCurrency(supplier.totalPaid || 0, 'USD')]);
  rows.push(['Dette Restante', formatCurrency(supplier.remainingDebt || 0, 'USD')]);
  rows.push(['Solde Crédit', formatCurrency(supplier.creditBalance || 0, 'USD')]);

  downloadCSV(`${supplierName}_transactions.csv`, rows);
}
