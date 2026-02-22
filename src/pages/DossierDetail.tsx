import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDossier, useDeleteConteneur } from '@/hooks/useApi';
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
import { ArrowLeft, Building2, Container, Car, Plus, Calendar, Edit, AlertCircle, CreditCard, Pencil, Trash2 } from 'lucide-react';
import { AddConteneurDialog } from '@/components/conteneurs/AddConteneurDialog';
import { EditConteneurDialog } from '@/components/conteneurs/EditConteneurDialog';
import { EditDossierDialog } from '@/components/dossiers/EditDossierDialog';
import { AddPaymentDialog } from '@/components/payments/AddPaymentDialog';
import { DossierAnalytics } from '@/components/dossiers/DossierAnalytics';
import { DossierPaymentLedger } from '@/components/dossiers/DossierPaymentLedger';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  en_cours: { label: 'En cours', className: 'bg-primary/10 text-primary border-primary/30' },
  termine: { label: 'Terminé', className: 'bg-success/10 text-success border-success/30' },
  annule: { label: 'Annulé', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const conteneurStatusConfig = {
  en_chargement: { label: 'En chargement', className: 'bg-warning/10 text-warning border-warning/30' },
  en_transit: { label: 'En transit', className: 'bg-primary/10 text-primary border-primary/30' },
  arrive: { label: 'Arrivé', className: 'bg-success/10 text-success border-success/30' },
  dedouane: { label: 'Dédouané', className: 'bg-muted text-muted-foreground border-muted-foreground/30' },
};

const typeLabels = {
  '20ft': '20 pieds',
  '40ft': '40 pieds',
  '40ft_hc': '40 pieds HC',
};

export default function DossierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [addConteneurOpen, setAddConteneurOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [editConteneurOpen, setEditConteneurOpen] = useState(false);
  const [selectedConteneur, setSelectedConteneur] = useState<any>(null);

  const { data: dossier, isLoading, error } = useDossier(id || '');
  const deleteConteneur = useDeleteConteneur();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dossier) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Dossier non trouvé</p>
          <Button onClick={() => navigate('/dossiers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux dossiers
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = statusConfig[dossier.status as keyof typeof statusConfig] || statusConfig.en_cours;
  const conteneurs = dossier.conteneurs || [];
  const totalVehicles = conteneurs.reduce((sum, c) => sum + (c.vehicles?.length || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => {
            if (dossier.supplierId) {
              navigate(`/suppliers/${dossier.supplierId}`);
            } else {
              navigate('/dossiers');
            }
          }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{dossier.reference}</h1>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">Dossier #{id}</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        </div>

        {/* Dossier Analytics */}
        <DossierAnalytics conteneurs={conteneurs} dossierId={dossier.id} />

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fournisseur</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{dossier.supplier?.name || '-'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dossier.supplier && (
                  <button
                    className="hover:underline text-primary"
                    onClick={() => navigate(`/suppliers/${dossier.supplierId}`)}
                  >
                    Voir le fournisseur →
                  </button>
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Date Création</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {new Date(dossier.dateCreation).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                dans {conteneurs.length} conteneurs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conteneurs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Conteneurs</CardTitle>
              <CardDescription>Liste des conteneurs de ce dossier</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => setAddConteneurOpen(true)}>
              <Plus className="h-4 w-4" />
              Ajouter Conteneur
            </Button>
            <AddConteneurDialog 
              open={addConteneurOpen} 
              onOpenChange={setAddConteneurOpen}
              preSelectedDossierId={dossier.id}
            />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                     <TableHead>Type</TableHead>
                     <TableHead>Date Départ</TableHead>
                     <TableHead className="text-center">Véhicules</TableHead>
                     <TableHead>Statut</TableHead>
                     <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conteneurs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucun conteneur dans ce dossier
                      </TableCell>
                    </TableRow>
                  ) : (
                    conteneurs.map((conteneur) => {
                      const cStatus = conteneurStatusConfig[conteneur.status as keyof typeof conteneurStatusConfig] || conteneurStatusConfig.en_chargement;
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
                          <TableCell>{typeLabels[conteneur.type as keyof typeof typeLabels] || conteneur.type}</TableCell>
                          <TableCell>
                            {conteneur.dateDepart
                              ? new Date(conteneur.dateDepart).toLocaleDateString('fr-FR')
                              : '-'}
                          </TableCell>
                          <TableCell className="text-center">{conteneur.vehicles?.length || 0}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cStatus.className}>
                              {cStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedConteneur(conteneur);
                                  setEditConteneurOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
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
                            </div>
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

        {/* Paiements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Paiements Fournisseur</CardTitle>
              <CardDescription>Suivi des versements pour ce dossier</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => setAddPaymentOpen(true)}>
              <CreditCard className="h-4 w-4" />
              Nouveau Paiement
            </Button>
          </CardHeader>
          <CardContent>
            <DossierPaymentLedger dossierId={dossier.id} />
          </CardContent>
        </Card>
      </div>

      <EditDossierDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        dossier={dossier}
      />

      <AddPaymentDialog
        open={addPaymentOpen}
        onOpenChange={setAddPaymentOpen}
        preSelectedSupplierId={dossier.supplierId}
        preSelectedDossierId={dossier.id}
      />

      <EditConteneurDialog
        open={editConteneurOpen}
        onOpenChange={setEditConteneurOpen}
        conteneur={selectedConteneur}
      />
    </DashboardLayout>
  );
}
