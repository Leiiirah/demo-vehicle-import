import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { clients } from '@/data/mockData';
import { UserCircle, MoreVertical, Eye, FileText, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const ClientsPage = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
            <p className="text-muted-foreground">
              Manage your import clients and track their profitability
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <UserCircle className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="kpi-card">
            <p className="kpi-label">Total Clients</p>
            <p className="kpi-value">{clients.length}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Active Clients</p>
            <p className="kpi-value text-success">
              {clients.filter((c) => c.status === 'active').length}
            </p>
          </div>
          <div className="kpi-card border-l-4 border-l-success">
            <p className="kpi-label">Total Profit Generated</p>
            <p className="kpi-value text-success">
              {formatCurrency(clients.reduce((sum, c) => sum + c.totalProfit, 0))}
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Avg. Margin</p>
            <p className="kpi-value text-info">
              {(clients.reduce((sum, c) => sum + c.marginPercentage, 0) / clients.length).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Vehicles Imported</th>
                  <th>Total Profit</th>
                  <th>Margin %</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                          <UserCircle className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.company}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-medium text-foreground">
                        {client.vehiclesImported}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium text-success">
                        {formatCurrency(client.totalProfit)}
                      </span>
                    </td>
                    <td>
                      <span className="badge-profit">{client.marginPercentage}%</span>
                    </td>
                    <td>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          client.status === 'active'
                            ? 'bg-success-muted text-success'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {client.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Vehicle History
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default ClientsPage;
