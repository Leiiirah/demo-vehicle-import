import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useVehicles, useDeleteVehicle } from '@/hooks/useApi';
import { api } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Car,
  Grid3X3,
  List,
  AlertCircle,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import AddVehicleDialog from '@/components/vehicles/AddVehicleDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleStatusSelect } from '@/components/vehicles/VehicleStatusSelect';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const VehiclesPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>(['ordered', 'in_transit', 'arrived', 'sold']);
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const { data: vehicles, isLoading, error } = useVehicles();
  const deleteVehicle = useDeleteVehicle();
  const { toast } = useToast();

  // Collect unique dossier IDs from vehicles
  const dossierIds = useMemo(() => {
    if (!vehicles) return [];
    const ids = new Set<string>();
    vehicles.forEach((v: any) => {
      if (v.conteneur?.dossier?.id) ids.add(v.conteneur.dossier.id);
    });
    return Array.from(ids);
  }, [vehicles]);

  // Fetch payment stats for all dossiers
  const dossierStatsQueries = useQueries({
    queries: dossierIds.map((dossierId) => ({
      queryKey: ['payments', 'dossier', dossierId, 'stats'],
      queryFn: () => api.request<{ progress: number }>(`/api/payments/dossier/${dossierId}/stats`),
      enabled: !!dossierId,
      staleTime: 30000,
    })),
  });

  // Map dossier ID → fully paid boolean
  const dossierPaidMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    dossierIds.forEach((id, idx) => {
      const data = dossierStatsQueries[idx]?.data;
      map[id] = data ? data.progress >= 100 : false;
    });
    return map;
  }, [dossierIds, dossierStatsQueries]);

  const isVehiclePaid = (vehicle: any) => {
    const dossierId = vehicle.conteneur?.dossier?.id;
    return dossierId ? dossierPaidMap[dossierId] === true : false;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ordered: 'badge-info',
      in_transit: 'badge-pending',
      arrived: 'badge-profit',
      sold: 'bg-muted text-muted-foreground',
    };
    const labels = {
      ordered: 'En stock',
      in_transit: 'Chargée',
      arrived: 'Arrivé',
      sold: 'Vendu',
    };
    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };


  const filteredVehicles = (vehicles || []).filter((vehicle) => {
    const matchesSearch =
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vehicle.client?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (vehicle.conteneur?.numero?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilters.includes(vehicle.status);
    let matchesMonth = true;
    if (monthFilter !== 'all') {
      const date = vehicle.orderDate ? new Date(vehicle.orderDate) : null;
      if (!date) {
        matchesMonth = false;
      } else {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        matchesMonth = key === monthFilter;
      }
    }
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const { paginatedItems: paginatedVehicles, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } = usePagination(filteredVehicles);

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Erreur de chargement des véhicules</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Véhicules</h1>
            <p className="text-muted-foreground">
              Gérez vos importations et suivez leur statut
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total prix d'achat</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(filteredVehicles.reduce((sum, v) => sum + Number(v.purchasePrice || 0), 0), 'USD')}
              </p>
            </div>
            <AddVehicleDialog>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Car className="h-4 w-4 mr-2" />
                Ajouter un véhicule
              </Button>
            </AddVehicleDialog>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher véhicules, clients, conteneurs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start">
                <Filter className="h-4 w-4 mr-2" />
                {statusFilters.length === 4 ? 'Tous les statuts' : `${statusFilters.length} statut(s)`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {[
                { value: 'ordered', label: 'En stock' },
                { value: 'in_transit', label: 'Chargée' },
                { value: 'arrived', label: 'Arrivé' },
                { value: 'sold', label: 'Vendu' },
              ].map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => {
                    setStatusFilters((prev) =>
                      prev.includes(status.value)
                        ? prev.filter((s) => s !== status.value)
                        : [...prev, status.value]
                    );
                  }}
                  className="flex items-center gap-2"
                >
                  <Checkbox checked={statusFilters.includes(status.value)} />
                  {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par mois" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les mois</SelectItem>
              {(() => {
                const months = new Set<string>();
                (vehicles || []).forEach((v: any) => {
                  const date = v.orderDate ? new Date(v.orderDate) : null;
                  if (date) months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
                });
                return Array.from(months).sort().reverse().map((m) => {
                  const [y, mo] = m.split('-');
                  const label = new Date(Number(y), Number(mo) - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                  return <SelectItem key={m} value={m}>{label}</SelectItem>;
                });
              })()}
            </SelectContent>
          </Select>
          <div className="flex items-center border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('table')}
              className={cn(viewMode === 'table' && 'bg-secondary')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('cards')}
              className={cn(viewMode === 'cards' && 'bg-secondary')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        )}

        {/* Vue tableau */}
        {!isLoading && viewMode === 'table' && (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Véhicule</th>
                    <th>VIN</th>
                    <th>Passeport</th>
                    <th>Prix d'achat (USD)</th>
                    <th>Transport (USD)</th>
                    <th>Transit (DZD)</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucun véhicule trouvé
                      </td>
                    </tr>
                  ) : (
                    paginatedVehicles.map((vehicle) => (
                      <tr 
                        key={vehicle.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            {vehicle.photoUrl ? <img src={vehicle.photoUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><Car className="h-5 w-5 text-muted-foreground" /></div>}
                            <div>
                              <p className="font-medium text-foreground">
                                {vehicle.brand} {vehicle.model}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {vehicle.year}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {vehicle.vin}
                          </code>
                        </td>
                        <td>
                          {vehicle.passeport ? (
                            <span
                              className="text-primary hover:underline cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/passeports/${vehicle.passeport.id}`);
                              }}
                            >
                              {vehicle.passeport.prenom} {vehicle.passeport.nom}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-foreground">
                          {formatCurrency(Number(vehicle.purchasePrice || 0), 'USD')}
                        </td>
                        <td className="text-foreground">
                          {formatCurrency(Number(vehicle.transportCost || 0), 'USD')}
                        </td>
                        <td className="text-foreground">
                          {formatCurrency(Number(vehicle.localFees || 0))}
                        </td>
                        <td><VehicleStatusSelect vehicleId={vehicle.id} currentStatus={vehicle.status} /></td>
                        <td>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/vehicles/${vehicle.id}`);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir les détails
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                               <AlertDialog>
                                 <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                   <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                     <Trash2 className="h-4 w-4 mr-2" />
                                     Supprimer
                                   </DropdownMenuItem>
                                 </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action est irréversible. Le véhicule {vehicle.brand} {vehicle.model} sera définitivement supprimé.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                     <AlertDialogAction onClick={(e) => {
                                      e.stopPropagation();
                                      deleteVehicle.mutate(vehicle.id, {
                                        onSuccess: () => toast({ title: 'Véhicule supprimé' }),
                                        onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
                                      });
                                    }}>
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} startIndex={startIndex} endIndex={endIndex} onPageChange={goToPage} />
          </div>
        )}

        {/* Vue cartes */}
        {!isLoading && viewMode === 'cards' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedVehicles.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Aucun véhicule trouvé
                </div>
              ) : (
                paginatedVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {vehicle.photoUrl ? <img src={vehicle.photoUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><Car className="h-6 w-6 text-muted-foreground" /></div>}
                        <div>
                          <p className="font-semibold text-foreground">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.year} • {vehicle.vin}
                          </p>
                        </div>
                      </div>
                      <VehicleStatusSelect vehicleId={vehicle.id} currentStatus={vehicle.status} />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client</span>
                        <span className="text-foreground font-medium">
                          {vehicle.client ? `${vehicle.client.prenom} ${vehicle.client.nom}` : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conteneur</span>
                        <code className="text-xs bg-muted px-2 py-0.5 rounded">
                          {vehicle.conteneur?.numero || '-'}
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prix d'achat</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(Number(vehicle.purchasePrice || 0), 'USD')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} startIndex={startIndex} endIndex={endIndex} onPageChange={goToPage} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VehiclesPage;
