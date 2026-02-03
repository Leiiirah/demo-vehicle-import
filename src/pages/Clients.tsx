import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { clients } from '@/data/mockData';
import { UserCircle, MoreVertical, Eye, FileText, Mail, Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AddClientDialog } from '@/components/clients/AddClientDialog';

const ClientsPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredClients = clients.filter(client => 
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
            <p className="text-muted-foreground">
              Gérez vos clients d'importation et suivez leur rentabilité
            </p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <UserCircle className="h-4 w-4 mr-2" />
            Ajouter client
          </Button>
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

        {/* Cartes récapitulatives */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="kpi-card">
            <p className="kpi-label">Total clients</p>
            <p className="kpi-value">{clients.length}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Clients actifs</p>
            <p className="kpi-value text-success">
              {clients.filter((c) => c.status === 'active').length}
            </p>
          </div>
          <div className="kpi-card border-l-4 border-l-success">
            <p className="kpi-label">Profit total généré</p>
            <p className="kpi-value text-success">
              {formatCurrency(clients.reduce((sum, c) => sum + c.totalProfit, 0))}
            </p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Marge moyenne</p>
            <p className="kpi-value text-primary">
              {(clients.reduce((sum, c) => sum + c.marginPercentage, 0) / clients.length).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Tableau clients */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Véhicules importés</th>
                  <th>Profit total</th>
                  <th>Marge %</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr 
                    key={client.id}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="cursor-pointer hover:bg-accent/50"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                          <UserCircle className="h-5 w-5 text-secondary-foreground" />
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
                      <span className="font-medium text-foreground">
                        {client.vehiclesImported}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium text-success">
                        {formatCurrency(client.totalProfit)}
                      </span>
                    </td>
                    <td>
                      <span className="badge-profit">{client.marginPercentage}%</span>
                    </td>
                    <td>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          client.status === 'active'
                            ? 'bg-success-muted text-success'
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
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun client trouvé pour "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddClientDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </DashboardLayout>
  );
};

export default ClientsPage;