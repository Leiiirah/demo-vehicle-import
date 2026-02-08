import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Container, FolderOpen, Calendar, Package, Ship, Anchor, Loader2 } from 'lucide-react';
import { api, type CreateConteneurData } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AddConteneurDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedDossierId?: string;
}

export const AddConteneurDialog = ({ open, onOpenChange, preSelectedDossierId }: AddConteneurDialogProps) => {
  const [numero, setNumero] = useState('');
  const [dossierId, setDossierId] = useState(preSelectedDossierId || '');
  const [type, setType] = useState<'20ft' | '40ft' | '40ft_hc'>('40ft');
  const [coutTransport, setCoutTransport] = useState('');
  const [dateDepart, setDateDepart] = useState('');
  const [dateArrivee, setDateArrivee] = useState('');

  const queryClient = useQueryClient();

  // Charger les dossiers depuis l'API
  const { data: dossiers = [] } = useQuery({
    queryKey: ['dossiers'],
    queryFn: () => api.getDossiers(),
  });

  // Mettre à jour dossierId si preSelectedDossierId change
  useEffect(() => {
    if (preSelectedDossierId) {
      setDossierId(preSelectedDossierId);
    }
  }, [preSelectedDossierId]);

  const createMutation = useMutation({
    mutationFn: (data: CreateConteneurData) => api.createConteneur(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteneurs'] });
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      toast({ title: 'Succès', description: 'Conteneur créé avec succès' });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    if (!dossierId || !numero) return;
    
    createMutation.mutate({
      numero,
      dossierId,
      type,
      coutTransport: coutTransport ? Number(coutTransport) : undefined,
      dateDepart: dateDepart || undefined,
      dateArrivee: dateArrivee || undefined,
    });
  };

  const resetForm = () => {
    setNumero('');
    setDossierId(preSelectedDossierId || '');
    setType('40ft');
    setCoutTransport('');
    setDateDepart('');
    setDateArrivee('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const selectedDossier = dossiers.find(d => d.id === dossierId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Container className="h-5 w-5 text-primary" />
            Nouveau Conteneur
          </DialogTitle>
          <DialogDescription>
            Ajoutez un conteneur à un dossier existant
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
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
                {dossiers.map((dossier) => (
                  <SelectItem key={dossier.id} value={dossier.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{dossier.reference}</span>
                      <span className="text-xs text-muted-foreground">{dossier.supplier?.name || 'Fournisseur inconnu'}</span>
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
                <span className="font-medium">{selectedDossier.supplier?.name || 'Fournisseur inconnu'}</span>
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

          {/* Coût du transport */}
          <div className="space-y-2">
            <Label htmlFor="coutTransport" className="flex items-center gap-2">
              <Ship className="h-4 w-4 text-muted-foreground" />
              Coût du transport (USD) *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input 
                id="coutTransport" 
                type="number"
                placeholder="Ex: 3500"
                value={coutTransport}
                onChange={(e) => setCoutTransport(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Fret + assurance maritime. Ce coût sera réparti sur les véhicules du conteneur.
            </p>
          </div>

          {/* Dates de suivi */}
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              Suivi du transport
            </Label>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Date de départ */}
              <div className="space-y-2">
                <Label htmlFor="dateDepart" className="text-xs flex items-center gap-1">
                  <Ship className="h-3 w-3 text-muted-foreground" />
                  Date de départ
                </Label>
                <Input 
                  id="dateDepart" 
                  type="date"
                  value={dateDepart}
                  onChange={(e) => setDateDepart(e.target.value)}
                />
              </div>
              
              {/* Date d'arrivée */}
              <div className="space-y-2">
                <Label htmlFor="dateArrivee" className="text-xs flex items-center gap-1">
                  <Anchor className="h-3 w-3 text-muted-foreground" />
                  Date d'arrivée
                </Label>
                <Input 
                  id="dateArrivee" 
                  type="date"
                  value={dateArrivee}
                  onChange={(e) => setDateArrivee(e.target.value)}
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              À renseigner au fur et à mesure du transport
            </p>
          </div>
        </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!dossierId || !numero || createMutation.isPending}
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Créer le conteneur
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
