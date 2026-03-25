import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useVehicles } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Search, AlertCircle, Car, DollarSign, Warehouse } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

export default function StockPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: vehicles, isLoading, error } = useVehicles();

  // Only vehicles with status "ordered" (En stock)
  const stockVehicles = (vehicles || []).filter(
    (v: any) => v.status === 'ordered'
  );

  const filteredVehicles = stockVehicles.filter(
    (v: any) =>
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { paginatedItems, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } =
    usePagination(filteredVehicles);

  const totalStockValue = stockVehicles.reduce(
    (acc: number, v: any) => acc + Number(v.totalCost || 0),
    0
  );

  const totalPurchaseValue = stockVehicles.reduce(
    (acc: number, v: any) => acc + Number(v.purchasePrice || 0),
    0
  );

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Erreur de chargement du stock</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock</h1>
          <p className="text-muted-foreground">Véhicules disponibles en stock</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Véhicules en Stock</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stockVehicles.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prix d'Achat Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalPurchaseValue, 'USD')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Coût Total du Stock</CardTitle>
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(totalStockValue)}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Véhicules en Stock</CardTitle>
            <CardDescription>Liste des véhicules disponibles en stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par marque, modèle, VIN ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Marque</TableHead>
                        <TableHead>Modèle</TableHead>
                        <TableHead>Année</TableHead>
                        <TableHead>VIN</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Prix d'Achat (USD)</TableHead>
                        <TableHead>Transport (USD)</TableHead>
                        <TableHead>Coût Total (DZD)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {searchTerm
                              ? `Aucun véhicule trouvé pour "${searchTerm}"`
                              : 'Aucun véhicule en stock'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((vehicle: any) => (
                          <TableRow
                            key={vehicle.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <img src={(vehicle as any).photoUrl || carPlaceholder} alt={`${vehicle.brand} ${vehicle.model}`} className="h-8 w-8 rounded object-cover" />
                                {vehicle.brand}
                              </div>
                            </TableCell>
                            <TableCell>{vehicle.model}</TableCell>
                            <TableCell>{vehicle.year}</TableCell>
                            <TableCell className="font-mono text-xs">{vehicle.vin}</TableCell>
                            <TableCell>{vehicle.supplier?.name || '-'}</TableCell>
                            <TableCell>{formatCurrency(Number(vehicle.purchasePrice || 0), 'USD')}</TableCell>
                            <TableCell>{formatCurrency(Number(vehicle.transportCost || 0), 'USD')}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(Number(vehicle.totalCost || 0))}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  onPageChange={goToPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
