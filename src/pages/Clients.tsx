import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MoreVertical, Eye, Phone, Search, ShoppingCart, Check, X, Percent } from 'lucide-react';
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

// Mock data for clients (acheteurs avec % sur bénéfice)
const clients = [
  {
    id: 'client-1',
    nom: 'Kaci',
    prenom: 'Mohamed',
    telephone: '+213 555 111 222',
    adresse: '12 Rue des Oliviers, Blida',
    pourcentageBenefice: 5,
    // Exemple: achat à 100 000 DZD, coût revient 80 000 DZD, bénéfice 20 000 DZD
    // Dette = 5% de 20 000 = 1 000 DZD
    prixVente: 10000000,
    coutRevient: 8500000,
    detteBenefice: 75000, // 5% du bénéfice (1 500 000)
    paye: false,
    createdAt: '2026-01-15',
  },
  {
    id: 'client-2',
    nom: 'Boudiaf',
    prenom: 'Yacine',
    telephone: '+213 555 333 444',
    adresse: '45 Avenue 8 Mai 1945, Sétif',
    pourcentageBenefice: 10,
    prixVente: 14000000,
    coutRevient: 11000000,
    detteBenefice: 300000, // 10% du bénéfice (3 000 000)
    paye: true,
    createdAt: '2026-01-20',
  },
  {
    id: 'client-3',
    nom: 'Sahraoui',
    prenom: 'Nadia',
    telephone: '+213 555 555 666',
    adresse: '8 Cité AADL, Bab Ezzouar, Alger',
    pourcentageBenefice: 3,
    prixVente: 7200000,
    coutRevient: 6000000,
    detteBenefice: 36000, // 3% du bénéfice (1 200 000)
    paye: true,
    createdAt: '2026-01-25',
  },
  {
    id: 'client-4',
    nom: 'Hamidi',
    prenom: 'Rachid',
    telephone: '+213 555 777 888',
    adresse: '20 Rue Zighoud Youcef, El Bouni, Annaba',
    pourcentageBenefice: 8,
    prixVente: 21000000,
    coutRevient: 17500000,
    detteBenefice: 280000, // 8% du bénéfice (3 500 000)
    paye: false,
    createdAt: '2026-01-28',
  },
];

const ClientsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredClients = clients.filter(c => 
    c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.telephone.includes(searchQuery)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  const totalDettes = clients.reduce((sum, c) => sum + c.detteBenefice, 0);
  const totalPaye = clients.filter(c => c.paye).reduce((sum, c) => sum + c.detteBenefice, 0);
  const totalNonPaye = clients.filter(c => !c.paye).reduce((sum, c) => sum + c.detteBenefice, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
            <p className="text-muted-foreground">
              Acheteurs avec pourcentage sur bénéfice
            </p>
          </div>
          <Button 
            className="bg-success text-success-foreground hover:bg-success/90"
            onClick={() => setIsDialogOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter client
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher (nom, prénom, téléphone)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="kpi-card">
            <p className="kpi-label">Total clients</p>
            <p className="kpi-value">{clients.length}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Total dettes (% bénéfice)</p>
            <p className="kpi-value text-primary">
              {formatCurrency(totalDettes)}
            </p>
          </div>
          <div className="kpi-card border-l-4 border-l-success">
            <p className="kpi-label">Payé</p>
            <p className="kpi-value text-success">
              {formatCurrency(totalPaye)}
            </p>
          </div>
          <div className="kpi-card border-l-4 border-l-warning">
            <p className="kpi-label">Non payé</p>
            <p className="kpi-value text-warning">
              {formatCurrency(totalNonPaye)}
            </p>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Téléphone</th>
                  <th>% Bénéfice</th>
                  <th>Prix vente</th>
                  <th>Bénéfice</th>
                  <th>Dette client</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const benefice = client.prixVente - client.coutRevient;
                  return (
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
                            <p className="font-medium text-foreground">{client.nom} {client.prenom}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {client.adresse}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {client.telephone}
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                          <Percent className="h-3 w-3" />
                          {client.pourcentageBenefice}%
                        </span>
                      </td>
                      <td>
                        <span className="font-medium">
                          {formatCurrency(client.prixVente)}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-success">
                          {formatCurrency(benefice)}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-warning">
                          {formatCurrency(client.detteBenefice)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                            client.paye
                              ? 'bg-success/10 text-success'
                              : 'bg-warning/10 text-warning'
                          )}
                        >
                          {client.paye ? (
                            <>
                              <Check className="h-3 w-3" />
                              Payé
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3" />
                              Non payé
                            </>
                          )}
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
                              Voir le détail
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun client trouvé pour "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddClientDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </DashboardLayout>
  );
};

export default ClientsPage;
