import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useClients } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { MoreVertical, Eye, Phone, Search, ShoppingCart, Check, X, Percent, AlertCircle } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';

const ClientsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: clients, isLoading, error } = useClients();

  const filteredClients = (clients || []).filter(c => 
    c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.telephone.includes(searchQuery)
  );

  const { paginatedItems: paginatedClients, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } = usePagination(filteredClients);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  const totalDettes = (clients || []).reduce((sum, c) => sum + (c.detteBenefice || 0), 0);
  const totalPaye = (clients || []).filter(c => c.paye).reduce((sum, c) => sum + (c.detteBenefice || 0), 0);
  const totalNonPaye = (clients || []).filter(c => !c.paye).reduce((sum, c) => sum + (c.detteBenefice || 0), 0);

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Erreur de chargement des clients</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </>
          ) : (
            <>
              <div className="kpi-card">
                <p className="kpi-label">Total clients</p>
                <p className="kpi-value">{(clients || []).length}</p>
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
            </>
          )}
        </div>

        {/* Tableau */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
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
                  {paginatedClients.map((client) => {
                    const benefice = (client.prixVente || 0) - (client.coutRevient || 0);
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
                                {client.adresse || '-'}
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
                            {client.pourcentageBenefice || 0}%
                          </span>
                        </td>
                        <td>
                          <span className="font-medium">
                            {formatCurrency(client.prixVente || 0)}
                          </span>
                        </td>
                        <td>
                          <span className="font-medium text-success">
                            {formatCurrency(benefice)}
                          </span>
                        </td>
                        <td>
                          <span className="font-medium text-warning">
                            {formatCurrency(client.detteBenefice || 0)}
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
                  {paginatedClients.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? `Aucun client trouvé pour "${searchQuery}"` : 'Aucun client'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} startIndex={startIndex} endIndex={endIndex} onPageChange={goToPage} />
          </div>
        </div>
      </div>

      <AddClientDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </DashboardLayout>
  );
};

export default ClientsPage;
