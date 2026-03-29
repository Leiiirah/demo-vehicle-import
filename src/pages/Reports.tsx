import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useProfitHistory, useSuppliers, useClients } from '@/hooks/useApi';
import { FileText, Download, Calendar, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ReportsPage = () => {
  const { data: profitHistory = [], isLoading: loadingProfit } = useProfitHistory();
  const { data: suppliers = [], isLoading: loadingSuppliers } = useSuppliers();
  const { data: clients = [], isLoading: loadingClients } = useClients();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isLoading = loadingProfit || loadingSuppliers || loadingClients;


  const clientProfitData = clients.map((client: any) => {
    const soldVehicles = (client.vehicles || []).filter((v: any) => v.status === 'sold');
    const profit = soldVehicles.reduce((sum: number, v: any) => {
      return sum + (Number(v.sellingPrice || 0) - Number(v.totalCost || 0));
    }, 0);
    return {
      name: `${client.nom || ''} ${client.prenom || ''}`.trim().split(' ')[0] || 'N/A',
      profit,
      vehicles: (client.vehicles || []).length,
    };
  }).filter((c: any) => c.vehicles > 0);

  const supplierData = suppliers.map((supplier: any) => ({
    name: supplier.name?.split(' ')[0] || 'N/A',
    paid: Number(supplier.totalPaid) || 0,
    debt: Number(supplier.remainingDebt) || 0,
    vehicles: Number(supplier.vehiclesSupplied) || 0,
  })).filter((s: any) => s.paid > 0 || s.debt > 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="text-2xl font-semibold text-foreground">Rapports & Analyses</h1>
            <p className="text-muted-foreground">
              Intelligence d'affaires et analyses pour la prise de décision
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="6m">
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Dernier mois</SelectItem>
                <SelectItem value="3m">3 derniers mois</SelectItem>
                <SelectItem value="6m">6 derniers mois</SelectItem>
                <SelectItem value="1y">Dernière année</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Types de rapports */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button onClick={() => scrollToSection('section-client')} className="kpi-card hover:border-primary transition-colors text-left cursor-pointer">
            <FileText className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-foreground">Par client</p>
            <p className="text-sm text-muted-foreground">Profit par client</p>
          </button>
          <button onClick={() => scrollToSection('section-supplier')} className="kpi-card hover:border-primary transition-colors text-left cursor-pointer">
            <FileText className="h-5 w-5 text-success mb-2" />
            <p className="font-medium text-foreground">Par fournisseur</p>
            <p className="text-sm text-muted-foreground">Récap paiements</p>
          </button>
          <button onClick={() => scrollToSection('section-vehicle')} className="kpi-card hover:border-primary transition-colors text-left cursor-pointer">
            <FileText className="h-5 w-5 text-warning mb-2" />
            <p className="font-medium text-foreground">Par véhicule</p>
            <p className="text-sm text-muted-foreground">Marges individuelles</p>
          </button>
          <button onClick={() => scrollToSection('section-profit')} className="kpi-card hover:border-primary transition-colors text-left cursor-pointer">
            <FileText className="h-5 w-5 text-danger mb-2" />
            <p className="font-medium text-foreground">Historique profit</p>
            <p className="text-sm text-muted-foreground">Tendances mensuelles</p>
          </button>
        </div>

        {/* Grille graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendance profit */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Tendance des profits
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 5%, 90%)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(0, 0%, 45%)', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(0, 0%, 45%)', fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat('fr-DZ', {
                        notation: 'compact',
                      }).format(value)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(0, 5%, 90%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Profit']}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="hsl(142, 71%, 45%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(142, 71%, 45%)', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profit par client */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Profit par client
            </h3>
            <div className="h-[300px]">
              {clientProfitData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientProfitData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 5%, 90%)" />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(0, 0%, 45%)', fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('fr-DZ', {
                          notation: 'compact',
                        }).format(value)
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(0, 0%, 45%)', fontSize: 12 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(0, 0%, 100%)',
                        border: '1px solid hsl(0, 5%, 90%)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Profit']}
                    />
                    <Bar
                      dataKey="profit"
                      fill="hsl(0, 72%, 50%)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Aucun client trouvé
                </div>
              )}
            </div>
          </div>

          {/* Récap fournisseurs */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Récapitulatif financier fournisseurs
            </h3>
            <div className="h-[300px]">
              {supplierData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={supplierData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 5%, 90%)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(0, 0%, 45%)', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(0, 0%, 45%)', fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('fr-DZ', {
                          notation: 'compact',
                        }).format(value)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(0, 0%, 100%)',
                        border: '1px solid hsl(0, 5%, 90%)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="paid"
                      name="Total payé"
                      fill="hsl(142, 71%, 45%)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="debt"
                      name="Dette en cours"
                      fill="hsl(0, 72%, 51%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Aucun fournisseur trouvé
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tableau récap */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Résumé performance mensuelle
          </h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mois</th>
                  <th>Véhicules vendus</th>
                  <th>Chiffre d'affaires</th>
                  <th>Profit</th>
                  <th>Marge moy.</th>
                </tr>
              </thead>
              <tbody>
                {profitHistory.length > 0 ? (
                  profitHistory.map((month: any) => (
                    <tr key={month.month}>
                      <td className="font-medium text-foreground">{month.month} 2026</td>
                      <td>-</td>
                      <td>{formatCurrency(month.profit * 12)}</td>
                      <td className="text-success font-medium">
                        {formatCurrency(month.profit)}
                      </td>
                      <td>
                        <span className="badge-profit">-</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucune donnée disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;
