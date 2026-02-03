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
import { Checkbox } from '@/components/ui/checkbox';
import { BookUser, Upload, X, File } from 'lucide-react';

interface AddPasseportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

export const AddPasseportDialog = ({ open, onOpenChange }: AddPasseportDialogProps) => {
  const [pdfPasseport, setPdfPasseport] = useState<UploadedFile | null>(null);
  const [montant, setMontant] = useState('10000');
  const [paye, setPaye] = useState(false);

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setPdfPasseport({
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          type: file.type,
        });
      }
    };
    input.click();
  };

  const removeFile = () => {
    setPdfPasseport(null);
  };

  const handleSubmit = () => {
    // TODO: Enregistrer le passeport
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookUser className="h-5 w-5 text-primary" />
            Ajouter un passeport
          </DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau passeport avec paiement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Nom et Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" placeholder="Ex: Benali" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" placeholder="Ex: Ahmed" />
            </div>
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone *</Label>
            <Input id="telephone" placeholder="+213 XXX XXX XXX" />
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse *</Label>
            <Textarea 
              id="adresse" 
              placeholder="Adresse complète"
              rows={2}
            />
          </div>

          {/* Numéro de passeport */}
          <div className="space-y-2">
            <Label htmlFor="numeroPasseport">Numéro de passeport *</Label>
            <Input id="numeroPasseport" placeholder="Ex: A12345678" className="font-mono" />
          </div>

          {/* PDF du passeport */}
          <div className="space-y-2">
            <Label>PDF du passeport *</Label>
            {pdfPasseport ? (
              <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-accent/30">
                <div className="flex items-center gap-3">
                  <File className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">{pdfPasseport.name}</p>
                    <p className="text-xs text-muted-foreground">{pdfPasseport.size}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={removeFile}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFileSelect}
                className="w-full border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 hover:bg-accent/30 transition-colors flex flex-col items-center gap-2"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Cliquer pour télécharger le PDF
                </span>
                <span className="text-xs text-muted-foreground">
                  PDF uniquement (max 10 MB)
                </span>
              </button>
            )}
          </div>

          {/* Séparateur */}
          <div className="border-t border-border pt-4">
            <h3 className="font-medium text-sm mb-3">Paiement</h3>
            
            {/* Montant dû */}
            <div className="space-y-2">
              <Label htmlFor="montant">Montant dû (DZD)</Label>
              <Input 
                id="montant" 
                type="number"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="10000"
              />
              <p className="text-xs text-muted-foreground">
                Par défaut : 10 000 DZD
              </p>
            </div>

            {/* Checkbox Payé */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="paye" 
                checked={paye}
                onCheckedChange={(checked) => setPaye(checked === true)}
              />
              <Label htmlFor="paye" className="text-sm font-normal cursor-pointer">
                Marquer comme payé
              </Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSubmit}
          >
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
