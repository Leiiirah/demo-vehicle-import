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
import { User, Building2, FileText, Upload, X, File, AlertCircle, Percent, Wallet } from 'lucide-react';

interface AddClientImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadedFile {
  name: string;
  size: string;
  type: string;
}

export const AddClientImportDialog = ({ open, onOpenChange }: AddClientImportDialogProps) => {
  const [clientType, setClientType] = useState<'individual' | 'company'>('individual');
  const [profitPercentage, setProfitPercentage] = useState('');
  const [documents, setDocuments] = useState<Record<string, UploadedFile | null>>({
    passport: null,
    nationalId: null,
    driverLicense: null,
    proofOfAddress: null,
    nif: null,
    registreCommerce: null,
    statutsEntreprise: null,
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
            <Wallet className="h-5 w-5 text-primary" />
            Ajouter un client import (partenaire)
          </DialogTitle>
          <DialogDescription>
            Ce client investit avec vous sur l'importation et reçoit un pourcentage du bénéfice
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="text-xs sm:text-sm">
              <User className="h-4 w-4 mr-1 hidden sm:inline" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="financial" className="text-xs sm:text-sm">
              <Percent className="h-4 w-4 mr-1 hidden sm:inline" />
              Financier
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
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <User className={`h-5 w-5 mx-auto mb-1 ${clientType === 'individual' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-sm font-medium ${clientType === 'individual' ? 'text-primary' : ''}`}>
                    Particulier
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setClientType('company')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    clientType === 'company'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Building2 className={`h-5 w-5 mx-auto mb-1 ${clientType === 'company' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-sm font-medium ${clientType === 'company' ? 'text-primary' : ''}`}>
                    Entreprise
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input id="lastName" placeholder="Ex: Benali" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input id="firstName" placeholder="Ex: Ahmed" />
              </div>
            </div>

            {clientType === 'company' && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Raison sociale *</Label>
                <Input id="companyName" placeholder="Ex: SARL Benali Auto Import" />
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

          {/* Onglet Financier */}
          <TabsContent value="financial" className="space-y-4 mt-4">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h3 className="font-medium text-primary flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Répartition des bénéfices
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Définissez le pourcentage du bénéfice que ce partenaire recevra sur chaque vente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profitPercentage">Pourcentage du bénéfice (%) *</Label>
              <div className="relative">
                <Input 
                  id="profitPercentage" 
                  type="number"
                  min="0"
                  max="100"
                  value={profitPercentage}
                  onChange={(e) => setProfitPercentage(e.target.value)}
                  placeholder="Ex: 30"
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ce pourcentage sera appliqué sur le bénéfice net de chaque véhicule vendu
              </p>
            </div>

            {profitPercentage && (
              <div className="p-4 bg-accent/50 rounded-lg space-y-3">
                <h4 className="font-medium text-sm">Exemple de répartition</h4>
                <p className="text-xs text-muted-foreground">
                  Pour un bénéfice de 500 000 DZD :
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">Part du partenaire</p>
                    <p className="text-lg font-bold text-primary">
                      {(500000 * Number(profitPercentage) / 100).toLocaleString('fr-DZ')} DZD
                    </p>
                    <p className="text-xs text-muted-foreground">{profitPercentage}%</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">Votre part</p>
                    <p className="text-lg font-bold text-success">
                      {(500000 * (100 - Number(profitPercentage)) / 100).toLocaleString('fr-DZ')} DZD
                    </p>
                    <p className="text-xs text-muted-foreground">{100 - Number(profitPercentage)}%</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="investmentCapacity">Capacité d'investissement (DZD)</Label>
              <Input 
                id="investmentCapacity" 
                type="number"
                placeholder="Ex: 10 000 000"
              />
              <p className="text-xs text-muted-foreground">
                Montant maximum que le partenaire peut investir par véhicule
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Conditions de paiement</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Paiement immédiat à la vente</SelectItem>
                  <SelectItem value="15days">Sous 15 jours après vente</SelectItem>
                  <SelectItem value="30days">Sous 30 jours après vente</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankDetails">RIB / Coordonnées bancaires</Label>
              <Input id="bankDetails" placeholder="Numéro de compte pour les virements" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="financialNotes">Notes financières</Label>
              <Textarea 
                id="financialNotes" 
                placeholder="Conditions particulières, accords spéciaux..."
                rows={2}
              />
            </div>
          </TabsContent>

          {/* Onglet Documents */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">Documents requis selon la loi algérienne</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ces documents sont nécessaires pour l'importation de véhicules en Algérie
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-foreground border-b border-border pb-2">
                Documents d'identité
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentUpload 
                  id="passport" 
                  label="Passeport" 
                  required
                  description="Pages d'identité et validité"
                />
                <DocumentUpload 
                  id="nationalId" 
                  label="Carte d'identité nationale" 
                  required
                  description="Recto et verso"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentUpload 
                  id="driverLicense" 
                  label="Permis de conduire" 
                  description="Permis valide"
                />
                <DocumentUpload 
                  id="proofOfAddress" 
                  label="Justificatif de domicile" 
                  required
                  description="Facture électricité/gaz/eau (-3 mois)"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-foreground border-b border-border pb-2">
                Documents fiscaux
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentUpload 
                  id="nif" 
                  label="NIF (Numéro d'Identification Fiscale)" 
                  required
                  description="Attestation NIF délivrée par les impôts"
                />
                {clientType === 'company' && (
                  <DocumentUpload 
                    id="registreCommerce" 
                    label="Registre de commerce" 
                    required
                    description="Extrait du registre de commerce"
                  />
                )}
              </div>

              {clientType === 'company' && (
                <DocumentUpload 
                  id="statutsEntreprise" 
                  label="Statuts de l'entreprise" 
                  description="Statuts juridiques de la société"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Enregistrer le partenaire
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
