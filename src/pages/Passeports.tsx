import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePasseports, useUpdatePasseport, useDeletePasseport } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { MoreVertical, Eye, Phone, Search, BookUser, Check, X, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AddPasseportDialog } from '@/components/clients/AddPasseportDialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const PasseportsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: passeports, isLoading, error } = usePasseports();
  const updatePasseport = useUpdatePasseport();
  const deletePasseport = useDeletePasseport();
  const { toast } = useToast();

  const togglePaiement = (id: string, currentPaye: boolean) => {
    updatePasseport.mutate({ id, data: { paye: !currentPaye } });
  };

  const filteredPasseports = (passeports || []).filter(p => 
    p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.numeroPasseport.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.telephone.includes(searchQuery)
  );

  const { paginatedItems: paginatedPasseports, currentPage, totalPages, totalItems, startIndex, endIndex, goToPage } = usePagination(filteredPasseports);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Erreur de chargement des passeports</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalDu = (passeports || []).reduce((sum, p) => sum + (p.montantDu || 0), 0);
  const totalPaye = (passeports || []).filter(p => p.paye).reduce((sum, p) => sum + (p.montantDu || 0), 0);
  const totalNonPaye = (passeports || []).filter(p => !p.paye).reduce((sum, p) => sum + (p.montantDu || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Passeports</h1>
            <p className="text-muted-foreground">
              Gestion des passeports et paiements associés
            </p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsDialogOpen(true)}
          >
            <BookUser className="h-4 w-4 mr-2" />
            Ajouter passeport
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher (nom, prénom, n° passeport, téléphone)..."
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
                <p className="kpi-label">Total passeports</p>
                <p className="kpi-value">{(passeports || []).length}</p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">Total dû</p>
                <p className="kpi-value text-primary">
                  {formatCurrency(totalDu)}
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
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom & Prénom</th>
                    <th>Téléphone</th>
                    <th>N° Passeport</th>
                    <th>Adresse</th>
                    <th>Montant dû</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPasseports.map((passeport) => (
                    <tr 
                      key={passeport.id}
                      onClick={() => navigate(`/passeports/${passeport.id}`)}
                      className="cursor-pointer hover:bg-accent/50"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <BookUser className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{passeport.nom} {passeport.prenom}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {passeport.telephone}
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm">{passeport.numeroPasseport}</span>
                      </td>
                      <td>
                        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                          {passeport.adresse || '-'}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium">
                          {formatCurrency(passeport.montantDu || 0)}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePaiement(passeport.id, passeport.paye);
                          }}
                          disabled={updatePasseport.isPending}
                          className={cn(
                            'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all hover:scale-105 shadow-sm border disabled:opacity-50',
                            passeport.paye
                              ? 'bg-success/10 text-success hover:bg-success/20 border-success/30'
                              : 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/30'
                          )}
                        >
                          {passeport.paye ? (
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
                        </button>
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/passeports/${passeport.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir le détail
                            </DropdownMenuItem>
                             <AlertDialog>
                               <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                   <Trash2 className="h-4 w-4 mr-2" />
                                   Supprimer
                                 </DropdownMenuItem>
                               </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer ce passeport ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. Le passeport de {passeport.nom} {passeport.prenom} sera définitivement supprimé.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                   <AlertDialogAction onClick={(e) => {
                                    e.stopPropagation();
                                    deletePasseport.mutate(passeport.id, {
                                      onSuccess: () => toast({ title: 'Passeport supprimé' }),
                                      onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
                                    });
                                  }}>
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {paginatedPasseports.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? `Aucun passeport trouvé pour "${searchQuery}"` : 'Aucun passeport'}
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

      <AddPasseportDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </DashboardLayout>
  );
};

export default PasseportsPage;
