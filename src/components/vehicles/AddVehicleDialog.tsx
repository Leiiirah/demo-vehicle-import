import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollableDialogContent,
  ScrollableDialogBody,
  ScrollableDialogFooter,
} from '@/components/ui/scrollable-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Car, DollarSign, Truck, FileText, Plus, Trash2, CreditCard, Loader2, Upload, X, BookOpen } from 'lucide-react';
import { api, type CreateVehicleData } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { BrandCombobox } from '@/components/vehicles/BrandCombobox';

interface AddVehicleDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  preSelectedConteneurId?: string;
  preSelectedSupplierId?: string;
}

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

const AddVehicleDialog = ({ children, open: controlledOpen, onOpenChange: controlledOnOpenChange, preSelectedConteneurId, preSelectedSupplierId }: AddVehicleDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (controlledOnOpenChange) controlledOnOpenChange(v);
    else setInternalOpen(v);
  };
  const [step, setStep] = useState(1);

  // Champs du formulaire
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2025');
  const [vin, setVin] = useState('');
  const [color, setColor] = useState('');
  const [conteneurId, setConteneurId] = useState(preSelectedConteneurId || '');
  const [status, setStatus] = useState<'ordered' | 'in_transit' | 'arrived'>('in_transit');
  const [supplierId, setSupplierId] = useState(preSelectedSupplierId || '');

  useEffect(() => {
    if (preSelectedConteneurId) setConteneurId(preSelectedConteneurId);
  }, [preSelectedConteneurId]);

  useEffect(() => {
    if (preSelectedSupplierId) setSupplierId(preSelectedSupplierId);
  }, [preSelectedSupplierId]);
  const [orderDate, setOrderDate] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [transmission, setTransmission] = useState<'manual' | 'automatic'>('automatic');
  const [passeportId, setPasseportId] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // État pour les coûts USD
  const [prixVehicule, setPrixVehicule] = useState<number>(0);
  const [prixTransport, setPrixTransport] = useState<number>(0);

  // État pour les charges DZD
  const [chargesTransit, setChargesTransit] = useState<number>(0);
  const [chargesDivers, setChargesDivers] = useState<ChargeDivers[]>([]);

  // État pour les versements
  const [versements, setVersements] = useState<Versement[]>([]);

  const queryClient = useQueryClient();

  // Charger les données depuis l'API
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.getSuppliers(),
  });

  const { data: conteneurs = [] } = useQuery({
    queryKey: ['conteneurs'],
    queryFn: () => api.getConteneurs(),
  });

  const { data: passeports = [] } = useQuery({
    queryKey: ['passeports'],
    queryFn: () => api.getPasseports(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleData) => api.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['conteneurs'] });
      toast({ title: 'Succès', description: 'Véhicule créé avec succès' });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model || !vin || !supplierId || !conteneurId || !orderDate) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      brand,
      model,
      year: Number(year),
      vin,
      supplierId,
      conteneurId,
      status,
      purchasePrice: prixVehicule,
      localFees: chargesTransit + chargesDivers.reduce((sum, c) => sum + c.montant, 0),
      totalCost: prixRevient,
      orderDate,
      arrivalDate: estimatedArrival || undefined,
      photoUrl: photoPreview || undefined,
      passeportId: passeportId && passeportId !== 'none' ? passeportId : undefined,
    });
  };

  const resetForm = () => {
    setStep(1);
    setBrand('');
    setModel('');
    setYear('2025');
    setVin('');
    setColor('');
    setConteneurId(preSelectedConteneurId || '');
    setStatus('in_transit');
    setSupplierId(preSelectedSupplierId || '');
    setOrderDate('');
    setEstimatedArrival('');
    setPrixVehicule(0);
    setPrixTransport(0);
    setChargesTransit(0);
    setChargesDivers([]);
    setVersements([]);
    setTransmission('automatic');
    setPasseportId('');
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

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


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <ScrollableDialogContent className="max-w-2xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Ajouter un véhicule
          </DialogTitle>
          <DialogDescription>
            Étape {step} sur 4 -{' '}
            {step === 1 && 'Informations du véhicule'}
            {step === 2 && 'Coûts USD & Versements'}
            {step === 3 && 'Charges locales (DZD)'}
            {step === 4 && 'Client Import & Documents'}
          </DialogDescription>
        </DialogHeader>

        <ScrollableDialogBody>
          {/* Progress bar */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <form id="add-vehicle-form" onSubmit={handleSubmit}>
          {/* Étape 1: Informations véhicule */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque *</Label>
                  <BrandCombobox value={brand} onChange={setBrand} id="brand" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modèle *</Label>
                  <Input id="model" placeholder="Ex: Land Cruiser" value={model} onChange={(e) => setModel(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Année *</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vin">Numéro VIN *</Label>
                  <Input id="vin" placeholder="17 caractères" maxLength={17} value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Couleur</Label>
                  <Input id="color" placeholder="Ex: Noir métallisé" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conteneurId">Conteneur *</Label>
                  {preSelectedConteneurId ? (
                    <div className="p-2.5 bg-accent/50 rounded-md text-sm font-medium">
                      {conteneurs.find(c => c.id === preSelectedConteneurId)?.numero || 'Conteneur sélectionné'}
                    </div>
                  ) : (
                    <Select value={conteneurId} onValueChange={setConteneurId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un conteneur" />
                      </SelectTrigger>
                      <SelectContent>
                        {conteneurs.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.numero}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Statut initial *</Label>
                  <Select value={status} onValueChange={(val) => setStatus(val as 'ordered' | 'in_transit' | 'arrived')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordered">En stock</SelectItem>
                      <SelectItem value="in_transit">Chargée</SelectItem>
                      <SelectItem value="arrived">Arrivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmission">Boîte de vitesse</Label>
                  <Select value={transmission} onValueChange={(v) => setTransmission(v as 'manual' | 'automatic')}>
                    <SelectTrigger id="transmission">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatique</SelectItem>
                      <SelectItem value="manual">Manuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passeportId" className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Passeport
                </Label>
                <Select value={passeportId} onValueChange={setPasseportId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un passeport (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {passeports.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.prenom} {p.nom} — {p.numeroPasseport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Photo */}
              <div className="space-y-2">
                <Label>Photo du véhicule</Label>
                {photoPreview ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                      className="absolute top-1 right-1 bg-background/80 rounded-full p-1 hover:bg-background"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="add-vehicle-photo-upload"
                    className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Cliquer pour ajouter une photo</span>
                    <input
                      id="add-vehicle-photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Étape 2: Coûts USD & Versements */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Prix véhicule USD */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium">Prix du véhicule (USD)</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prixVehicule">Prix FOB *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      id="prixVehicule" 
                      type="number" 
                      className="pl-7" 
                      placeholder="0"
                      value={prixVehicule || ''}
                      onChange={(e) => setPrixVehicule(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Prix transport USD */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="font-medium">Prix du transport (USD)</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prixTransport">Fret + Assurance *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      id="prixTransport" 
                      type="number" 
                      className="pl-7" 
                      placeholder="0"
                      value={prixTransport || ''}
                      onChange={(e) => setPrixTransport(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Récap USD */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total USD à payer</span>
                  <span className="font-semibold">{formatCurrency(totalUSD, 'USD')}</span>
                </div>
              </div>

              {/* Versements */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="font-medium">Versements (USD)</span>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addVersement}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>

                {versements.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun versement enregistré. Cliquez sur "Ajouter" pour créer un versement.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {versements.map((v, index) => (
                      <div key={v.id} className="p-3 bg-background rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Versement {index + 1}</span>
                          <Button
                            type="button"
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
                                placeholder="0"
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
                              placeholder="Ex: 134.50"
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

                {/* Récap versements */}
                {versements.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total versé</span>
                      <span className="font-medium">{formatCurrency(totalVerse, 'USD')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reste à verser</span>
                      <span className={`font-medium ${resteAVerser > 0 ? 'text-warning' : 'text-success'}`}>
                        {formatCurrency(resteAVerser, 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taux moyen pondéré</span>
                      <span className="font-medium">{tauxMoyenPondere.toFixed(2)} DZD/$</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Étape 3: Charges locales DZD */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Charges Transit */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <span className="font-medium mb-3 block">Charges Transit (DZD)</span>
                <p className="text-sm text-muted-foreground mb-3">
                  Total incluant : Douane, Transit, Quittance, Port
                </p>
                <div className="space-y-2">
                  <Label htmlFor="chargesTransit">Montant total *</Label>
                  <Input 
                    id="chargesTransit" 
                    type="number" 
                    placeholder="0"
                    value={chargesTransit || ''}
                    onChange={(e) => setChargesTransit(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Charges Divers */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Charges Divers (DZD)</span>
                  <Button type="button" variant="outline" size="sm" onClick={addChargeDivers}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>

                {chargesDivers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune charge diverse. Cliquez sur "Ajouter" pour créer une ligne.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {chargesDivers.map((c, index) => (
                      <div key={c.id} className="flex items-center gap-2">
                        <Input
                          placeholder="Libellé (ex: Mise en conformité)"
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
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChargeDivers(c.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {chargesDivers.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-border flex justify-between text-sm">
                    <span className="text-muted-foreground">Total charges diverses</span>
                    <span className="font-medium">{formatCurrency(totalChargesDivers)}</span>
                  </div>
                )}
              </div>

              {/* Récapitulatif prix de revient */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-3">
                <h4 className="font-semibold">Calcul du prix de revient</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total USD ({formatCurrency(totalUSD, 'USD')} × {tauxMoyenPondere.toFixed(2)})</span>
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
                  <div className="flex justify-between pt-2 border-t border-primary/20">
                    <span className="font-semibold">Prix de revient</span>
                    <span className="font-bold text-lg">{formatCurrency(prixRevient)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Client Import & Documents */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <span className="font-medium mb-3 block">Client Import (Partenaire)</span>
                <p className="text-sm text-muted-foreground">
                  Vous pourrez associer un passeport (partenaire) après la création du véhicule.
                </p>
              </div>

              {!preSelectedSupplierId && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <span className="font-medium mb-3 block">Fournisseur</span>
                  <div className="space-y-2">
                    <Label>Sélectionner un fournisseur *</Label>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} - {supplier.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderDate">Date de commande *</Label>
                    <Input id="orderDate" type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedArrival">Arrivée estimée</Label>
                    <Input id="estimatedArrival" type="date" value={estimatedArrival} onChange={(e) => setEstimatedArrival(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">Documents à joindre</span>
                </div>
                <div className="space-y-3">
                  {[
                    'Bill of Lading (B/L)',
                    'Facture fournisseur',
                    'Certificat de conformité',
                  ].map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center justify-between p-3 border border-dashed border-border rounded-lg"
                    >
                      <span className="text-sm">{doc}</span>
                      <Button type="button" variant="outline" size="sm">
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes et observations</Label>
                <Textarea
                  id="notes"
                  placeholder="Ajoutez des informations supplémentaires..."
                  rows={3}
                />
              </div>

              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <h4 className="font-medium text-success mb-2">Récapitulatif final</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• Prix de revient estimé : <span className="font-semibold text-foreground">{formatCurrency(prixRevient)}</span></p>
                  <p>• Taux de change moyen : <span className="font-semibold text-foreground">{tauxMoyenPondere.toFixed(2)} DZD/$</span></p>
                  <p>• {versements.length} versement(s) enregistré(s)</p>
                </div>
              </div>
            </div>
          )}

          </form>
        </ScrollableDialogBody>

        <ScrollableDialogFooter className="justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Précédent
          </Button>
          {step < 4 ? (
            <Button type="button" onClick={nextStep}>
              Suivant
            </Button>
          ) : (
            <Button type="submit" form="add-vehicle-form" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ajouter le véhicule
            </Button>
          )}
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog;
