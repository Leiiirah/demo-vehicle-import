import { vehicles } from '@/data/mockData';
import { Car, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function RecentVehicles() {
  const getStatusBadge = (status: string) => {
    const styles = {
      ordered: 'badge-info',
      in_transit: 'badge-pending',
      arrived: 'badge-profit',
      sold: 'bg-muted text-muted-foreground',
    };
    const labels = {
      ordered: 'Ordered',
      in_transit: 'In Transit',
      arrived: 'Arrived',
      sold: 'Sold',
    };
    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Vehicles</h3>
          <p className="text-sm text-muted-foreground">Latest import activities</p>
        </div>
        <Link
          to="/vehicles"
          className="flex items-center gap-1 text-sm font-medium text-info hover:text-info/80 transition-colors"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {vehicles.slice(0, 4).map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
              <Car className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground truncate">
                  {vehicle.brand} {vehicle.model}
                </p>
                {getStatusBadge(vehicle.status)}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {vehicle.client} • {vehicle.containerId}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-success">
                {formatCurrency(vehicle.profit)}
              </p>
              <p className="text-xs text-muted-foreground">profit</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
