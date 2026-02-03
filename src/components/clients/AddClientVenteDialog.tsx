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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, FileText, Upload, X, File, ShoppingCart, CreditCard } from 'lucide-react';

interface AddClientVenteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

export const AddClientVenteDialog = ({ open, onOpenChange }: AddClientVenteDialogProps) => {
  const [clientType, setClientType] = useState<'individual' | 'company'>('individual');
  const [documents, setDocuments] = useState<Record<string, UploadedFile | null>>({
    nationalId: null,
    proofOfAddress: null,
  });

  const handleFileSelect = (docType: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setDocuments(prev => ({
          ...prev,
          [docType]: {
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            type: file.type,
          }
        }));
      }
    };
    input.click();
  };

  const removeFile = (docType: string) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: null
    }));
  };

  const DocumentUpload = ({ 
    id, 
    label, 
    required = false,
    description 
  }: { 
    id: string; 
    label: string; 
    required?: boolean;
    description?: string;
  }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-primary">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {documents[id] ? (
        <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-accent/30">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{documents[id]?.name}</p>
              <p className="text-xs text-muted-foreground">{documents[id]?.size}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => removeFile(id)}
            className="hover:bg-danger/10 hover:text-danger"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => handleFileSelect(id)}
          className="w-full border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 hover:bg-accent/30 transition-colors flex flex-col items-center gap-2"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Cliquer pour télécharger
          </span>
          <span className="text-xs text-muted-foreground">
            PDF, JPG ou PNG (max 10 MB)
          </span>
        </button>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-success" />
            Ajouter un client vente (acheteur)
          </DialogTitle>
          <DialogDescription>
            Ce client achète un véhicule - il paye le prix de vente
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="text-xs sm:text-sm">
              <User className="h-4 w-4 mr-1 hidden sm:inline" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs sm:text-sm">
              <CreditCard className="h-4 w-4 mr-1 hidden sm:inline" />
              Paiement
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">
              <FileText className="h-4 w-4 mr-1 hidden sm:inline" />
              Documents
            </TabsTrigger>
          </TabsList>

          {/* Onglet Informations */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Type de client</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setClientType('individual')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    clientType === 'individual'
                      ? 'border-success bg-success/10'
                      : 'border-border hover:border-success/50'
                  }`}
                >
                  <User className={`h-5 w-5 mx-auto mb-1 ${clientType === 'individual' ? 'text-success' : 'text-muted-foreground'}`} />
                  <p className={`text-sm font-medium ${clientType === 'individual' ? 'text-success' : ''}`}>
                    Particulier
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setClientType('company')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    clientType === 'company'
                      ? 'border-success bg-success/10'
                      : 'border-border hover:border-success/50'
                  }`}
                >
                  <Building2 className={`h-5 w-5 mx-auto mb-1 ${clientType === 'company' ? 'text-success' : 'text-muted-foreground'}`} />
                  <p className={`text-sm font-medium ${clientType === 'company' ? 'text-success' : ''}`}>
                    Entreprise
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input id="lastName" placeholder="Ex: Kaci" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input id="firstName" placeholder="Ex: Mohamed" />
              </div>
            </div>

            {clientType === 'company' && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Raison sociale *</Label>
                <Input id="companyName" placeholder="Ex: EURL Kaci Transport" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input id="phone" placeholder="+213 XXX XXX XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneAlt">Téléphone secondaire</Label>
                <Input id="phoneAlt" placeholder="+213 XXX XXX XXX" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="client@email.com" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wilaya">Wilaya *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16">16 - Alger</SelectItem>
                    <SelectItem value="31">31 - Oran</SelectItem>
                    <SelectItem value="25">25 - Constantine</SelectItem>
                    <SelectItem value="09">09 - Blida</SelectItem>
                    <SelectItem value="19">19 - Sétif</SelectItem>
                    <SelectItem value="23">23 - Annaba</SelectItem>
                    <SelectItem value="06">06 - Béjaïa</SelectItem>
                    <SelectItem value="15">15 - Tizi Ouzou</SelectItem>
                    <SelectItem value="other">Autre...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="commune">Commune</Label>
                <Input id="commune" placeholder="Ex: Hydra, Bir Mourad Raïs..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse complète</Label>
              <Textarea 
                id="address" 
                placeholder="Adresse détaillée du client"
                rows={2}
              />
            </div>
          </TabsContent>

          {/* Onglet Paiement */}
          <TabsContent value="preferences" className="space-y-4 mt-4">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <h3 className="font-medium text-success flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Informations de paiement
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Comment ce client souhaite-t-il régler ses achats ?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Mode de paiement préféré</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                  <SelectItem value="installments">Paiement échelonné</SelectItem>
                  <SelectItem value="mixed">Mixte (espèces + virement)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin">Budget minimum (DZD)</Label>
                <Input id="budgetMin" type="number" placeholder="5 000 000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax">Budget maximum (DZD)</Label>
                <Input id="budgetMax" type="number" placeholder="15 000 000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredBrands">Marques recherchées</Label>
              <div className="grid grid-cols-3 gap-2">
                {['Toyota', 'Mercedes', 'BMW', 'Audi', 'Porsche', 'Hyundai'].map((brand) => (
                  <label 
                    key={brand}
                    className="flex items-center gap-2 p-2 border border-border rounded-md cursor-pointer hover:bg-accent/50"
                  >
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Types de véhicules recherchés</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Berline', 'SUV', 'Pick-up', '4x4', 'Utilitaire', 'Luxe'].map((type) => (
                  <label 
                    key={type}
                    className="flex items-center gap-2 p-2 border border-border rounded-md cursor-pointer hover:bg-accent/50"
                  >
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Remarques</Label>
              <Textarea 
                id="notes" 
                placeholder="Informations supplémentaires sur le client..."
                rows={2}
              />
            </div>
          </TabsContent>

          {/* Onglet Documents */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            <div className="p-3 bg-muted border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                Documents optionnels pour le dossier client vente
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentUpload 
                id="nationalId" 
                label="Carte d'identité nationale" 
                description="Recto et verso"
              />
              <DocumentUpload 
                id="proofOfAddress" 
                label="Justificatif de domicile" 
                description="Facture électricité/gaz/eau"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button className="bg-success text-success-foreground hover:bg-success/90">
            Enregistrer l'acheteur
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
