import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { vehicles } from '@/data/mockData';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Car,
  Grid3X3,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import AddVehicleDialog from '@/components/vehicles/AddVehicleDialog';

const VehiclesPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.containerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Véhicules</h1>
            <p className="text-muted-foreground">
              Gérez vos importations et suivez leur statut
            </p>
          </div>
          <AddVehicleDialog>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Car className="h-4 w-4 mr-2" />
              Ajouter un véhicule
            </Button>
          </AddVehicleDialog>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher véhicules, clients, conteneurs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="ordered">Commandé</SelectItem>
              <SelectItem value="in_transit">En transit</SelectItem>
              <SelectItem value="arrived">Arrivé</SelectItem>
              <SelectItem value="sold">Vendu</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('table')}
              className={cn(viewMode === 'table' && 'bg-secondary')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('cards')}
              className={cn(viewMode === 'cards' && 'bg-secondary')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Vue tableau */}
        {viewMode === 'table' && (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Véhicule</th>
                    <th>Client</th>
                    <th>Fournisseur</th>
                    <th>Conteneur</th>
                    <th>Statut</th>
                    <th>Coût total</th>
                    <th>Profit</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr 
                      key={vehicle.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Car className="h-5 w-5 text-secondary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {vehicle.brand} {vehicle.model}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {vehicle.year} • {vehicle.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-foreground">{vehicle.client}</td>
                      <td className="text-muted-foreground">{vehicle.supplier}</td>
                      <td>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {vehicle.containerId}
                        </code>
                      </td>
                      <td>{getStatusBadge(vehicle.status)}</td>
                      <td className="font-medium text-foreground">
                        {formatCurrency(vehicle.totalCost)}
                      </td>
                      <td>
                        <span className="font-medium text-success">
                          {formatCurrency(vehicle.profit)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({vehicle.margin}%)
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
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
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
        )}

        {/* Vue cartes */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                      <Car className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.year} • {vehicle.id}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(vehicle.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client</span>
                    <span className="text-foreground font-medium">{vehicle.client}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conteneur</span>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">
                      {vehicle.containerId}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coût total</span>
                    <span className="text-foreground font-medium">
                      {formatCurrency(vehicle.totalCost)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Profit</p>
                    <p className="text-lg font-semibold text-success">
                      {formatCurrency(vehicle.profit)}
                    </p>
                  </div>
                  <span className="badge-profit text-sm">{vehicle.margin}% marge</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VehiclesPage;