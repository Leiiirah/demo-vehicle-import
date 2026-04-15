import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useClient, useDeleteClient, useSalesByClient, useUpdateVehicle } from '@/hooks/useApi';
import { useCreateCaisseEntry } from '@/hooks/useCaisse';
import { formatCurrency } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Edit,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Mail,
  Building2,
  Trash2,
  FileText,
  Wallet,
  CreditCard,
  Car,
  CalendarIcon,
  Download,
  Landmark,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { EditClientDialog } from '@/components/clients/EditClientDialog';
import { AssignVehicleDialog } from '@/components/clients/AssignVehicleDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { exportClientTransactionsPDF } from '@/lib/exportClientTransactionsPDF';

const getMonthOptions = () => {
  const options = [{ value: 'all', label: 'Toutes les périodes' }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = subMonths(now, i);
    options.push({
      value: format(d, 'yyyy-MM'),
      label: format(d, 'MMMM yyyy', { locale: fr }),
    });
  }
  return options;
};

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  const { data: client, isLoading, error } = useClient(id || '');
  const { data: clientSales = [] } = useSalesByClient(id || '');
  const deleteClient = useDeleteClient();
  const updateVehicle = useUpdateVehicle();
  const createCaisseEntry = useCreateCaisseEntry();

  // Versement dialog state
  const [versementDialogOpen, setVersementDialogOpen] = useState(false);
  const [versementVehicle, setVersementVehicle] = useState<any>(null);
  const [versementAmount, setVersementAmount] = useState('');
  const [versementMode, setVersementMode] = useState<'versement' | 'virement'>('versement');

  const monthOptions = useMemo(() => getMonthOptions(), []);

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

  const handleVersementSubmit = () => {
    if (!versementVehicle || !versementAmount) return;
    const amount = Number(versementAmount);
    if (amount <= 0) return;

    const currentPaid = Number(versementVehicle.amountPaid || 0);
    const newAmountPaid = currentPaid + amount;
    const sellingPrice = Number(versementVehicle.sellingPrice || 0);
    const isFull = newAmountPaid >= sellingPrice;

    updateVehicle.mutate(
      {
        id: versementVehicle.id,
        data: {
          paymentStatus: isFull ? 'solde' : 'versement',
          amountPaid: isFull ? sellingPrice : newAmountPaid,
          ...(isFull ? {
            status: 'sold',
            soldDate: versementVehicle.soldDate || new Date().toISOString().split('T')[0],
          } : {}),
        },
      },
      {
        onSuccess: () => {
          createCaisseEntry.mutate({
            type: 'entree',
            montant: amount,
            date: new Date().toISOString().split('T')[0],
            description: `${versementMode === 'virement' ? 'Virement' : 'Versement'} ${versementVehicle.brand} ${versementVehicle.model} ${versementVehicle.year} — ${client?.nom || ''} ${client?.prenom || ''}`.trim(),
            vehicleId: versementVehicle.id,
            paymentMethod: versementMode,
          });
          toast.success(isFull ? 'Paiement complet — véhicule soldé' : 'Versement enregistré');
          setVersementDialogOpen(false);
          setVersementVehicle(null);
          setVersementAmount('');
          setVersementMode('versement');
        },
        onError: () => toast.error('Erreur lors du paiement'),
      },
    );
  };


  const allVehicles = useMemo(() => (client?.vehicles || []).filter((v: any) => v.sellingPrice != null), [client]);

  const filteredVehicles = useMemo(() => {
    if (dateFilter === 'all') return allVehicles;
    const [year, month] = dateFilter.split('-').map(Number);
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    return allVehicles.filter((v: any) => {
      const d = new Date(v.soldDate || v.createdAt);
      return d >= start && d <= end;
    });
  }, [allVehicles, dateFilter]);

  // Filter sales by date
  const filteredSales = useMemo(() => {
    if (dateFilter === 'all') return clientSales;
    const [year, month] = dateFilter.split('-').map(Number);
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    return clientSales.filter((s: any) => {
      const d = new Date(s.date);
      return d >= start && d <= end;
    });
  }, [clientSales, dateFilter]);

  const filteredStats = useMemo(() => {
    const totalVentes = filteredVehicles.reduce((sum: number, v: any) => sum + Number(v.sellingPrice || 0), 0);
    const totalPaye = filteredVehicles.reduce((sum: number, v: any) => sum + Number(v.amountPaid || 0), 0);
    const resteAPayer = totalVentes - totalPaye;
    return { vehiclesCount: filteredVehicles.length, totalVentes, totalPaye, resteAPayer };
  }, [filteredVehicles]);

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
              <div className="h-16 w-16 rounded-xl bg-success/10 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-success" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{client.nom} {client.prenom}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{client.telephone || '-'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => {
              const soldVehicles = (client.vehicles || []).filter((v: any) => v.sellingPrice != null);
              exportClientTransactionsPDF(client, soldVehicles);
              toast.success('Rapport exporté');
            }}>
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
            <Button variant="outline" onClick={() => setAssignDialogOpen(true)}>
              <Car className="h-4 w-4 mr-2" />
              Affecter véhicule
            </Button>
            <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* Date Filter + KPIs */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Véhicules vendus</p>
                    <p className="text-2xl font-bold">{filteredStats.vehiclesCount}</p>
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
                    <p className="text-sm text-muted-foreground">Total ventes</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(filteredStats.totalVentes)}</p>
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
                    <p className="text-2xl font-bold text-success">{formatCurrency(filteredStats.totalPaye)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={`border-l-4 ${filteredStats.resteAPayer > 0 ? 'border-l-danger' : filteredStats.resteAPayer < 0 ? 'border-l-success' : 'border-l-muted'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${filteredStats.resteAPayer > 0 ? 'bg-danger/10' : filteredStats.resteAPayer < 0 ? 'bg-success/10' : 'bg-muted/10'}`}>
                    <FileText className={`h-5 w-5 ${filteredStats.resteAPayer > 0 ? 'text-danger' : filteredStats.resteAPayer < 0 ? 'text-success' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {filteredStats.resteAPayer > 0 ? 'Reste à payer' : filteredStats.resteAPayer < 0 ? 'Crédit client' : 'Solde'}
                    </p>
                    <p className={`text-2xl font-bold ${filteredStats.resteAPayer > 0 ? 'text-danger' : filteredStats.resteAPayer < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      {filteredStats.resteAPayer > 0 ? '-' : filteredStats.resteAPayer < 0 ? '+' : ''}{formatCurrency(Math.abs(filteredStats.resteAPayer))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Informations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Ventes groupées */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Ventes ({filteredSales.length})
            </h2>
          </div>

          {filteredSales.length === 0 ? (
            <div className="bg-card rounded-xl border border-border shadow-sm p-12 text-center text-muted-foreground">
              Aucune vente pour ce client
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.map((sale: any, idx: number) => {
                const saleVehicles = sale.vehicles || [];
                const saleDebt = Number(sale.debt) || 0;
                const saleCarriedDebt = Number(sale.carriedDebt) || 0;
                const saleTotalSelling = Number(sale.totalSellingPrice) || 0;

                return (
                  <div key={sale.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      <EditClientDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} client={client} />
      <AssignVehicleDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen} clientId={client.id} clientName={`${client.nom} ${client.prenom}`} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{client.nom} {client.prenom}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default ClientDetailPage;
