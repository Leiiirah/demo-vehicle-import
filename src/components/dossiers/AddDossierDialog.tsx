import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, CreateDossierData } from '@/services/api';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderOpen, Building2, Calendar, FileText, Loader2 } from 'lucide-react';

interface AddDossierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedSupplierId?: string;
}

export const AddDossierDialog = ({ open, onOpenChange, preSelectedSupplierId }: AddDossierDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [reference, setReference] = useState('');
  const [supplierId, setSupplierId] = useState(preSelectedSupplierId || '');
  const [dateCreation, setDateCreation] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (preSelectedSupplierId) {
      setSupplierId(preSelectedSupplierId);
    }
  }, [preSelectedSupplierId]);

  // Fetch suppliers from API
  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.getSuppliers(),
    enabled: open,
  });

  // Fetch existing dossiers to calculate next reference number per supplier
  const { data: dossiers = [] } = useQuery({
    queryKey: ['dossiers'],
    queryFn: () => api.getDossiers(),
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDossierData) => api.createDossier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      toast({
        title: 'Dossier créé',
        description: 'Le dossier a été créé avec succès',
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

  // Générer une référence automatique basée sur le nom du fournisseur
  const generateReference = () => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 900) + 100;
      return `DOS-${year}-${random}`;
    }
    
    const supplierName = supplier.name.toUpperCase().replace(/\s+/g, '-');
    
    // Count existing dossiers for this supplier to determine the next number
    const supplierDossiers = dossiers.filter(d => d.supplierId === supplierId || d.supplier?.id === supplierId);
    const nextNumber = supplierDossiers.length + 1;
    const paddedNumber = String(nextNumber).padStart(3, '0');
    
    return `${supplierName}-${paddedNumber}`;
  };

  const handleSubmit = () => {
    if (!supplierId) {
      toast({
        title: 'Champ requis',
        description: 'Veuillez sélectionner un fournisseur',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate({
      reference: reference.trim() || generateReference(),
      supplierId,
      dateCreation,
      status: 'en_cours',
    });
  };

  const resetForm = () => {
    setReference('');
    setSupplierId(preSelectedSupplierId || '');
    setDateCreation(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const selectedSupplier = suppliers.find(s => s.id === supplierId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ScrollableDialogContent className="max-w-md">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Nouveau Dossier
          </DialogTitle>
          <DialogDescription>
            Créez un nouveau dossier d'importation lié à un fournisseur
          </DialogDescription>
        </DialogHeader>

        <ScrollableDialogBody>
          <div className="space-y-4">
            {/* Référence */}
            <div className="space-y-2">
              <Label htmlFor="reference" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Référence
              </Label>
              <Input 
                id="reference" 
                placeholder={`Ex: ${generateReference()} (auto si vide)`}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Laissez vide pour générer automatiquement
              </p>
            </div>

            {/* Sélection Fournisseur */}
            {preSelectedSupplierId ? (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Fournisseur
                </Label>
                <div className="p-3 bg-accent/50 rounded-lg">
                  <span className="font-medium">{selectedSupplier?.name || 'Fournisseur'}</span>
                  {selectedSupplier?.location && (
                    <span className="text-xs text-muted-foreground ml-2">({selectedSupplier.location})</span>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Fournisseur *
                  </Label>
                  <Select value={supplierId} onValueChange={setSupplierId} disabled={loadingSuppliers}>
                    <SelectTrigger id="supplier">
                      <SelectValue placeholder={loadingSuppliers ? 'Chargement...' : 'Sélectionner un fournisseur'} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{supplier.name}</span>
                            <span className="text-xs text-muted-foreground">{supplier.location}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Info fournisseur sélectionné */}
                {selectedSupplier && (
                  <div className="p-3 bg-accent/50 rounded-lg space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Localisation</span>
                      <span className="font-medium">{selectedSupplier.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Véhicules fournis</span>
                      <span className="font-medium">{selectedSupplier.vehiclesSupplied}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dette en cours</span>
                      <span className="font-medium text-warning">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedSupplier.remainingDebt)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Date de création */}
            <div className="space-y-2">
              <Label htmlFor="dateCreation" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date de création
              </Label>
              <Input 
                id="dateCreation" 
                type="date"
                value={dateCreation}
                onChange={(e) => setDateCreation(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea 
                id="notes" 
                placeholder="Informations supplémentaires sur ce dossier..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </ScrollableDialogBody>

        <ScrollableDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={createMutation.isPending}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!supplierId || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              'Créer le dossier'
            )}
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
};
