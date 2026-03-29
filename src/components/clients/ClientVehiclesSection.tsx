import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { useUpdateVehicle } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Car, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Payment {
  amount: number;
  exchangeRate: number;
}

interface DossierStats {
  totalDue: number;
  totalPaid: number;
  progress: number;
  payments: Payment[];
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  purchasePrice: number;
  transportCost: number;
  theoreticalRate?: number;
  localFees?: number;
  totalCost: number;
  sellingPrice?: number | null;
  soldDate?: string | null;
  createdAt?: string;
  conteneur?: {
    dossier?: {
      id: string;
    };
  };
}

interface ClientVehiclesSectionProps {
  vehicles: Vehicle[];
}


function ClientVehicleRow({ vehicle, dossierStats }: { vehicle: Vehicle; dossierStats?: DossierStats }) {
  const navigate = useNavigate();
  const updateVehicle = useUpdateVehicle();

  const isDossierSolde = (dossierStats?.progress ?? 0) >= 100;

  const tauxChangeFinal = useMemo(() => {
    if (!dossierStats?.payments?.length) return 0;
    const payments = dossierStats.payments;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (totalAmount === 0) return 0;
    return payments.reduce((sum, p) => sum + Number(p.amount) * Number(p.exchangeRate), 0) / totalAmount;
  }, [dossierStats]);

  const totalUSD = Number(vehicle.purchasePrice) + Number(vehicle.transportCost);
  const prixRevientFinal = isDossierSolde && tauxChangeFinal > 0
    ? (totalUSD * tauxChangeFinal) + Number(vehicle.localFees || 0)
    : (Number(vehicle.theoreticalRate || 0) > 0
      ? (totalUSD * Number(vehicle.theoreticalRate)) + Number(vehicle.localFees || 0)
      : null);

  const handleUnassign = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateVehicle.mutate(
      { id: vehicle.id, data: { clientId: null as any, sellingPrice: null as any } },
      {
        onSuccess: () => toast.success('Véhicule retiré du client'),
        onError: () => toast.error('Erreur lors du retrait'),
      }
    );
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
    >
      <TableCell className="font-medium">
        {vehicle.brand} {vehicle.model} {vehicle.year}
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {vehicle.vin?.slice(-8)}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(prixRevientApprox)}
      </TableCell>
      <TableCell className="text-right">
        {prixRevientFinal !== null ? (
          <span className="text-success font-medium">{formatCurrency(prixRevientFinal)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {isDossierSolde && tauxChangeFinal > 0
          ? tauxChangeFinal.toFixed(2)
          : Number(vehicle.theoreticalRate || 0).toFixed(2)}
      </TableCell>
      <TableCell>
        {vehicle.soldDate
          ? new Date(vehicle.soldDate).toLocaleDateString('fr-FR')
          : '—'}
      </TableCell>
      <TableCell>
        {isDossierSolde ? (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Soldé
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1">
            <Clock className="h-3 w-3" />
            Non soldé
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <AlertDialog>
          <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>Retirer ce véhicule ?</AlertDialogTitle>
              <AlertDialogDescription>
                Le véhicule {vehicle.brand} {vehicle.model} ({vehicle.year}) sera dissocié de ce client. Cette action ne supprime pas le véhicule.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnassign} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Retirer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

export function ClientVehiclesSection({ vehicles }: ClientVehiclesSectionProps) {
  const [filter, setFilter] = useState('tous');

  // Sort vehicles: last added first
  const sortedVehicles = useMemo(() => {
    return [...vehicles].reverse();
  }, [vehicles]);

  // Collect unique dossier IDs
  const dossierIds = useMemo(() => {
    const ids = new Set<string>();
    vehicles.forEach((v) => {
      const did = v.conteneur?.dossier?.id;
      if (did) ids.add(did);
    });
    return Array.from(ids);
  }, [vehicles]);

  // Fetch stats for all dossiers
  const dossierStatsQueries = useQueries({
    queries: dossierIds.map((dossierId) => ({
      queryKey: ['payments', 'dossier', dossierId, 'stats'],
      queryFn: () => api.request<DossierStats>(`/api/payments/dossier/${dossierId}/stats`),
      enabled: !!dossierId,
      staleTime: 30000,
    })),
  });

  const dossierStatsMap = useMemo(() => {
    const map: Record<string, DossierStats | undefined> = {};
    dossierIds.forEach((id, idx) => {
      map[id] = dossierStatsQueries[idx]?.data;
    });
    return map;
  }, [dossierIds, dossierStatsQueries]);

  const isLoading = dossierStatsQueries.some((q) => q.isLoading);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    if (filter === 'tous') return sortedVehicles;
    return sortedVehicles.filter((v) => {
      const did = v.conteneur?.dossier?.id;
      const stats = did ? dossierStatsMap[did] : undefined;
      const solde = (stats?.progress ?? 0) >= 100;
      return filter === 'solde' ? solde : !solde;
    });
  }, [sortedVehicles, filter, dossierStatsMap]);

  const { paginatedItems, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } = usePagination(filteredVehicles);

  if (!vehicles.length) return null;

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Car className="h-5 w-5" />
          Véhicules assignés
          <Badge variant="secondary" className="ml-1">{vehicles.length}</Badge>
        </CardTitle>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="tous">Tous</TabsTrigger>
            <TabsTrigger value="solde">Soldé</TabsTrigger>
            <TabsTrigger value="non-solde">Non soldé</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">Aucun véhicule trouvé</p>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Désignation</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead className="text-right">P. Revient Approx.</TableHead>
                    <TableHead className="text-right">P. Revient Final</TableHead>
                    <TableHead className="text-right">Taux</TableHead>
                    <TableHead>Date vente</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((vehicle) => (
                    <ClientVehicleRow
                      key={vehicle.id}
                      vehicle={vehicle}
                      dossierStats={dossierStatsMap[vehicle.conteneur?.dossier?.id || '']}
                    />
                  ))}
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
  );
}
