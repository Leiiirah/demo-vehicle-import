import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProfitChart } from '@/components/dashboard/ProfitChart';
import { StatusDonutChart } from '@/components/dashboard/StatusDonutChart';
import { TopVehiclesTable } from '@/components/dashboard/TopVehiclesTable';
import { TopVehiclesByCount } from '@/components/dashboard/RecentVehicles';
import { kpiData } from '@/data/mockData';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Ship,
  CheckCircle2,
  ShoppingCart,
} from 'lucide-react';

const Index = () => {
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête de page */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue. Voici l'aperçu de votre activité d'importation.
          </p>
        </div>

        {/* Cartes KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard
            title="Total investi"
            value={formatCurrency(kpiData.totalInvested)}
            icon={<DollarSign className="h-5 w-5" />}
            variant="info"
            trend={{ value: 12.5, isPositive: true }}
          />
          <KPICard
            title="Profit total"
            value={formatCurrency(kpiData.totalProfit)}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="success"
            trend={{ value: 8.2, isPositive: true }}
          />
          <KPICard
            title="Dettes en cours"
            value={formatCurrency(kpiData.outstandingDebts, 'USD')}
            icon={<AlertCircle className="h-5 w-5" />}
            variant="danger"
            trend={{ value: 3.1, isPositive: false }}
          />
          <KPICard
            title="En transit"
            value={kpiData.vehiclesInTransit}
            icon={<Ship className="h-5 w-5" />}
            variant="warning"
            subtitle="véhicules"
          />
          <KPICard
            title="Arrivés"
            value={kpiData.vehiclesArrived}
            icon={<CheckCircle2 className="h-5 w-5" />}
            variant="success"
            subtitle="véhicules"
          />
          <KPICard
            title="Vendus"
            value={kpiData.vehiclesSold}
            icon={<ShoppingCart className="h-5 w-5" />}
            variant="default"
            subtitle="véhicules"
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfitChart />
          <StatusDonutChart />
        </div>

        {/* Tableaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopVehiclesTable />
          <TopVehiclesByCount />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;