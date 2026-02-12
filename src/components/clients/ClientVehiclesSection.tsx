import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Car, CheckCircle2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  conteneur?: {
    dossier?: {
      id: string;
    };
  };
}

interface ClientVehiclesSectionProps {
  vehicles: Vehicle[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-DZ', { style: 'decimal', minimumFractionDigits: 0 }).format(amount) + ' DZD';

function ClientVehicleRow({ vehicle, dossierStats }: { vehicle: Vehicle; dossierStats?: DossierStats }) {
  const navigate = useNavigate();

  const isDossierSolde = (dossierStats?.progress ?? 0) >= 100;

  const tauxChangeFinal = useMemo(() => {
    if (!dossierStats?.payments?.length) return 0;
    const payments = dossierStats.payments;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (totalAmount === 0) return 0;
    return payments.reduce((sum, p) => sum + Number(p.amount) * Number(p.exchangeRate), 0) / totalAmount;
  }, [dossierStats]);

  const totalUSD = Number(vehicle.purchasePrice) + Number(vehicle.transportCost);
  const prixRevientApprox = Number(vehicle.totalCost);
  const prixRevientFinal = isDossierSolde
    ? (totalUSD * tauxChangeFinal) + Number(vehicle.localFees || 0)
    : null;

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
    </TableRow>
  );
}

export function ClientVehiclesSection({ vehicles }: ClientVehiclesSectionProps) {
  const [filter, setFilter] = useState('tous');

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
    if (filter === 'tous') return vehicles;
    return vehicles.filter((v) => {
      const did = v.conteneur?.dossier?.id;
      const stats = did ? dossierStatsMap[did] : undefined;
      const solde = (stats?.progress ?? 0) >= 100;
      return filter === 'solde' ? solde : !solde;
    });
  }, [vehicles, filter, dossierStatsMap]);

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <ClientVehicleRow
                    key={vehicle.id}
                    vehicle={vehicle}
                    dossierStats={dossierStatsMap[vehicle.conteneur?.dossier?.id || '']}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
