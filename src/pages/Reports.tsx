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
import { profitHistory, suppliers, clients } from '@/data/mockData';
import { FileText, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ReportsPage = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  const clientProfitData = clients.map((client) => ({
    name: client.name.split(' ')[0],
    profit: client.totalProfit,
    vehicles: client.vehiclesImported,
  }));

  const supplierData = suppliers.map((supplier) => ({
    name: supplier.name.split(' ')[0],
    paid: supplier.totalPaid,
    debt: supplier.remainingDebt,
    vehicles: supplier.vehiclesSupplied,
  }));

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
          <button className="kpi-card hover:border-primary transition-colors text-left">
            <FileText className="h-5 w-5 text-primary mb-2" />
            <p className="font-medium text-foreground">Par client</p>
            <p className="text-sm text-muted-foreground">Profit par client</p>
          </button>
          <button className="kpi-card hover:border-primary transition-colors text-left">
            <FileText className="h-5 w-5 text-success mb-2" />
            <p className="font-medium text-foreground">Par fournisseur</p>
            <p className="text-sm text-muted-foreground">Récap paiements</p>
          </button>
          <button className="kpi-card hover:border-primary transition-colors text-left">
            <FileText className="h-5 w-5 text-warning mb-2" />
            <p className="font-medium text-foreground">Par véhicule</p>
            <p className="text-sm text-muted-foreground">Marges individuelles</p>
          </button>
          <button className="kpi-card hover:border-primary transition-colors text-left">
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
            </div>
          </div>

          {/* Récap fournisseurs */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Récapitulatif financier fournisseurs
            </h3>
            <div className="h-[300px]">
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
                      new Intl.NumberFormat('en-US', {
                        notation: 'compact',
                        style: 'currency',
                        currency: 'USD',
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
                {profitHistory.map((month) => (
                  <tr key={month.month}>
                    <td className="font-medium text-foreground">{month.month} 2026</td>
                    <td>8</td>
                    <td>{formatCurrency(month.profit * 12)}</td>
                    <td className="text-success font-medium">
                      {formatCurrency(month.profit)}
                    </td>
                    <td>
                      <span className="badge-profit">7,2%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;