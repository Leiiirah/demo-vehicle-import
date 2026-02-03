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
import { ShoppingCart, Percent } from 'lucide-react';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddClientDialog = ({ open, onOpenChange }: AddClientDialogProps) => {
  const [pourcentage, setPourcentage] = useState('5');
  const [prixVente, setPrixVente] = useState('');
  const [coutRevient, setCoutRevient] = useState('');
  const [paye, setPaye] = useState(false);

  const benefice = (Number(prixVente) || 0) - (Number(coutRevient) || 0);
  const dette = benefice > 0 ? (benefice * Number(pourcentage)) / 100 : 0;

  const handleSubmit = () => {
    // TODO: Enregistrer le client
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-success" />
            Ajouter un client
          </DialogTitle>
          <DialogDescription>
            Acheteur avec pourcentage sur le bénéfice
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Nom et Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" placeholder="Ex: Kaci" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" placeholder="Ex: Mohamed" />
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
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="space-y-2">
                <Label htmlFor="prixVente">Prix de vente (DZD)</Label>
                <Input 
                  id="prixVente" 
                  type="number"
                  value={prixVente}
                  onChange={(e) => setPrixVente(e.target.value)}
                  placeholder="10 000 000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coutRevient">Coût de revient (DZD)</Label>
                <Input 
                  id="coutRevient" 
                  type="number"
                  value={coutRevient}
                  onChange={(e) => setCoutRevient(e.target.value)}
                  placeholder="8 500 000"
                />
              </div>
            </div>

            {/* Aperçu du calcul */}
            {prixVente && coutRevient && (
              <div className="mt-4 p-3 bg-accent/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bénéfice</span>
                  <span className="font-medium text-success">
                    {new Intl.NumberFormat('fr-DZ').format(benefice)} DZD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Part client ({pourcentage}%)
                  </span>
                  <span className="font-bold text-warning">
                    {new Intl.NumberFormat('fr-DZ').format(dette)} DZD
                  </span>
                </div>
              </div>
            )}
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

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            className="bg-success text-success-foreground hover:bg-success/90"
            onClick={handleSubmit}
          >
            Enregistrer le client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
