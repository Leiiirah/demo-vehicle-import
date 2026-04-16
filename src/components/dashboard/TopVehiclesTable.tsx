import { useTopVehicles } from '@/hooks/useApi';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface TopVehiclesTableProps {
  filterParams?: { month?: number; year?: number };
}

export function TopVehiclesTable({ filterParams }: TopVehiclesTableProps) {
  const { data: topVehicles, isLoading, error } = useTopVehicles(filterParams);


  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !topVehicles || topVehicles.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Top véhicules rentables</h3>
            <p className="text-sm text-muted-foreground">Meilleures importations</p>
          </div>
          <TrendingUp className="h-5 w-5 text-success" />
        </div>
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top véhicules rentables</h3>
          <p className="text-sm text-muted-foreground">Meilleures importations</p>
        </div>
        <TrendingUp className="h-5 w-5 text-success" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Véhicule
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Profit
              </th>
              <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Marge
              </th>
            </tr>
          </thead>
          <tbody>
            {topVehicles.map((vehicle, index) => (
              <tr
                key={index}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-secondary-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{vehicle.brand}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="font-medium text-success">
                    {formatCurrency(vehicle.profit)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="badge-profit">{Math.round(vehicle.margin)}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
