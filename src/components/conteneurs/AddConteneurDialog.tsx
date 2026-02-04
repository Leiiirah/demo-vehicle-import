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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Container, FolderOpen, Calendar, Package } from 'lucide-react';

// Mock dossiers pour la sélection
const mockDossiers = [
  { id: 'DOS001', reference: 'DOS-2026-001', supplierName: 'Guangzhou Auto Export' },
  { id: 'DOS002', reference: 'DOS-2026-002', supplierName: 'Shanghai Motors Ltd' },
  { id: 'DOS003', reference: 'DOS-2026-003', supplierName: 'Shenzhen Auto Hub' },
];

interface AddConteneurDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedDossierId?: string;
}

export const AddConteneurDialog = ({ open, onOpenChange, preSelectedDossierId }: AddConteneurDialogProps) => {
  const [numero, setNumero] = useState('');
  const [dossierId, setDossierId] = useState(preSelectedDossierId || '');
  const [type, setType] = useState<'20ft' | '40ft' | '40ft_hc'>('40ft');
  const [dateDepart, setDateDepart] = useState('');

  const handleSubmit = () => {
    // TODO: Enregistrer le conteneur
    console.log({
      numero,
      dossierId,
      type,
      dateDepart,
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setNumero('');
    setDossierId(preSelectedDossierId || '');
    setType('40ft');
    setDateDepart('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const selectedDossier = mockDossiers.find(d => d.id === dossierId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Container className="h-5 w-5 text-primary" />
            Nouveau Conteneur
          </DialogTitle>
          <DialogDescription>
            Ajoutez un conteneur à un dossier existant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Sélection Dossier */}
          <div className="space-y-2">
            <Label htmlFor="dossier" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              Dossier *
            </Label>
            <Select value={dossierId} onValueChange={setDossierId}>
              <SelectTrigger id="dossier">
                <SelectValue placeholder="Sélectionner un dossier" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                {mockDossiers.map((dossier) => (
                  <SelectItem key={dossier.id} value={dossier.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{dossier.reference}</span>
                      <span className="text-xs text-muted-foreground">{dossier.supplierName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info dossier sélectionné */}
          {selectedDossier && (
            <div className="p-3 bg-accent/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fournisseur</span>
                <span className="font-medium">{selectedDossier.supplierName}</span>
              </div>
            </div>
          )}

          {/* Numéro conteneur */}
          <div className="space-y-2">
            <Label htmlFor="numero" className="flex items-center gap-2">
              <Container className="h-4 w-4 text-muted-foreground" />
              Numéro du conteneur *
            </Label>
            <Input 
              id="numero" 
              placeholder="Ex: MSKU1234567"
              value={numero}
              onChange={(e) => setNumero(e.target.value.toUpperCase())}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Code ISO du conteneur (11 caractères)
            </p>
          </div>

          {/* Type de conteneur */}
          <div className="space-y-2">
            <Label htmlFor="type" className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Type de conteneur *
            </Label>
            <Select value={type} onValueChange={(val) => setType(val as '20ft' | '40ft' | '40ft_hc')}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                <SelectItem value="20ft">20 pieds (TEU)</SelectItem>
                <SelectItem value="40ft">40 pieds (FEU)</SelectItem>
                <SelectItem value="40ft_hc">40 pieds High Cube</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date de départ */}
          <div className="space-y-2">
            <Label htmlFor="dateDepart" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date de départ (optionnel)
            </Label>
            <Input 
              id="dateDepart" 
              type="date"
              value={dateDepart}
              onChange={(e) => setDateDepart(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              À renseigner une fois le conteneur expédié
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!dossierId || !numero}
          >
            Créer le conteneur
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
