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
  Landmark, Search, Loader2, TrendingUp, Car, Users,
} from 'lucide-react';
import { useCaisseEntries, useCaisseSummary } from '@/hooks/useCaisse';

const BanquePage = () => {
  const { data: entries = [], isLoading } = useCaisseEntries();
  const { data: summary } = useCaisseSummary();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only virement entries
  const virementEntries = useMemo(() => {
    return (entries as any[]).filter((e) => e.paymentMethod === 'virement');
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return virementEntries;
    const term = searchTerm.toLowerCase();
    return virementEntries.filter((e: any) =>
      (e.description || '').toLowerCase().includes(term) ||
      (e.reference || '').toLowerCase().includes(term) ||
      (e.client && `${e.client.nom} ${e.client.prenom}`.toLowerCase().includes(term)) ||
      (e.vehicle && `${e.vehicle.brand} ${e.vehicle.model}`.toLowerCase().includes(term))
    );
  }, [virementEntries, searchTerm]);

  const totalVirements = virementEntries.reduce((sum: number, e: any) => sum + Number(e.montant || 0), 0);
  const totalEntries = virementEntries.length;

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
            Suivi des virements bancaires clients
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total virements</CardTitle>
              <Landmark className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalVirements)}</div>
              <p className="text-xs text-muted-foreground mt-1">{totalEntries} opération(s)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Solde Caisse (hors virements)</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(summary?.soldeActuel || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Espèces uniquement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total encaissé (global)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency((summary?.soldeActuel || 0) + totalVirements)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Caisse + Banque</p>
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
            <CardTitle>Historique des virements</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Landmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucun virement enregistré</p>
                <p className="text-sm">Les virements apparaîtront ici lors de l'enregistrement d'un paiement client par virement.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Véhicule</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((entry: any) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm">
                          {format(new Date(entry.date), 'dd/MM/yyyy')}
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
                        <TableCell>
                          {entry.vehicle ? (
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{entry.vehicle.brand} {entry.vehicle.model}</span>
                            </div>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {formatCurrency(Number(entry.montant))}
                        </TableCell>
                      </TableRow>
                    ))}
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
