import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreatePasseportData } from '@/services/api';
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
import { BookUser, Upload, X, File, Loader2 } from 'lucide-react';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [numeroPasseport, setNumeroPasseport] = useState('');
  const [nin, setNin] = useState('');
  const [pdfPasseport, setPdfPasseport] = useState<UploadedFile | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: CreatePasseportData) => api.createPasseport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passeports'] });
      toast({
        title: 'Passeport enregistré',
        description: 'Le passeport a été créé avec succès',
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
    setNom('');
    setPrenom('');
    setTelephone('');
    setAdresse('');
    setNumeroPasseport('');
    setNin('');
    setPdfPasseport(null);
  };

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
    if (!nom.trim() || !prenom.trim() || !telephone.trim() || !numeroPasseport.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate({
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim(),
      adresse: adresse.trim() || undefined,
      numeroPasseport: numeroPasseport.trim(),
      nin: nin.trim() || undefined,
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
            <BookUser className="h-5 w-5 text-primary" />
            Ajouter un passeport
          </DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau passeport
          </DialogDescription>
        </DialogHeader>

        <ScrollableDialogBody>
          <div className="space-y-4">
            {/* Nom et Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input 
                  id="nom" 
                  placeholder="Ex: Benali" 
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input 
                  id="prenom" 
                  placeholder="Ex: Ahmed" 
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
              </div>
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input 
                id="telephone" 
                placeholder="+213 XXX XXX XXX" 
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input 
                id="adresse" 
                placeholder="Ex: Alger, Algérie" 
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
              />
            </div>

            {/* Numéro de passeport */}
            <div className="space-y-2">
              <Label htmlFor="numeroPasseport">Numéro de passeport *</Label>
              <Input 
                id="numeroPasseport" 
                placeholder="Ex: A12345678" 
                className="font-mono" 
                value={numeroPasseport}
                onChange={(e) => setNumeroPasseport(e.target.value)}
              />
            </div>

            {/* NIN */}
            <div className="space-y-2">
              <Label htmlFor="nin">NIN (Numéro d'Identification Nationale)</Label>
              <Input 
                id="nin" 
                placeholder="Ex: 1234567890123456789" 
                className="font-mono" 
                value={nin}
                onChange={(e) => setNin(e.target.value)}
              />
            </div>

            {/* PDF du passeport */}
            <div className="space-y-2">
              <Label>PDF du passeport (optionnel)</Label>
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
          </div>
        </ScrollableDialogBody>

        <ScrollableDialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={createMutation.isPending}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
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
