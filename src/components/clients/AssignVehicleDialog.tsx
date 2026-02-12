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
import { useVehicles, useUpdateVehicle } from '@/hooks/useApi';
import { Car, Search, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AssignVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

export function AssignVehicleDialog({ open, onOpenChange, clientId, clientName }: AssignVehicleDialogProps) {
  const { data: vehicles = [], isLoading } = useVehicles();
  const updateVehicle = useUpdateVehicle();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Show vehicles not yet assigned to any client
  const availableVehicles = vehicles.filter((v: any) => !v.clientId);

  const filteredVehicles = availableVehicles.filter((v: any) => {
    const term = searchTerm.toLowerCase();
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

  const handleAssign = () => {
    if (!selectedVehicleId) return;
    updateVehicle.mutate(
      { id: selectedVehicleId, data: { clientId } },
      {
        onSuccess: () => {
          toast.success('Véhicule affecté au client avec succès');
          setSelectedVehicleId(null);
          setSearchTerm('');
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Erreur lors de l'affectation du véhicule");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Affecter un véhicule</DialogTitle>
          <DialogDescription>
            Sélectionnez un véhicule à affecter à <strong>{clientName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par marque, modèle ou VIN..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[300px] pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucun véhicule disponible
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedVehicleId || updateVehicle.isPending}
          >
            {updateVehicle.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Affecter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
