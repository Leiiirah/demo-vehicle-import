import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShoppingCart, Percent, UserPlus, Users, Loader2 } from 'lucide-react';
import { api, type CreateClientData } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddClientDialog = ({ open, onOpenChange }: AddClientDialogProps) => {
  const [clientType, setClientType] = useState<'new' | 'existing'>('new');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [pourcentage, setPourcentage] = useState('5');
  const [paye, setPaye] = useState(false);

  const queryClient = useQueryClient();

  // Charger les clients depuis l'API
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.getClients(),
  });

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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientData> }) => api.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Succès', description: 'Client mis à jour avec succès' });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    if (clientType === 'new') {
      if (!nom || !prenom || !telephone) return;
      createMutation.mutate({
        nom,
        prenom,
        telephone,
        adresse: adresse || undefined,
        pourcentageBenefice: Number(pourcentage),
        prixVente: 0,
        coutRevient: 0,
        detteBenefice: 0,
        paye,
      });
    } else {
      if (!selectedClientId) return;
      updateMutation.mutate({
        id: selectedClientId,
        data: {
          pourcentageBenefice: Number(pourcentage),
          paye,
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const resetForm = () => {
    setClientType('new');
    setSelectedClientId('');
    setNom('');
    setPrenom('');
    setTelephone('');
    setAdresse('');
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
            {/* Choix type de client */}
            <div className="space-y-3">
              <Label>Type de client</Label>
              <RadioGroup 
                value={clientType} 
                onValueChange={(value) => setClientType(value as 'new' | 'existing')}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="new-client"
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    clientType === 'new' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <RadioGroupItem value="new" id="new-client" />
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Nouveau</span>
                  </div>
                </Label>
                <Label
                  htmlFor="existing-client"
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    clientType === 'existing' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <RadioGroupItem value="existing" id="existing-client" />
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Existant</span>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* Formulaire Nouveau Client */}
            {clientType === 'new' && (
              <>
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

                {/* Téléphone */}
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone *</Label>
                  <Input id="telephone" placeholder="+213 XXX XXX XXX" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                </div>

                {/* Adresse */}
                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Textarea 
                    id="adresse" 
                    placeholder="Adresse complète"
                    rows={2}
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Sélection Client Existant */}
            {clientType === 'existing' && (
              <div className="space-y-2">
                <Label htmlFor="client-select">Sélectionner un client *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger id="client-select">
                    <SelectValue placeholder="Choisir un client existant" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{client.nom} {client.prenom}</span>
                          <span className="text-xs text-muted-foreground">{client.telephone}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
            disabled={isPending || (clientType === 'new' ? (!nom || !prenom || !telephone) : !selectedClientId)}
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enregistrer le client
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
};
