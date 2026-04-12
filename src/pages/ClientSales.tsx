import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Users, Search, Download, Loader2, TrendingUp, DollarSign,
  Car, CheckCircle, Clock, Eye, Trash2, FileText, Wallet, CreditCard, ChevronDown, ExternalLink, Landmark,
} from 'lucide-react';
import { useClients, useVehicles, useDeleteClient, useUpdateVehicle, useSales, useAddSalePayment } from '@/hooks/useApi';
import { useCreateCaisseEntry } from '@/hooks/useCaisse';
import { AssignVehicleDialog } from '@/components/clients/AssignVehicleDialog';
import { NewSaleDialog } from '@/components/clients/NewSaleDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { exportClientTransactionsPDF } from '@/lib/exportClientTransactionsPDF';

const ClientSalesPage = () => {
  const navigate = useNavigate();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const deleteClient = useDeleteClient();
  const updateVehicle = useUpdateVehicle();
  const createCaisseEntry = useCreateCaisseEntry();
  const addSalePayment = useAddSalePayment();
  const { toast } = useToast();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const { data: salesData = [], isLoading: salesLoading } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [newSaleDialogOpen, setNewSaleDialogOpen] = useState(false);
  const [selectedClientForAssign, setSelectedClientForAssign] = useState<any>(null);

  // Versement dialog state
  const [versementDialogOpen, setVersementDialogOpen] = useState(false);
  const [versementVehicle, setVersementVehicle] = useState<any>(null);
  const [versementAmount, setVersementAmount] = useState('');
  const [versementMode, setVersementMode] = useState<'versement' | 'virement'>('versement');

  const isLoading = clientsLoading || vehiclesLoading || salesLoading;


  // Get all vehicles that have a client (= sales)
  const soldVehicles = (vehicles as any[]).filter((v) => v.clientId);

  // Filtrage
  const filteredVehicles = soldVehicles.filter((v: any) => {
    const clientName = v.client ? `${v.client.nom} ${v.client.prenom}` : '';
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      `${v.brand} ${v.model} ${v.vin}`.toLowerCase().includes(term) ||
      clientName.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'solde' && v.paymentStatus === 'solde') ||
      (statusFilter === 'versement' && v.paymentStatus === 'versement') ||
      (statusFilter === 'pending' && !v.paymentStatus);

    return matchesSearch && matchesStatus;
  });

  // KPIs
  const totalRevenue = soldVehicles.reduce((sum: number, v: any) => sum + Number(v.sellingPrice || 0), 0);
  const totalCost = soldVehicles.reduce((sum: number, v: any) => sum + Number(v.totalCost || 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const totalPaid = soldVehicles.reduce((sum: number, v: any) => sum + Number(v.amountPaid || 0), 0);
  const totalRemaining = Math.max(0, totalRevenue - totalPaid);
  const soldeCount = soldVehicles.filter((v: any) => v.paymentStatus === 'solde').length;
  const versementCount = soldVehicles.filter((v: any) => v.paymentStatus === 'versement').length;

  const handleExportClientPDF = (vehicle: any) => {
    const client = vehicle.client;
    if (!client) return;
    const clientVehicles = soldVehicles.filter((v: any) => v.clientId === client.id);
    exportClientTransactionsPDF(client, clientVehicles);
    toast({ title: 'PDF généré', description: `Transactions de ${client.nom} ${client.prenom}` });
  };

  const handleStatusChange = (vehicle: any, newStatus: string) => {
    if (newStatus === 'versement') {
      setVersementVehicle(vehicle);
      setVersementAmount('');
      setVersementDialogOpen(true);
    } else if (newStatus === 'solde') {
      // Mark as soldé: set status to sold, paymentStatus to solde, amountPaid to sellingPrice
      const sellingPrice = Number(vehicle.sellingPrice || 0);
      const currentPaid = Number(vehicle.amountPaid || 0);
      const remaining = sellingPrice - currentPaid;

      updateVehicle.mutate(
        {
          id: vehicle.id,
          data: {
            status: 'sold',
            paymentStatus: 'solde',
            amountPaid: sellingPrice,
            soldDate: vehicle.soldDate || new Date().toISOString().split('T')[0],
          },
        },
        {
          onSuccess: () => {
            // Create caisse entry for the remaining amount (or full if no prior versements)
            if (remaining > 0) {
              createCaisseEntry.mutate({
                type: 'entree',
                montant: remaining,
                date: new Date().toISOString().split('T')[0],
                description: `Solde vente ${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.client?.nom || ''} ${vehicle.client?.prenom || ''}`,
                vehicleId: vehicle.id,
              });
            }
            toast({ title: 'Véhicule marqué comme soldé' });
          },
          onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
        },
      );
    }
  };

  const handleVersementSubmit = () => {
    if (!versementVehicle || !versementAmount) return;
    const amount = Number(versementAmount);
    if (amount <= 0) return;

    const currentPaid = Number(versementVehicle.amountPaid || 0);
    const newAmountPaid = currentPaid + amount;
    const sellingPrice = Number(versementVehicle.sellingPrice || 0);

    // Check if this versement completes the payment
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
          // Create caisse entry for the versement
          createCaisseEntry.mutate({
            type: 'entree',
            montant: amount,
            date: new Date().toISOString().split('T')[0],
            description: `Versement ${versementVehicle.brand} ${versementVehicle.model} ${versementVehicle.year} — ${versementVehicle.client?.nom || ''} ${versementVehicle.client?.prenom || ''}`.trim(),
            vehicleId: versementVehicle.id,
          });
          toast({ title: isFull ? 'Paiement complet — véhicule soldé' : 'Versement enregistré' });
          setVersementDialogOpen(false);
          setVersementVehicle(null);
          setVersementAmount('');
        },
        onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
      },
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Ventes Clients</h1>
            <p className="text-muted-foreground">
              Suivi des ventes et encaissements par véhicule
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              onClick={() => setNewSaleDialogOpen(true)}
            >
              <Car className="h-4 w-4" />
              Nouvelle vente
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {
              const rows = [
                ['Véhicule', 'VIN', 'Client', 'Téléphone', 'Prix de vente', 'Montant payé', 'Reste', 'Statut'],
                ...soldVehicles.map((v: any) => {
                  const sp = Number(v.sellingPrice || 0);
                  const ap = Number(v.amountPaid || 0);
                  return [
                    `${v.brand} ${v.model} (${v.year})`,
                    v.vin || '',
                    v.client ? `${v.client.nom} ${v.client.prenom}` : '',
                    v.client?.telephone || '',
                    sp,
                    ap,
                    Math.max(0, sp - ap),
                    v.paymentStatus === 'solde' ? 'Soldé' : v.paymentStatus === 'versement' ? 'Versement' : 'Non défini',
                  ];
                }),
              ];
              const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
              const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ventes-clients-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast({ title: 'Export réussi', description: 'Le fichier CSV a été téléchargé' });
            }}>
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total des ventes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">{soldVehicles.length} véhicules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bénéfice total</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(totalProfit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Marge nette</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{soldVehicles.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Véhicules vendus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Payé</CardTitle>
              <Wallet className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground mt-1">Encaissements</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reste à payer</CardTitle>
              <CreditCard className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalRemaining)}</div>
              <p className="text-xs text-muted-foreground mt-1">Créances</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Soldés</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{soldeCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Paiements complets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En versement</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{versementCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Paiements partiels</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par véhicule ou client..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="solde">Soldés</SelectItem>
                  <SelectItem value="versement">Versement</SelectItem>
                  <SelectItem value="pending">Non défini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table - Grouped */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
              <div className="space-y-3">
                {salesData
                  .filter((sale: any) => {
                    const client = sale.client;
                    if (!client) return false;
                    const clientName = `${client.nom} ${client.prenom}`;
                    const term = searchTerm.toLowerCase();
                    const matchesSearch = !term || clientName.toLowerCase().includes(term) ||
                      (sale.vehicles || []).some((v: any) => `${v.brand} ${v.model} ${v.vin}`.toLowerCase().includes(term));
                    return matchesSearch;
                  })
                  .map((sale: any) => {
                    const saleVehicles = sale.vehicles || [];
                    const saleTotalSelling = Number(sale.totalSellingPrice) || 0;
                    const salePaid = Number(sale.amountPaid) || 0;
                    const saleDebt = Number(sale.debt) || 0;
                    const saleCarriedDebt = Number(sale.carriedDebt) || 0;
                    const saleProfit = Number(sale.totalProfit) || 0;

                    return (
                      <Collapsible key={sale.id}>
                        <div className="rounded-lg border border-border overflow-hidden">
                          <CollapsibleTrigger asChild>
                            <button className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 gap-2 hover:bg-muted/50 transition-colors cursor-pointer text-left group">
                              <div className="flex items-center gap-3">
                                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 shrink-0" />
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {sale.client?.nom} {sale.client?.prenom}
                                    <Badge variant="secondary" className="ml-2 text-xs">{saleVehicles.length} véhicule(s)</Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(sale.date).toLocaleDateString('fr-FR')}
                                    {sale.client?.telephone && ` • ${sale.client.telephone}`}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Total vente</p>
                                  <p className="font-bold">{formatCurrency(saleTotalSelling)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Payé</p>
                                  <p className="font-bold text-success">{formatCurrency(salePaid)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Dette</p>
                                  <p className={`font-bold ${saleDebt > 0 ? 'text-destructive' : 'text-success'}`}>
                                    {formatCurrency(saleDebt)}
                                  </p>
                                </div>
                                {saleCarriedDebt > 0 && (
                                  <Badge variant="outline" className="border-warning text-warning text-xs">
                                    +{formatCurrency(saleCarriedDebt)} reportée
                                  </Badge>
                                )}
                              </div>
                            </button>
                          </CollapsibleTrigger>
                          <div className="flex gap-1 px-4 py-1 bg-muted/30 border-t border-border justify-end">
                            <Button variant="ghost" size="sm" onClick={() => {
                              if (sale.client) navigate(`/clients/${sale.client.id}`);
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              if (sale.client) {
                                const clientVehicles = soldVehicles.filter((v: any) => v.clientId === sale.client.id);
                                exportClientTransactionsPDF(sale.client, clientVehicles);
                                toast({ title: 'PDF généré' });
                              }
                            }}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                          <CollapsibleContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Véhicule</TableHead>
                                  <TableHead className="text-right">Prix de vente</TableHead>
                                  <TableHead className="text-right">Montant payé</TableHead>
                                  <TableHead className="text-right">Montant restant</TableHead>
                                  <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {saleVehicles.map((vehicle: any) => {
                                  const sp = Number(vehicle.sellingPrice || 0);
                                  const ap = Number(vehicle.amountPaid || 0);
                                  const remaining = Math.max(0, sp - ap);
                                  return (
                                    <TableRow key={vehicle.id}>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          {vehicle.photoUrl ? (
                                            <img src={vehicle.photoUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-8 w-8 rounded object-cover" />
                                          ) : (
                                            <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                                              <Car className="h-4 w-4 text-secondary-foreground" />
                                            </div>
                                          )}
                                          <div>
                                            <div className="font-medium text-sm">{vehicle.brand} {vehicle.model} ({vehicle.year})</div>
                                            <div className="text-xs text-muted-foreground">{vehicle.vin}</div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right font-medium">{formatCurrency(sp)}</TableCell>
                                      <TableCell className="text-right font-medium text-success">{formatCurrency(ap)}</TableCell>
                                      <TableCell className="text-right font-medium">
                                        {remaining > 0 ? (
                                          <span className="text-destructive">{formatCurrency(remaining)}</span>
                                        ) : (
                                          <span className="text-success">0 DZD</span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                                          <ExternalLink className="h-4 w-4 mr-1" />
                                          Voir
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune vente enregistrée
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legacy individual vehicles (without sale) */}
        {filteredVehicles.filter((v: any) => !v.saleId).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ventes individuelles (ancien format)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Prix de vente</TableHead>
                    <TableHead className="text-right">Montant payé</TableHead>
                    <TableHead className="text-right">Montant restant</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.filter((v: any) => !v.saleId).map((vehicle: any) => {
                    const sellingPrice = Number(vehicle.sellingPrice || 0);
                    const amountPaid = Number(vehicle.amountPaid || 0);
                    const remaining = Math.max(0, sellingPrice - amountPaid);
                    const isVersement = vehicle.paymentStatus === 'versement';

                    return (
                      <TableRow
                        key={vehicle.id}
                        className={isVersement ? 'bg-yellow-50 dark:bg-yellow-950/30 hover:bg-yellow-100 dark:hover:bg-yellow-950/50' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {vehicle.photoUrl ? (
                              <img src={vehicle.photoUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                <Car className="h-5 w-5 text-secondary-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{vehicle.brand} {vehicle.model} ({vehicle.year})</div>
                              <div className="text-sm text-muted-foreground">
                                {vehicle.vin}
                                {vehicle.color && <span> • {vehicle.color}</span>}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {vehicle.client ? (
                            <div>
                              <div className="font-medium">{vehicle.client.nom} {vehicle.client.prenom}</div>
                              <div className="text-sm text-muted-foreground">{vehicle.client.telephone}</div>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(sellingPrice)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(amountPaid)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {remaining > 0 ? (
                            <span className="text-destructive">{formatCurrency(remaining)}</span>
                          ) : (
                            <span className="text-success">0 DZD</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={vehicle.paymentStatus || 'pending'}
                            onValueChange={(val) => {
                              if (val === 'pending') return;
                              handleStatusChange(vehicle, val);
                            }}
                          >
                            <SelectTrigger className="h-8 w-[130px]" onClick={(e) => e.stopPropagation()}>
                              <SelectValue>
                                {vehicle.paymentStatus === 'solde' ? (
                                  <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Soldé</Badge>
                                ) : vehicle.paymentStatus === 'versement' ? (
                                  <Badge variant="outline" className="border-warning text-warning"><Clock className="h-3 w-3 mr-1" />Versement</Badge>
                                ) : (
                                  <Badge variant="secondary">Non défini</Badge>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="solde">Soldé</SelectItem>
                              <SelectItem value="versement">Versement</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleExportClientPDF(vehicle); }}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <NewSaleDialog
        open={newSaleDialogOpen}
        onOpenChange={setNewSaleDialogOpen}
      />

      {/* Versement Dialog */}
      <Dialog open={versementDialogOpen} onOpenChange={setVersementDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer un versement</DialogTitle>
          </DialogHeader>
          {versementVehicle && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <div className="font-medium text-sm">
                  {versementVehicle.brand} {versementVehicle.model} ({versementVehicle.year})
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Client : {versementVehicle.client?.nom} {versementVehicle.client?.prenom}
                </div>
                <div className="text-xs text-muted-foreground">
                  Prix de vente : {formatCurrency(Number(versementVehicle.sellingPrice || 0))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Déjà payé : {formatCurrency(Number(versementVehicle.amountPaid || 0))}
                </div>
                <div className="text-xs font-medium text-destructive">
                  Restant : {formatCurrency(Math.max(0, Number(versementVehicle.sellingPrice || 0) - Number(versementVehicle.amountPaid || 0)))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="versementAmount">Montant du versement (DZD)</Label>
                <FormattedNumberInput
                  id="versementAmount"
                  placeholder="0"
                  value={versementAmount}
                  onValueChange={(v) => setVersementAmount(String(v))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVersementDialogOpen(false)}>Annuler</Button>
            <Button
              onClick={handleVersementSubmit}
              disabled={!versementAmount || Number(versementAmount) <= 0 || updateVehicle.isPending}
            >
              {updateVehicle.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClientSalesPage;
