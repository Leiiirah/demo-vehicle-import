import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Car, Package, DollarSign, TrendingUp, ArrowDownUp } from 'lucide-react';
import type { Conteneur, Vehicle, Payment } from '@/services/api';
import { api } from '@/services/api';

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

    const totalInvestmentUSD = allVehicles.reduce(
      (sum, v) => sum + Number(v.purchasePrice),
      0
    );

    const recoveredFundsDZD = allVehicles
      .filter((v) => v.status === 'sold' && v.sellingPrice)
      .reduce((sum, v) => sum + Number(v.sellingPrice || 0), 0);

    const soldVehiclesTotalCost = allVehicles
      .filter((v) => v.status === 'sold')
      .reduce((sum, v) => sum + Number(v.totalCost), 0);

    const profit = recoveredFundsDZD - soldVehiclesTotalCost;

    // Différence Réelle / Théorique
    // Prix de revient théorique = totalCost (uses theoreticalRate)
    // Prix de revient réel = (purchasePrice + transportCost) * tauxChangeFinal + localFees
    let differenceReelleTheorique = 0;
    if (isDossierSolde && tauxChangeFinal > 0) {
      differenceReelleTheorique = allVehicles.reduce((sum, v) => {
        const prixTheorique = Number(v.totalCost);
        const totalUSD = Number(v.purchasePrice) + Number(v.transportCost);
        const prixReel = (totalUSD * tauxChangeFinal) + Number(v.localFees || 0);
        return sum + (prixTheorique - prixReel);
      }, 0);
    }

    return {
      totalVehicles: allVehicles.length,
      soldCount,
      stockCount,
      soldPercentage: allVehicles.length > 0 ? (soldCount / allVehicles.length) * 100 : 0,
      totalInvestmentUSD,
      recoveredFundsDZD,
      profit,
      differenceReelleTheorique,
    };
  }, [conteneurs, isDossierSolde, tauxChangeFinal]);

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

      {/* Différence Réelle / Théorique - only when dossier is soldé */}
      {isDossierSolde && (
        <Card className="border-2" style={{ borderColor: 'hsl(142, 71%, 45%)', backgroundColor: 'hsl(142, 71%, 45%, 0.12)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'hsl(142, 71%, 45%)' }}>
              Différence Réelle / Théorique
            </CardTitle>
            <ArrowDownUp className="h-4 w-4" style={{ color: 'hsl(142, 71%, 45%)' }} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.differenceReelleTheorique >= 0 ? 'text-success' : 'text-destructive'}`}>
              {stats.differenceReelleTheorique >= 0 ? '+' : ''}{formatCurrency(stats.differenceReelleTheorique)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Σ (Prix de revient théorique − Prix de revient réel) • Taux réel moyen : {tauxChangeFinal.toFixed(2)} DZD/$
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
