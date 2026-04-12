import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useClients, useDeleteClient } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { ShoppingCart, Search, AlertCircle, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AddClientDialog } from '@/components/clients/AddClientDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const ClientsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();

  const { data: clients, isLoading, error } = useClients();
  const deleteClient = useDeleteClient();

  const filteredClients = (clients || []).filter(c =>
    c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.telephone.includes(searchQuery)
  );

  const { paginatedItems: paginatedClients, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } = usePagination(filteredClients);

  // KPI calculations
  const clientsList = clients || [];
  const totalVentes = clientsList.reduce((sum, c) => {
    const sold = (c.vehicles || []).filter((v: any) => v.sellingPrice != null);
    return sum + sold.reduce((s: number, v: any) => s + Number(v.sellingPrice || 0), 0);
  }, 0);
  const totalPaye = clientsList.reduce((sum, c) => {
    const sold = (c.vehicles || []).filter((v: any) => v.sellingPrice != null);
    return sum + sold.reduce((s: number, v: any) => s + Number(v.amountPaid || 0), 0);
  }, 0);
  const resteAPayer = totalVentes - totalPaye;

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
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Clients</h1>
            <p className="text-muted-foreground">Gérez vos clients et le suivi des créances</p>
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

        {/* KPIs — 4 cartes alignées sur fournisseurs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <div className="kpi-card">
                <p className="kpi-label">Total clients</p>
                <p className="kpi-value">{clientsList.length}</p>
              </div>
              <div className="kpi-card border-l-4 border-l-primary">
                <p className="kpi-label">Total ventes</p>
                <p className="kpi-value text-primary">{formatCurrency(totalVentes)}</p>
              </div>
              <div className="kpi-card border-l-4 border-l-success">
                <p className="kpi-label">Total payé</p>
                <p className="kpi-value text-success">{formatCurrency(totalPaye)}</p>
              </div>
              {(() => {
                return (
                  <div className={`kpi-card border-l-4 ${resteAPayer > 0 ? 'border-l-danger' : resteAPayer < 0 ? 'border-l-success' : 'border-l-muted'}`}>
                    <p className="kpi-label">{resteAPayer > 0 ? 'Créances totales' : resteAPayer < 0 ? 'Crédit total' : 'Solde'}</p>
                    <p className={`kpi-value ${resteAPayer > 0 ? 'text-danger' : resteAPayer < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      {resteAPayer > 0 ? '-' : resteAPayer < 0 ? '+' : ''}{formatCurrency(Math.abs(resteAPayer))}
                    </p>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Tableau clients */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? `Aucun client trouvé pour "${searchQuery}"` : 'Aucun client'}
          </div>
        ) : (
          <>
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead className="text-right">Véhicules</TableHead>
                    <TableHead className="text-right">Total ventes</TableHead>
                    <TableHead className="text-right">Total payé</TableHead>
                    <TableHead className="text-right">Reste à payer</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClients.map((client) => {
                    const soldVehicles = (client.vehicles || []).filter((v: any) => v.sellingPrice != null);
                    const clientTotalVentes = soldVehicles.reduce((s: number, v: any) => s + Number(v.sellingPrice || 0), 0);
                    const clientTotalPaye = soldVehicles.reduce((s: number, v: any) => s + Number(v.amountPaid || 0), 0);
                    const clientReste = clientTotalVentes - clientTotalPaye;

                    return (
                      <TableRow
                        key={client.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                              <ShoppingCart className="h-4 w-4 text-success" />
                            </div>
                            <span className="font-medium text-foreground">{client.nom} {client.prenom}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{client.telephone || '-'}</TableCell>
                        <TableCell className="text-right">{soldVehicles.length}</TableCell>
                        <TableCell className="text-right text-primary font-medium">
                          {formatCurrency(clientTotalVentes)}
                        </TableCell>
                        <TableCell className="text-right text-success font-medium">
                          {formatCurrency(clientTotalPaye)}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          clientReste > 0 ? 'text-danger' : clientReste < 0 ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {clientReste > 0 ? '-' : clientReste < 0 ? '+' : ''}{formatCurrency(Math.abs(clientReste))}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => navigate(`/clients/${client.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setClientToDelete({ id: client.id, name: `${client.nom} ${client.prenom}` })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} startIndex={startIndex} endIndex={endIndex} onPageChange={goToPage} />
          </>
        )}
      </div>

      <AddClientDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{clientToDelete?.name}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (clientToDelete) {
                  deleteClient.mutate(clientToDelete.id, {
                    onSuccess: () => {
                      toast.success('Client supprimé avec succès');
                      setClientToDelete(null);
                    },
                    onError: () => toast.error('Erreur lors de la suppression'),
                  });
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default ClientsPage;
