import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { FolderOpen, Building2, Calendar, FileText } from 'lucide-react';
import { suppliers } from '@/data/mockData';

interface AddDossierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddDossierDialog = ({ open, onOpenChange }: AddDossierDialogProps) => {
  const [reference, setReference] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [dateCreation, setDateCreation] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Générer une référence automatique
  const generateReference = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900) + 100;
    return `DOS-${year}-${random}`;
  };

  const handleSubmit = () => {
    // TODO: Enregistrer le dossier
    console.log({
      reference: reference || generateReference(),
      supplierId,
      dateCreation,
      notes,
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setReference('');
    setSupplierId('');
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Nouveau Dossier
          </DialogTitle>
          <DialogDescription>
            Créez un nouveau dossier d'importation lié à un fournisseur
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
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
          <div className="space-y-2">
            <Label htmlFor="supplier" className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Fournisseur *
            </Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger id="supplier">
                <SelectValue placeholder="Sélectionner un fournisseur" />
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

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!supplierId}
          >
            Créer le dossier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
