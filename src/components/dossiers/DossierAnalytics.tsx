import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Package, DollarSign, TrendingUp } from 'lucide-react';
import type { Conteneur, Vehicle, Payment } from '@/services/api';
import { api } from '@/services/api';
import { formatCurrency } from '@/lib/utils';

interface DossierAnalyticsProps {
  conteneurs: Conteneur[];
  dossierId: string;
}

export function DossierAnalytics({ conteneurs, dossierId }: DossierAnalyticsProps) {
  // Fetch dossier payment stats for progress check
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

  // Collect all vehicle IDs to fetch their payments
  const allVehicles: Vehicle[] = useMemo(
    () => conteneurs.flatMap((c) => c.vehicles || []),
    [conteneurs]
  );

  // Compute weighted average rate from dossier-level supplier payments
  const dossierPayments = dossierPaymentStats?.payments || [];
  const dossierWeightedRate = useMemo(() => {
    const totalPaidUSD = dossierPayments.reduce((s: number, p: any) => s + Number(p.amount), 0);
    if (totalPaidUSD === 0) return 0;
    return Math.round(
      dossierPayments.reduce((s: number, p: any) => s + Number(p.amount) * Number(p.exchangeRate), 0) / totalPaidUSD
    );
  }, [dossierPayments]);

  const stats = useMemo(() => {
    const soldCount = allVehicles.filter((v) => v.status === 'sold').length;
    const chargeCount = allVehicles.filter((v) => v.status === 'in_transit').length;
    const stockCount = allVehicles.filter((v) => v.status === 'ordered').length;

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

    // Compute profit using dossier-level weighted average rate
    const soldVehicles = allVehicles.filter((v) => v.status === 'sold');
    let soldVehiclesTotalCost = 0;

    if (dossierWeightedRate > 0) {
      for (const v of soldVehicles) {
        const totalUSD = Number(v.purchasePrice || 0) + Number(v.transportCost || 0);
        soldVehiclesTotalCost += (totalUSD * dossierWeightedRate) + Number(v.localFees || 0);
      }
    }

    const profit = dossierWeightedRate > 0 ? recoveredFundsDZD - soldVehiclesTotalCost : 0;

    return {
      totalVehicles: allVehicles.length,
      soldCount,
      chargeCount,
      stockCount,
      totalInvestmentUSD,
      totalPurchaseUSD,
      totalTransportUSD,
      recoveredFundsDZD,
      profit,
    };
  }, [conteneurs, allVehicles, dossierWeightedRate]);


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
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <span className="text-success">{stats.soldCount} vendu(s)</span>
              <span className="text-warning">{stats.chargeCount} chargée(s)</span>
              <span className="text-primary">{stats.stockCount} en stock</span>
            </div>
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

        {/* Recovered Funds - only when fully paid */}
        {isDossierSolde && (
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
        )}

        {/* Profit - only when fully paid */}
        {isDossierSolde && (
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
        )}
      </div>

    </div>
  );
}
