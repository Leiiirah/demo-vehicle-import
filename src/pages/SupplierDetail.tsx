import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Dossier, Conteneur, Vehicle } from '@/services/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSupplier, useDossiers, useConteneurs, useVehicles } from '@/hooks/useApi';
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
  ChevronRight,
  ChevronDown,
  Package,
  FolderOpen,
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
  const [expandedDossiers, setExpandedDossiers] = useState<Set<string>>(new Set());
  const [expandedConteneurs, setExpandedConteneurs] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: supplier, isLoading, error } = useSupplier(id || '');
  const { data: allDossiers } = useDossiers();
  const { data: allConteneurs } = useConteneurs();
  const { data: allVehicles } = useVehicles();

  const supplierDossiers = (allDossiers || []).filter(d => d.supplierId === id);
  const supplierVehicles = (allVehicles || []).filter(v => v.supplierId === id);

  const getConteneursForDossier = (dossierId: string) =>
    (allConteneurs || []).filter(c => c.dossierId === dossierId);

  const getVehiclesForConteneur = (conteneurId: string) =>
    (allVehicles || []).filter(v => v.conteneurId === conteneurId);

  const toggleDossier = (dossierId: string) => {
    setExpandedDossiers(prev => {
      const next = new Set(prev);
      if (next.has(dossierId)) next.delete(dossierId);
      else next.add(dossierId);
      return next;
    });
  };

  const toggleConteneur = (conteneurId: string) => {
    setExpandedConteneurs(prev => {
      const next = new Set(prev);
      if (next.has(conteneurId)) next.delete(conteneurId);
      else next.add(conteneurId);
      return next;
    });
  };

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

  const getConteneurStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      en_chargement: 'bg-muted text-muted-foreground border-muted',
      en_transit: 'bg-warning/10 text-warning border-warning/20',
      arrive: 'bg-success/10 text-success border-success/20',
      dedouane: 'bg-primary/10 text-primary border-primary/20',
    };
    const labels: Record<string, string> = {
      en_chargement: 'En chargement',
      en_transit: 'En transit',
      arrive: 'Arrivé',
      dedouane: 'Dédouané',
    };
    return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
  };

  const getVehicleStatusBadge = (status: string) => {
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

        {/* Hierarchical Dossiers → Conteneurs → Véhicules */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Dossiers ({supplierDossiers.length})
          </h2>

          {supplierDossiers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
              Aucun dossier pour ce fournisseur
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              {supplierDossiers.map((dossier) => {
                const isDossierExpanded = expandedDossiers.has(dossier.id);
                const conteneurs = getConteneursForDossier(dossier.id);
                return (
                  <div key={dossier.id} className="border-b border-border last:border-b-0">
                    {/* Dossier row */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleDossier(dossier.id)}
                    >
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        {isDossierExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                      <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{dossier.reference}</span>
                      {getDossierStatusBadge(dossier.status)}
                      <span className="text-sm text-muted-foreground ml-auto">
                        {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conteneurs.length} conteneur{conteneurs.length !== 1 ? 's' : ''}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={(e) => { e.stopPropagation(); navigate(`/dossiers/${dossier.id}`); }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Conteneurs under dossier */}
                    {isDossierExpanded && (
                      <div className="bg-muted/30">
                        {conteneurs.length === 0 ? (
                          <div className="pl-16 py-3 text-sm text-muted-foreground">
                            Aucun conteneur dans ce dossier
                          </div>
                        ) : (
                          conteneurs.map((conteneur) => {
                            const isConteneurExpanded = expandedConteneurs.has(conteneur.id);
                            const vehicles = getVehiclesForConteneur(conteneur.id);
                            return (
                              <div key={conteneur.id}>
                                {/* Conteneur row */}
                                <div
                                  className="flex items-center gap-3 pl-12 pr-4 py-2.5 hover:bg-muted/50 cursor-pointer"
                                  onClick={() => toggleConteneur(conteneur.id)}
                                >
                                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                    {isConteneurExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                  </Button>
                                  <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <span className="font-medium text-foreground text-sm">{conteneur.numero}</span>
                                  <Badge variant="outline" className="text-xs">{conteneur.type}</Badge>
                                  {getConteneurStatusBadge(conteneur.status)}
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    {vehicles.length} véhicule{vehicles.length !== 1 ? 's' : ''}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/conteneurs/${conteneur.id}`); }}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>

                                {/* Vehicles table under conteneur */}
                                {isConteneurExpanded && (
                                  <div className="pl-20 pr-4 pb-3">
                                    {vehicles.length === 0 ? (
                                      <div className="py-3 text-sm text-muted-foreground">
                                        Aucun véhicule dans ce conteneur
                                      </div>
                                    ) : (
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="text-xs">Véhicule</TableHead>
                                            <TableHead className="text-xs">VIN</TableHead>
                                            <TableHead className="text-xs text-right">Prix achat</TableHead>
                                            <TableHead className="text-xs">Statut</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {vehicles.map((vehicle) => (
                                            <TableRow
                                              key={vehicle.id}
                                              className="cursor-pointer hover:bg-muted/50"
                                              onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${vehicle.id}`); }}
                                            >
                                              <TableCell className="text-sm">
                                                <div className="flex items-center gap-2">
                                                  <Car className="h-3.5 w-3.5 text-muted-foreground" />
                                                  <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
                                                  <span className="text-muted-foreground">{vehicle.year}</span>
                                                </div>
                                              </TableCell>
                                              <TableCell className="text-sm text-muted-foreground font-mono">{vehicle.vin}</TableCell>
                                              <TableCell className="text-sm text-right">{formatCurrency(vehicle.purchasePrice)}</TableCell>
                                              <TableCell>{getVehicleStatusBadge(vehicle.status)}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
