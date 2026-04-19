import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { useCreateCaisseEntry } from '@/hooks/useCaisse';
import { useToast } from '@/hooks/use-toast';

export function AddBanqueEntryDialog() {
  const getLocalDateValue = () => {
    const now = new Date();
    const tz = now.getTimezoneOffset() * 60 * 1000;
    return new Date(now.getTime() - tz).toISOString().split('T')[0];
  };

  const [open, setOpen] = useState(false);
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(getLocalDateValue());
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const createMutation = useCreateCaisseEntry();

  const resetForm = () => {
    setMontant('');
    setDate(getLocalDateValue());
    setDescription('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!montant || !date) return;

    createMutation.mutate(
      {
        type: 'entree',
        montant: Number(montant),
        date,
        description: description || 'Approvisionnement',
        paymentMethod: 'virement',
      } as any,
      {
        onSuccess: () => {
          toast({ title: 'Approvisionnement enregistré', description: 'Le solde bancaire a été mis à jour.' });
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
          <DialogTitle>Nouvel approvisionnement bancaire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Montant (DZD)</Label>
            <FormattedNumberInput
              value={montant}
              onValueChange={(v) => setMontant(String(v))}
              placeholder="0"
              required
            />
            <p className="text-xs text-muted-foreground">Ce montant sera ajouté au solde de la banque.</p>
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
              placeholder="Ex: Dépôt bancaire, virement reçu..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Approvisionner
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
