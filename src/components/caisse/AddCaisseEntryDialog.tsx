import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useCreateCaisseEntry } from '@/hooks/useCaisse';
import { useVehicles } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

export function AddCaisseEntryDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'entree' | 'charge' | 'retrait'>('entree');
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const { toast } = useToast();

  const createMutation = useCreateCaisseEntry();
  const { data: vehicles = [] } = useVehicles();

  const resetForm = () => {
    setType('entree');
    setMontant('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setReference('');
    setVehicleId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!montant || !date) return;

    createMutation.mutate(
      {
        type,
        montant: Number(montant),
        date,
        description: description || undefined,
        reference: reference || undefined,
        vehicleId: vehicleId || undefined,
      },
      {
        onSuccess: () => {
          toast({ title: type === 'entree' ? 'Entrée ajoutée' : 'Charge ajoutée' });
          resetForm();
          setOpen(false);
        },
        onError: (err: any) => {
          toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau mouvement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'entree' | 'charge' | 'retrait')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entree">Entrée (cash in)</SelectItem>
                <SelectItem value="charge">Charge (dépense)</SelectItem>
                <SelectItem value="retrait">Retrait</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Montant (DZD)</Label>
            <FormattedNumberInput
              value={montant}
              onValueChange={(v) => setMontant(String(v))}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du mouvement..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
