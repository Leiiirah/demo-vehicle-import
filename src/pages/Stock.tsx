import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useConteneurs, useUpdateConteneur } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Search, Container, AlertCircle, MoreVertical, Eye, Warehouse, Car, DollarSign, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const statusOptions = [
  { value: 'charge', label: 'Chargée' },
  { value: 'decharge', label: 'Déchargée' },
];


export default function StockPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: conteneurs, isLoading, error } = useConteneurs();
  const updateConteneur = useUpdateConteneur();
  const { toast } = useToast();

  // Only decharged containers
  const dechargedConteneurs = (conteneurs || []).filter(
    (c) => c.status === 'decharge'
  );

  const filteredConteneurs = dechargedConteneurs.filter(
    (c) =>
      c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.dossier?.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (c.dossier?.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const { paginatedItems, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } =
    usePagination(filteredConteneurs);

  // Total stock value: sum of totalCost of all vehicles inside decharged containers
  const totalStockValue = dechargedConteneurs.reduce((acc, c) => {
    const vehiclesTotal = (c.vehicles || []).reduce(
      (vAcc: number, v: any) => vAcc + Number(v.totalCost || 0),
      0
    );
    return acc + vehiclesTotal;
  }, 0);

  const totalVehicles = dechargedConteneurs.reduce(
    (acc, c) => acc + (c.vehicles?.length || 0),
    0
  );

  const handleStatusChange = (conteneurId: string, newStatus: string) => {
    updateConteneur.mutate(
      { id: conteneurId, data: { status: newStatus as any } },
      {
        onSuccess: () => toast({ title: 'Statut mis à jour' }),
        onError: (err: any) =>
          toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
      }
    );
  };

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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock</h1>
          <p className="text-muted-foreground">Conteneurs déchargés et disponibles en stock</p>
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
                  <CardTitle className="text-sm font-medium">Conteneurs en Stock</CardTitle>
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dechargedConteneurs.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Véhicules en Stock</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVehicles}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valeur Totale du Stock</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle>Conteneurs Déchargés</CardTitle>
            <CardDescription>Gérez le statut de vos conteneurs en stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro, dossier ou fournisseur..."
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
                        <TableHead>Numéro</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Dossier</TableHead>
                        <TableHead>Arrivée</TableHead>
                        <TableHead className="text-center">Véhicules</TableHead>
                        <TableHead>Valeur (DZD)</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {searchTerm
                              ? `Aucun conteneur trouvé pour "${searchTerm}"`
                              : 'Aucun conteneur déchargé en stock'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((conteneur) => {
                          const vehiclesValue = (conteneur.vehicles || []).reduce(
                            (acc: number, v: any) => acc + Number(v.totalCost || 0),
                            0
                          );
                          return (
                            <TableRow
                              key={conteneur.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => navigate(`/conteneurs/${conteneur.id}`)}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Container className="h-4 w-4 text-muted-foreground" />
                                  {conteneur.numero}
                                </div>
                              </TableCell>
                              <TableCell>{conteneur.dossier?.supplier?.name || '-'}</TableCell>
                              <TableCell>{conteneur.dossier?.reference || '-'}</TableCell>
                              <TableCell>
                                {conteneur.dateArrivee
                                  ? new Date(conteneur.dateArrivee).toLocaleDateString('fr-FR')
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {conteneur.vehicles?.length || 0}
                              </TableCell>
                              <TableCell>{formatCurrency(vehiclesValue)}</TableCell>
                              <TableCell>
                                <Select
                                  value={conteneur.status}
                                  onValueChange={(val) => handleStatusChange(conteneur.id, val)}
                                >
                                  <SelectTrigger
                                    className="h-8 w-[140px]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/conteneurs/${conteneur.id}`);
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Voir le détail
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
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
