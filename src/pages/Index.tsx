import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProfitChart } from '@/components/dashboard/ProfitChart';
import { StatusDonutChart } from '@/components/dashboard/StatusDonutChart';
import { TopVehiclesTable } from '@/components/dashboard/TopVehiclesTable';
import { TopVehiclesByCount } from '@/components/dashboard/RecentVehicles';
import { useDashboardStats } from '@/hooks/useApi';
import {
  Package,
  Ship,
  HandCoins,
  AlertCircle,
  Banknote,
  Wallet,
  Calendar,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const filterParams = useMemo(() => {
    const params: { month?: number; year?: number } = {};
    if (selectedMonth !== 'all') params.month = parseInt(selectedMonth);
    if (selectedYear !== 'all') params.year = parseInt(selectedYear);
    return Object.keys(params).length > 0 ? params : undefined;
  }, [selectedMonth, selectedYear]);

  const { data: stats, isLoading, error } = useDashboardStats(filterParams);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' },
  ];

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Erreur de chargement des données</p>
            <p className="text-muted-foreground text-sm mt-2">
              {error instanceof Error ? error.message : 'Veuillez réessayer'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête de page avec filtres */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue. Voici l'aperçu de votre activité d'importation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les mois</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cartes KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {isLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[120px] rounded-xl" />
              ))}
            </>
          ) : (
            <>
              <KPICard
                title="Valeur du stock"
                value={formatCurrency(stats?.valeurStock || 0)}
                icon={<Package className="h-5 w-5" />}
                variant="info"
                subtitle="véhicules en stock"
              />
              <KPICard
                title="Véhicules chargées"
                value={formatCurrency(stats?.valeurChargees || 0, 'USD')}
                icon={<Ship className="h-5 w-5" />}
                variant="warning"
                subtitle="en transit"
              />
              <KPICard
                title="Créance total"
                value={formatCurrency(stats?.creanceTotal || 0)}
                icon={<HandCoins className="h-5 w-5" />}
                variant="success"
                subtitle="clients"
              />
              <KPICard
                title="Dettes total"
                value={formatCurrency(stats?.dettesTotal || 0)}
                icon={<AlertCircle className="h-5 w-5" />}
                variant="danger"
                subtitle="fournisseurs"
              />
              <KPICard
                title="Total général"
                value={formatCurrency(stats?.totalEverything || 0)}
                icon={<Banknote className="h-5 w-5" />}
                variant="default"
                subtitle="investissement"
              />
              <KPICard
                title="Total caisse"
                value={formatCurrency(stats?.totalCaisse || 0)}
                icon={<Wallet className="h-5 w-5" />}
                variant="success"
                subtitle="solde caisse"
              />
            </>
          )}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfitChart filterParams={filterParams} />
          <StatusDonutChart filterParams={filterParams} />
        </div>

        {/* Tableaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopVehiclesTable filterParams={filterParams} />
          <TopVehiclesByCount />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
