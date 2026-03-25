import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useVehicle, useVehicleCharges, useCreateVehicleCharge, useDeleteVehicleCharge, useUpdateVehicleCharge, useDeleteVehicle } from '@/hooks/useApi';
import { api, type Payment } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Car,
  Package,
  CheckCircle2,
  DollarSign,
  FileText,
  Calendar,
  User,
  Building2,
  Edit,
  Clock,
  Ship,
  Anchor,
  BadgeCheck,
  Plus,
  Trash2,
  CreditCard,
  TrendingUp,
  Truck,
  AlertCircle,
  Save,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditVehicleDialog } from '@/components/vehicles/EditVehicleDialog';
import type { VehicleCharge } from '@/services/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: vehicle, isLoading, error } = useVehicle(id || '');
  const { data: chargesData } = useVehicleCharges(id || '');
  const deleteVehicle = useDeleteVehicle();

  const handleDelete = () => {
    if (!id) return;
    deleteVehicle.mutate(id, {
      onSuccess: () => {
        toast.success('Véhicule supprimé');
        navigate('/vehicles');
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    });
  };

  // Fetch dossier payment stats to determine if dossier is fully paid
  const dossierId = vehicle?.conteneur?.dossier?.id;
  const { data: dossierPaymentStats } = useQuery<{
    totalDue: number;
    totalPaid: number;
    totalPaidDZD: number;
    remaining: number;
    progress: number;
    payments: Payment[];
  }>({
    queryKey: ['payments', 'dossier', dossierId, 'stats'],
    queryFn: () => api.request(`/api/payments/dossier/${dossierId}/stats`),
    enabled: !!dossierId,
  });

  const isDossierSolde = (dossierPaymentStats?.progress ?? 0) >= 100;

  // Calculate average exchange rate from all dossier payments
  const tauxChangeFinal = (() => {
    if (!dossierPaymentStats?.payments?.length) return 0;
    const payments = dossierPaymentStats.payments;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (totalAmount === 0) return 0;
    const weightedRate = payments.reduce((sum, p) => sum + Number(p.amount) * Number(p.exchangeRate), 0);
    return weightedRate / totalAmount;
  })();

  const createChargeMutation = useCreateVehicleCharge(id || '');
  const deleteChargeMutation = useDeleteVehicleCharge(id || '');
  const updateChargeMutation = useUpdateVehicleCharge(id || '');

  // Mock client import associé
  const clientImport = {
    id: 'CLI001',
    name: vehicle?.client ? `${vehicle.client.prenom} ${vehicle.client.nom}` : 'Non assigné',
    profitPercentage: vehicle?.client?.pourcentageBenefice || 15,
    investedAmount: 5000000,
  };

  // État pour les coûts USD
  const [prixVehicule, setPrixVehicule] = useState<number>(0);
  const [prixTransport, setPrixTransport] = useState<number>(0);

  // État pour les charges DZD
  const [chargesTransit, setChargesTransit] = useState<number>(0);

  // Taux de change réel (saisi par l'admin)
  const [tauxChangeReel, setTauxChangeReel] = useState<number>(0);

  // Local state for new charge being added (before saving)
  const [newCharge, setNewCharge] = useState<{ label: string; amount: number } | null>(null);

  // Initialize state from vehicle when loaded
  useEffect(() => {
    if (vehicle) {
      setPrixVehicule(Number(vehicle.purchasePrice) || 0);
      setPrixTransport(Number(vehicle.transportCost) || 0);
      setChargesTransit(Number(vehicle.localFees) || 0);
      setTauxChangeReel(Number(vehicle.theoreticalRate) || 0);
      setHasChanges(false);
    }
  }, [vehicle]);

  // Convert API data to local format
  const chargesDivers: VehicleCharge[] = chargesData || [];

  // Mutation for saving vehicle updates with optimistic rollback
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Vehicle ID missing');
      return api.updateVehicle(id, {
        purchasePrice: prixVehicule,
        localFees: chargesTransit,
      });
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['vehicle', id] });
      
      // Snapshot the previous value for rollback
      const previousVehicle = queryClient.getQueryData(['vehicle', id]);
      
      return { previousVehicle };
    },
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData(['vehicle', id], data);
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Modifications enregistrées');
      setHasChanges(false);
    },
    onError: (error, _, context) => {
      // Rollback to previous state on error
      if (context?.previousVehicle) {
        queryClient.setQueryData(['vehicle', id], context.previousVehicle);
        // Reset local state to match rolled back data
        const prev = context.previousVehicle as any;
        setPrixVehicule(Number(prev.purchasePrice) || 0);
        setPrixTransport(Number(prev.transportCost) || 0);
        setChargesTransit(Number(prev.localFees) || 0);
      }
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde - vérifiez votre connexion');
      setHasChanges(false);
    },
  });

  // Track changes
  const handlePrixVehiculeChange = (value: number) => {
    setPrixVehicule(value);
    setHasChanges(true);
  };

  const handlePrixTransportChange = (value: number) => {
    setPrixTransport(value);
    setHasChanges(true);
  };

  const handleChargesTransitChange = (value: number) => {
    setChargesTransit(value);
    setHasChanges(true);
  };


  // Calculs
  const totalUSD = prixVehicule + prixTransport;

  // Total USD converti en DZD via taux réel
  const totalUSDenDZD = totalUSD * tauxChangeReel;

  // Total charges diverses
  const totalChargesDivers = chargesDivers.reduce((sum, c) => sum + Number(c.amount), 0);

  // Prix de revient (calculé uniquement si taux réel saisi)
  const prixRevient = tauxChangeReel > 0 ? totalUSDenDZD + chargesTransit + totalChargesDivers : 0;

  // Calcul de la répartition des bénéfices (safe access after loading check)
  const sellingPrice = vehicle?.sellingPrice ?? 0;
  const hasBeneficeData = sellingPrice > 0 && prixRevient > 0;
  const benefice = sellingPrice - prixRevient;
  const clientShare = (benefice * clientImport.profitPercentage) / 100;
  const companyShare = benefice - clientShare;

  // Handle taux réel change
  const handleTauxReelChange = (value: number) => {
    setTauxChangeReel(value);
    setHasChanges(true);
  };

  // Gestion des charges diverses via API
  const addChargeDivers = () => {
    setNewCharge({ label: '', amount: 0 });
  };

  const saveNewCharge = () => {
    if (newCharge && newCharge.label && newCharge.amount > 0) {
      createChargeMutation.mutate(newCharge, {
        onSuccess: () => {
          setNewCharge(null);
          toast.success('Charge ajoutée');
        },
        onError: (error) => {
          toast.error('Erreur lors de l\'ajout de la charge');
          console.error(error);
        },
      });
    }
  };

  const cancelNewCharge = () => {
    setNewCharge(null);
  };

  const removeChargeDivers = (chargeId: string) => {
    deleteChargeMutation.mutate(chargeId, {
      onSuccess: () => {
        toast.success('Charge supprimée');
      },
      onError: (error) => {
        toast.error('Erreur lors de la suppression');
        console.error(error);
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !vehicle) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Véhicule non trouvé</p>
          <Button onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux véhicules
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusInfo = (status: string) => {
    const statusMap = {
      ordered: { label: 'En stock', color: 'badge-info', progress: 25, icon: Package },
      in_transit: { label: 'Chargée', color: 'badge-pending', progress: 50, icon: Ship },
      arrived: { label: 'Arrivé', color: 'badge-profit', progress: 75, icon: Anchor },
      sold: { label: 'Vendu', color: 'bg-muted text-muted-foreground', progress: 100, icon: BadgeCheck },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.ordered;
  };

  const statusInfo = getStatusInfo(vehicle.status);

  // Timeline du véhicule
  const timeline = [
    {
      status: 'ordered',
      label: 'Commande passée',
      date: vehicle.orderDate,
      completed: true,
      icon: Package,
    },
    {
      status: 'in_transit',
      label: 'Départ du port',
      date: vehicle.status !== 'ordered' ? '2026-01-20' : null,
      completed: ['in_transit', 'arrived', 'sold'].includes(vehicle.status),
      icon: Ship,
    },
    {
      status: 'arrived',
      label: 'Arrivée au port',
      date: vehicle.arrivalDate,
      completed: ['arrived', 'sold'].includes(vehicle.status),
      icon: Anchor,
    },
    {
      status: 'sold',
      label: 'Véhicule vendu',
      date: vehicle.soldDate,
      completed: vehicle.status === 'sold',
      icon: BadgeCheck,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => {
            if (vehicle.conteneurId) {
              navigate(`/conteneurs/${vehicle.conteneurId}`);
            } else {
              navigate('/vehicles');
            }
          }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {vehicle.photoUrl ? (
            <img src={vehicle.photoUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-16 w-16 rounded-xl object-cover border border-border" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center">
              <Car className="h-8 w-8 text-secondary-foreground" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">
                {vehicle.brand} {vehicle.model}
              </h1>
              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusInfo.color)}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-muted-foreground">
              {vehicle.year} • {vehicle.id} • VIN: {vehicle.vin}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
            )}
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Le véhicule {vehicle.brand} {vehicle.model} sera définitivement supprimé.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Progress bar du statut */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-muted-foreground">{statusInfo.progress}%</span>
            </div>
            <Progress value={statusInfo.progress} className="h-2" />
            <div className="flex justify-between mt-4">
              {timeline.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center mb-2',
                        step.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn('text-xs font-medium', step.completed ? 'text-foreground' : 'text-muted-foreground')}>
                      {step.label}
                    </span>
                    {step.date && (
                      <span className="text-xs text-muted-foreground">{step.date}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <Card>
            <CardContent className="pt-3 sm:pt-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 sm:h-9 w-8 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Prix de revient</p>
                  <p className="text-sm sm:text-base font-semibold truncate">{tauxChangeReel > 0 && prixRevient > 0 ? formatCurrency(prixRevient) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 sm:h-9 w-8 sm:w-9 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Prix de vente</p>
                  <p className="text-sm sm:text-base font-semibold truncate">{sellingPrice > 0 ? formatCurrency(sellingPrice) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 sm:h-9 w-8 sm:w-9 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Bénéfice</p>
                  <p className={cn('text-sm sm:text-base font-semibold truncate', hasBeneficeData ? (benefice > 0 ? 'text-success' : 'text-destructive') : '')}>
                    {hasBeneficeData ? formatCurrency(benefice) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 sm:h-9 w-8 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Taux réel (moy. pondéré)</p>
                  <p className="text-sm sm:text-base font-semibold truncate">{tauxChangeFinal > 0 ? `${tauxChangeFinal.toFixed(2)} DZD/$` : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Écart réel / approx. */}
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={cn('h-8 sm:h-9 w-8 sm:w-9 rounded-lg flex items-center justify-center flex-shrink-0', ecartPrixRevient !== null ? (ecartPrixRevient >= 0 ? 'bg-destructive/10' : 'bg-success/10') : 'bg-muted')}>
                <TrendingUp className={cn('h-4 w-4', ecartPrixRevient !== null ? (ecartPrixRevient >= 0 ? 'text-destructive' : 'text-success') : 'text-muted-foreground')} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Écart réel / approx.</p>
                <p className={cn('text-sm sm:text-base font-semibold truncate', ecartPrixRevient !== null ? (ecartPrixRevient >= 0 ? 'text-destructive' : 'text-success') : '')}>
                  {ecartPrixRevient !== null ? `${ecartPrixRevient >= 0 ? '+' : ''}${formatCurrency(ecartPrixRevient)}` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="costs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="costs">Coûts & Versements</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
          </TabsList>

          {/* Coûts & Versements */}
          <TabsContent value="costs" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Colonne gauche : Coûts USD */}
              <div className="space-y-4">
                {/* Prix véhicule USD */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Prix du véhicule (USD)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>Prix FOB</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          className="pl-7"
                          value={prixVehicule}
                          onChange={(e) => handlePrixVehiculeChange(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prix transport USD */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Prix du transport (USD)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>Fret + Assurance</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          className="pl-7"
                          value={prixTransport}
                          onChange={(e) => handlePrixTransportChange(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Charges Transit DZD */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Charges Transit (DZD)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Total incluant : Douane, Transit, Quittance, Port
                    </p>
                    <Input
                      type="number"
                      value={chargesTransit}
                      onChange={(e) => handleChargesTransitChange(Number(e.target.value))}
                    />
                  </CardContent>
                </Card>

                {/* Charges Divers DZD */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Charges Divers (DZD)</CardTitle>
                      <Button variant="outline" size="sm" onClick={addChargeDivers}>
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {chargesDivers.length === 0 && !newCharge ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucune charge diverse
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {chargesDivers.map((c) => (
                          <div key={c.id} className="flex items-center gap-2">
                            <Input
                              placeholder="Libellé"
                              className="flex-1"
                              value={c.label}
                              disabled
                            />
                            <Input
                              type="number"
                              placeholder="Montant"
                              className="w-32"
                              value={c.amount || ''}
                              disabled
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeChargeDivers(c.id)}
                              disabled={deleteChargeMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        
                        {/* New charge form */}
                        {newCharge && (
                          <div className="flex items-center gap-2 p-2 border border-dashed border-primary rounded">
                            <Input
                              placeholder="Libellé"
                              className="flex-1"
                              value={newCharge.label}
                              onChange={(e) => setNewCharge({ ...newCharge, label: e.target.value })}
                            />
                            <Input
                              type="number"
                              placeholder="Montant"
                              className="w-32"
                              value={newCharge.amount || ''}
                              onChange={(e) => setNewCharge({ ...newCharge, amount: Number(e.target.value) })}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={saveNewCharge}
                              disabled={createChargeMutation.isPending}
                            >
                              <Save className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelNewCharge}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        )}
                        
                        {chargesDivers.length > 0 && (
                          <div className="pt-2 border-t border-border flex justify-between text-sm">
                            <span className="text-muted-foreground">Total</span>
                            <span className="font-medium">{formatCurrency(totalChargesDivers)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Colonne droite : Taux + Prix de revient */}
              <div className="space-y-4">
                {/* Taux de change approximatif */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Taux de change approximatif
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>Taux DZD / USD</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tauxApproximatif || ''}
                        onChange={(e) => handleTauxApproximatifChange(Number(e.target.value))}
                        placeholder="Ex: 134.50"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Récap prix de revient */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Prix de revient approximatif</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total USD ({formatCurrency(totalUSD, 'USD')} × {tauxApproximatif.toFixed(2)})
                        </span>
                        <span>{formatCurrency(totalUSDenDZD)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Charges Transit</span>
                        <span>{formatCurrency(chargesTransit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Charges Divers</span>
                        <span>{formatCurrency(totalChargesDivers)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-primary/20">
                        <span className="font-semibold">Prix de revient approximatif</span>
                        <span className="text-xl font-bold text-success">{formatCurrency(prixRevient)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                 {/* Prix de revient FINAL - only when dossier is soldé */}
                 {isDossierSolde && (
                   <Card className="border-2" style={{ borderColor: 'hsl(142, 71%, 45%)', backgroundColor: 'hsl(142, 71%, 45%, 0.12)' }}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-success">
                        <CheckCircle2 className="h-5 w-5" />
                        Prix de revient final — Dossier Soldé
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Taux de change réel (moyen pondéré)</span>
                          <span className="font-semibold text-success">{tauxChangeFinal.toFixed(2)} DZD/$</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total USD ({formatCurrency(totalUSD, 'USD')} × {tauxChangeFinal.toFixed(2)})
                          </span>
                          <span>{formatCurrency(totalUSD * tauxChangeFinal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Charges Transit</span>
                          <span>{formatCurrency(chargesTransit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Charges Divers</span>
                          <span>{formatCurrency(totalChargesDivers)}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-success/30">
                          <span className="font-semibold text-success">Prix de revient final</span>
                          <span className="text-xl font-bold text-success">
                            {formatCurrency((totalUSD * tauxChangeFinal) + chargesTransit + totalChargesDivers)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <BadgeCheck className="h-4 w-4 text-success" />
                          <span className="text-xs font-medium text-success">Véhicule Payé (Soldé)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Détails */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Informations véhicule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marque</span>
                    <span className="font-medium">{vehicle.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modèle</span>
                    <span className="font-medium">{vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Année</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VIN</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{vehicle.vin}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conteneur</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{vehicle.conteneur?.numero || vehicle.conteneurId || '-'}</code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Fournisseur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom</span>
                    <span className="font-medium">{vehicle.supplier?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Localisation</span>
                    <span className="font-medium">{vehicle.supplier?.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Note</span>
                    <span className="font-medium">⭐ {vehicle.supplier?.rating || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client Import (Partenaire)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom</span>
                    <span className="font-medium">{clientImport.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Part des bénéfices</span>
                    <span className="font-medium">{clientImport.profitPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Montant investi</span>
                    <span className="font-medium">{formatCurrency(clientImport.investedAmount)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Dates clés
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commande</span>
                    <span className="font-medium">{vehicle.orderDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arrivée</span>
                    <span className="font-medium">{vehicle.arrivalDate || 'En attente'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vente</span>
                    <span className="font-medium">{vehicle.soldDate || 'Non vendu'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      <EditVehicleDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        vehicle={vehicle}
      />
    </DashboardLayout>
  );
};

export default VehicleDetailPage;
