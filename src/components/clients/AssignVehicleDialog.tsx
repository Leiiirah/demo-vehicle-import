import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDossiers, useVehicles, useUpdateVehicle } from '@/hooks/useApi';
import { Car, Search, Loader2, Check, FolderOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface AssignVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

export function AssignVehicleDialog({ open, onOpenChange, clientId, clientName }: AssignVehicleDialogProps) {
  const { data: dossiers = [], isLoading: dossiersLoading } = useDossiers();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const updateVehicle = useUpdateVehicle();

  const [step, setStep] = useState<'dossier' | 'vehicle'>('dossier');
  const [dossierSearch, setDossierSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const filteredDossiers = dossiers.filter((d: any) => {
    if (d.status === 'termine') return false;
    const term = dossierSearch.toLowerCase();
    return (
      d.reference?.toLowerCase().includes(term) ||
      d.supplier?.name?.toLowerCase().includes(term)
    );
  });

  // Vehicles inside the selected dossier that are not yet assigned to a client
  const dossierVehicles = vehicles.filter((v: any) => {
    if (!selectedDossier) return false;
    const belongsToDossier = v.conteneur?.dossier?.id === selectedDossier.id;
    const isAvailable = !v.clientId;
    return belongsToDossier && isAvailable;
  });

  const filteredVehicles = dossierVehicles.filter((v: any) => {
    const term = vehicleSearch.toLowerCase();
    return (
      v.brand?.toLowerCase().includes(term) ||
      v.model?.toLowerCase().includes(term) ||
      v.vin?.toLowerCase().includes(term) ||
      String(v.year).includes(term)
    );
  });

  const statusLabels: Record<string, string> = {
    ordered: 'Commandé',
    in_transit: 'En transit',
    arrived: 'Arrivé',
    sold: 'Vendu',
  };

  const handleReset = () => {
    setStep('dossier');
    setDossierSearch('');
    setVehicleSearch('');
    setSelectedDossier(null);
    setSelectedVehicleId(null);
  };

  const handleClose = (val: boolean) => {
    if (!val) handleReset();
    onOpenChange(val);
  };

  const handleAssign = () => {
    if (!selectedVehicleId) return;
    updateVehicle.mutate(
      { id: selectedVehicleId, data: { clientId } },
      {
        onSuccess: () => {
          toast.success('Véhicule affecté au client avec succès');
          handleReset();
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Erreur lors de l'affectation du véhicule");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'dossier' ? 'Sélectionner un dossier' : 'Sélectionner un véhicule'}
          </DialogTitle>
          <DialogDescription>
            {step === 'dossier'
              ? `Étape 1/2 — Choisissez le dossier pour ${clientName}`
              : `Étape 2/2 — Choisissez un véhicule du dossier ${selectedDossier?.reference}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'dossier' ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par référence ou fournisseur..."
                className="pl-9"
                value={dossierSearch}
                onChange={(e) => setDossierSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[300px] pr-2">
              {dossiersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredDossiers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Aucun dossier trouvé
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDossiers.map((dossier: any) => (
                    <button
                      key={dossier.id}
                      type="button"
                      onClick={() => setSelectedDossier(dossier)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                        selectedDossier?.id === dossier.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent/50'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <FolderOpen className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{dossier.reference}</div>
                        <div className="text-xs text-muted-foreground">
                          {dossier.supplier?.name || 'Fournisseur inconnu'}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {dossier.status === 'en_cours' ? 'En cours' : dossier.status === 'termine' ? 'Terminé' : dossier.status}
                      </Badge>
                      {selectedDossier?.id === dossier.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => setStep('vehicle')}
                disabled={!selectedDossier}
                className="gap-2"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par marque, modèle ou VIN..."
                className="pl-9"
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[300px] pr-2">
              {vehiclesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Aucun véhicule disponible dans ce dossier
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredVehicles.map((vehicle: any) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                        selectedVehicleId === vehicle.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent/50'
                      }`}
                    >
                      {vehicle.photoUrl ? (
                        <img
                          src={vehicle.photoUrl}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Car className="h-5 w-5 text-secondary-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          VIN: {vehicle.vin}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {statusLabels[vehicle.status] || vehicle.status}
                      </Badge>
                      {selectedVehicleId === vehicle.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('dossier')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <Button
                onClick={handleAssign}
                disabled={!selectedVehicleId || updateVehicle.isPending}
              >
                {updateVehicle.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Affecter
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
