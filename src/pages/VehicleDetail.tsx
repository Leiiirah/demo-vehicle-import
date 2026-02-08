import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useVehicle } from '@/hooks/useApi';
import { api } from '@/services/api';
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

interface Versement {
  id: string;
  date: string;
  montantUSD: number;
  tauxChange: number;
}

interface ChargeDivers {
  id: string;
  libelle: string;
  montant: number;
}

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: vehicle, isLoading, error } = useVehicle(id || '');

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
  const [chargesDivers, setChargesDivers] = useState<ChargeDivers[]>([]);

  // État pour les versements
  const [versements, setVersements] = useState<Versement[]>([]);

  // Initialize state from vehicle when loaded
  useEffect(() => {
    if (vehicle) {
      setPrixVehicule(Number(vehicle.purchasePrice) || 0);
      setPrixTransport(Number(vehicle.transportCost) || 0);
      setChargesTransit(Number(vehicle.localFees) || 0);
      setHasChanges(false);
    }
  }, [vehicle]);

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

  // Calculs
  const totalUSD = prixVehicule + prixTransport;
  const totalVerse = versements.reduce((sum, v) => sum + v.montantUSD, 0);
  const resteAVerser = totalUSD - totalVerse;

  // Taux moyen pondéré
  const tauxMoyenPondere = versements.length > 0
    ? versements.reduce((sum, v) => sum + v.montantUSD * v.tauxChange, 0) / 
      versements.reduce((sum, v) => sum + v.montantUSD, 0) || 0
    : 0;

  // Total USD converti en DZD via taux moyen
  const totalUSDenDZD = totalUSD * tauxMoyenPondere;

  // Total charges diverses
  const totalChargesDivers = chargesDivers.reduce((sum, c) => sum + c.montant, 0);

  // Prix de revient
  const prixRevient = totalUSDenDZD + chargesTransit + totalChargesDivers;

  // Calcul de la répartition des bénéfices (safe access after loading check)
  const sellingPrice = vehicle?.sellingPrice ?? 0;
  const benefice = sellingPrice - prixRevient;
  const clientShare = (benefice * clientImport.profitPercentage) / 100;
  const companyShare = benefice - clientShare;

  // Gestion des versements
  const addVersement = () => {
    setVersements([
      ...versements,
      { id: `v-${Date.now()}`, date: '', montantUSD: 0, tauxChange: 0 },
    ]);
  };

  const updateVersement = (id: string, field: keyof Versement, value: string | number) => {
    setVersements(
      versements.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const removeVersement = (id: string) => {
    setVersements(versements.filter((v) => v.id !== id));
  };

  // Gestion des charges diverses
  const addChargeDivers = () => {
    setChargesDivers([
      ...chargesDivers,
      { id: `cd-${Date.now()}`, libelle: '', montant: 0 },
    ]);
  };

  const updateChargeDivers = (id: string, field: keyof ChargeDivers, value: string | number) => {
    setChargesDivers(
      chargesDivers.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeChargeDivers = (id: string) => {
    setChargesDivers(chargesDivers.filter((c) => c.id !== id));
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
      ordered: { label: 'Commandé', color: 'badge-info', progress: 25, icon: Package },
      in_transit: { label: 'En transit', color: 'badge-pending', progress: 50, icon: Ship },
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prix de revient</p>
                  <p className="text-xl font-semibold">{formatCurrency(prixRevient)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prix de vente</p>
                  <p className="text-xl font-semibold">{formatCurrency(sellingPrice)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bénéfice</p>
                  <p className={cn('text-xl font-semibold', benefice > 0 ? 'text-success' : 'text-destructive')}>
                    {formatCurrency(benefice)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taux moyen</p>
                  <p className="text-xl font-semibold">{tauxMoyenPondere.toFixed(2)} DZD/$</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="costs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="costs">Coûts & Versements</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="profit">Répartition bénéfices</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
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
                    {chargesDivers.length === 0 ? (
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
                              value={c.libelle}
                              onChange={(e) => updateChargeDivers(c.id, 'libelle', e.target.value)}
                            />
                            <Input
                              type="number"
                              placeholder="Montant"
                              className="w-32"
                              value={c.montant || ''}
                              onChange={(e) => updateChargeDivers(c.id, 'montant', Number(e.target.value))}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeChargeDivers(c.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-border flex justify-between text-sm">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-medium">{formatCurrency(totalChargesDivers)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Colonne droite : Versements */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Versements USD
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={addVersement}>
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Récap */}
                    <div className="p-3 bg-muted/50 rounded-lg mb-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total USD à payer</span>
                        <span className="font-semibold">{formatCurrency(totalUSD, 'USD')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total versé</span>
                        <span className="font-medium">{formatCurrency(totalVerse, 'USD')}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-border">
                        <span className="text-muted-foreground">Reste à verser</span>
                        <span className={cn('font-semibold', resteAVerser > 0 ? 'text-warning' : 'text-success')}>
                          {formatCurrency(resteAVerser, 'USD')}
                        </span>
                      </div>
                    </div>

                    {/* Liste des versements */}
                    {versements.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aucun versement enregistré
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {versements.map((v, index) => (
                          <div key={v.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Versement {index + 1}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVersement(v.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Date</Label>
                                <Input
                                  type="date"
                                  value={v.date}
                                  onChange={(e) => updateVersement(v.id, 'date', e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Montant USD</Label>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                  <Input
                                    type="number"
                                    className="pl-5"
                                    value={v.montantUSD || ''}
                                    onChange={(e) => updateVersement(v.id, 'montantUSD', Number(e.target.value))}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Taux de change</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={v.tauxChange || ''}
                                  onChange={(e) => updateVersement(v.id, 'tauxChange', Number(e.target.value))}
                                />
                              </div>
                            </div>
                            {v.montantUSD > 0 && v.tauxChange > 0 && (
                              <div className="mt-2 text-xs text-right text-muted-foreground">
                                = {formatCurrency(v.montantUSD * v.tauxChange)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Taux moyen */}
                    {versements.length > 0 && (
                      <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Taux moyen pondéré</span>
                          <span className="text-lg font-bold">{tauxMoyenPondere.toFixed(2)} DZD/$</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Récap prix de revient */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Prix de revient</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total USD ({formatCurrency(totalUSD, 'USD')} × {tauxMoyenPondere.toFixed(2)})
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
                        <span className="font-semibold">Total prix de revient</span>
                        <span className="text-xl font-bold">{formatCurrency(prixRevient)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

          {/* Répartition bénéfices */}
          <TabsContent value="profit">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des bénéfices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-6 bg-success/10 border border-success/20 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Bénéfice total</p>
                    <p className={cn('text-3xl font-bold', benefice > 0 ? 'text-success' : 'text-destructive')}>
                      {formatCurrency(benefice)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Prix de vente ({formatCurrency(vehicle.sellingPrice)}) - Prix de revient ({formatCurrency(prixRevient)})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium">Part Client Import</span>
                      </div>
                      <p className="text-2xl font-bold">{formatCurrency(clientShare > 0 ? clientShare : 0)}</p>
                      <p className="text-sm text-muted-foreground">
                        {clientImport.profitPercentage}% - {clientImport.name}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">Part Entreprise</span>
                      </div>
                      <p className="text-2xl font-bold">{formatCurrency(companyShare > 0 ? companyShare : 0)}</p>
                      <p className="text-sm text-muted-foreground">
                        {100 - clientImport.profitPercentage}% - Votre part
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-3">Statut des paiements</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Montant dû au client import</span>
                        <span className="font-medium text-warning">{formatCurrency(clientShare > 0 ? clientShare : 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Déjà versé</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="font-medium">Reste à verser</span>
                        <span className="font-medium text-destructive">{formatCurrency(clientShare > 0 ? clientShare : 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Bill of Lading (B/L)', status: 'uploaded', date: '2026-01-15' },
                    { name: 'Facture fournisseur', status: 'uploaded', date: '2026-01-15' },
                    { name: 'Certificat de conformité', status: 'pending', date: null },
                    { name: 'Déclaration douanière', status: 'pending', date: null },
                    { name: 'Photos véhicule', status: 'uploaded', date: '2026-01-20' },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          {doc.date && (
                            <p className="text-xs text-muted-foreground">Ajouté le {doc.date}</p>
                          )}
                        </div>
                      </div>
                      {doc.status === 'uploaded' ? (
                        <span className="badge-profit text-xs">Téléchargé</span>
                      ) : (
                        <Button variant="outline" size="sm">
                          Ajouter
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historique */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Historique des activités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: '2026-01-28', action: 'Véhicule arrivé au port d\'Alger', type: 'status' },
                    { date: '2026-01-28', action: 'Versement de $5,000 @ 136.20 DZD/$', type: 'payment' },
                    { date: '2026-01-25', action: 'Déclaration douanière initiée', type: 'document' },
                    { date: '2026-01-22', action: 'Versement de $10,000 @ 135.50 DZD/$', type: 'payment' },
                    { date: '2026-01-20', action: 'Départ du port de Shanghai', type: 'status' },
                    { date: '2026-01-18', action: 'Photos du véhicule ajoutées', type: 'document' },
                    { date: '2026-01-15', action: 'Versement de $15,000 @ 134.00 DZD/$', type: 'payment' },
                    { date: '2026-01-15', action: 'Commande passée chez ' + vehicle.supplier, type: 'status' },
                    { date: '2026-01-15', action: 'B/L et facture uploadés', type: 'document' },
                  ].map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'h-3 w-3 rounded-full',
                          event.type === 'status' ? 'bg-primary' : 
                          event.type === 'payment' ? 'bg-success' : 'bg-muted-foreground'
                        )} />
                        {index < 8 && <div className="w-px h-full bg-border" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium">{event.action}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
