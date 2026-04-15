import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { formatCurrency } from '@/lib/utils';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Landmark, Search, Loader2, TrendingUp, TrendingDown, Car, Users, ArrowUpCircle, ArrowDownCircle,
} from 'lucide-react';
import { useCaisseEntries, useCaisseSummary } from '@/hooks/useCaisse';

const BanquePage = () => {
  const { data: entries = [], isLoading } = useCaisseEntries();
  const { data: summary } = useCaisseSummary();
  const [searchTerm, setSearchTerm] = useState('');

  // Bank entries: client virements (inflows) + supplier/dossier payments (outflows)
  const banqueEntries = useMemo(() => {
    return (entries as any[]).filter(
      (e) => e.paymentMethod === 'virement' || e._source === 'dossier_payment'
    );
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return banqueEntries;
    const term = searchTerm.toLowerCase();
    return banqueEntries.filter((e: any) =>
      (e.description || '').toLowerCase().includes(term) ||
      (e.reference || '').toLowerCase().includes(term) ||
      (e.client && `${e.client.nom} ${e.client.prenom}`.toLowerCase().includes(term)) ||
      (e.vehicle && `${e.vehicle.brand} ${e.vehicle.model}`.toLowerCase().includes(term))
    );
  }, [banqueEntries, searchTerm]);

  const totalVirements = summary?.totalVirements || 0;
  const totalSupplierPayments = summary?.totalSupplierPayments || 0;
  const soldeBanque = totalVirements - totalSupplierPayments;

  const {
    paginatedItems, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage,
  } = usePagination(filteredEntries);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Banque</h1>
          <p className="text-muted-foreground">
            Suivi des virements clients et paiements fournisseurs
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entrées (virements clients)</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalVirements)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sorties (paiements fournisseurs)</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalSupplierPayments)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Solde Banque</CardTitle>
              <Landmark className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${soldeBanque >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(soldeBanque)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Virements - Paiements fournisseurs</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par description, client ou véhicule..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historique bancaire</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucune opération bancaire</p>
                <p className="text-sm">Les virements clients et paiements fournisseurs apparaîtront ici.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Client / Fournisseur</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((entry: any) => {
                      const isOutflow = entry._source === 'dossier_payment';
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm whitespace-nowrap">
                            {format(new Date(entry.date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            {isOutflow ? (
                              <Badge className="bg-red-500/15 text-red-700 border-red-200 gap-1">
                                <ArrowDownCircle className="h-3 w-3" />Sortie
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200 gap-1">
                                <ArrowUpCircle className="h-3 w-3" />Entrée
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {entry.description || '—'}
                          </TableCell>
                          <TableCell>
                            {entry.client ? (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{entry.client.nom} {entry.client.prenom}</span>
                              </div>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={isOutflow ? 'text-red-600' : 'text-emerald-600'}>
                              {isOutflow ? '-' : '+'}{formatCurrency(Number(entry.montant))}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  onPageChange={goToPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BanquePage;
