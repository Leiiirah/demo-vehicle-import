import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useClient, useUpdateClient, useDeleteClient } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Edit,
  ShoppingCart,
  Percent,
  Check,
  X,
  TrendingUp,
  AlertCircle,
  Mail,
  Building2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EditClientDialog } from '@/components/clients/EditClientDialog';
import { AssignVehicleDialog } from '@/components/clients/AssignVehicleDialog';
import { ClientVehiclesSection } from '@/components/clients/ClientVehiclesSection';
import { Car } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  
  const { data: client, isLoading, error } = useClient(id || '');
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const handleDelete = () => {
    if (!id) return;
    deleteClient.mutate(id, {
      onSuccess: () => {
        toast.success('Client supprimé');
        navigate('/clients');
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    });
  };


  const handleMarkAsPaid = () => {
    if (client) {
      updateClient.mutate({ id: client.id, data: { paye: true } });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-32" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !client) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Client non trouvé</p>
          <Button onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux clients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const benefice = (client.prixVente || 0) - (client.coutRevient || 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/clients')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-success/10 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-success" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-foreground">
                    {client.nom} {client.prenom}
                  </h1>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Client
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {client.pourcentageBenefice || 0}% du bénéfice
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(true)}
            >
              <Car className="h-4 w-4 mr-2" />
              Affecter un véhicule
            </Button>
            <Button 
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
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
                  <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Le client {client.nom} {client.prenom} sera définitivement supprimé.
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
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pourcentage</p>
                  <p className="text-2xl font-bold text-primary">{client.pourcentageBenefice || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prix vente</p>
                  <p className="text-lg font-bold">{formatCurrency(client.prixVente || 0)}</p>
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
                  <p className="text-sm text-muted-foreground">Bénéfice</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(benefice)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dette client</p>
                  <p className="text-lg font-bold text-warning">{formatCurrency(client.detteBenefice || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.telephone}</span>
              </div>
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.adresse && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{client.adresse}</span>
                </div>
              )}
              {client.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{client.company}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calcul du bénéfice */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calcul du bénéfice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix de vente</span>
                <span className="font-medium">{formatCurrency(client.prixVente || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coût de revient</span>
                <span className="font-medium">- {formatCurrency(client.coutRevient || 0)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-medium">Bénéfice</span>
                <span className="font-bold text-success">{formatCurrency(benefice)}</span>
              </div>
              <div className="flex justify-between bg-warning/10 p-3 rounded-lg">
                <span className="font-medium">Part client ({client.pourcentageBenefice || 0}%)</span>
                <span className="font-bold text-warning">{formatCurrency(client.detteBenefice || 0)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Statut paiement */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Statut du paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-warning/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Dette totale</p>
                  <p className="text-2xl font-bold text-warning mt-1">
                    {formatCurrency(client.detteBenefice || 0)}
                  </p>
                </div>
                <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <div className="mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
                        client.paye
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      )}
                    >
                      {client.paye ? (
                        <>
                          <Check className="h-4 w-4" />
                          Payé
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          Non payé
                        </>
                      )}
                    </span>
                  </div>
                </div>
                {!client.paye && (
                  <div className="flex items-center">
                    <Button 
                      className="bg-success text-success-foreground hover:bg-success/90"
                      onClick={handleMarkAsPaid}
                      disabled={updateClient.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Marquer comme payé
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Véhicules assignés / Ventes */}
          {client.vehicles && client.vehicles.length > 0 && (
            <ClientVehiclesSection vehicles={client.vehicles} />
          )}
        </div>
      </div>

      <EditClientDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        client={client}
      />
      <AssignVehicleDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        clientId={client.id}
        clientName={`${client.nom} ${client.prenom}`}
      />
    </DashboardLayout>
  );
};

export default ClientDetailPage;
