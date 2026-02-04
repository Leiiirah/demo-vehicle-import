import { useVehicles } from '@/hooks/useApi';
import { Car, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function TopVehiclesByCount() {
  const { data: vehicles, isLoading, error } = useVehicles();

  const getStatusBadge = (status: string) => {
    const styles = {
      ordered: 'badge-info',
      in_transit: 'badge-pending',
      arrived: 'badge-profit',
      sold: 'bg-muted text-muted-foreground',
    };
    const labels = {
      ordered: 'Commandé',
      in_transit: 'En transit',
      arrived: 'Arrivé',
      sold: 'Vendu',
    };
    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', styles[status as keyof typeof styles])}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !vehicles) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Top véhicules</h3>
            <p className="text-sm text-muted-foreground">Par nombre d'unités importées</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  // Group vehicles by brand+model and count them
  const vehicleCounts = vehicles.reduce((acc, vehicle) => {
    const key = `${vehicle.brand} ${vehicle.model}`;
    if (!acc[key]) {
      acc[key] = { 
        name: key, 
        brand: vehicle.brand,
        model: vehicle.model,
        count: 0, 
        statuses: [] as string[],
        lastStatus: vehicle.status
      };
    }
    acc[key].count++;
    acc[key].statuses.push(vehicle.status);
    acc[key].lastStatus = vehicle.status;
    return acc;
  }, {} as Record<string, { name: string; brand: string; model: string; count: number; statuses: string[]; lastStatus: string }>);

  // Sort by count descending and take top 4
  const topVehicles = Object.values(vehicleCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top véhicules</h3>
          <p className="text-sm text-muted-foreground">Par nombre d'unités importées</p>
        </div>
        <Link
          to="/vehicles"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Voir tout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {topVehicles.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            Aucun véhicule
          </div>
        ) : (
          topVehicles.map((vehicle, index) => (
            <div
              key={vehicle.name}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <Car className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">
                    {vehicle.name}
                  </p>
                  {getStatusBadge(vehicle.lastStatus)}
                </div>
                <p className="text-sm text-muted-foreground">
                  #{index + 1} en volume d'importation
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-primary text-lg">
                  {vehicle.count}
                </p>
                <p className="text-xs text-muted-foreground">unités</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
