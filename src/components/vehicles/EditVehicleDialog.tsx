import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type CreateVehicleData } from '@/services/api';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  ScrollableDialogContent,
  ScrollableDialogBody,
  ScrollableDialogFooter,
} from '@/components/ui/scrollable-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  clientId?: string;
  supplierId: string;
  conteneurId: string;
  passeportId?: string | null;
  status: string;
  purchasePrice: number;
  localFees?: number;
  totalCost?: number;
  sellingPrice?: number;
  orderDate: string;
  arrivalDate?: string;
  soldDate?: string;
}

interface EditVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
}

type VehicleStatus = 'ordered' | 'in_transit' | 'arrived' | 'sold';

export function EditVehicleDialog({ open, onOpenChange, vehicle }: EditVehicleDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    clientId: '',
    supplierId: '',
    conteneurId: '',
    status: 'ordered' as VehicleStatus,
    purchasePrice: 0,
    localFees: 0,
    totalCost: 0,
    sellingPrice: 0,
    orderDate: '',
    arrivalDate: '',
    soldDate: '',
    passeportId: '',
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.getSuppliers(),
  });

  const { data: conteneurs } = useQuery({
    queryKey: ['conteneurs'],
    queryFn: () => api.getConteneurs(),
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });

  const { data: passeports } = useQuery({
    queryKey: ['passeports'],
    queryFn: () => api.getPasseports(),
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        vin: vehicle.vin || '',
        clientId: vehicle.clientId || '',
        supplierId: vehicle.supplierId || '',
        conteneurId: vehicle.conteneurId || '',
        status: (vehicle.status as VehicleStatus) || 'ordered',
        purchasePrice: vehicle.purchasePrice || 0,
        localFees: vehicle.localFees || 0,
        totalCost: vehicle.totalCost || 0,
        sellingPrice: vehicle.sellingPrice || 0,
        orderDate: vehicle.orderDate?.split('T')[0] || '',
        arrivalDate: vehicle.arrivalDate?.split('T')[0] || '',
        soldDate: vehicle.soldDate?.split('T')[0] || '',
        passeportId: vehicle.passeportId || '',
      });
    }
  }, [vehicle]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateVehicleData>) => api.updateVehicle(vehicle!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicle?.id] });
      queryClient.invalidateQueries({ queryKey: ['conteneurs'] });
      toast.success('Véhicule mis à jour avec succès');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Update vehicle error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.vin) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    
    const dataToSend: Partial<CreateVehicleData> = {
      brand: formData.brand,
      model: formData.model,
      year: Number(formData.year),
      vin: formData.vin,
      supplierId: formData.supplierId,
      conteneurId: formData.conteneurId,
      status: formData.status,
      purchasePrice: Number(formData.purchasePrice) || 0,
      localFees: Number(formData.localFees) || 0,
      totalCost: Number(formData.totalCost) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      orderDate: formData.orderDate,
      clientId: formData.clientId || undefined,
      arrivalDate: formData.arrivalDate || undefined,
      soldDate: formData.soldDate || undefined,
      passeportId: formData.passeportId && formData.passeportId !== 'none' ? formData.passeportId : undefined,
    };
    
    updateMutation.mutate(dataToSend);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="max-w-2xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Modifier le véhicule</DialogTitle>
        </DialogHeader>
        <ScrollableDialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marque *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modèle *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Année</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN *</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierId">Fournisseur</Label>
                <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {(suppliers || []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conteneurId">Conteneur</Label>
                <Select value={formData.conteneurId} onValueChange={(value) => setFormData({ ...formData, conteneurId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {(conteneurs || []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.numero}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {(clients || []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.prenom} {c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passeportId">Passeport</Label>
              <Select value={formData.passeportId} onValueChange={(value) => setFormData({ ...formData, passeportId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un passeport (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {(passeports || []).map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.prenom} {p.nom} — {p.numeroPasseport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value: VehicleStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ordered">En stock</SelectItem>
                  <SelectItem value="in_transit">Chargée</SelectItem>
                  <SelectItem value="arrived">Arrivé</SelectItem>
                  <SelectItem value="sold">Vendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Prix d'achat (USD)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localFees">Frais locaux (DZD)</Label>
                <Input
                  id="localFees"
                  type="number"
                  value={formData.localFees}
                  onChange={(e) => setFormData({ ...formData, localFees: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalCost">Coût total (DZD)</Label>
                <Input
                  id="totalCost"
                  type="number"
                  value={formData.totalCost}
                  onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Prix de vente (DZD)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderDate">Date commande</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalDate">Date arrivée</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soldDate">Date vente</Label>
                <Input
                  id="soldDate"
                  type="date"
                  value={formData.soldDate}
                  onChange={(e) => setFormData({ ...formData, soldDate: e.target.value })}
                />
              </div>
            </div>
          </form>
        </ScrollableDialogBody>
        <ScrollableDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enregistrer
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
}
