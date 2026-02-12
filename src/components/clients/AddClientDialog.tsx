import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollableDialogContent,
  ScrollableDialogBody,
  ScrollableDialogFooter,
} from '@/components/ui/scrollable-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, Percent, Loader2 } from 'lucide-react';
import { api, type CreateClientData } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddClientDialog = ({ open, onOpenChange }: AddClientDialogProps) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [pourcentage, setPourcentage] = useState('5');
  const [paye, setPaye] = useState(false);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateClientData) => api.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Succès', description: 'Client créé avec succès' });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    if (!nom || !prenom) return;
    createMutation.mutate({
      nom,
      prenom,
      telephone: '',
      pourcentageBenefice: Number(pourcentage),
      prixVente: 0,
      coutRevient: 0,
      detteBenefice: 0,
      paye,
    });
  };

  const isPending = createMutation.isPending;

  const resetForm = () => {
    setNom('');
    setPrenom('');
    setPourcentage('5');
    setPaye(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ScrollableDialogContent className="max-w-md">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-success" />
            Ajouter un client
          </DialogTitle>
          <DialogDescription>
            Acheteur avec pourcentage sur le bénéfice
          </DialogDescription>
        </DialogHeader>

        <ScrollableDialogBody>
          <div className="space-y-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input id="nom" placeholder="Ex: Kaci" value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input id="prenom" placeholder="Ex: Mohamed" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
              </div>
            </div>

            {/* Séparateur - Calcul du bénéfice */}
            <div className="border-t border-border pt-4">
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                Calcul du bénéfice
              </h3>
              
              {/* Pourcentage */}
              <div className="space-y-2">
                <Label htmlFor="pourcentage">Pourcentage sur bénéfice (%)</Label>
                <div className="relative">
                  <Input 
                    id="pourcentage" 
                    type="number"
                    min="0"
                    max="100"
                    value={pourcentage}
                    onChange={(e) => setPourcentage(e.target.value)}
                    placeholder="5"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Le bénéfice et la dette seront calculés automatiquement en fonction des véhicules assignés.
                </p>
              </div>
            </div>

            {/* Checkbox Payé */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="paye" 
                checked={paye}
                onCheckedChange={(checked) => setPaye(checked === true)}
              />
              <Label htmlFor="paye" className="text-sm font-normal cursor-pointer">
                Marquer la dette comme payée
              </Label>
            </div>
          </div>
        </ScrollableDialogBody>

        <ScrollableDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            className="bg-success text-success-foreground hover:bg-success/90"
            onClick={handleSubmit}
            disabled={isPending || !nom || !prenom}
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enregistrer le client
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
};
