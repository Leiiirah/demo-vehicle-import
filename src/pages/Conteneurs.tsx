import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useConteneurs, useDeleteConteneur, useUpdateConteneur } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Search, Container, FolderOpen, Ship, Anchor, AlertCircle, MoreVertical, Eye, Trash2, PackageCheck } from 'lucide-react';
import { AddConteneurDialog } from '@/components/conteneurs/AddConteneurDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  charge: { label: 'Chargée', className: 'bg-warning/10 text-warning border-warning/30' },
  arrivee: { label: 'Arrivée', className: 'bg-primary/10 text-primary border-primary/30' },
  decharge: { label: 'Déchargée', className: 'bg-success/10 text-success border-success/30' },
};

const formatCurrency = (amount: number) => {
  const parts = Math.abs(Math.round(amount)).toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (amount < 0 ? '-' : '') + parts.join('.') + ' DZD';
};

export default function ConteneursPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: conteneurs, isLoading, error } = useConteneurs();
  const deleteConteneur = useDeleteConteneur();
  const updateConteneur = useUpdateConteneur();
  const { toast } = useToast();

  const filteredConteneurs = (conteneurs || []).filter((conteneur) => {
    const matchesSearch =
      conteneur.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conteneur.dossier?.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || conteneur.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { paginatedItems: paginatedConteneurs, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } = usePagination(filteredConteneurs);

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Erreur de chargement des conteneurs</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const charged = (conteneurs || []).filter((c) => c.status === 'charge').length;
  const arrived = (conteneurs || []).filter((c) => c.status === 'arrivee').length;
  const decharged = (conteneurs || []).filter((c) => c.status === 'decharge').length;
  const totalVehicles = (conteneurs || []).reduce((acc, c) => acc + (c.vehicles?.length || 0), 0);

  const sumPrixTotal = filteredConteneurs.reduce((acc, c) => {
    const cTotal = (c.vehicles || []).reduce((sum: number, v: any) => sum + (parseFloat(String(v.totalCost)) || 0), 0);
    return acc + cTotal;
  }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conteneurs</h1>
            <p className="text-muted-foreground">Suivez vos conteneurs en temps réel</p>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouveau Conteneur
          </Button>
        </div>

        <AddConteneurDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-6">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Container className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(conteneurs || []).length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chargées</CardTitle>
                  <Ship className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{charged}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Arrivées</CardTitle>
                  <Anchor className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{arrived}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Déchargées</CardTitle>
                  <Anchor className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{decharged}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVehicles}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Search & Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Conteneurs</CardTitle>
            <CardDescription>Cliquez sur un conteneur pour voir ses détails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou dossier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="charge">Chargée</SelectItem>
                  <SelectItem value="arrivee">Arrivée</SelectItem>
                  <SelectItem value="decharge">Déchargée</SelectItem>
                </SelectContent>
              </Select>
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
                        <TableHead>Départ</TableHead>
                        <TableHead>Arrivée</TableHead>
                        <TableHead>Prix Total</TableHead>
                        <TableHead className="text-center">Véhicules</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedConteneurs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {searchTerm ? `Aucun conteneur trouvé pour "${searchTerm}"` : 'Aucun conteneur'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedConteneurs.map((conteneur) => {
                          const status = statusConfig[conteneur.status as keyof typeof statusConfig] || statusConfig.charge;
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
                              <TableCell>
                                {conteneur.dateDepart
                                  ? new Date(conteneur.dateDepart).toLocaleDateString('fr-FR')
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {conteneur.dateArrivee
                                  ? new Date(conteneur.dateArrivee).toLocaleDateString('fr-FR')
                                  : '-'}
                              </TableCell>
                              <TableCell>{(() => {
                                const total = (conteneur.vehicles || []).reduce((sum: number, v: any) => sum + (parseFloat(String(v.totalCost)) || 0), 0);
                                return total > 0 ? formatCurrency(total) : '-';
                              })()}</TableCell>
                              <TableCell className="text-center">{conteneur.vehicles?.length || 0}</TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Select
                                  value={conteneur.status}
                                  onValueChange={(value) => {
                                    updateConteneur.mutate(
                                      { id: conteneur.id, data: { status: value as 'charge' | 'arrivee' | 'decharge' } },
                                      {
                                        onSuccess: () => toast({ title: 'Statut mis à jour' }),
                                        onError: () => toast({ title: 'Erreur', variant: 'destructive' }),
                                      }
                                    );
                                  }}
                                >
                                  <SelectTrigger className="w-[130px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="charge">Chargée</SelectItem>
                                    <SelectItem value="arrivee">Arrivée</SelectItem>
                                    <SelectItem value="decharge">Déchargée</SelectItem>
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
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/conteneurs/${conteneur.id}`); }}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Voir le détail
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Supprimer
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Supprimer ce conteneur ?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Cette action est irréversible. Le conteneur {conteneur.numero} sera définitivement supprimé.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                                          <AlertDialogAction onClick={(e) => {
                                            e.stopPropagation();
                                            deleteConteneur.mutate(conteneur.id, {
                                              onSuccess: () => toast({ title: 'Conteneur supprimé' }),
                                              onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
                                            });
                                          }}>
                                            Supprimer
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
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
                <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} startIndex={startIndex} endIndex={endIndex} onPageChange={goToPage} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
