import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  ScrollableDialogContent,
  ScrollableDialogHeader,
  ScrollableDialogBody,
  ScrollableDialogFooter,
} from '@/components/ui/scrollable-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Car, Plus, Link2, DollarSign, Loader2, Upload, X } from 'lucide-react';
import { api, Vehicle, Conteneur } from '@/services/api';
import { toast } from 'sonner';
import { BrandCombobox } from '@/components/vehicles/BrandCombobox';

interface AffecterVehiculeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conteneurId: string;
  conteneurNumero: string;
}

export const AffecterVehiculeDialog = ({ 
  open, 
  onOpenChange, 
  conteneurId,
  conteneurNumero 
}: AffecterVehiculeDialogProps) => {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  
  // Champs nouveau véhicule
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [vin, setVin] = useState('');
  const [color, setColor] = useState('');
  const [transmission, setTransmission] = useState<'manual' | 'automatic'>('automatic');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [prixVehicule, setPrixVehicule] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [passeportId, setPasseportId] = useState('');

  // Fetch conteneur to get the dossier's supplierId
  const { data: conteneur } = useQuery({
    queryKey: ['conteneur', conteneurId],
    queryFn: () => api.getConteneur(conteneurId),
    enabled: open,
  });

  // Pre-select supplier from conteneur's dossier when data loads
  const dossierSupplierId = conteneur?.dossier?.supplier?.id || conteneur?.dossier?.supplierId;
  
  useEffect(() => {
    if (open && dossierSupplierId && !supplierId) {
      setSupplierId(dossierSupplierId);
    }
  }, [open, dossierSupplierId]);

  // Fetch all vehicles to find unassigned ones (no conteneurId or different conteneurId)
  const { data: allVehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.getVehicles(),
    enabled: open && mode === 'existing',
  });

  // Filter vehicles that don't have a conteneur assigned yet
  const availableVehicles = allVehicles.filter(
    (v) => !v.conteneurId || v.conteneurId === ''
  );

  // Fetch suppliers for the new vehicle form
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.getSuppliers(),
    enabled: open && mode === 'new',
  });

  // Fetch passeports
  const { data: passeports = [] } = useQuery({
    queryKey: ['passeports'],
    queryFn: () => api.getPasseports(),
    enabled: open && mode === 'new',
  });

  // Mutation for updating existing vehicle's conteneurId
  const updateVehicleMutation = useMutation({
    mutationFn: (vehicleId: string) => 
      api.updateVehicle(vehicleId, { conteneurId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteneur', conteneurId] });
      queryClient.invalidateQueries({ queryKey: ['conteneurs'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Véhicule affecté au conteneur avec succès');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation for creating a new vehicle
  const createVehicleMutation = useMutation({
    mutationFn: (data: {
      brand: string;
      model: string;
      year: number;
      vin: string;
      purchasePrice: number;
      supplierId: string;
      conteneurId: string;
      orderDate: string;
      passeportId?: string;
    }) => api.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteneur', conteneurId] });
      queryClient.invalidateQueries({ queryKey: ['conteneurs'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Véhicule créé et affecté au conteneur avec succès');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const isLoading = updateVehicleMutation.isPending || createVehicleMutation.isPending;

  const handleSubmit = async () => {
    try {
      if (mode === 'existing') {
        if (!selectedVehicleId) {
          toast.error('Veuillez sélectionner un véhicule');
          return;
        }
        await updateVehicleMutation.mutateAsync(selectedVehicleId);
      } else {
        if (!brand || !model || !vin || !prixVehicule || !supplierId) {
          toast.error('Veuillez remplir tous les champs obligatoires');
          return;
        }
        await createVehicleMutation.mutateAsync({
          brand,
          model,
          year: parseInt(year, 10),
          vin,
          purchasePrice: parseFloat(prixVehicule),
          supplierId,
          conteneurId,
          orderDate: new Date().toISOString(),
          passeportId: passeportId && passeportId !== 'none' ? passeportId : undefined,
        });
      }
    } catch (error) {
      console.error('Error assigning vehicle:', error);
    }
  };

  const resetForm = () => {
    setMode('new');
    setSelectedVehicleId('');
    setBrand('');
    setModel('');
    setYear('2024');
    setVin('');
    setColor('');
    setTransmission('automatic');
    setPhotoPreview(null);
    setPhotoFile(null);
    setPrixVehicule('');
    setSupplierId('');
    setPasseportId('');
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

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const selectedVehicle = availableVehicles.find(v => v.id === selectedVehicleId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ScrollableDialogContent className="max-w-md">
        <ScrollableDialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Affecter un véhicule
          </DialogTitle>
          <DialogDescription>
            Conteneur : <span className="font-medium text-foreground">{conteneurNumero}</span>
          </DialogDescription>
        </ScrollableDialogHeader>

        <ScrollableDialogBody>
          <div className="space-y-4">
            {/* Formulaire nouveau véhicule */}
            {true && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marque *</Label>
                    <BrandCombobox value={brand} onChange={setBrand} id="brand" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modèle *</Label>
                    <Input 
                      id="model" 
                      placeholder="Ex: Land Cruiser"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Année *</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger id="year">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-lg z-50">
                        {[2026, 2025, 2024, 2023, 2022].map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vin">Numéro VIN *</Label>
                    <Input 
                      id="vin" 
                      placeholder="17 caractères" 
                      maxLength={17}
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      className="font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Couleur et Transmission */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Couleur</Label>
                    <Input
                      id="color"
                      placeholder="Ex: Blanc, Noir"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Boîte de vitesse</Label>
                    <Select value={transmission} onValueChange={(v) => setTransmission(v as 'manual' | 'automatic')}>
                      <SelectTrigger id="transmission">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border shadow-lg z-50">
                        <SelectItem value="automatic">Automatique</SelectItem>
                        <SelectItem value="manual">Manuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                      htmlFor="photo-upload"
                      className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Cliquer pour ajouter une photo</span>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                </div>

                {/* Passeport */}
                <div className="space-y-2">
                  <Label htmlFor="passeportId">Passeport</Label>
                  <Select value={passeportId} onValueChange={setPasseportId}>
                    <SelectTrigger id="passeportId">
                      <SelectValue placeholder="Sélectionner un passeport (optionnel)" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="none">Aucun</SelectItem>
                      {passeports.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.prenom} {p.nom} — {p.numeroPasseport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prix du véhicule */}
                <div className="space-y-2">
                  <Label htmlFor="prixVehicule" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Prix du véhicule (USD) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input 
                      id="prixVehicule" 
                      type="number"
                      placeholder="Ex: 45000"
                      value={prixVehicule}
                      onChange={(e) => setPrixVehicule(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Prix FOB du véhicule. Le coût transport sera ajouté automatiquement.
                  </p>
                </div>
              </>
            )}

          </div>
        </ScrollableDialogBody>

        <ScrollableDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !brand || !model || !vin || !prixVehicule || !supplierId}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Affecter au conteneur
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
};
