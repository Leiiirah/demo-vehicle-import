import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CreateSupplierData } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Building2, User, CreditCard, FileText, Loader2 } from 'lucide-react';

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddSupplierDialog = ({ open, onOpenChange }: AddSupplierDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [creditLimit, setCreditLimit] = useState('0');

  const createMutation = useMutation({
    mutationFn: (data: CreateSupplierData) => api.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Fournisseur créé',
        description: 'Le fournisseur a été enregistré avec succès',
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
    setCompanyName('');
    setProvince('');
    setCity('');
    setCreditLimit('0');
  };

  const handleSubmit = () => {
    if (!companyName.trim()) {
      toast({
        title: 'Champ requis',
        description: 'Le nom de l\'entreprise est obligatoire',
        variant: 'destructive',
      });
      return;
    }

    const location = [city, province].filter(Boolean).join(', ') || 'Chine';

    createMutation.mutate({
      name: companyName.trim(),
      location,
      creditBalance: parseFloat(creditLimit) || 0,
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Ajouter un fournisseur
          </DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau fournisseur chinois pour l'import vers l'Algérie
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="pb-4">
            <Tabs defaultValue="general" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="text-xs sm:text-sm">
                  <Building2 className="h-4 w-4 mr-1 hidden sm:inline" />
                  Général
                </TabsTrigger>
                <TabsTrigger value="contact" className="text-xs sm:text-sm">
                  <User className="h-4 w-4 mr-1 hidden sm:inline" />
                  Contact
                </TabsTrigger>
                <TabsTrigger value="bank" className="text-xs sm:text-sm">
                  <CreditCard className="h-4 w-4 mr-1 hidden sm:inline" />
                  Bancaire
                </TabsTrigger>
                <TabsTrigger value="commercial" className="text-xs sm:text-sm">
                  <FileText className="h-4 w-4 mr-1 hidden sm:inline" />
                  Commercial
                </TabsTrigger>
              </TabsList>

              {/* Onglet Informations générales */}
              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                    <Input 
                      id="companyName" 
                      placeholder="Ex: Guangzhou Auto Trading Co." 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyNameChinese">Nom chinois (可选)</Label>
                    <Input id="companyNameChinese" placeholder="Ex: 广州汽车贸易有限公司" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Select value={province} onValueChange={setProvince}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une province" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Guangdong">Guangdong (广东)</SelectItem>
                        <SelectItem value="Shanghai">Shanghai (上海)</SelectItem>
                        <SelectItem value="Beijing">Beijing (北京)</SelectItem>
                        <SelectItem value="Zhejiang">Zhejiang (浙江)</SelectItem>
                        <SelectItem value="Jiangsu">Jiangsu (江苏)</SelectItem>
                        <SelectItem value="Shandong">Shandong (山东)</SelectItem>
                        <SelectItem value="Tianjin">Tianjin (天津)</SelectItem>
                        <SelectItem value="Liaoning">Liaoning (辽宁)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input 
                      id="city" 
                      placeholder="Ex: Guangzhou, Shenzhen..." 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète</Label>
                  <Textarea 
                    id="address" 
                    placeholder="Adresse détaillée du fournisseur en Chine"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Spécialisation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de véhicules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Berlines</SelectItem>
                      <SelectItem value="suv">SUV / Crossovers</SelectItem>
                      <SelectItem value="truck">Camions / Utilitaires</SelectItem>
                      <SelectItem value="bus">Bus / Minibus</SelectItem>
                      <SelectItem value="electric">Véhicules électriques</SelectItem>
                      <SelectItem value="parts">Pièces détachées</SelectItem>
                      <SelectItem value="mixed">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Onglet Contact */}
              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Nom du contact principal *</Label>
                    <Input id="contactName" placeholder="Ex: Mr. Wang Wei" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactRole">Fonction</Label>
                    <Input id="contactRole" placeholder="Ex: Sales Manager" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (avec indicatif)</Label>
                    <Input id="phone" placeholder="+86 XXX XXXX XXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneAlternate">Téléphone secondaire</Label>
                    <Input id="phoneAlternate" placeholder="+86 XXX XXXX XXXX" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wechat">WeChat ID</Label>
                    <Input id="wechat" placeholder="ID WeChat pour communication" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" placeholder="+86 XXX XXXX XXXX" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <Input id="email" type="email" placeholder="contact@supplier.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site web / Alibaba</Label>
                  <Input id="website" type="url" placeholder="https://..." />
                </div>
              </TabsContent>

              {/* Onglet Informations bancaires */}
              <TabsContent value="bank" className="space-y-4 mt-4">
                <div className="p-3 bg-accent/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    💡 Ces informations sont essentielles pour les virements internationaux vers la Chine
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Nom de la banque</Label>
                  <Input id="bankName" placeholder="Ex: Bank of China, ICBC, China Construction Bank..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Nom du titulaire du compte</Label>
                    <Input id="accountName" placeholder="Nom exact sur le compte bancaire" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Numéro de compte</Label>
                    <Input id="accountNumber" placeholder="Numéro de compte bancaire" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="swiftCode">Code SWIFT / BIC *</Label>
                    <Input id="swiftCode" placeholder="Ex: BKCHCNBJ" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnapsCode">Code CNAPS (中国现代化支付系统)</Label>
                    <Input id="cnapsCode" placeholder="Code de paiement national chinois" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankAddress">Adresse de l'agence bancaire</Label>
                  <Textarea 
                    id="bankAddress" 
                    placeholder="Adresse complète de la succursale bancaire"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise préférée pour les paiements</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD - Dollar américain</SelectItem>
                      <SelectItem value="cny">CNY - Yuan chinois (RMB)</SelectItem>
                      <SelectItem value="eur">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Onglet Conditions commerciales */}
              <TabsContent value="commercial" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Conditions de paiement</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100_advance">100% à l'avance</SelectItem>
                        <SelectItem value="50_50">50% avance / 50% avant expédition</SelectItem>
                        <SelectItem value="30_70">30% avance / 70% contre B/L</SelectItem>
                        <SelectItem value="lc">Lettre de crédit (L/C)</SelectItem>
                        <SelectItem value="tt">Virement télégraphique (T/T)</SelectItem>
                        <SelectItem value="negotiable">À négocier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incoterm">Incoterm habituel</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fob">FOB (Free On Board)</SelectItem>
                        <SelectItem value="cif">CIF (Cost, Insurance, Freight)</SelectItem>
                        <SelectItem value="cfr">CFR (Cost and Freight)</SelectItem>
                        <SelectItem value="exw">EXW (Ex Works)</SelectItem>
                        <SelectItem value="dap">DAP (Delivered At Place)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditLimit">Limite de crédit accordée (USD)</Label>
                    <Input 
                      id="creditLimit" 
                      type="number" 
                      placeholder="0" 
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes / Remarques</Label>
                    <Textarea 
                      id="notes" 
                      placeholder="Informations supplémentaires..."
                      rows={1}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
