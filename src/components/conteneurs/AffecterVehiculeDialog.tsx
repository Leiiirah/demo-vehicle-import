import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Car, Plus, Link2 } from 'lucide-react';

// Mock véhicules non affectés
const mockVehiculesDisponibles = [
  { id: 'VH010', brand: 'Mercedes', model: 'GLE 450', year: 2024, vin: 'W1N253486...', status: 'ordered' },
  { id: 'VH011', brand: 'BMW', model: 'X7', year: 2024, vin: '5UXCW2C5...', status: 'ordered' },
  { id: 'VH012', brand: 'Audi', model: 'Q7', year: 2024, vin: 'WAUZZZ4M...', status: 'ordered' },
];

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
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  
  // Champs nouveau véhicule
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [vin, setVin] = useState('');

  const handleSubmit = () => {
    // TODO: Enregistrer l'affectation
    console.log({
      mode,
      conteneurId,
      vehicleId: mode === 'existing' ? selectedVehicleId : 'new',
      brand,
      model,
      year,
      vin,
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setMode('new');
    setSelectedVehicleId('');
    setBrand('');
    setModel('');
    setYear('2024');
    setVin('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const selectedVehicle = mockVehiculesDisponibles.find(v => v.id === selectedVehicleId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Affecter un véhicule
          </DialogTitle>
          <DialogDescription>
            Conteneur : <span className="font-medium text-foreground">{conteneurNumero}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4 overflow-y-auto flex-1 pr-2">
          {/* Choix mode */}
          <div className="space-y-3">
            <Label>Type d'affectation</Label>
            <RadioGroup 
              value={mode} 
              onValueChange={(value) => setMode(value as 'new' | 'existing')}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="new-vehicle"
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  mode === 'new' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="new" id="new-vehicle" />
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Nouveau</span>
                </div>
              </Label>
              <Label
                htmlFor="existing-vehicle"
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  mode === 'existing' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="existing" id="existing-vehicle" />
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Existant</span>
                </div>
              </Label>
            </RadioGroup>
          </div>

          {/* Formulaire nouveau véhicule */}
          {mode === 'new' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque *</Label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger id="brand">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="toyota">Toyota</SelectItem>
                      <SelectItem value="mercedes">Mercedes</SelectItem>
                      <SelectItem value="bmw">BMW</SelectItem>
                      <SelectItem value="audi">Audi</SelectItem>
                      <SelectItem value="porsche">Porsche</SelectItem>
                      <SelectItem value="land-rover">Land Rover</SelectItem>
                      <SelectItem value="volkswagen">Volkswagen</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="vin">Numéro VIN</Label>
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

              <p className="text-xs text-muted-foreground">
                Les coûts et détails complets pourront être ajoutés depuis la fiche véhicule.
              </p>
            </>
          )}

          {/* Sélection véhicule existant */}
          {mode === 'existing' && (
            <div className="space-y-2">
              <Label htmlFor="vehicle-select">Véhicule disponible *</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger id="vehicle-select">
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  {mockVehiculesDisponibles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{vehicle.brand} {vehicle.model} ({vehicle.year})</span>
                        <span className="text-xs text-muted-foreground font-mono">{vehicle.vin}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {mockVehiculesDisponibles.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun véhicule disponible. Créez-en un nouveau.
                </p>
              )}

              {selectedVehicle && (
                <div className="p-3 bg-accent/50 rounded-lg mt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Véhicule</span>
                    <span className="font-medium">{selectedVehicle.brand} {selectedVehicle.model}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Année</span>
                    <span className="font-medium">{selectedVehicle.year}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VIN</span>
                    <span className="font-medium font-mono">{selectedVehicle.vin}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={mode === 'new' ? !brand || !model : !selectedVehicleId}
          >
            Affecter au conteneur
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
