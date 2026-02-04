import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSuppliers } from '@/hooks/useApi';
import { Building2, MoreVertical, Eye, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AddSupplierDialog } from '@/components/suppliers/AddSupplierDialog';
import { Skeleton } from '@/components/ui/skeleton';

const SuppliersPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const { data: suppliers, isLoading, error } = useSuppliers();

  const formatCurrency = (amount: number, currency: 'USD' | 'DZD' = 'USD') => {
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Erreur de chargement des fournisseurs</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const suppliersList = suppliers || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête de page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Fournisseurs</h1>
            <p className="text-muted-foreground">
              Gérez vos fournisseurs chinois et les soldes de paiement
            </p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Ajouter fournisseur
          </Button>
        </div>

        {/* Cartes récapitulatives */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <div className="kpi-card">
                <p className="kpi-label">Total fournisseurs</p>
                <p className="kpi-value">{suppliersList.length}</p>
              </div>
              <div className="kpi-card border-l-4 border-l-success">
                <p className="kpi-label">Total payé</p>
                <p className="kpi-value text-success">
                  {formatCurrency(suppliersList.reduce((sum, s) => sum + (s.totalPaid || 0), 0))}
                </p>
              </div>
              <div className="kpi-card border-l-4 border-l-danger">
                <p className="kpi-label">Dette totale en cours</p>
                <p className="kpi-value text-danger">
                  {formatCurrency(suppliersList.reduce((sum, s) => sum + (s.remainingDebt || 0), 0))}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Grille fournisseurs */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : suppliersList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Aucun fournisseur trouvé
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliersList.map((supplier) => (
              <div
                key={supplier.id}
                onClick={() => navigate(`/suppliers/${supplier.id}`)}
                className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">{supplier.location}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les détails
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        Historique paiements
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Résumé financier */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Véhicules fournis</span>
                    <span className="font-medium text-foreground">{supplier.vehiclesSupplied || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Total payé</span>
                    <span className="font-medium text-success">
                      {formatCurrency(supplier.totalPaid || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <Tooltip>
                      <TooltipTrigger className="text-sm text-muted-foreground cursor-help">
                        Solde crédit
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Crédit ouvert actuel avec ce fournisseur</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="font-medium text-primary">
                      {formatCurrency(supplier.creditBalance || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium text-foreground">
                      Dette restante
                    </span>
                    <span className={`font-semibold ${
                      (supplier.remainingDebt || 0) > 0 ? 'text-danger' : 'text-success'
                    }`}>
                      {formatCurrency(supplier.remainingDebt || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddSupplierDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </DashboardLayout>
  );
};

export default SuppliersPage;
