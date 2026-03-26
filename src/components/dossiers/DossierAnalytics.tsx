import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Car, Package, DollarSign, TrendingUp } from 'lucide-react';
import type { Conteneur, Vehicle, Payment } from '@/services/api';
import { api } from '@/services/api';
import { formatCurrency } from '@/lib/utils';

interface DossierAnalyticsProps {
  conteneurs: Conteneur[];
  dossierId: string;
}

export function DossierAnalytics({ conteneurs, dossierId }: DossierAnalyticsProps) {
  // Fetch dossier payment stats for real exchange rate
  const { data: dossierPaymentStats } = useQuery<{
    totalDue: number;
    totalPaid: number;
    progress: number;
    payments: Payment[];
  }>({
    queryKey: ['payments', 'dossier', dossierId, 'stats'],
    queryFn: () => api.request(`/api/payments/dossier/${dossierId}/stats`),
    enabled: !!dossierId,
  });

  const isDossierSolde = (dossierPaymentStats?.progress ?? 0) >= 100;

  const tauxChangeFinal = useMemo(() => {
    if (!dossierPaymentStats?.payments?.length) return 0;
    const payments = dossierPaymentStats.payments;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (totalAmount === 0) return 0;
    const weightedRate = payments.reduce((sum, p) => sum + Number(p.amount) * Number(p.exchangeRate), 0);
    return weightedRate / totalAmount;
  }, [dossierPaymentStats]);

  const stats = useMemo(() => {
    const allVehicles: Vehicle[] = conteneurs.flatMap((c) => c.vehicles || []);

    const soldCount = allVehicles.filter((v) => v.status === 'sold').length;
    const stockCount = allVehicles.length - soldCount;

    const totalPurchaseUSD = allVehicles.reduce(
      (sum, v) => sum + Number(v.purchasePrice || 0),
      0
    );

    const totalTransportUSD = conteneurs.reduce(
      (sum, c) => sum + Number(c.coutTransport || 0),
      0
    );

    const totalInvestmentUSD = totalPurchaseUSD + totalTransportUSD;

    const recoveredFundsDZD = allVehicles
      .filter((v) => v.status === 'sold' && v.sellingPrice)
      .reduce((sum, v) => sum + Number(v.sellingPrice || 0), 0);

    const soldVehiclesTotalCost = allVehicles
      .filter((v) => v.status === 'sold')
      .reduce((sum, v) => sum + Number(v.totalCost), 0);

    const profit = recoveredFundsDZD - soldVehiclesTotalCost;


    return {
      totalVehicles: allVehicles.length,
      soldCount,
      stockCount,
      soldPercentage: allVehicles.length > 0 ? (soldCount / allVehicles.length) * 100 : 0,
      totalInvestmentUSD,
      totalPurchaseUSD,
      totalTransportUSD,
      recoveredFundsDZD,
      profit,
    };
  }, [conteneurs]);


  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Sold vs Stock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-success">{stats.soldCount}</span>
              <span className="text-muted-foreground">vendus</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-lg font-semibold">{stats.stockCount}</span>
              <span className="text-muted-foreground">en stock</span>
            </div>
            <Progress value={stats.soldPercentage} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.soldPercentage.toFixed(0)}% vendus sur {stats.totalVehicles} total
            </p>
          </CardContent>
        </Card>

        {/* Total Investment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investissement Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalInvestmentUSD, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Achat: {formatCurrency(stats.totalPurchaseUSD, 'USD')} + Transport: {formatCurrency(stats.totalTransportUSD, 'USD')}
            </p>
          </CardContent>
        </Card>

        {/* Recovered Funds */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fonds Récupérés</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.recoveredFundsDZD)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Montant total des ventes réalisées
            </p>
          </CardContent>
        </Card>

        {/* Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice Net</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(stats.profit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ventes - Coûts de revient
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
