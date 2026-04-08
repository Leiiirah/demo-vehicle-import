import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Container, FolderOpen, Calendar, Package, Ship, Anchor, Loader2, ChevronDown } from 'lucide-react';
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
  const [numeroError, setNumeroError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const queryClient = useQueryClient();

  const { data: dossiers = [] } = useQuery({
    queryKey: ['dossiers'],
    queryFn: () => api.getDossiers(),
  });

  const { data: allConteneurs = [] } = useQuery({
    queryKey: ['conteneurs'],
    queryFn: () => api.getConteneurs(),
    enabled: open,
  });

  // Filter containers that have status 'arrivee' - these numbers can be reused
  const availableArriveeNumeros = useMemo(() => {
    const arrivee = allConteneurs.filter(c => c.status === 'arrivee');
    // Get unique numbers
    const seen = new Set<string>();
    return arrivee.filter(c => {
      if (seen.has(c.numero)) return false;
      seen.add(c.numero);
      return true;
    });
  }, [allConteneurs]);

  // Filter suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    if (!numero) return availableArriveeNumeros;
    return availableArriveeNumeros.filter(c => 
      c.numero.toUpperCase().includes(numero.toUpperCase())
    );
  }, [availableArriveeNumeros, numero]);

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
    onError: (error: any) => {
      const message = error?.message || 'Erreur inconnue';
      if (message.includes('conteneur avec ce numéro existe déjà') || message.includes('already exists')) {
        setNumeroError('Ce numéro de conteneur est déjà utilisé par un conteneur en cours de chargement. Vous ne pouvez le réutiliser que lorsque le conteneur précédent est arrivé.');
      } else {
        toast({ title: 'Erreur', description: message, variant: 'destructive' });
      }
    },
  });

  const handleSubmit = () => {
    if (!dossierId || !numero) return;
    setNumeroError('');
    
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
    setNumeroError('');
    setShowSuggestions(false);
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
      <ScrollableDialogContent className="max-w-md">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Container className="h-5 w-5 text-primary" />
            Nouveau Conteneur
          </DialogTitle>
          <DialogDescription>
            Ajoutez un conteneur à un dossier existant
          </DialogDescription>
        </DialogHeader>

        <ScrollableDialogBody>
          <div className="space-y-4">
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

            {selectedDossier && (
              <div className="p-3 bg-accent/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fournisseur</span>
                  <span className="font-medium">{selectedDossier.supplier?.name || 'Fournisseur inconnu'}</span>
                </div>
              </div>
            )}

            {/* Numéro conteneur with suggestions */}
            <div className="space-y-2">
              <Label htmlFor="numero" className="flex items-center gap-2">
                <Container className="h-4 w-4 text-muted-foreground" />
                Numéro du conteneur *
              </Label>
              <div className="relative">
                <Input 
                  id="numero" 
                  placeholder="Ex: MSKU1234567"
                  value={numero}
                  onChange={(e) => { setNumero(e.target.value.toUpperCase()); setNumeroError(''); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className={`uppercase ${numeroError ? 'border-destructive' : ''}`}
                  autoComplete="off"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                      Conteneurs arrivés — réutilisables
                    </div>
                    {filteredSuggestions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors flex items-center justify-between"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setNumero(c.numero);
                          setNumeroError('');
                          setShowSuggestions(false);
                        }}
                      >
                        <span className="font-mono text-sm font-medium">{c.numero}</span>
                        <span className="text-xs text-green-600 dark:text-green-400">Arrivé ✓</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {numeroError ? (
                <p className="text-xs text-destructive font-medium">{numeroError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Code ISO du conteneur (11 caractères). Tapez pour voir les numéros réutilisables.
                </p>
              )}
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
                <FormattedNumberInput 
                  id="coutTransport" 
                  placeholder="Ex: 3 500"
                  value={coutTransport}
                  onValueChange={(v) => setCoutTransport(String(v))}
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
        </ScrollableDialogBody>

        <ScrollableDialogFooter>
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
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
};
