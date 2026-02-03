import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { vehicles } from '@/data/mockData';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Building2,
  Car,
  FileText,
  Edit,
  MessageCircle,
  ShoppingCart,
  DollarSign,
  Calculator,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Mock data
const clientsVente = [
  {
    id: 'vente-1',
    name: 'Mohamed Kaci',
    company: '',
    email: 'mkaci@gmail.com',
    phone: '+213 555 111 222',
    phone2: '',
    wilaya: 'Blida',
    commune: 'Ouled Yaïch',
    address: '12 Rue des Oliviers',
    status: 'active',
    vehiclesPurchased: 2,
    totalSpent: 14500000,
    lastPurchase: '2026-01-15',
    createdAt: '2025-09-20',
  },
  {
    id: 'vente-2',
    name: 'Yacine Boudiaf',
    company: 'EURL Boudiaf Transport',
    email: 'yboudiaf@transport.dz',
    phone: '+213 555 333 444',
    phone2: '+213 555 333 445',
    wilaya: 'Sétif',
    commune: 'Sétif Centre',
    address: '45 Avenue 8 Mai 1945',
    status: 'active',
    vehiclesPurchased: 4,
    totalSpent: 28000000,
    lastPurchase: '2026-01-28',
    createdAt: '2025-06-10',
  },
  {
    id: 'vente-3',
    name: 'Nadia Sahraoui',
    company: '',
    email: 'nadia.s@email.com',
    phone: '+213 555 555 666',
    phone2: '',
    wilaya: 'Alger',
    commune: 'Bab Ezzouar',
    address: '8 Cité AADL',
    status: 'active',
    vehiclesPurchased: 1,
    totalSpent: 7200000,
    lastPurchase: '2025-12-20',
    createdAt: '2025-11-05',
  },
  {
    id: 'vente-4',
    name: 'Rachid Hamidi',
    company: 'Hamidi & Fils',
    email: 'rhamidi@hamidi.dz',
    phone: '+213 555 777 888',
    phone2: '',
    wilaya: 'Annaba',
    commune: 'El Bouni',
    address: '20 Rue Zighoud Youcef',
    status: 'active',
    vehiclesPurchased: 3,
    totalSpent: 21000000,
    lastPurchase: '2026-01-30',
    createdAt: '2025-07-15',
  },
];

const ClientVenteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const client = clientsVente.find(c => c.id === id);
  const clientVehicles = vehicles.slice(0, 2);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ordered: 'bg-primary/10 text-primary border-primary/20',
      in_transit: 'bg-warning/10 text-warning border-warning/20',
      arrived: 'bg-success/10 text-success border-success/20',
      sold: 'bg-muted text-muted-foreground border-muted',
    };
    const labels: Record<string, string> = {
      ordered: 'Commandé',
      in_transit: 'En transit',
      arrived: 'Arrivé',
      sold: 'Vendu',
    };
    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Acheteur non trouvé</p>
          <Button onClick={() => navigate('/clients-vente')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux acheteurs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/clients-vente')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-success/10 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-success" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-foreground">{client.name}</h1>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Acheteur
                  </Badge>
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      client.status === 'active'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {client.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                {client.company && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{client.company}</span>
                  </div>
                )}
                {!client.company && (
                  <p className="text-muted-foreground">Particulier</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Client depuis {new Date(client.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contacter
            </Button>
            <Button className="bg-success text-success-foreground hover:bg-success/90">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Véhicules achetés</p>
                  <p className="text-2xl font-bold">{client.vehiclesPurchased}</p>
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
                  <p className="text-sm text-muted-foreground">Total dépensé</p>
                  <p className="text-xl font-bold text-success">{formatCurrency(client.totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Panier moyen</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(client.totalSpent / client.vehiclesPurchased)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dernier achat</p>
                  <p className="text-lg font-bold">
                    {new Date(client.lastPurchase).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="vehicles">Véhicules achetés</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                  {client.phone2 && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.phone2}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adresse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wilaya</span>
                    <span className="font-medium">{client.wilaya}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commune</span>
                    <span className="font-medium">{client.commune}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{client.address}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Véhicules achetés</CardTitle>
                <CardDescription>Historique des achats de {client.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Véhicule</TableHead>
                      <TableHead>Prix d'achat</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut paiement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                            <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(vehicle.sellingPrice)}
                        </TableCell>
                        <TableCell>{new Date(vehicle.orderDate).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            Payé
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Paiements reçus</CardTitle>
                  <CardDescription>Historique des paiements de ce client</CardDescription>
                </div>
                <Button className="bg-success text-success-foreground hover:bg-success/90">
                  Enregistrer paiement
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>15/01/2026</TableCell>
                      <TableCell>Toyota Hilux 2024</TableCell>
                      <TableCell className="font-medium">{formatCurrency(7200000)}</TableCell>
                      <TableCell>Virement</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Complété
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>28/12/2025</TableCell>
                      <TableCell>Hyundai Tucson 2024</TableCell>
                      <TableCell className="font-medium">{formatCurrency(7300000)}</TableCell>
                      <TableCell>Espèces</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Complété
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientVenteDetailPage;
