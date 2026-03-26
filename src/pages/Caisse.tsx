import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { fr } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { formatCurrency, cn } from '@/lib/utils';
import { usePagination } from '@/hooks/usePagination';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TablePagination } from '@/components/ui/table-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  Search, Loader2, Trash2, Car, CreditCard, AlertTriangle, CalendarIcon, X,
} from 'lucide-react';
import { useCaisseEntries, useCaisseSummary, useDeleteCaisseEntry, useCaisseBalance, usePurgeCaisse } from '@/hooks/useCaisse';
import { AddCaisseEntryDialog } from '@/components/caisse/AddCaisseEntryDialog';
import { api } from '@/services/api';
import { CaisseBalanceCard } from '@/components/caisse/CaisseBalanceCard';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CaissePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: entries = [], isLoading } = useCaisseEntries();
  const { data: summary } = useCaisseSummary();
  const { data: balanceData } = useCaisseBalance();
  const soldeTotal = (summary?.totalEntrees || 0) - (summary?.totalCharges || 0) + (balanceData?.balance || 0);
  const deleteMutation = useDeleteCaisseEntry();
  const purgeMutation = usePurgeCaisse();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const filteredEntries = useMemo(() => {
    return (entries as any[]).filter((e) => {
      const term = searchTerm.toLowerCase();
      const searchMatch =
        !term ||
        (e.description || '').toLowerCase().includes(term) ||
        (e.reference || '').toLowerCase().includes(term) ||
        (e.vehicle && `${e.vehicle.brand} ${e.vehicle.model}`.toLowerCase().includes(term)) ||
        (e.client && `${e.client.nom} ${e.client.prenom}`.toLowerCase().includes(term));
      const typeMatch = typeFilter === 'all' || e.type === typeFilter || (typeFilter === 'payment' && e._source === 'payment');
      const entryDate = new Date(e.date);
      const dateFromMatch = !dateFrom || entryDate >= dateFrom;
      const dateToMatch = !dateTo || entryDate <= dateTo;
      return searchMatch && typeMatch && dateFromMatch && dateToMatch;
    });
  }, [entries, searchTerm, typeFilter, dateFrom, dateTo]);

  const {
    paginatedItems, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage,
  } = usePagination(filteredEntries);


  const getTypeBadge = (type: string, source?: string) => {
    if (source === 'payment') {
      return <Badge className="bg-purple-500/15 text-purple-700 border-purple-200 gap-1"><CreditCard className="h-3 w-3" />Paiement</Badge>;
    }
    switch (type) {
      case 'entree':
        return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-200 gap-1"><ArrowUpCircle className="h-3 w-3" />Entrée</Badge>;
      case 'charge':
        return <Badge className="bg-red-500/15 text-red-700 border-red-200 gap-1"><ArrowDownCircle className="h-3 w-3" />Charge</Badge>;
      case 'retrait':
        return <Badge className="bg-orange-500/15 text-orange-700 border-orange-200 gap-1"><ArrowDownCircle className="h-3 w-3" />Retrait</Badge>;
      case 'vente_auto':
        return <Badge className="bg-blue-500/15 text-blue-700 border-blue-200 gap-1"><Car className="h-3 w-3" />Vente auto</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const handleDelete = useCallback(async (entry: any) => {
    try {
      const source = entry._source;
      const rawId = entry.id;

      if (source === 'manual') {
        await api.deleteCaisseEntry(rawId);
      } else if (source === 'vehicle_charge') {
        // id format: "vc-<uuid>"
        const realId = rawId.replace('vc-', '');
        await api.deleteVehicleCharge(realId);
      } else if (source === 'payment') {
        // id format: "pay-<uuid>"
        const realId = rawId.replace('pay-', '');
        await api.deletePayment(realId);
      } else if (source === 'vehicle_sale') {
        toast({ title: 'Impossible', description: 'Pour supprimer une vente, modifiez le statut du véhicule.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Mouvement supprimé' });
      queryClient.invalidateQueries({ queryKey: ['caisse'] });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  }, [toast, deleteMutation]);

  const handlePurge = () => {
    purgeMutation.mutate(undefined, {
      onSuccess: (data: any) => toast({ title: `${data.deleted} mouvements supprimés` }),
      onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const deletableOnPage = paginatedItems.filter((e: any) => e._source !== 'vehicle_sale');
  const allPageSelected = deletableOnPage.length > 0 && deletableOnPage.every((e: any) => selectedIds.has(e.id));

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        deletableOnPage.forEach((e: any) => next.delete(e.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        deletableOnPage.forEach((e: any) => next.add(e.id));
        return next;
      });
    }
  };

  const handleBulkDelete = useCallback(async () => {
    setBulkDeleting(true);
    const allEntries = entries as any[];
    let deleted = 0;
    let errors = 0;
    for (const id of selectedIds) {
      const entry = allEntries.find((e: any) => e.id === id);
      if (!entry || entry._source === 'vehicle_sale') continue;
      try {
        if (entry._source === 'manual') {
          await api.deleteCaisseEntry(id);
        } else if (entry._source === 'vehicle_charge') {
          await api.deleteVehicleCharge(id.replace('vc-', ''));
        } else if (entry._source === 'payment') {
          await api.deletePayment(id.replace('pay-', ''));
        }
        deleted++;
      } catch {
        errors++;
      }
    }
    setSelectedIds(new Set());
    setBulkDeleting(false);
    queryClient.invalidateQueries({ queryKey: ['caisse'] });
    toast({ title: `${deleted} mouvement(s) supprimé(s)${errors ? `, ${errors} erreur(s)` : ''}` });
  }, [selectedIds, entries, queryClient, toast]);

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
          <div className="flex gap-2">
            <AddCaisseEntryDialog />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Purger la caisse
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Purger tous les mouvements manuels ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera définitivement toutes les entrées manuelles de la caisse. 
                    Les ventes auto et charges véhicules ne seront pas affectées. Cette action est irréversible.
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

        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Solde Total</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${soldeTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(soldeTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Entrées - Charges + Caisse Disponible</p>
            </CardContent>
          </Card>
          <CaisseBalanceCard />
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
                  <SelectItem value="retrait">Retraits</SelectItem>
                  <SelectItem value="vente_auto">Ventes auto</SelectItem>
                  <SelectItem value="payment">Paiements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full sm:w-[200px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Date début'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full sm:w-[200px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Date fin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
              {(dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }} className="gap-1">
                  <X className="h-4 w-4" /> Réinitialiser
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Historique des mouvements</CardTitle>
            {selectedIds.size > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2" disabled={bulkDeleting}>
                    {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Supprimer ({selectedIds.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer {selectedIds.size} mouvement(s) ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Supprimer tout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allPageSelected} onCheckedChange={toggleSelectAll} />
                  </TableHead>
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
                      <TableCell>{getTypeBadge(entry.type, entry._source)}</TableCell>
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
                         {entry._source !== 'vehicle_sale' && (
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
                                 <AlertDialogAction onClick={() => handleDelete(entry)}>
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
