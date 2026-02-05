import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Car, Package, DollarSign, TrendingUp } from 'lucide-react';
import type { Conteneur, Vehicle } from '@/services/api';

interface DossierAnalyticsProps {
  conteneurs: Conteneur[];
}

export function DossierAnalytics({ conteneurs }: DossierAnalyticsProps) {
  const stats = useMemo(() => {
    const allVehicles: Vehicle[] = conteneurs.flatMap((c) => c.vehicles || []);

    const soldCount = allVehicles.filter((v) => v.status === 'sold').length;
    const stockCount = allVehicles.length - soldCount;

    // Total investment = sum of all vehicle purchase prices (USD)
    const totalInvestmentUSD = allVehicles.reduce(
      (sum, v) => sum + Number(v.purchasePrice),
      0
    );

    // Recovered funds = sum of selling prices for sold vehicles (DZD)
    const recoveredFundsDZD = allVehicles
      .filter((v) => v.status === 'sold' && v.sellingPrice)
      .reduce((sum, v) => sum + Number(v.sellingPrice || 0), 0);

    // Total cost of sold vehicles (DZD)
    const soldVehiclesTotalCost = allVehicles
      .filter((v) => v.status === 'sold')
      .reduce((sum, v) => sum + Number(v.totalCost), 0);

    // Profit from sold vehicles
    const profit = recoveredFundsDZD - soldVehiclesTotalCost;

    return {
      totalVehicles: allVehicles.length,
      soldCount,
      stockCount,
      soldPercentage: allVehicles.length > 0 ? (soldCount / allVehicles.length) * 100 : 0,
      totalInvestmentUSD,
      recoveredFundsDZD,
      profit,
    };
  }, [conteneurs]);

  const formatCurrency = (amount: number, currency: 'USD' | 'DZD' = 'DZD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  return (
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
            Prix d'achat total des véhicules
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
  );
}
