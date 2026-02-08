import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type CreateConteneurData } from '@/services/api';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  ScrollableDialogContent,
  ScrollableDialogBody,
  ScrollableDialogFooter,
} from '@/components/ui/scrollable-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Conteneur {
  id: string;
  numero: string;
  dossierId: string;
  type: string;
  status: string;
  coutTransport?: number;
  dateDepart?: string;
  dateArrivee?: string;
}

interface EditConteneurDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conteneur: Conteneur | null;
}

type ConteneurType = '20ft' | '40ft' | '40ft_hc';
type ConteneurStatus = 'en_chargement' | 'en_transit' | 'arrive' | 'dedouane';

export function EditConteneurDialog({ open, onOpenChange, conteneur }: EditConteneurDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    numero: '',
    dossierId: '',
    type: '40ft' as ConteneurType,
    status: 'en_chargement' as ConteneurStatus,
    coutTransport: 0,
    dateDepart: '',
    dateArrivee: '',
  });

  const { data: dossiers } = useQuery({
    queryKey: ['dossiers'],
    queryFn: () => api.getDossiers(),
  });

  useEffect(() => {
    if (conteneur) {
      setFormData({
        numero: conteneur.numero || '',
        dossierId: conteneur.dossierId || '',
        type: (conteneur.type as ConteneurType) || '40ft',
        status: (conteneur.status as ConteneurStatus) || 'en_chargement',
        coutTransport: conteneur.coutTransport || 0,
        dateDepart: conteneur.dateDepart?.split('T')[0] || '',
        dateArrivee: conteneur.dateArrivee?.split('T')[0] || '',
      });
    }
  }, [conteneur]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateConteneurData>) => api.updateConteneur(conteneur!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conteneurs'] });
      queryClient.invalidateQueries({ queryKey: ['conteneurs', conteneur?.id] });
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      toast.success('Conteneur mis à jour avec succès');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numero || !formData.dossierId) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    updateMutation.mutate({
      numero: formData.numero,
      dossierId: formData.dossierId,
      type: formData.type,
      status: formData.status,
      coutTransport: formData.coutTransport,
      dateDepart: formData.dateDepart || undefined,
      dateArrivee: formData.dateArrivee || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="max-w-md">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Modifier le conteneur</DialogTitle>
        </DialogHeader>
        <ScrollableDialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Numéro *</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dossierId">Dossier *</Label>
              <Select value={formData.dossierId} onValueChange={(value) => setFormData({ ...formData, dossierId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un dossier" />
                </SelectTrigger>
                <SelectContent>
                  {(dossiers || []).map((dossier) => (
                    <SelectItem key={dossier.id} value={dossier.id}>
                      {dossier.reference} - {dossier.supplier?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: ConteneurType) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20ft">20 pieds</SelectItem>
                  <SelectItem value="40ft">40 pieds</SelectItem>
                  <SelectItem value="40ft_hc">40 pieds HC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value: ConteneurStatus) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_chargement">En chargement</SelectItem>
                  <SelectItem value="en_transit">En transit</SelectItem>
                  <SelectItem value="arrive">Arrivé</SelectItem>
                  <SelectItem value="dedouane">Dédouané</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coutTransport">Coût transport (USD)</Label>
              <Input
                id="coutTransport"
                type="number"
                value={formData.coutTransport}
                onChange={(e) => setFormData({ ...formData, coutTransport: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateDepart">Date départ</Label>
                <Input
                  id="dateDepart"
                  type="date"
                  value={formData.dateDepart}
                  onChange={(e) => setFormData({ ...formData, dateDepart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateArrivee">Date arrivée</Label>
                <Input
                  id="dateArrivee"
                  type="date"
                  value={formData.dateArrivee}
                  onChange={(e) => setFormData({ ...formData, dateArrivee: e.target.value })}
                />
              </div>
            </div>
          </form>
        </ScrollableDialogBody>
        <ScrollableDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enregistrer
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
}
