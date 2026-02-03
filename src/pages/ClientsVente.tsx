import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MoreVertical, Eye, FileText, Mail, Phone, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AddClientVenteDialog } from '@/components/clients/AddClientVenteDialog';

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
  {
    id: 'vente-4',
    name: 'Rachid Hamidi',
    company: 'Hamidi & Fils',
    email: 'rhamidi@hamidi.dz',
    phone: '+213 555 777 888',
    status: 'active',
    vehiclesPurchased: 3,
    totalSpent: 21000000,
    lastPurchase: '2026-01-30',
  },
];

const ClientsVentePage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredClients = clientsVente.filter(client => 
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

  const totalVehiclesSold = clientsVente.reduce((sum, c) => sum + c.vehiclesPurchased, 0);
  const totalRevenue = clientsVente.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Clients Vente</h1>
            <p className="text-muted-foreground">
              Acheteurs finaux des véhicules importés
            </p>
          </div>
          <Button 
            className="bg-success text-success-foreground hover:bg-success/90"
            onClick={() => setIsDialogOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter acheteur
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un acheteur (nom, entreprise, email, téléphone)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="kpi-card">
            <p className="kpi-label">Acheteurs</p>
            <p className="kpi-value">{clientsVente.length}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Véhicules vendus</p>
            <p className="kpi-value text-success">{totalVehiclesSold}</p>
          </div>
          <div className="kpi-card border-l-4 border-l-success">
            <p className="kpi-label">CA Total</p>
            <p className="kpi-value text-success">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Panier moyen</p>
            <p className="kpi-value text-primary">
              {formatCurrency(totalRevenue / totalVehiclesSold)}
            </p>
          </div>
        </div>

        {/* Tableau */}
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
                {filteredClients.map((client) => (
                  <tr 
                    key={client.id}
                    onClick={() => navigate(`/clients-vente/${client.id}`)}
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
                          <DropdownMenuItem onClick={() => navigate(`/clients-vente/${client.id}`)}>
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
                {filteredClients.length === 0 && (
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
      </div>

      <AddClientVenteDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </DashboardLayout>
  );
};

export default ClientsVentePage;
