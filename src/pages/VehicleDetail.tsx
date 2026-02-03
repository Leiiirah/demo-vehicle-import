import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { vehicles, suppliers } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Car,
  Truck,
  Package,
  CheckCircle2,
  DollarSign,
  FileText,
  Calendar,
  MapPin,
  User,
  Building2,
  Edit,
  Clock,
  Ship,
  Anchor,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Trouver le véhicule (mock)
  const vehicle = vehicles.find((v) => v.id === id) || vehicles[0];
  const supplier = suppliers.find((s) => s.name === vehicle.supplier);

  // Mock client import associé
  const clientImport = {
    id: 'CLI001',
    name: 'Ahmed Benali',
    profitPercentage: 15,
    investedAmount: 5000000,
  };

  const formatCurrency = (amount: number, currency: 'USD' | 'DZD' = 'DZD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      ordered: { label: 'Commandé', color: 'badge-info', progress: 25, icon: Package },
      in_transit: { label: 'En transit', color: 'badge-pending', progress: 50, icon: Ship },
      arrived: { label: 'Arrivé', color: 'badge-profit', progress: 75, icon: Anchor },
      sold: { label: 'Vendu', color: 'bg-muted text-muted-foreground', progress: 100, icon: BadgeCheck },
    };
    return statusMap[status as keyof typeof statusMap];
  };

  const statusInfo = getStatusInfo(vehicle.status);
  const StatusIcon = statusInfo.icon;

  // Timeline du véhicule
  const timeline = [
    {
      status: 'ordered',
      label: 'Commande passée',
      date: vehicle.orderDate,
      completed: true,
      icon: Package,
    },
    {
      status: 'in_transit',
      label: 'Départ du port',
      date: vehicle.status !== 'ordered' ? '2026-01-20' : null,
      completed: ['in_transit', 'arrived', 'sold'].includes(vehicle.status),
      icon: Ship,
    },
    {
      status: 'arrived',
      label: 'Arrivée au port',
      date: vehicle.arrivalDate,
      completed: ['arrived', 'sold'].includes(vehicle.status),
      icon: Anchor,
    },
    {
      status: 'sold',
      label: 'Véhicule vendu',
      date: vehicle.soldDate,
      completed: vehicle.status === 'sold',
      icon: BadgeCheck,
    },
  ];

  // Calcul de la répartition des bénéfices
  const clientShare = (vehicle.profit * clientImport.profitPercentage) / 100;
  const companyShare = vehicle.profit - clientShare;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">
                {vehicle.brand} {vehicle.model}
              </h1>
              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusInfo.color)}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-muted-foreground">
              {vehicle.year} • {vehicle.id} • VIN: {vehicle.vin}
            </p>
          </div>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>

        {/* Progress bar du statut */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-muted-foreground">{statusInfo.progress}%</span>
            </div>
            <Progress value={statusInfo.progress} className="h-2" />
            <div className="flex justify-between mt-4">
              {timeline.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center mb-2',
                        step.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn('text-xs font-medium', step.completed ? 'text-foreground' : 'text-muted-foreground')}>
                      {step.label}
                    </span>
                    {step.date && (
                      <span className="text-xs text-muted-foreground">{step.date}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coût total</p>
                  <p className="text-xl font-semibold">{formatCurrency(vehicle.totalCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prix de vente</p>
                  <p className="text-xl font-semibold">{formatCurrency(vehicle.sellingPrice)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bénéfice</p>
                  <p className="text-xl font-semibold text-success">{formatCurrency(vehicle.profit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marge</p>
                  <p className="text-xl font-semibold">{vehicle.margin}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="costs">Coûts détaillés</TabsTrigger>
            <TabsTrigger value="profit">Répartition bénéfices</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          {/* Détails */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Informations véhicule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marque</span>
                    <span className="font-medium">{vehicle.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modèle</span>
                    <span className="font-medium">{vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Année</span>
                    <span className="font-medium">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VIN</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{vehicle.vin}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conteneur</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{vehicle.containerId}</code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Fournisseur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom</span>
                    <span className="font-medium">{vehicle.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Localisation</span>
                    <span className="font-medium">{supplier?.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Note</span>
                    <span className="font-medium">⭐ {supplier?.rating || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client Import (Partenaire)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom</span>
                    <span className="font-medium">{clientImport.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Part des bénéfices</span>
                    <span className="font-medium">{clientImport.profitPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Montant investi</span>
                    <span className="font-medium">{formatCurrency(clientImport.investedAmount)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Dates clés
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commande</span>
                    <span className="font-medium">{vehicle.orderDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arrivée</span>
                    <span className="font-medium">{vehicle.arrivalDate || 'En attente'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vente</span>
                    <span className="font-medium">{vehicle.soldDate || 'Non vendu'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Coûts détaillés */}
          <TabsContent value="costs">
            <Card>
              <CardHeader>
                <CardTitle>Décomposition des coûts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Prix d'achat (USD)</h4>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prix FOB</span>
                      <span className="font-medium">{formatCurrency(vehicle.purchasePrice, 'USD')}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Frais de transport (USD)</h4>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fret + Assurance</span>
                      <span className="font-medium">{formatCurrency(vehicle.transportCost, 'USD')}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3">Frais locaux (DZD)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Douane + Port + Transit</span>
                        <span className="font-medium">{formatCurrency(vehicle.localFees)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Coût total</span>
                      <span className="text-xl font-bold">{formatCurrency(vehicle.totalCost)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Répartition bénéfices */}
          <TabsContent value="profit">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des bénéfices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-6 bg-success/10 border border-success/20 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Bénéfice total</p>
                    <p className="text-3xl font-bold text-success">{formatCurrency(vehicle.profit)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium">Part Client Import</span>
                      </div>
                      <p className="text-2xl font-bold">{formatCurrency(clientShare)}</p>
                      <p className="text-sm text-muted-foreground">
                        {clientImport.profitPercentage}% - {clientImport.name}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">Part Entreprise</span>
                      </div>
                      <p className="text-2xl font-bold">{formatCurrency(companyShare)}</p>
                      <p className="text-sm text-muted-foreground">
                        {100 - clientImport.profitPercentage}% - Votre part
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-3">Statut des paiements</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Montant dû au client import</span>
                        <span className="font-medium text-warning">{formatCurrency(clientShare)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Déjà versé</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="font-medium">Reste à verser</span>
                        <span className="font-medium text-destructive">{formatCurrency(clientShare)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Bill of Lading (B/L)', status: 'uploaded', date: '2026-01-15' },
                    { name: 'Facture fournisseur', status: 'uploaded', date: '2026-01-15' },
                    { name: 'Certificat de conformité', status: 'pending', date: null },
                    { name: 'Déclaration douanière', status: 'pending', date: null },
                    { name: 'Photos véhicule', status: 'uploaded', date: '2026-01-20' },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          {doc.date && (
                            <p className="text-xs text-muted-foreground">Ajouté le {doc.date}</p>
                          )}
                        </div>
                      </div>
                      {doc.status === 'uploaded' ? (
                        <span className="badge-profit text-xs">Téléchargé</span>
                      ) : (
                        <Button variant="outline" size="sm">
                          Ajouter
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historique */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Historique des activités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: '2026-01-28', action: 'Véhicule arrivé au port d\'Alger', type: 'status' },
                    { date: '2026-01-25', action: 'Déclaration douanière initiée', type: 'document' },
                    { date: '2026-01-20', action: 'Départ du port de Shanghai', type: 'status' },
                    { date: '2026-01-18', action: 'Photos du véhicule ajoutées', type: 'document' },
                    { date: '2026-01-15', action: 'Commande passée chez ' + vehicle.supplier, type: 'status' },
                    { date: '2026-01-15', action: 'B/L et facture uploadés', type: 'document' },
                  ].map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'h-3 w-3 rounded-full',
                          event.type === 'status' ? 'bg-primary' : 'bg-muted-foreground'
                        )} />
                        {index < 5 && <div className="w-px h-full bg-border" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium">{event.action}</p>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default VehicleDetailPage;
