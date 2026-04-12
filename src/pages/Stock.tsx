import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useVehicles } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, AlertCircle, Car, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/services/api';

export default function StockPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const { data: vehicles, isLoading, error } = useVehicles();
  const queryClient = useQueryClient();
  const recalcDone = useRef(false);

  // Auto-recalculate all dossier costs on first mount to fix stale data
  useEffect(() => {
    if (recalcDone.current) return;
    recalcDone.current = true;
    api.request('/api/payments/recalculate-all-costs', { method: 'POST' })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      })
      .catch(() => {});
  }, [queryClient]);

  // Only vehicles that are "En stock" (ordered)
  const stockVehicles = (vehicles || []).filter(
    (v: any) => v.status === 'ordered'
  );

  // Collect unique dossier IDs
  const dossierIds = useMemo(() => {
    if (!vehicles) return [];
    const ids = new Set<string>();
    stockVehicles.forEach((v: any) => {
      if (v.conteneur?.dossier?.id) ids.add(v.conteneur.dossier.id);
    });
    return Array.from(ids);
  }, [vehicles, stockVehicles]);

  // Fetch payment stats for all dossiers
  const dossierStatsQueries = useQueries({
    queries: dossierIds.map((dossierId) => ({
      queryKey: ['payments', 'dossier', dossierId, 'stats'],
      queryFn: () => api.request<{ progress: number; payments: any[] }>(`/api/payments/dossier/${dossierId}/stats`),
      enabled: !!dossierId,
      staleTime: 30000,
    })),
  });

  // Map dossier ID → { paid, weightedRate }
  const dossierRateMap = useMemo(() => {
    const map: Record<string, { paid: boolean; weightedRate: number }> = {};
    dossierIds.forEach((id, idx) => {
      const data = dossierStatsQueries[idx]?.data;
      if (!data) {
        map[id] = { paid: false, weightedRate: 0 };
        return;
      }
      const payments = data.payments || [];
      const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
      const weightedRate = totalPaid > 0
        ? Math.round(payments.reduce((s: number, p: any) => s + Number(p.amount) * Number(p.exchangeRate), 0) / totalPaid * 100) / 100
        : 0;
      map[id] = { paid: data.progress >= 100, weightedRate };
    });
    return map;
  }, [dossierIds, dossierStatsQueries]);

  const getDisplayTotalDzd = (vehicle: any): number => {
    if (Number(vehicle.totalCost) > 0) return Number(vehicle.totalCost);
    const dossierId = vehicle.conteneur?.dossier?.id;
    if (!dossierId) return 0;
    const rate = dossierRateMap[dossierId]?.weightedRate || 0;
    if (rate <= 0) return 0;
    return (Number(vehicle.purchasePrice || 0) + Number(vehicle.transportCost || 0)) * rate
      + Number(vehicle.localFees || 0)
      + Number(vehicle.passeportCost || 0)
      + Number((vehicle as any).totalChargesDivers || 0);
  };

  const filteredVehicles = stockVehicles.filter((v: any) => {
    const matchesSearch =
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (monthFilter === 'all') return matchesSearch;
    const date = v.arrivalDate ? new Date(v.arrivalDate) : v.createdAt ? new Date(v.createdAt) : null;
    if (!date) return false;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return matchesSearch && key === monthFilter;
  });

  const { paginatedItems, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } =
    usePagination(filteredVehicles);

  const totalPurchaseValue = stockVehicles.reduce(
    (acc: number, v: any) => acc + Number(v.purchasePrice || 0),
    0
  );

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Erreur de chargement du stock</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock</h1>
          <p className="text-muted-foreground">Véhicules disponibles en stock</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {isLoading ? (
            <>
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Véhicules en Stock</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stockVehicles.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prix d'Achat Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalPurchaseValue, 'USD')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stock (DZD)</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stockVehicles.reduce((acc: number, v: any) => acc + getDisplayTotalDzd(v), 0))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Véhicules en Stock</CardTitle>
            <CardDescription>Liste des véhicules disponibles en stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par marque, modèle, VIN ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par mois" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les mois</SelectItem>
                  {(() => {
                    const months = new Set<string>();
                    stockVehicles.forEach((v: any) => {
                      const date = v.arrivalDate ? new Date(v.arrivalDate) : v.createdAt ? new Date(v.createdAt) : null;
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
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Véhicule</TableHead>
                        <TableHead>VIN</TableHead>
                        <TableHead>Couleur</TableHead>
                        <TableHead>Boîte</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Passeport</TableHead>
                        <TableHead>Prix d'achat (USD)</TableHead>
                        <TableHead>Transport (USD)</TableHead>
                        <TableHead>Passeport (DZD)</TableHead>
                        <TableHead>Transit (DZD)</TableHead>
                        <TableHead>Charges divers (DZD)</TableHead>
                        <TableHead>Total (DZD)</TableHead>
                        <TableHead>Date d'arrivée</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                            {searchTerm
                              ? `Aucun véhicule trouvé pour "${searchTerm}"`
                              : 'Aucun véhicule en stock'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((vehicle: any) => (
                          <TableRow
                            key={vehicle.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {vehicle.photoUrl ? (
                                  <img src={vehicle.photoUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-10 w-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                    <Car className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-foreground">{vehicle.brand} {vehicle.model}</p>
                                  <p className="text-xs text-muted-foreground">{vehicle.year}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">{vehicle.vin}</code>
                            </TableCell>
                            <TableCell className="text-foreground text-sm">{vehicle.color || '-'}</TableCell>
                            <TableCell className="text-foreground text-sm">
                              {vehicle.transmission === 'manual' ? 'Manuelle' : 'Automatique'}
                            </TableCell>
                            <TableCell className="text-foreground">{vehicle.supplier?.name || '-'}</TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell className="text-foreground">{formatCurrency(Number(vehicle.purchasePrice || 0), 'USD')}</TableCell>
                            <TableCell className="text-foreground">{formatCurrency(Number(vehicle.transportCost || 0), 'USD')}</TableCell>
                            <TableCell className="text-foreground">{formatCurrency(Number(vehicle.passeportCost || 0))}</TableCell>
                            <TableCell className="text-foreground">{formatCurrency(Number(vehicle.localFees || 0))}</TableCell>
                            <TableCell className="text-foreground">{formatCurrency(Number((vehicle as any).totalChargesDivers || 0))}</TableCell>
                            <TableCell className="text-foreground">
                              {(() => {
                                const total = getDisplayTotalDzd(vehicle);
                                return total > 0 ? formatCurrency(total) : '-';
                              })()}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {vehicle.arrivalDate ? new Date(vehicle.arrivalDate).toLocaleDateString('fr-FR') : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
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
}