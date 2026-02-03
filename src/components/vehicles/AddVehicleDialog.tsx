import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Car, DollarSign, Truck, FileText } from 'lucide-react';
import { suppliers } from '@/data/mockData';

interface AddVehicleDialogProps {
  children: React.ReactNode;
}

const AddVehicleDialog = ({ children }: AddVehicleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Mock clients import pour la sélection
  const clientsImport = [
    { id: 'CLI001', name: 'Ahmed Benali', profitPercentage: 15 },
    { id: 'CLI002', name: 'Karim Hadj', profitPercentage: 20 },
    { id: 'CLI003', name: 'Youcef Mansouri', profitPercentage: 10 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI only - pas de logique de soumission
    setOpen(false);
    setStep(1);
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Ajouter un véhicule
          </DialogTitle>
          <DialogDescription>
            Étape {step} sur 4 -{' '}
            {step === 1 && 'Informations du véhicule'}
            {step === 2 && 'Coûts et prix'}
            {step === 3 && 'Client Import & Fournisseur'}
            {step === 4 && 'Documents et notes'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Étape 1: Informations véhicule */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toyota">Toyota</SelectItem>
                      <SelectItem value="mercedes">Mercedes</SelectItem>
                      <SelectItem value="bmw">BMW</SelectItem>
                      <SelectItem value="audi">Audi</SelectItem>
                      <SelectItem value="porsche">Porsche</SelectItem>
                      <SelectItem value="land-rover">Land Rover</SelectItem>
                      <SelectItem value="volkswagen">Volkswagen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modèle *</Label>
                  <Input id="model" placeholder="Ex: Land Cruiser" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Année *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vin">Numéro VIN</Label>
                  <Input id="vin" placeholder="17 caractères" maxLength={17} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Couleur</Label>
                  <Input id="color" placeholder="Ex: Noir métallisé" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="containerId">N° Conteneur</Label>
                  <Input id="containerId" placeholder="Ex: CONT-2024-XXX" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Statut initial *</Label>
                <Select defaultValue="ordered">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordered">Commandé</SelectItem>
                    <SelectItem value="in_transit">En transit</SelectItem>
                    <SelectItem value="arrived">Arrivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Étape 2: Coûts et prix */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium">Prix d'achat (USD)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Prix FOB *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input id="purchasePrice" type="number" className="pl-7" placeholder="0" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exchangeRate">Taux de change</Label>
                    <Input id="exchangeRate" type="number" defaultValue="134.50" step="0.01" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="font-medium">Frais de transport (USD)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingCost">Fret maritime</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input id="shippingCost" type="number" className="pl-7" placeholder="0" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceCost">Assurance</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input id="insuranceCost" type="number" className="pl-7" placeholder="0" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <span className="font-medium mb-3 block">Frais locaux (DZD)</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customsFees">Douane</Label>
                    <Input id="customsFees" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portFees">Frais portuaires</Label>
                    <Input id="portFees" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transitFees">Transit</Label>
                    <Input id="transitFees" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherFees">Autres frais</Label>
                    <Input id="otherFees" type="number" placeholder="0" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Prix de vente prévu (DZD)</span>
                  <Input 
                    type="number" 
                    className="w-48 text-right font-semibold" 
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Client Import & Fournisseur */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <span className="font-medium mb-3 block">Client Import (Partenaire)</span>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sélectionner un client import *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un partenaire" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientsImport.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.profitPercentage}% de part)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientInvestment">Montant investi par le client (DZD)</Label>
                    <Input id="clientInvestment" type="number" placeholder="0" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <span className="font-medium mb-3 block">Fournisseur</span>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sélectionner un fournisseur *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} - {supplier.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orderDate">Date de commande</Label>
                      <Input id="orderDate" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedArrival">Arrivée estimée</Label>
                      <Input id="estimatedArrival" type="date" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <span className="font-medium mb-3 block">Client Vente (Acheteur final)</span>
                <p className="text-sm text-muted-foreground mb-3">
                  Optionnel - À renseigner quand le véhicule sera vendu
                </p>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="À définir lors de la vente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Étape 4: Documents et notes */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">Documents à joindre</span>
                </div>
                <div className="space-y-3">
                  {[
                    'Bill of Lading (B/L)',
                    'Facture fournisseur',
                    'Certificat de conformité',
                    'Photos du véhicule',
                  ].map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center justify-between p-3 border border-dashed border-border rounded-lg"
                    >
                      <span className="text-sm">{doc}</span>
                      <Button type="button" variant="outline" size="sm">
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes et observations</Label>
                <Textarea
                  id="notes"
                  placeholder="Ajoutez des informations supplémentaires sur ce véhicule..."
                  rows={4}
                />
              </div>

              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <h4 className="font-medium text-success mb-2">Récapitulatif</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• Véhicule ajouté avec le statut "Commandé"</p>
                  <p>• Client Import associé avec répartition des bénéfices</p>
                  <p>• Suivi automatique du transport activé</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              Précédent
            </Button>
            {step < 4 ? (
              <Button type="button" onClick={nextStep}>
                Suivant
              </Button>
            ) : (
              <Button type="submit">
                Ajouter le véhicule
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVehicleDialog;
