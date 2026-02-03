import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { clients } from '@/data/mockData';
import { UserCircle, MoreVertical, Eye, FileText, Mail, Phone, Search, Wallet, ShoppingCart, Percent, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AddClientImportDialog } from '@/components/clients/AddClientImportDialog';
import { AddClientVenteDialog } from '@/components/clients/AddClientVenteDialog';

// Mock data for import clients (partners)
const clientsImport = [
  {
    id: 'imp-1',
    name: 'Ahmed Benali',
    company: 'Benali Auto Import',
    email: 'ahmed@benaliauto.dz',
    phone: '+213 555 123 456',
    status: 'active',
    profitPercentage: 30,
    vehiclesImported: 12,
    totalInvested: 45000000,
    totalProfitShare: 4500000,
    pendingPayment: 850000,
  },
  {
    id: 'imp-2',
    name: 'Karim Meziane',
    company: 'KM Investments',
    email: 'karim@kminvest.dz',
    phone: '+213 555 789 012',
    status: 'active',
    profitPercentage: 25,
    vehiclesImported: 8,
    totalInvested: 32000000,
    totalProfitShare: 2800000,
    pendingPayment: 0,
  },
  {
    id: 'imp-3',
    name: 'Sofiane Hadj',
    company: 'Hadj Motors',
    email: 'sofiane@hadjmotors.dz',
    phone: '+213 555 456 789',
    status: 'inactive',
    profitPercentage: 35,
    vehiclesImported: 5,
    totalInvested: 18000000,
    totalProfitShare: 1500000,
    pendingPayment: 320000,
  },
];

// Mock data for sale clients (buyers)
const clientsVente = [
  {
    id: 'vente-1',
    name: 'Mohamed Kaci',
    company: '',
    email: 'mkaci@gmail.com',
    phone: '+213 555 111 222',
    status: 'active',
    vehiclesPurchased: 2,
    totalSpent: 14500000,
    lastPurchase: '2026-01-15',
  },
  {
    id: 'vente-2',
    name: 'Yacine Boudiaf',
    company: 'EURL Boudiaf Transport',
    email: 'yboudiaf@transport.dz',
    phone: '+213 555 333 444',
    status: 'active',
    vehiclesPurchased: 4,
    totalSpent: 28000000,
    lastPurchase: '2026-01-28',
  },
  {
    id: 'vente-3',
    name: 'Nadia Sahraoui',
    company: '',
    email: 'nadia.s@email.com',
    phone: '+213 555 555 666',
    status: 'active',
    vehiclesPurchased: 1,
    totalSpent: 7200000,
    lastPurchase: '2025-12-20',
  },
];

const ClientsPage = () => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isVenteDialogOpen, setIsVenteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('import');
  const navigate = useNavigate();

  const filteredClientsImport = clientsImport.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const filteredClientsVente = clientsVente.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  const totalPendingPayments = clientsImport.reduce((sum, c) => sum + c.pendingPayment, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
            <p className="text-muted-foreground">
              Gérez vos partenaires d'import et vos acheteurs
            </p>
          </div>
        </div>

        {/* Tabs Import / Vente */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="import" className="gap-2">
                <Wallet className="h-4 w-4" />
                Clients Import
              </TabsTrigger>
              <TabsTrigger value="vente" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Clients Vente
              </TabsTrigger>
            </TabsList>

            {activeTab === 'import' ? (
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsImportDialogOpen(true)}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Ajouter partenaire
              </Button>
            ) : (
              <Button 
                className="bg-success text-success-foreground hover:bg-success/90"
                onClick={() => setIsVenteDialogOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ajouter acheteur
              </Button>
            )}
          </div>

          {/* Barre de recherche */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client (nom, entreprise, email, téléphone)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tab Import */}
          <TabsContent value="import" className="space-y-4">
            {/* KPIs Import */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="kpi-card">
                <p className="kpi-label">Partenaires</p>
                <p className="kpi-value">{clientsImport.length}</p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">Total investi</p>
                <p className="kpi-value text-primary">
                  {formatCurrency(clientsImport.reduce((sum, c) => sum + c.totalInvested, 0))}
                </p>
              </div>
              <div className="kpi-card border-l-4 border-l-success">
                <p className="kpi-label">Parts versées</p>
                <p className="kpi-value text-success">
                  {formatCurrency(clientsImport.reduce((sum, c) => sum + c.totalProfitShare, 0))}
                </p>
              </div>
              <div className="kpi-card border-l-4 border-l-warning">
                <p className="kpi-label">À verser</p>
                <p className="kpi-value text-warning">
                  {formatCurrency(totalPendingPayments)}
                </p>
              </div>
            </div>

            {/* Tableau clients import */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Partenaire</th>
                      <th>Contact</th>
                      <th>% Bénéfice</th>
                      <th>Véhicules</th>
                      <th>Part totale</th>
                      <th>À verser</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientsImport.map((client) => (
                      <tr 
                        key={client.id}
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="cursor-pointer hover:bg-accent/50"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Wallet className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{client.name}</p>
                              <p className="text-xs text-muted-foreground">{client.company}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                            <Percent className="h-3 w-3" />
                            {client.profitPercentage}%
                          </span>
                        </td>
                        <td>
                          <span className="font-medium text-foreground">
                            {client.vehiclesImported}
                          </span>
                        </td>
                        <td>
                          <span className="font-medium text-success">
                            {formatCurrency(client.totalProfitShare)}
                          </span>
                        </td>
                        <td>
                          {client.pendingPayment > 0 ? (
                            <span className="font-medium text-warning">
                              {formatCurrency(client.pendingPayment)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              client.status === 'active'
                                ? 'bg-success/10 text-success'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {client.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir le profil
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Historique véhicules
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {filteredClientsImport.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground">
                          Aucun partenaire trouvé pour "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Tab Vente */}
          <TabsContent value="vente" className="space-y-4">
            {/* KPIs Vente */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="kpi-card">
                <p className="kpi-label">Acheteurs</p>
                <p className="kpi-value">{clientsVente.length}</p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">Véhicules vendus</p>
                <p className="kpi-value text-success">
                  {clientsVente.reduce((sum, c) => sum + c.vehiclesPurchased, 0)}
                </p>
              </div>
              <div className="kpi-card border-l-4 border-l-success">
                <p className="kpi-label">CA Total</p>
                <p className="kpi-value text-success">
                  {formatCurrency(clientsVente.reduce((sum, c) => sum + c.totalSpent, 0))}
                </p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">Panier moyen</p>
                <p className="kpi-value text-primary">
                  {formatCurrency(
                    clientsVente.reduce((sum, c) => sum + c.totalSpent, 0) / 
                    clientsVente.reduce((sum, c) => sum + c.vehiclesPurchased, 0)
                  )}
                </p>
              </div>
            </div>

            {/* Tableau clients vente */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Acheteur</th>
                      <th>Contact</th>
                      <th>Véhicules achetés</th>
                      <th>Total dépensé</th>
                      <th>Dernier achat</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientsVente.map((client) => (
                      <tr 
                        key={client.id}
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="cursor-pointer hover:bg-accent/50"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                              <ShoppingCart className="h-5 w-5 text-success" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{client.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {client.company || 'Particulier'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="font-medium text-foreground">
                            {client.vehiclesPurchased}
                          </span>
                        </td>
                        <td>
                          <span className="font-medium text-success">
                            {formatCurrency(client.totalSpent)}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted-foreground">
                            {new Date(client.lastPurchase).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        <td>
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              client.status === 'active'
                                ? 'bg-success/10 text-success'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {client.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir le profil
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Historique achats
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {filteredClientsVente.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          Aucun acheteur trouvé pour "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddClientImportDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
      <AddClientVenteDialog open={isVenteDialogOpen} onOpenChange={setIsVenteDialogOpen} />
    </DashboardLayout>
  );
};

export default ClientsPage;
