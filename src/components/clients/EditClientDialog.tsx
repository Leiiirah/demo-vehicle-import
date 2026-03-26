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

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  adresse?: string;
  email?: string;
  company?: string;
  pourcentageBenefice?: number;
  prixVente?: number;
  coutRevient?: number;
  detteBenefice?: number;
  paye: boolean;
}

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export function EditClientDialog({ open, onOpenChange, client }: EditClientDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    email: '',
    company: '',
    pourcentageBenefice: 0,
    prixVente: 0,
    coutRevient: 0,
    detteBenefice: 0,
    paye: false,
  });

  useEffect(() => {
    if (client) {
      setFormData({
        nom: client.nom || '',
        prenom: client.prenom || '',
        telephone: client.telephone || '',
        adresse: client.adresse || '',
        email: client.email || '',
        company: client.company || '',
        pourcentageBenefice: client.pourcentageBenefice || 0,
        prixVente: client.prixVente || 0,
        coutRevient: client.coutRevient || 0,
        detteBenefice: client.detteBenefice || 0,
        paye: client.paye || false,
      });
    }
  }, [client]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.updateClient(client!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', client?.id] });
      toast.success('Client mis à jour avec succès');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.prenom || !formData.telephone) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="max-w-md">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Modifier le client</DialogTitle>
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              <Label htmlFor="company">Société</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pourcentageBenefice">% Bénéfice</Label>
              <FormattedNumberInput
                id="pourcentageBenefice"
                allowDecimals
                value={formData.pourcentageBenefice}
                onValueChange={(v) => setFormData({ ...formData, pourcentageBenefice: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prixVente">Prix vente (DZD)</Label>
                <Input
                  id="prixVente"
                  type="number"
                  value={formData.prixVente}
                  onChange={(e) => setFormData({ ...formData, prixVente: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coutRevient">Coût revient (DZD)</Label>
                <Input
                  id="coutRevient"
                  type="number"
                  value={formData.coutRevient}
                  onChange={(e) => setFormData({ ...formData, coutRevient: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="detteBenefice">Dette bénéfice (DZD)</Label>
              <Input
                id="detteBenefice"
                type="number"
                value={formData.detteBenefice}
                onChange={(e) => setFormData({ ...formData, detteBenefice: parseFloat(e.target.value) || 0 })}
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
