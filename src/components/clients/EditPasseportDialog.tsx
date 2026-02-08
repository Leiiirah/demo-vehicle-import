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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Passeport {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string;
  numeroPasseport: string;
  montantDu?: number;
  paye: boolean;
}

interface EditPasseportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passeport: Passeport | null;
}

export function EditPasseportDialog({ open, onOpenChange, passeport }: EditPasseportDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    numeroPasseport: '',
    montantDu: 10000,
    paye: false,
  });

  useEffect(() => {
    if (passeport) {
      setFormData({
        nom: passeport.nom || '',
        prenom: passeport.prenom || '',
        telephone: passeport.telephone || '',
        adresse: passeport.adresse || '',
        numeroPasseport: passeport.numeroPasseport || '',
        montantDu: passeport.montantDu || 10000,
        paye: passeport.paye || false,
      });
    }
  }, [passeport]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.updatePasseport(passeport!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passeports'] });
      queryClient.invalidateQueries({ queryKey: ['passeports', passeport?.id] });
      toast.success('Passeport mis à jour avec succès');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.prenom || !formData.telephone || !formData.numeroPasseport) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="max-w-md">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Modifier le passeport</DialogTitle>
        </DialogHeader>
        <ScrollableDialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroPasseport">N° Passeport *</Label>
              <Input
                id="numeroPasseport"
                value={formData.numeroPasseport}
                onChange={(e) => setFormData({ ...formData, numeroPasseport: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="montantDu">Montant dû (DZD)</Label>
              <Input
                id="montantDu"
                type="number"
                value={formData.montantDu}
                onChange={(e) => setFormData({ ...formData, montantDu: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="paye">Payé</Label>
              <Switch
                id="paye"
                checked={formData.paye}
                onCheckedChange={(checked) => setFormData({ ...formData, paye: checked })}
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
