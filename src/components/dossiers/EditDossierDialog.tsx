import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type CreateDossierData } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Dossier {
  id: string;
  reference: string;
  supplierId: string;
  dateCreation: string;
  status: string;
  notes?: string;
}

interface EditDossierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dossier: Dossier | null;
}

type DossierStatus = 'en_cours' | 'termine' | 'annule';

export function EditDossierDialog({ open, onOpenChange, dossier }: EditDossierDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    reference: '',
    supplierId: '',
    dateCreation: '',
    status: 'en_cours' as DossierStatus,
    notes: '',
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.getSuppliers(),
  });

  useEffect(() => {
    if (dossier) {
      setFormData({
        reference: dossier.reference || '',
        supplierId: dossier.supplierId || '',
        dateCreation: dossier.dateCreation?.split('T')[0] || '',
        status: (dossier.status as DossierStatus) || 'en_cours',
        notes: dossier.notes || '',
      });
    }
  }, [dossier]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateDossierData>) => api.updateDossier(dossier!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      queryClient.invalidateQueries({ queryKey: ['dossiers', dossier?.id] });
      toast.success('Dossier mis à jour avec succès');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reference || !formData.supplierId) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    updateMutation.mutate({
      reference: formData.reference,
      supplierId: formData.supplierId,
      dateCreation: formData.dateCreation,
      status: formData.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Modifier le dossier</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6">
          <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label htmlFor="reference">Référence *</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplierId">Fournisseur *</Label>
            <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                {(suppliers || []).map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateCreation">Date de création</Label>
            <Input
              id="dateCreation"
              type="date"
              value={formData.dateCreation}
              onChange={(e) => setFormData({ ...formData, dateCreation: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={formData.status} onValueChange={(value: DossierStatus) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="termine">Terminé</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          </form>
        </ScrollArea>
        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
