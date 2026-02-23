import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, Search, Download, Loader2, Car } from 'lucide-react';
import { useVehicles } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';

const SalesPage = () => {
  const navigate = useNavigate();
  const { data: vehicles = [], isLoading } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('all');

  const soldVehicles = useMemo(() => (vehicles as any[]).filter((v) => v.clientId), [vehicles]);

  const uniqueClients = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    soldVehicles.forEach((v: any) => {
      if (v.client && !map.has(v.clientId)) {
        map.set(v.clientId, { id: v.clientId, name: `${v.client.nom} ${v.client.prenom}` });
      }
    });
    return Array.from(map.values());
  }, [soldVehicles]);

  const filteredVehicles = useMemo(() => {
    return soldVehicles.filter((v: any) => {
      const term = searchTerm.toLowerCase();
      const searchMatch = !term ||
        `${v.brand} ${v.model} ${v.vin}`.toLowerCase().includes(term) ||
        (v.client && `${v.client.nom} ${v.client.prenom}`.toLowerCase().includes(term));
      const clientMatch = clientFilter === 'all' || v.clientId === clientFilter;
      return searchMatch && clientMatch;
    });
  }, [soldVehicles, searchTerm, clientFilter]);

  const { paginatedItems: paginatedVehicles, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } = usePagination(filteredVehicles);


  const totalSales = filteredVehicles.reduce((s: number, v: any) => s + Number(v.sellingPrice || 0), 0);
  const totalCost = filteredVehicles.reduce((s: number, v: any) => s + Number(v.totalCost || 0), 0);
  const totalProfit = totalSales - totalCost;
  const averageMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : '0';

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Ventes & Marges</h1>
            <p className="text-muted-foreground">Suivi des ventes et analyse des marges bénéficiaires</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total des ventes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-muted-foreground mt-1">{filteredVehicles.length} véhicules vendus</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Coût total</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
              <p className="text-xs text-muted-foreground mt-1">Investissement total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profit total</CardTitle>
              <TrendingUp className={`h-4 w-4 ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{formatCurrency(totalProfit)}</div>
              <p className="text-xs text-muted-foreground mt-1">Bénéfice net</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Marge moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{averageMargin}%</div>
              <p className="text-xs text-muted-foreground mt-1">Sur toutes les ventes</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par marque, modèle, VIN ou client..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les clients</SelectItem>
                  {uniqueClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Coût</TableHead>
                  <TableHead className="text-right">Prix de vente</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Marge</TableHead>
                  <TableHead>Date de vente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length > 0 ? (
                  paginatedVehicles.map((vehicle: any) => {
                    const profit = Number(vehicle.sellingPrice || 0) - Number(vehicle.totalCost || 0);
                    const margin = vehicle.sellingPrice > 0
                      ? ((profit / Number(vehicle.sellingPrice)) * 100).toFixed(1)
                      : '0';
                    return (
                      <TableRow
                        key={vehicle.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {vehicle.photoUrl ? (
                              <img src={vehicle.photoUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                <Car className="h-5 w-5 text-secondary-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                              <div className="text-sm text-muted-foreground">{vehicle.year} • {vehicle.vin}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{vehicle.client ? `${vehicle.client.nom} ${vehicle.client.prenom}` : '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(vehicle.totalCost || 0))}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(vehicle.sellingPrice || 0))}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(profit)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={Number(margin) >= 10 ? 'default' : 'secondary'}
                            className={Number(margin) >= 10 ? 'bg-success' : ''}
                          >
                            {margin}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vehicle.soldDate
                            ? new Date(vehicle.soldDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune vente enregistrée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} startIndex={startIndex} endIndex={endIndex} onPageChange={goToPage} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SalesPage;
