import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSuppliers } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { api } from '@/services/api';
import { Building2, AlertCircle, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AddSupplierDialog } from '@/components/suppliers/AddSupplierDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const SuppliersPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: suppliers, isLoading, error } = useSuppliers();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Fournisseur supprimé avec succès');
      setSupplierToDelete(null);
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Erreur de chargement des fournisseurs</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const suppliersList = suppliers || [];
  const { paginatedItems: paginatedSuppliers, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } = usePagination(suppliersList);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Fournisseurs</h1>
            <p className="text-muted-foreground">
              Gérez vos fournisseurs et les soldes de paiement
            </p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Ajouter fournisseur
          </Button>
        </div>

        {/* Cartes récapitulatives */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <div className="kpi-card">
                <p className="kpi-label">Total fournisseurs</p>
                <p className="kpi-value">{suppliersList.length}</p>
              </div>
              <div className="kpi-card border-l-4 border-l-success">
                <p className="kpi-label">Total payé</p>
                <p className="kpi-value text-success">
                  {formatCurrency(suppliersList.reduce((sum, s) => sum + (parseFloat(String(s.totalPaid)) || 0), 0))}
                </p>
              </div>
              <div className="kpi-card border-l-4 border-l-danger">
                <p className="kpi-label">Dette totale en cours</p>
                <p className="kpi-value text-danger">
                  {formatCurrency(suppliersList.reduce((sum, s) => sum + (s.remainingDebt || 0), 0))}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Table fournisseurs */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : suppliersList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Aucun fournisseur trouvé
          </div>
        ) : (
          <>
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">Véhicules</TableHead>
                    <TableHead className="text-right">Total payé</TableHead>
                    <TableHead className="text-right">Solde crédit</TableHead>
                    <TableHead className="text-right">Dette restante</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSuppliers.map((supplier) => (
                    <TableRow
                      key={supplier.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/suppliers/${supplier.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{supplier.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{supplier.vehiclesSupplied || 0}</TableCell>
                      <TableCell className="text-right text-success font-medium">
                        {formatCurrency(supplier.totalPaid || 0)}
                      </TableCell>
                      <TableCell className="text-right text-primary font-medium">
                        {formatCurrency(supplier.creditBalance || 0)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        (supplier.remainingDebt || 0) > 0 ? 'text-danger' : 'text-success'
                      }`}>
                        {formatCurrency(supplier.remainingDebt || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/suppliers/${supplier.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setSupplierToDelete({ id: supplier.id, name: supplier.name })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} startIndex={startIndex} endIndex={endIndex} onPageChange={goToPage} />
          </>
        )}
      </div>

      <AddSupplierDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      <AlertDialog open={!!supplierToDelete} onOpenChange={(open) => !open && setSupplierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le fournisseur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{supplierToDelete?.name}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => supplierToDelete && deleteMutation.mutate(supplierToDelete.id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default SuppliersPage;
