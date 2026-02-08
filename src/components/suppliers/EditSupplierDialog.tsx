import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
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
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  location: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface EditSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
}

export function EditSupplierDialog({ open, onOpenChange, supplier }: EditSupplierDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        location: supplier.location || '',
        contactName: supplier.contactName || '',
        contactEmail: supplier.contactEmail || '',
        contactPhone: supplier.contactPhone || '',
      });
    }
  }, [supplier]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.updateSupplier(supplier!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', supplier?.id] });
      toast.success('Fournisseur mis à jour avec succès');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="max-w-md">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Modifier le fournisseur</DialogTitle>
        </DialogHeader>
        <ScrollableDialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom du fournisseur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localisation *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ville, Pays"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Nom du contact</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Nom du contact"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Téléphone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+86 xxx xxx xxxx"
              />
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
