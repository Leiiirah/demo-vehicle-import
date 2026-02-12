import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Download, 
  Loader2, 
  TrendingUp, 
  DollarSign,
  Car,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
} from 'lucide-react';
import { useClients, useVehicles, useDeleteClient } from '@/hooks/useApi';
import { AssignVehicleDialog } from '@/components/clients/AssignVehicleDialog';
import { NewSaleDialog } from '@/components/clients/NewSaleDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const ClientSalesPage = () => {
  const navigate = useNavigate();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const deleteClient = useDeleteClient();
  const { toast } = useToast();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [newSaleDialogOpen, setNewSaleDialogOpen] = useState(false);
  const [selectedClientForAssign, setSelectedClientForAssign] = useState<any>(null);

  const isLoading = clientsLoading || vehiclesLoading;

  const formatCurrency = (amount: number, currency: 'USD' | 'DZD' = 'DZD') => {
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

  // Enrichir les clients avec leurs statistiques de vente
  const clientsWithStats = clients.map((client: any) => {
    const clientVehicles = vehicles.filter((v: any) => v.clientId === client.id);
    const soldVehicles = clientVehicles.filter((v: any) => v.status === 'sold');
    const pendingVehicles = clientVehicles.filter((v: any) => v.status !== 'sold');
    
    const totalSales = soldVehicles.reduce((sum: number, v: any) => sum + Number(v.sellingPrice || 0), 0);
    const totalCost = soldVehicles.reduce((sum: number, v: any) => sum + Number(v.totalCost || 0), 0);
    const totalProfit = totalSales - totalCost;
    
    return {
      ...client,
      vehicleCount: clientVehicles.length,
      soldCount: soldVehicles.length,
      pendingCount: pendingVehicles.length,
      totalSales,
      totalProfit,
      isPaid: client.paye,
    };
  });

  // Filtrage
  const filteredClients = clientsWithStats.filter((client: any) => {
    const matchesSearch = 
      `${client.nom} ${client.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telephone?.includes(searchTerm) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'paid' && client.isPaid) ||
      (statusFilter === 'pending' && !client.isPaid && client.vehicleCount > 0) ||
      (statusFilter === 'no_sales' && client.vehicleCount === 0);
    
    return matchesSearch && matchesStatus;
  });

  // KPIs globaux
  const totalClientsWithSales = clientsWithStats.filter((c: any) => c.vehicleCount > 0).length;
  const totalRevenue = clientsWithStats.reduce((sum: number, c: any) => sum + c.totalSales, 0);
  const totalProfit = clientsWithStats.reduce((sum: number, c: any) => sum + c.totalProfit, 0);
  const paidClients = clientsWithStats.filter((c: any) => c.isPaid && c.vehicleCount > 0).length;

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
              Suivi des ventes et encaissements par client
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
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clients actifs
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClientsWithSales}</div>
              <p className="text-xs text-muted-foreground mt-1">
                sur {clients.length} clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chiffre d'affaires
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total des ventes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bénéfice total
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(totalProfit)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Marge nette
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clients soldés
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidClients}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Paiements complets
              </p>
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
                  placeholder="Rechercher un client..." 
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
                  <SelectItem value="all">Tous les clients</SelectItem>
                  <SelectItem value="paid">Soldés</SelectItem>
                  <SelectItem value="pending">En cours</SelectItem>
                  <SelectItem value="no_sales">Sans ventes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des clients */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des clients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-center">Véhicules</TableHead>
                  <TableHead className="text-right">Chiffre d'affaires</TableHead>
                  <TableHead className="text-right">Bénéfice</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client: any) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="font-medium">
                          {client.nom} {client.prenom}
                        </div>
                        {client.company && (
                          <div className="text-sm text-muted-foreground">
                            {client.company}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{client.telephone}</div>
                        {client.email && (
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{client.vehicleCount}</span>
                          {client.soldCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {client.soldCount} vendus
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {client.totalSales > 0 ? formatCurrency(client.totalSales) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {client.totalProfit > 0 ? (
                          <span className="text-success font-medium">
                            {formatCurrency(client.totalProfit)}
                          </span>
                        ) : client.totalProfit < 0 ? (
                          <span className="text-destructive font-medium">
                            {formatCurrency(client.totalProfit)}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {client.vehicleCount === 0 ? (
                          <Badge variant="outline">Sans ventes</Badge>
                        ) : client.isPaid ? (
                          <Badge className="bg-success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Soldé
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            En cours
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedClientForAssign(client);
                              setAssignDialogOpen(true);
                            }}
                            title="Affecter un véhicule"
                          >
                            <Car className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/clients/${client.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
                                <AlertDialogAction onClick={(e) => {
                                  e.stopPropagation();
                                  deleteClient.mutate(client.id, {
                                    onSuccess: () => toast({ title: 'Client supprimé' }),
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun client trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selectedClientForAssign && (
        <AssignVehicleDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          clientId={selectedClientForAssign.id}
          clientName={`${selectedClientForAssign.nom} ${selectedClientForAssign.prenom}`}
        />
      )}

      <NewSaleDialog
        open={newSaleDialogOpen}
        onOpenChange={setNewSaleDialogOpen}
      />
    </DashboardLayout>
  );
};

export default ClientSalesPage;
