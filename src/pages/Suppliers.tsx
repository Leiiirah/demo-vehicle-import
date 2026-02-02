import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { suppliers } from '@/data/mockData';
import { Building2, Star, MoreVertical, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SuppliersPage = () => {
  const formatCurrency = (amount: number, currency: 'USD' | 'DZD' = 'USD') => {
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Suppliers</h1>
            <p className="text-muted-foreground">
              Manage your Chinese vehicle suppliers and payment balances
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Building2 className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="kpi-card">
            <p className="kpi-label">Total Suppliers</p>
            <p className="kpi-value">{suppliers.length}</p>
          </div>
          <div className="kpi-card border-l-4 border-l-success">
            <p className="kpi-label">Total Paid</p>
            <p className="kpi-value text-success">
              {formatCurrency(suppliers.reduce((sum, s) => sum + s.totalPaid, 0))}
            </p>
          </div>
          <div className="kpi-card border-l-4 border-l-danger">
            <p className="kpi-label">Total Outstanding Debt</p>
            <p className="kpi-value text-danger">
              {formatCurrency(suppliers.reduce((sum, s) => sum + s.remainingDebt, 0))}
            </p>
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-info-muted flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{supplier.name}</p>
                    <p className="text-sm text-muted-foreground">{supplier.location}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      Payment History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(supplier.rating)
                        ? 'text-warning fill-warning'
                        : 'text-muted'
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  {supplier.rating}
                </span>
              </div>

              {/* Financial Summary */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Vehicles Supplied</span>
                  <span className="font-medium text-foreground">{supplier.vehiclesSupplied}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total Paid</span>
                  <span className="font-medium text-success">
                    {formatCurrency(supplier.totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <Tooltip>
                    <TooltipTrigger className="text-sm text-muted-foreground cursor-help">
                      Credit Balance
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Current open credit with this supplier</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="font-medium text-info">
                    {formatCurrency(supplier.creditBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-medium text-foreground">
                    Remaining Debt
                  </span>
                  <span className={`font-semibold ${
                    supplier.remainingDebt > 0 ? 'text-danger' : 'text-success'
                  }`}>
                    {formatCurrency(supplier.remainingDebt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuppliersPage;
