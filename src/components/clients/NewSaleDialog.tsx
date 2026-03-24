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
import { useClients, useVehicles, useUpdateVehicle } from '@/hooks/useApi';
import { formatCurrency } from '@/lib/utils';
import { Car, Search, Loader2, Check, Users, ArrowRight, ArrowLeft, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface NewSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'client' | 'vehicle' | 'price';

export function NewSaleDialog({ open, onOpenChange }: NewSaleDialogProps) {
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const updateVehicle = useUpdateVehicle();

  const [step, setStep] = useState<Step>('client');
  const [clientSearch, setClientSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [sellingPrice, setSellingPrice] = useState('');

  const filteredClients = clients.filter((c: any) => {
    const term = clientSearch.toLowerCase();
    return (
      `${c.nom} ${c.prenom}`.toLowerCase().includes(term) ||
      c.telephone?.includes(term) ||
      c.company?.toLowerCase().includes(term)
    );
  });

  // Show only vehicles in stock (not sold, not assigned to a client)
  const stockVehicles = vehicles.filter((v: any) => v.status === 'in_stock' && !v.clientId);

  const filteredVehicles = stockVehicles.filter((v: any) => {
    const term = vehicleSearch.toLowerCase();
    return (
      v.brand?.toLowerCase().includes(term) ||
      v.model?.toLowerCase().includes(term) ||
      v.vin?.toLowerCase().includes(term) ||
      String(v.year).includes(term)
    );
  });

  const selectedVehicle = vehicles.find((v: any) => v.id === selectedVehicleId);

  const handleReset = () => {
    setStep('client');
    setClientSearch('');
    setVehicleSearch('');
    setSelectedClient(null);
    setSelectedVehicleId(null);
    setSellingPrice('');
  };

  const handleClose = (val: boolean) => {
    if (!val) handleReset();
    onOpenChange(val);
  };

  const handleAssign = () => {
    if (!selectedClient || !selectedVehicleId) return;
    const data: any = { clientId: selectedClient.id };
    if (sellingPrice) {
      data.sellingPrice = Number(sellingPrice);
    }
    updateVehicle.mutate(
      { id: selectedVehicleId, data },
      {
        onSuccess: () => {
          toast.success(`Véhicule affecté à ${selectedClient.nom} ${selectedClient.prenom}`);
          handleReset();
          onOpenChange(false);
        },
        onError: () => toast.error("Erreur lors de l'affectation"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 'client' && 'Sélectionner un client'}
            {step === 'vehicle' && 'Sélectionner un véhicule en stock'}
            {step === 'price' && 'Prix de vente'}
          </DialogTitle>
          <DialogDescription>
            {step === 'client' && 'Étape 1/3 — Choisissez le client acheteur'}
            {step === 'vehicle' && `Étape 2/3 — Choisissez un véhicule en stock pour ${selectedClient?.nom} ${selectedClient?.prenom}`}
            {step === 'price' && 'Étape 3/3 — Définissez le prix de vente'}
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
                  {filteredVehicles.map((vehicle: any) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                        selectedVehicleId === vehicle.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'
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
                        </div>
                        <div className="text-xs text-muted-foreground truncate">VIN: {vehicle.vin}</div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">En stock</Badge>
                      {selectedVehicleId === vehicle.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('client')} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <Button onClick={() => setStep('price')} disabled={!selectedVehicleId} className="gap-2">
                Suivant <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'price' && (
          <>
            <div className="space-y-4">
              {selectedVehicle && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  {selectedVehicle.photoUrl ? (
                    <img src={selectedVehicle.photoUrl} alt={`${selectedVehicle.brand} ${selectedVehicle.model}`} className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Car className="h-5 w-5 text-secondary-foreground" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm">{selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})</div>
                    <div className="text-xs text-muted-foreground">Coût de revient : {formatCurrency(selectedVehicle.totalCost || 0)}</div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="sellingPriceSale">Prix de vente (DZD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="sellingPriceSale"
                    type="number"
                    placeholder="0"
                    className="pl-9"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    min={0}
                  />
                </div>
                {sellingPrice && selectedVehicle?.totalCost ? (
                  <p className={`text-sm font-medium ${Number(sellingPrice) - Number(selectedVehicle.totalCost) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    Bénéfice estimé : {formatCurrency(Number(sellingPrice) - Number(selectedVehicle.totalCost))}
                  </p>
                ) : null}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('vehicle')} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
              <Button onClick={handleAssign} disabled={!sellingPrice || updateVehicle.isPending}>
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
