import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useConteneur, useDeleteConteneur, useDeleteVehicle } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Container, FolderOpen, Car, Edit, Plus, Ship, Anchor, AlertCircle, Trash2 } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { AffecterVehiculeDialog } from '@/components/conteneurs/AffecterVehiculeDialog';
import { VehicleStatusSelect } from '@/components/vehicles/VehicleStatusSelect';
import { EditConteneurDialog } from '@/components/conteneurs/EditConteneurDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const statusConfig = {
  charge: { label: 'Chargée', className: 'bg-warning/10 text-warning border-warning/30' },
  decharge: { label: 'Déchargée', className: 'bg-success/10 text-success border-success/30' },
};

const vehicleStatusConfig = {
  ordered: { label: 'En stock', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  in_transit: { label: 'Chargée', className: 'bg-primary/10 text-primary border-primary/30' },
  arrived: { label: 'Arrivé', className: 'bg-success/10 text-success border-success/30' },
  sold: { label: 'Vendu', className: 'bg-muted text-muted-foreground border-muted-foreground/30' },
};

const typeLabels = {
  '20ft': '20 pieds',
  '40ft': '40 pieds',
  '40ft_hc': '40 pieds HC',
};

export default function ConteneurDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [affecterVehiculeOpen, setAffecterVehiculeOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: conteneur, isLoading, error } = useConteneur(id || '');
  const dossierId = conteneur?.dossierId;
  const { data: dossierPaymentStats } = useQuery<{ progress: number }>({
    queryKey: ['payments', 'dossier', dossierId, 'stats'],
    queryFn: () => api.request(`/api/payments/dossier/${dossierId}/stats`),
    enabled: !!dossierId,
  });
  const isDossierFullyPaid = (dossierPaymentStats?.progress ?? 0) >= 100;
  const deleteConteneur = useDeleteConteneur();
  const deleteVehicle = useDeleteVehicle();

  const handleDelete = () => {
    if (!id) return;
    deleteConteneur.mutate(id, {
      onSuccess: () => {
        toast.success('Conteneur supprimé');
        navigate('/conteneurs');
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !conteneur) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Conteneur non trouvé</p>
          <Button onClick={() => navigate('/conteneurs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux conteneurs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = statusConfig[conteneur.status as keyof typeof statusConfig] || statusConfig.charge;
  const vehicules = conteneur.vehicles || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Container className="h-8 w-8 text-muted-foreground" />
              <h1 className="text-3xl font-bold tracking-tight">{conteneur.numero}</h1>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">Conteneur #{id}</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce conteneur ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le conteneur {conteneur.numero} et ses données seront définitivement supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dossier</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{conteneur.dossier?.reference || '-'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {conteneur.dossier && (
                  <button
                    className="hover:underline text-primary"
                    onClick={() => navigate(`/dossiers/${conteneur.dossierId}`)}
                  >
                    Voir le dossier →
                  </button>
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Type</CardTitle>
              <Container className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{typeLabels[conteneur.type as keyof typeof typeLabels] || conteneur.type}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicules.length}</div>
            </CardContent>
          </Card>
          {isDossierFullyPaid && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coût total</CardTitle>
                <Ship className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {(() => {
                  const totalPurchase = vehicules.reduce((sum, v) => sum + Number(v.purchasePrice || 0), 0);
                  const totalTransport = Number(conteneur.coutTransport || 0);
                  const coutTotal = totalPurchase + totalTransport;
                  return (
                    <div>
                      <div className="text-lg font-bold">{formatCurrency(coutTotal, 'USD')}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Achat: {formatCurrency(totalPurchase, 'USD')} + Transport: {formatCurrency(totalTransport, 'USD')}
                      </p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Trajet</CardTitle>
            <CardDescription>Suivi du transport maritime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-success/10 mx-auto mb-2">
                  <Ship className="h-6 w-6 text-success" />
                </div>
                <p className="font-medium">Port de départ</p>
                {conteneur.dateDepart ? (
                  <p className="text-sm text-muted-foreground">
                    {new Date(conteneur.dateDepart).toLocaleDateString('fr-FR')}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Non défini</p>
                )}
              </div>
              <div className="flex-1 mx-4">
                <div className="h-1 bg-muted rounded-full relative">
                  <div
                    className="absolute h-1 bg-primary rounded-full"
                    style={{ 
                      width: conteneur.status === 'decharge' ? '100%' : '10%' 
                    }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className={`flex items-center justify-center h-12 w-12 rounded-full mx-auto mb-2 ${conteneur.dateArrivee ? 'bg-success/10' : 'bg-muted'}`}>
                  <Anchor className={`h-6 w-6 ${conteneur.dateArrivee ? 'text-success' : 'text-muted-foreground'}`} />
                </div>
                <p className="font-medium">Port d'arrivée</p>
                {conteneur.dateArrivee ? (
                  <p className="text-sm text-muted-foreground">
                    {new Date(conteneur.dateArrivee).toLocaleDateString('fr-FR')}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">En attente</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Véhicules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Véhicules</CardTitle>
              <CardDescription>Véhicules chargés dans ce conteneur</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => setAffecterVehiculeOpen(true)}>
              <Plus className="h-4 w-4" />
              Affecter Véhicule
            </Button>
            <AffecterVehiculeDialog 
              open={affecterVehiculeOpen} 
              onOpenChange={setAffecterVehiculeOpen}
              conteneurId={conteneur.id}
              conteneurNumero={conteneur.numero}
            />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Passeport</TableHead>
                    <TableHead>Prix d'achat</TableHead>
                    <TableHead>Transport</TableHead>
                    <TableHead>Passeport (DZD)</TableHead>
                    <TableHead>Transit (DZD)</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        Aucun véhicule dans ce conteneur
                      </TableCell>
                    </TableRow>
                  ) : (
                    vehicules.map((vehicule) => {
                      const vStatus = vehicleStatusConfig[vehicule.status as keyof typeof vehicleStatusConfig] || vehicleStatusConfig.ordered;
                      return (
                        <TableRow
                          key={vehicule.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/vehicles/${vehicule.id}`)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {vehicule.photoUrl ? <img src={vehicule.photoUrl} alt={`${vehicule.brand} ${vehicule.model}`} className="h-8 w-8 rounded object-cover" /> : <div className="h-8 w-8 rounded bg-muted flex items-center justify-center"><Car className="h-4 w-4 text-muted-foreground" /></div>}
                              <div>
                                <p>{vehicule.brand} {vehicule.model}</p>
                                <p className="text-xs text-muted-foreground">{vehicule.year}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">{vehicule.vin}</code>
                          </TableCell>
                          <TableCell>
                            {vehicule.passeport ? (
                              <span
                                className="text-primary hover:underline cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/passeports/${vehicule.passeport.id}`);
                                }}
                              >
                                {vehicule.passeport.prenom} {vehicule.passeport.nom}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{formatCurrency(Number(vehicule.purchasePrice || 0), 'USD')}</TableCell>
                          <TableCell>{formatCurrency(Number(vehicule.transportCost || 0), 'USD')}</TableCell>
                          <TableCell>{formatCurrency(Number(vehicule.passeportCost || 0))}</TableCell>
                          <TableCell>{formatCurrency(Number(vehicule.localFees || 0))}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <VehicleStatusSelect vehicleId={vehicule.id} currentStatus={vehicule.status} />
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. Le véhicule {vehicule.brand} {vehicule.model} sera définitivement supprimé.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={(e) => {
                                    e.stopPropagation();
                                    deleteVehicle.mutate(vehicule.id, {
                                      onSuccess: () => toast.success('Véhicule supprimé'),
                                      onError: () => toast.error('Erreur lors de la suppression'),
                                    });
                                  }}>
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
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
          </CardContent>
        </Card>
      </div>

      <EditConteneurDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        conteneur={conteneur}
      />
    </DashboardLayout>
  );
}
