import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSupplier, useDossiers, useVehicles, usePayments } from '@/hooks/useApi';
import { exportSupplierDossiers, exportSupplierTransactions } from '@/lib/exportSupplierData';
import { 
  Building2, 
  ArrowLeft, 
  MapPin, 
  CreditCard,
  TrendingUp,
  Car,
  FileText,
  Edit,
  AlertCircle,
  Trash2,
  FolderOpen,
  Plus,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EditSupplierDialog } from '@/components/suppliers/EditSupplierDialog';
import { AddDossierDialog } from '@/components/dossiers/AddDossierDialog';
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
import { toast } from 'sonner';

const SupplierDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDossierOpen, setAddDossierOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: supplier, isLoading, error } = useSupplier(id || '');
  const { data: allDossiers } = useDossiers();
  const { data: allVehicles } = useVehicles();
  const { data: allPayments } = usePayments();

  const supplierDossiers = (allDossiers || []).filter(d => d.supplierId === id);
  const supplierVehicles = (allVehicles || []).filter(v => v.supplierId === id);
  const supplierPayments = (allPayments || []).filter(p => p.supplierId === id);

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteSupplier(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Fournisseur supprimé avec succès');
      navigate('/suppliers');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });


  const getDossierStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      en_cours: 'bg-primary/10 text-primary border-primary/20',
      termine: 'bg-success/10 text-success border-success/20',
      annule: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    const labels: Record<string, string> = {
      en_cours: 'En cours',
      termine: 'Terminé',
      annule: 'Annulé',
    };
    return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !supplier) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Fournisseur non trouvé</p>
          <Button onClick={() => navigate('/suppliers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux fournisseurs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-accent flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{supplier.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{supplier.location}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { exportSupplierDossiers(supplier.name, supplierDossiers, supplierVehicles); toast.success('Dossiers exportés'); }}>
              <Download className="h-4 w-4 mr-2" />
              Exporter Dossiers
            </Button>
            <Button variant="outline" onClick={() => { exportSupplierTransactions(supplier.name, supplierPayments, supplier); toast.success('Transactions exportées'); }}>
              <Download className="h-4 w-4 mr-2" />
              Exporter Transactions
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Véhicules fournis</p>
                  <p className="text-2xl font-bold">{supplier.vehiclesSupplied || supplierVehicles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total payé</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(supplier.totalPaid || 0, 'USD')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Solde crédit</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(supplier.creditBalance || 0, 'USD')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-danger/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-danger" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dette restante</p>
                  <p className="text-2xl font-bold text-danger">{formatCurrency(supplier.remainingDebt || 0, 'USD')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dossiers Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Dossiers ({supplierDossiers.length})
            </h2>
            <Button className="gap-2" onClick={() => setAddDossierOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouveau Dossier
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Conteneurs</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierDossiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      Aucun dossier pour ce fournisseur
                    </TableCell>
                  </TableRow>
                ) : (
                  supplierDossiers.map((dossier) => (
                    <TableRow
                      key={dossier.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/dossiers/${dossier.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4 text-primary" />
                          {dossier.reference}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {dossier.conteneurs?.length || 0} conteneur{(dossier.conteneurs?.length || 0) !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell>{getDossierStatusBadge(dossier.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <EditSupplierDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} supplier={supplier} />

      <AddDossierDialog open={addDossierOpen} onOpenChange={setAddDossierOpen} preSelectedSupplierId={id} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le fournisseur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{supplier.name}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default SupplierDetailPage;
