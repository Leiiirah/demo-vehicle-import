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
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Landmark, Search, Loader2, TrendingUp, TrendingDown, Car, Users, ArrowUpCircle, ArrowDownCircle, Building2, Trash2, AlertTriangle,
} from 'lucide-react';
import { useCaisseEntries, useCaisseSummary } from '@/hooks/useCaisse';
import { useDeleteBanqueEntry, usePurgeBanque } from '@/hooks/useBanque';
import { BanqueBalanceCard } from '@/components/banque/BanqueBalanceCard';
import { AddBanqueEntryDialog } from '@/components/banque/AddBanqueEntryDialog';
import { toast } from '@/components/ui/sonner';

const BanquePage = () => {
  const { data: entries = [], isLoading } = useCaisseEntries();
  const { data: summary } = useCaisseSummary();
  const [searchTerm, setSearchTerm] = useState('');
  const deleteMutation = useDeleteBanqueEntry();
  const purgeMutation = usePurgeBanque();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Transaction supprimée'),
      onError: () => toast.error('Erreur lors de la suppression'),
    });
  };

  const handlePurge = () => {
    purgeMutation.mutate(undefined, {
      onSuccess: (data: any) => toast.success(`${data.deleted} mouvement(s) bancaire(s) supprimé(s)`),
      onError: (err: any) => toast.error(err.message || 'Erreur lors de la purge'),
    });
  };

  // Bank entries: client virements (inflows) + supplier/dossier payments (outflows)
  const banqueEntries = useMemo(() => {
    const filtered = (entries as any[]).filter(
      (e) => e.paymentMethod === 'virement' || e._source === 'dossier_payment'
    );
    // Sort newest first
    return filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) return banqueEntries;
    const term = searchTerm.toLowerCase();
    return banqueEntries.filter((e: any) =>
      (e.description || '').toLowerCase().includes(term) ||
      (e.reference || '').toLowerCase().includes(term) ||
      (e.client && `${e.client.nom} ${e.client.prenom}`.toLowerCase().includes(term)) ||
      (e.supplier && (e.supplier.name || '').toLowerCase().includes(term)) ||
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Banque</h1>
            <p className="text-muted-foreground">
              Suivi des virements clients et paiements fournisseurs
            </p>
          </div>
          <div className="flex gap-2">
            <AddBanqueEntryDialog />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Purger la banque
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Purger tous les mouvements bancaires ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera définitivement tous les mouvements de la banque (virements clients et entrées manuelles) et remettra le solde bancaire à zéro. Les paiements fournisseurs déjà enregistrés ne seront pas affectés. Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePurge} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Purger tout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* KPIs + Solde Banque on the same row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BanqueBalanceCard />
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

          <Card className="border-success/30 bg-success/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Flux net (historique)</CardTitle>
              <Landmark className="h-4 w-4 text-success" />
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
                      <TableHead>Client</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
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
                              <Badge className="bg-destructive/15 text-destructive border-destructive/20 gap-1">
                                <ArrowDownCircle className="h-3 w-3" />Sortie
                              </Badge>
                            ) : (
                              <Badge className="bg-success/15 text-success border-success/20 gap-1">
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
                          <TableCell>
                            {entry.supplier ? (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{entry.supplier.name}</span>
                              </div>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={isOutflow ? 'text-destructive' : 'text-success'}>
                              {isOutflow ? '-' : '+'}{formatCurrency(Number(entry.montant))}
                            </span>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer cette transaction ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. La transaction sera supprimée définitivement de la base de données.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
