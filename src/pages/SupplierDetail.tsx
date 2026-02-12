import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSupplier, useVehicles } from '@/hooks/useApi';
import { 
  Building2, 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  TrendingUp,
  Car,
  FileText,
  Edit,
  MessageCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const queryClient = useQueryClient();
  const { data: supplier, isLoading, error } = useSupplier(id || '');
  const { data: vehicles } = useVehicles();
  
  const supplierVehicles = (vehicles || []).filter(v => v.supplierId === id);

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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ordered: 'bg-primary/10 text-primary border-primary/20',
      in_transit: 'bg-warning/10 text-warning border-warning/20',
      arrived: 'bg-success/10 text-success border-success/20',
      sold: 'bg-muted text-muted-foreground border-muted',
    };
    const labels: Record<string, string> = {
      ordered: 'Commandé',
      in_transit: 'En transit',
      arrived: 'Arrivé',
      sold: 'Vendu',
    };
    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/suppliers')}
            >
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
          <div className="flex gap-2">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button 
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setDeleteDialogOpen(true)}
            >
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
                  <p className="text-2xl font-bold text-success">{formatCurrency(supplier.totalPaid || 0)}</p>
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
                  <p className="text-2xl font-bold text-primary">{formatCurrency(supplier.creditBalance || 0)}</p>
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
                  <p className="text-2xl font-bold text-danger">{formatCurrency(supplier.remainingDebt || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="vehicles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vehicles">Véhicules ({supplierVehicles.length})</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Véhicules de ce fournisseur</CardTitle>
                <CardDescription>Liste des véhicules commandés auprès de {supplier.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {supplierVehicles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Véhicule</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Prix achat</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date commande</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierVehicles.map((vehicle) => (
                        <TableRow 
                          key={vehicle.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                              <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {vehicle.client ? `${vehicle.client.prenom} ${vehicle.client.nom}` : '-'}
                          </TableCell>
                          <TableCell>{formatCurrency(vehicle.purchasePrice)}</TableCell>
                          <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                          <TableCell>{new Date(vehicle.orderDate).toLocaleDateString('fr-FR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun véhicule enregistré pour ce fournisseur
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique des paiements</CardTitle>
                <CardDescription>Tous les paiements effectués à ce fournisseur</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Aucun paiement enregistré
                </p>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      <EditSupplierDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        supplier={supplier}
      />

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
