import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle,
  Search, Loader2, Trash2, Car,
} from 'lucide-react';
import { useCaisseEntries, useCaisseSummary, useDeleteCaisseEntry } from '@/hooks/useCaisse';
import { AddCaisseEntryDialog } from '@/components/caisse/AddCaisseEntryDialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CaissePage = () => {
  const navigate = useNavigate();
  const { data: entries = [], isLoading } = useCaisseEntries();
  const { data: summary } = useCaisseSummary();
  const deleteMutation = useDeleteCaisseEntry();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredEntries = useMemo(() => {
    return (entries as any[]).filter((e) => {
      const term = searchTerm.toLowerCase();
      const searchMatch =
        !term ||
        (e.description || '').toLowerCase().includes(term) ||
        (e.reference || '').toLowerCase().includes(term) ||
        (e.vehicle && `${e.vehicle.brand} ${e.vehicle.model}`.toLowerCase().includes(term)) ||
        (e.client && `${e.client.nom} ${e.client.prenom}`.toLowerCase().includes(term));
      const typeMatch = typeFilter === 'all' || e.type === typeFilter;
      return searchMatch && typeMatch;
    });
  }, [entries, searchTerm, typeFilter]);

  const {
    paginatedItems, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage,
  } = usePagination(filteredEntries);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-DZ', { style: 'decimal', minimumFractionDigits: 0 }).format(amount) + ' DZD';

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'entree':
        return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200 gap-1"><ArrowUpCircle className="h-3 w-3" />Entrée</Badge>;
      case 'charge':
        return <Badge className="bg-red-500/15 text-red-700 border-red-200 gap-1"><ArrowDownCircle className="h-3 w-3" />Charge</Badge>;
      case 'vente_auto':
        return <Badge className="bg-blue-500/15 text-blue-700 border-blue-200 gap-1"><Car className="h-3 w-3" />Vente auto</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Mouvement supprimé' }),
      onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
    });
  };

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
            <h1 className="text-2xl font-semibold text-foreground">Caisse</h1>
            <p className="text-muted-foreground">Gestion des mouvements financiers et suivi de rentabilité</p>
          </div>
          <AddCaisseEntryDialog />
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Entrées</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(summary?.totalEntrees || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Charges</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary?.totalCharges || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bénéfices</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(summary?.totalBenefices || 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Solde Actuel</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(summary?.soldeActuel || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(summary?.soldeActuel || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par description, référence, véhicule ou client..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="entree">Entrées</SelectItem>
                  <SelectItem value="charge">Charges</SelectItem>
                  <SelectItem value="vente_auto">Ventes auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des mouvements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Véhicule / Client</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Bénéfice</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.length > 0 ? (
                  paginatedItems.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{getTypeBadge(entry.type)}</TableCell>
                      <TableCell>
                        <div className="max-w-[250px]">
                          <div className="font-medium truncate">{entry.description || '-'}</div>
                          {entry.reference && (
                            <div className="text-xs text-muted-foreground">Réf: {entry.reference}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.vehicle ? (
                          <button
                            className="text-left hover:underline text-primary"
                            onClick={() => navigate(`/vehicles/${entry.vehicleId}`)}
                          >
                            <div className="font-medium">{entry.vehicle.brand} {entry.vehicle.model}</div>
                            <div className="text-xs text-muted-foreground">{entry.vehicle.vin}</div>
                          </button>
                        ) : entry.client ? (
                          <button
                            className="text-left hover:underline text-primary"
                            onClick={() => navigate(`/clients/${entry.clientId}`)}
                          >
                            {entry.client.nom} {entry.client.prenom}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={entry.type === 'charge' ? 'text-red-600' : 'text-emerald-600'}>
                          {entry.type === 'charge' ? '-' : '+'}{formatCurrency(Number(entry.montant))}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.type === 'vente_auto' && entry.benefice != null ? (
                          <span className={`font-medium ${Number(entry.benefice) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(Number(entry.benefice))}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                         {entry._source === 'manual' && entry.type !== 'vente_auto' && (
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Supprimer ce mouvement ?</AlertDialogTitle>
                                 <AlertDialogDescription>
                                   Cette action est irréversible.
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel>Annuler</AlertDialogCancel>
                                 <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                                   Supprimer
                                 </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                         )}
                       </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun mouvement enregistré
                    </TableCell>
                  </TableRow>
                )}
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CaissePage;
