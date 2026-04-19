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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useClients, useVehicles, useCreateSale } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';
import { Car, Search, Loader2, Check, Users, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';

interface NewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetClient?: any;
}

type Step = 'client' | 'vehicle' | 'price';

export function NewSaleDialog({ open, onOpenChange, presetClient }: NewSaleDialogProps) {
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const createSale = useCreateSale();

  const [step, setStep] = useState<Step>(presetClient ? 'vehicle' : 'client');
  const [clientSearch, setClientSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(presetClient ?? null);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [vehiclePrices, setVehiclePrices] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredClients = clients.filter((c: any) => {
    const term = clientSearch.toLowerCase();
    return (
      `${c.nom} ${c.prenom}`.toLowerCase().includes(term) ||
      c.telephone?.includes(term) ||
      c.company?.toLowerCase().includes(term)
    );
  });

  // Show only vehicles in stock (not sold, not assigned to a client)
  const stockVehicles = vehicles.filter((v: any) => v.status === 'ordered' && !v.clientId);

  const filteredVehicles = stockVehicles.filter((v: any) => {
    const term = vehicleSearch.toLowerCase();
    return (
      v.brand?.toLowerCase().includes(term) ||
      v.model?.toLowerCase().includes(term) ||
      v.vin?.toLowerCase().includes(term) ||
      String(v.year).includes(term)
    );
  });

  const selectedVehicles = vehicles.filter((v: any) => selectedVehicleIds.includes(v.id));

  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleReset = () => {
    setStep(presetClient ? 'vehicle' : 'client');
    setClientSearch('');
    setVehicleSearch('');
    setSelectedClient(presetClient ?? null);
    setSelectedVehicleIds([]);
    setVehiclePrices({});
    setIsSubmitting(false);
  };

  const handleClose = (val: boolean) => {
    if (!val) handleReset();
    onOpenChange(val);
  };

  const formatWithSpaces = (value: string) => {
    const num = value.replace(/\s/g, '').replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const updatePrice = (vehicleId: string, rawInput: string) => {
    const cleaned = rawInput.replace(/\s/g, '');
    setVehiclePrices((prev) => ({ ...prev, [vehicleId]: cleaned }));
  };

  const allPricesFilled = selectedVehicleIds.every((id) => vehiclePrices[id] && Number(vehiclePrices[id]) > 0);

  const handleAssign = async () => {
    if (!selectedClient || selectedVehicleIds.length === 0) return;
    setIsSubmitting(true);

    try {
      await createSale.mutateAsync({
        clientId: selectedClient.id,
        vehicles: selectedVehicleIds.map((vehicleId) => ({
          vehicleId,
          sellingPrice: Number(vehiclePrices[vehicleId]),
        })),
      });

      toast.success(
        selectedVehicleIds.length === 1
          ? `Vente enregistrée pour ${selectedClient.nom} ${selectedClient.prenom}`
          : `Vente de ${selectedVehicleIds.length} véhicules enregistrée pour ${selectedClient.nom} ${selectedClient.prenom}`
      );
      handleReset();
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement de la vente");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'client' && 'Sélectionner un client'}
            {step === 'vehicle' && 'Sélectionner les véhicules'}
            {step === 'price' && 'Prix de vente'}
          </DialogTitle>
          <DialogDescription>
            {step === 'client' && 'Étape 1/3 — Choisissez le client acheteur'}
            {step === 'vehicle' && (presetClient
              ? `Étape 1/2 — Sélectionnez un ou plusieurs véhicules pour ${selectedClient?.nom} ${selectedClient?.prenom}`
              : `Étape 2/3 — Sélectionnez un ou plusieurs véhicules pour ${selectedClient?.nom} ${selectedClient?.prenom}`)}
            {step === 'price' && (presetClient
              ? `Étape 2/2 — Définissez le prix de vente pour ${selectedVehicleIds.length} véhicule(s)`
              : `Étape 3/3 — Définissez le prix de vente pour ${selectedVehicleIds.length} véhicule(s)`)}
          </DialogDescription>
        </DialogHeader>

        {step === 'client' && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                className="pl-9"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[300px] pr-2">
              {clientsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Aucun client trouvé</div>
              ) : (
                <div className="space-y-2">
                  {filteredClients.map((client: any) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => setSelectedClient(client)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                        selectedClient?.id === client.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{client.nom} {client.prenom}</div>
                        <div className="text-xs text-muted-foreground">
                          {client.telephone}{client.company && ` • ${client.company}`}
                        </div>
                      </div>
                      {selectedClient?.id === client.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>Annuler</Button>
              <Button onClick={() => setStep('vehicle')} disabled={!selectedClient} className="gap-2">
                Suivant <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'vehicle' && (
          <>
            {selectedVehicleIds.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default" className="text-xs">
                  {selectedVehicleIds.length} sélectionné(s)
                </Badge>
                {selectedVehicles.map((v: any) => (
                  <Badge key={v.id} variant="secondary" className="text-xs gap-1">
                    {v.brand} {v.model}
                    <button type="button" onClick={() => toggleVehicle(v.id)} className="ml-0.5 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
                <div className="text-center py-8 text-muted-foreground text-sm">Aucun véhicule en stock disponible</div>
              ) : (
                <div className="space-y-2">
                  {filteredVehicles.map((vehicle: any) => {
                    const isSelected = selectedVehicleIds.includes(vehicle.id);
                    return (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => toggleVehicle(vehicle.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'
                        }`}
                      >
                        {vehicle.photoUrl ? (
                          <img src={vehicle.photoUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                            <Car className="h-5 w-5 text-secondary-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                            {vehicle.color && (
                              <span className="ml-2 text-xs text-muted-foreground">• {vehicle.color}</span>
                            )}
                            {vehicle.transmission && (
                              <span className="ml-1 text-xs text-muted-foreground">• {vehicle.transmission === 'automatic' ? 'Auto' : 'Manuel'}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">VIN: {vehicle.vin}</div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">En stock</Badge>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              {presetClient ? (
                <Button variant="outline" onClick={() => handleClose(false)}>Annuler</Button>
              ) : (
                <Button variant="outline" onClick={() => setStep('client')} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Retour
                </Button>
              )}
              <Button onClick={() => setStep('price')} disabled={selectedVehicleIds.length === 0} className="gap-2">
                Suivant <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'price' && (
          <>
            <ScrollArea className={selectedVehicles.length > 2 ? 'h-[350px] pr-2' : ''}>
              <div className="space-y-4">
                {selectedVehicles.map((vehicle: any) => (
                  <div key={vehicle.id} className="space-y-2 p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      {vehicle.photoUrl ? (
                        <img src={vehicle.photoUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Car className="h-5 w-5 text-secondary-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{vehicle.brand} {vehicle.model} ({vehicle.year})</div>
                        <div className="text-xs text-muted-foreground">Coût de revient : {formatCurrency(vehicle.totalCost || 0)}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prix de vente (DZD)</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={formatWithSpaces(vehiclePrices[vehicle.id] || '')}
                        onChange={(e) => updatePrice(vehicle.id, e.target.value)}
                      />
                      {vehiclePrices[vehicle.id] && vehicle.totalCost ? (
                        <p className={`text-xs font-medium ${Number(vehiclePrices[vehicle.id]) - Number(vehicle.totalCost) >= 0 ? 'text-success' : 'text-destructive'}`}>
                          Bénéfice estimé : {formatCurrency(Number(vehiclePrices[vehicle.id]) - Number(vehicle.totalCost))}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('vehicle')} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <Button onClick={handleAssign} disabled={!allPricesFilled || isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Enregistrer la vente
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
