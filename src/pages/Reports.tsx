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
import { FileText, Download, Calendar, Filter } from 'lucide-react';
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive business intelligence and decision-making insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="6m">
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="kpi-card hover:border-info transition-colors text-left">
            <FileText className="h-5 w-5 text-info mb-2" />
            <p className="font-medium text-foreground">By Client</p>
            <p className="text-sm text-muted-foreground">Profit per client</p>
          </button>
          <button className="kpi-card hover:border-info transition-colors text-left">
            <FileText className="h-5 w-5 text-success mb-2" />
            <p className="font-medium text-foreground">By Supplier</p>
            <p className="text-sm text-muted-foreground">Payment summary</p>
          </button>
          <button className="kpi-card hover:border-info transition-colors text-left">
            <FileText className="h-5 w-5 text-warning mb-2" />
            <p className="font-medium text-foreground">By Vehicle</p>
            <p className="text-sm text-muted-foreground">Individual margins</p>
          </button>
          <button className="kpi-card hover:border-info transition-colors text-left">
            <FileText className="h-5 w-5 text-danger mb-2" />
            <p className="font-medium text-foreground">Profit History</p>
            <p className="text-sm text-muted-foreground">Monthly trends</p>
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profit Trend */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Profit Trend
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 25%, 90%)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat('fr-DZ', {
                        notation: 'compact',
                      }).format(value)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(215, 25%, 90%)',
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

          {/* Client Profit */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Profit by Client
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientProfitData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 25%, 90%)" />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
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
                    tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(215, 25%, 90%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Profit']}
                  />
                  <Bar
                    dataKey="profit"
                    fill="hsl(217, 91%, 60%)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supplier Summary */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Supplier Financial Summary
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 25%, 90%)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
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
                      border: '1px solid hsl(215, 25%, 90%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="paid"
                    name="Total Paid"
                    fill="hsl(142, 71%, 45%)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="debt"
                    name="Outstanding Debt"
                    fill="hsl(0, 72%, 51%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Stats Table */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Monthly Performance Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Vehicles Sold</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                  <th>Avg. Margin</th>
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
                      <span className="badge-profit">7.2%</span>
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
