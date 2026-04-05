import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDossiers, useDeleteDossier } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Search, FolderOpen, Building2, Container, Car, AlertCircle, Trash2, MoreVertical } from 'lucide-react';
import { AddDossierDialog } from '@/components/dossiers/AddDossierDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  en_cours: { label: 'En cours', className: 'bg-primary/10 text-primary border-primary/30' },
  solde: { label: 'Soldé', className: 'bg-success/10 text-success border-success/30' },
  annule: { label: 'Annulé', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export default function DossiersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: dossiers, isLoading, error } = useDossiers();
  const deleteMutation = useDeleteDossier();

  const filteredDossiers = (dossiers || []).filter(
    (dossier) =>
      dossier.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dossier.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const { paginatedItems: paginatedDossiers, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } = usePagination(filteredDossiers);

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Erreur de chargement des dossiers</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalConteneurs = (dossiers || []).reduce((acc, d) => acc + (d.conteneurs?.length || 0), 0);
  const totalVehicles = (dossiers || []).reduce((acc, d) => {
    return acc + (d.conteneurs?.reduce((sum, c) => sum + (c.vehicles?.length || 0), 0) || 0);
  }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dossiers</h1>
            <p className="text-muted-foreground">Gérez vos commandes d'importation</p>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouveau Dossier
          </Button>
        </div>

        <AddDossierDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Dossiers</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(dossiers || []).length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conteneurs</CardTitle>
                  <Container className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalConteneurs}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVehicles}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Dossiers</CardTitle>
            <CardDescription>Cliquez sur un dossier pour voir ses détails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par référence ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>Date Création</TableHead>
                        <TableHead className="text-center">Conteneurs</TableHead>
                        <TableHead className="text-center">Véhicules</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {paginatedDossiers.length === 0 ? (
                         <TableRow>
                           <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                             {searchTerm ? `Aucun dossier trouvé pour "${searchTerm}"` : 'Aucun dossier'}
                           </TableCell>
                         </TableRow>
                       ) : (
                        paginatedDossiers.map((dossier) => {
                          const status = statusConfig[dossier.status as keyof typeof statusConfig] || statusConfig.en_cours;
                          const conteneurCount = dossier.conteneurs?.length || 0;
                          const vehicleCount = dossier.conteneurs?.reduce((sum, c) => sum + (c.vehicles?.length || 0), 0) || 0;
                          return (
                            <TableRow
                              key={dossier.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => navigate(`/dossiers/${dossier.id}`)}
                            >
                              <TableCell className="font-medium">{dossier.reference}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  {dossier.supplier?.name || '-'}
                                </div>
                              </TableCell>
                              <TableCell>{new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}</TableCell>
                              <TableCell className="text-center">{conteneurCount}</TableCell>
                              <TableCell className="text-center">{vehicleCount}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={status.className}>
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <AlertDialog open={deleteConfirmId === dossier.id} onOpenChange={(open) => setDeleteConfirmId(open ? dossier.id : null)}>
                                   <AlertDialogTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                       <Trash2 className="h-4 w-4 text-destructive" />
                                     </Button>
                                   </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer le dossier</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer le dossier "{dossier.reference}"? Cette action est irréversible.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="flex gap-3 justify-end">
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                       <AlertDialogAction
                                         className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                          deleteMutation.mutate(dossier.id, {
                                            onSuccess: () => {
                                              toast({
                                                title: 'Succès',
                                                description: 'Dossier supprimé avec succès',
                                              });
                                              setDeleteConfirmId(null);
                                            },
                                            onError: (error: any) => {
                                              toast({
                                                title: 'Erreur',
                                                description: error.message || 'Erreur lors de la suppression',
                                                variant: 'destructive',
                                              });
                                            },
                                          });
                                        }}
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </div>
                                   </AlertDialogContent>
                                 </AlertDialog>
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
