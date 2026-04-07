import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useClient, useUpdateClient, useDeleteClient, useSalesByClient, useAddSalePayment } from '@/hooks/useApi';
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
  Trash2,
  FileText,
  Wallet,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EditClientDialog } from '@/components/clients/EditClientDialog';
import { AssignVehicleDialog } from '@/components/clients/AssignVehicleDialog';
import { ClientVehiclesSection } from '@/components/clients/ClientVehiclesSection';
import { Car } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { exportClientTransactionsPDF } from '@/lib/exportClientTransactionsPDF';

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  
  const { data: client, isLoading, error } = useClient(id || '');
  const { data: clientSales = [] } = useSalesByClient(id || '');
  const addSalePayment = useAddSalePayment();
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

  // Compute from vehicles data
  const soldVehicles = (client.vehicles || []).filter((v: any) => v.sellingPrice != null);
  const totalPrixVente = soldVehicles.reduce((sum: number, v: any) => sum + Number(v.sellingPrice || 0), 0);
  const totalCoutRevient = soldVehicles.reduce((sum: number, v: any) => sum + Number(v.totalCost || 0), 0);
  const benefice = totalPrixVente - totalCoutRevient;
  const detteBenefice = benefice * (client.pourcentageBenefice || 0) / 100;
  const totalAmountPaid = soldVehicles.reduce((sum: number, v: any) => sum + Number(v.amountPaid || 0), 0);
  const totalRemaining = Math.max(0, totalPrixVente - totalAmountPaid);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
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
                  <p className="text-lg font-bold">{formatCurrency(totalPrixVente)}</p>
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
                  <p className="text-lg font-bold text-warning">{formatCurrency(detteBenefice)}</p>
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
                <span className="font-medium">{formatCurrency(totalPrixVente)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coût de revient</span>
                <span className="font-medium">- {formatCurrency(totalCoutRevient)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-medium">Bénéfice</span>
                <span className="font-bold text-success">{formatCurrency(benefice)}</span>
              </div>
              <div className="flex justify-between bg-warning/10 p-3 rounded-lg">
                <span className="font-medium">Part client ({client.pourcentageBenefice || 0}%)</span>
                <span className="font-bold text-warning">{formatCurrency(detteBenefice)}</span>
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
                    {formatCurrency(detteBenefice)}
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

          {/* Ventes groupées */}
          {clientSales.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Ventes
                  <Badge variant="secondary" className="ml-1">{clientSales.length}</Badge>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    exportClientTransactionsPDF(client, soldVehicles);
                    toast.success('PDF généré avec succès');
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Exporter PDF
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-accent/50">
                    <p className="text-xs text-muted-foreground">Total prix de vente</p>
                    <p className="text-lg font-bold">{formatCurrency(totalPrixVente)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10">
                    <p className="text-xs text-muted-foreground">Total payé</p>
                    <p className="text-lg font-bold text-success">{formatCurrency(totalAmountPaid)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/10">
                    <p className="text-xs text-muted-foreground">Reste à payer</p>
                    <p className="text-lg font-bold text-destructive">{formatCurrency(totalRemaining)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {clientSales.map((sale: any, idx: number) => {
                    const saleVehicles = sale.vehicles || [];
                    const saleDebt = Number(sale.debt) || 0;
                    const saleCarriedDebt = Number(sale.carriedDebt) || 0;
                    const salePaid = Number(sale.amountPaid) || 0;
                    const saleTotalSelling = Number(sale.totalSellingPrice) || 0;

                    return (
                      <div key={sale.id} className="rounded-lg border border-border">
                        <div className="flex items-center justify-between p-4 bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">#{idx + 1}</span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                Vente du {new Date(sale.date).toLocaleDateString('fr-FR')}
                                <Badge variant="secondary" className="ml-2 text-xs">{saleVehicles.length} véhicule(s)</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Total: {formatCurrency(saleTotalSelling)}
                                {saleCarriedDebt > 0 && (
                                  <span className="text-warning ml-2">+ {formatCurrency(saleCarriedDebt)} dette reportée</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {saleDebt > 0 ? (
                              <Badge variant="outline" className="border-destructive text-destructive">
                                Dette: {formatCurrency(saleDebt)}
                              </Badge>
                            ) : (
                              <Badge className="bg-success/10 text-success border-success/20" variant="outline">Soldé</Badge>
                            )}
                          </div>
                        </div>
                        <div className="rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Véhicule</TableHead>
                                <TableHead className="text-right">Prix de vente</TableHead>
                                <TableHead className="text-right">Coût de revient</TableHead>
                                <TableHead className="text-right">Bénéfice</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {saleVehicles.map((v: any) => {
                                const sp = Number(v.sellingPrice || 0);
                                const tc = Number(v.totalCost || 0);
                                return (
                                  <TableRow key={v.id}>
                                    <TableCell className="font-medium">{v.brand} {v.model} ({v.year})</TableCell>
                                    <TableCell className="text-right">{formatCurrency(sp)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(tc)}</TableCell>
                                    <TableCell className="text-right">
                                      <span className={sp - tc >= 0 ? 'text-success' : 'text-destructive'}>
                                        {formatCurrency(sp - tc)}
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Véhicules assignés (legacy - without sale) */}
          {client.vehicles && client.vehicles.filter((v: any) => !v.saleId).length > 0 && (
            <ClientVehiclesSection vehicles={client.vehicles.filter((v: any) => !v.saleId)} />
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
