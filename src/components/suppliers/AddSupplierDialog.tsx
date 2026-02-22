import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateSupplierData } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
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
import { Building2, Loader2 } from 'lucide-react';

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddSupplierDialog = ({ open, onOpenChange }: AddSupplierDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: CreateSupplierData) => api.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Fournisseur créé',
        description: 'Le fournisseur a été enregistré avec succès',
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setCompanyName('');
  };

  const handleSubmit = () => {
    if (!companyName.trim()) {
      toast({
        title: 'Champ requis',
        description: "Le nom de l'entreprise est obligatoire",
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate({
      name: companyName.trim(),
      location: 'Non spécifié',
    });
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
            <Building2 className="h-5 w-5 text-primary" />
            Ajouter un fournisseur
          </DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau fournisseur
          </DialogDescription>
        </DialogHeader>

        <ScrollableDialogBody>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de l'entreprise *</Label>
              <Input
                id="companyName"
                placeholder="Ex: Guangzhou Auto Trading Co."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>
        </ScrollableDialogBody>

        <ScrollableDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={createMutation.isPending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
};
