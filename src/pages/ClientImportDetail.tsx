import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { vehicles } from '@/data/mockData';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Building2,
  TrendingUp,
  Car,
  FileText,
  Edit,
  MessageCircle,
  Percent,
  Wallet,
  DollarSign
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
const clientsImport = [
  {
    id: 'imp-1',
    name: 'Ahmed Benali',
    company: 'Benali Auto Import',
    email: 'ahmed@benaliauto.dz',
    phone: '+213 555 123 456',
    phone2: '+213 555 999 888',
    wilaya: 'Alger',
    commune: 'Hydra',
    address: '25 Rue des Pins, Hydra',
    status: 'active',
    profitPercentage: 30,
    vehiclesImported: 12,
    totalInvested: 45000000,
    totalProfitShare: 4500000,
    pendingPayment: 850000,
    nif: '000123456789012',
    createdAt: '2025-06-15',
  },
  {
    id: 'imp-2',
    name: 'Karim Meziane',
    company: 'KM Investments',
    email: 'karim@kminvest.dz',
    phone: '+213 555 789 012',
    phone2: '',
    wilaya: 'Oran',
    commune: 'Bir El Djir',
    address: '10 Boulevard Front de Mer',
    status: 'active',
    profitPercentage: 25,
    vehiclesImported: 8,
    totalInvested: 32000000,
    totalProfitShare: 2800000,
    pendingPayment: 0,
    nif: '000987654321098',
    createdAt: '2025-08-20',
  },
  {
    id: 'imp-3',
    name: 'Sofiane Hadj',
    company: 'Hadj Motors',
    email: 'sofiane@hadjmotors.dz',
    phone: '+213 555 456 789',
    phone2: '',
    wilaya: 'Constantine',
    commune: 'El Khroub',
    address: '5 Rue Ali Mendjeli',
    status: 'inactive',
    profitPercentage: 35,
    vehiclesImported: 5,
    totalInvested: 18000000,
    totalProfitShare: 1500000,
    pendingPayment: 320000,
    nif: '000456789012345',
    createdAt: '2025-04-10',
  },
];

const ClientImportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const client = clientsImport.find(c => c.id === id);
  const clientVehicles = vehicles.slice(0, 3);

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
          <p className="text-muted-foreground">Partenaire non trouvé</p>
          <Button onClick={() => navigate('/clients-import')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux partenaires
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const mockDocuments = [
    { name: 'Passeport', status: 'valid', file: 'passeport.pdf' },
    { name: 'Carte d\'identité', status: 'valid', file: 'cni.pdf' },
    { name: 'NIF', status: 'valid', file: 'nif.pdf' },
    { name: 'Justificatif de domicile', status: 'expired', file: 'domicile.pdf' },
  ];

  const profitBreakdown = [
    { vehicle: 'Toyota Land Cruiser 2024', saleDate: '2026-01-20', totalProfit: 1200000, partnerShare: 360000, myShare: 840000, paid: true },
    { vehicle: 'Mercedes GLE 450', saleDate: '2026-01-10', totalProfit: 1500000, partnerShare: 450000, myShare: 1050000, paid: true },
    { vehicle: 'BMW X5 M Sport', saleDate: '2025-12-28', totalProfit: 850000, partnerShare: 255000, myShare: 595000, paid: false },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/clients-import')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-foreground">{client.name}</h1>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Partenaire Import
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
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{client.company}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Partenaire depuis {new Date(client.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contacter
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Part bénéfice</p>
                  <p className="text-2xl font-bold text-primary">{client.profitPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Véhicules</p>
                  <p className="text-2xl font-bold">{client.vehiclesImported}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total investi</p>
                  <p className="text-xl font-bold">{formatCurrency(client.totalInvested)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Part reçue</p>
                  <p className="text-xl font-bold text-success">{formatCurrency(client.totalProfitShare)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">À verser</p>
                  <p className="text-xl font-bold text-warning">{formatCurrency(client.pendingPayment)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="profits">Répartition bénéfices</TabsTrigger>
            <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="payments">Versements</TabsTrigger>
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

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Accord financier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm text-muted-foreground">Pourcentage sur bénéfices</p>
                      <p className="text-3xl font-bold text-primary mt-1">{client.profitPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">NIF</p>
                      <p className="font-medium font-mono mt-1">{client.nif}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entreprise</p>
                      <p className="font-medium mt-1">{client.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profits">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Répartition des bénéfices</CardTitle>
                <CardDescription>
                  Détail des parts sur chaque véhicule vendu ({client.profitPercentage}% pour le partenaire)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Véhicule</TableHead>
                      <TableHead>Date vente</TableHead>
                      <TableHead>Bénéfice total</TableHead>
                      <TableHead>Part partenaire ({client.profitPercentage}%)</TableHead>
                      <TableHead>Ma part ({100 - client.profitPercentage}%)</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profitBreakdown.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.vehicle}</TableCell>
                        <TableCell>{new Date(item.saleDate).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{formatCurrency(item.totalProfit)}</TableCell>
                        <TableCell className="text-primary font-medium">
                          {formatCurrency(item.partnerShare)}
                        </TableCell>
                        <TableCell className="text-success font-medium">
                          {formatCurrency(item.myShare)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={item.paid 
                              ? 'bg-success/10 text-success border-success/20' 
                              : 'bg-warning/10 text-warning border-warning/20'
                            }
                          >
                            {item.paid ? 'Versé' : 'En attente'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 p-4 bg-accent/50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total bénéfices</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(profitBreakdown.reduce((s, i) => s + i.totalProfit, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Part partenaire</p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(profitBreakdown.reduce((s, i) => s + i.partnerShare, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ma part</p>
                      <p className="text-xl font-bold text-success">
                        {formatCurrency(profitBreakdown.reduce((s, i) => s + i.myShare, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Véhicules importés ensemble</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Véhicule</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Prix vente</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
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
                        <TableCell>{vehicle.supplier}</TableCell>
                        <TableCell>{formatCurrency(vehicle.sellingPrice)}</TableCell>
                        <TableCell className="text-success font-medium">
                          {formatCurrency(vehicle.profit)}
                        </TableCell>
                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                        <TableCell>{new Date(vehicle.orderDate).toLocaleDateString('fr-FR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dossier partenaire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockDocuments.map((doc, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">{doc.file}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={doc.status === 'valid' 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                        }
                      >
                        {doc.status === 'valid' ? 'Valide' : 'Expiré'}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button className="mt-4" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Ajouter un document
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Versements au partenaire</CardTitle>
                  <CardDescription>Historique des parts versées</CardDescription>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Enregistrer versement
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
                      <TableCell>25/01/2026</TableCell>
                      <TableCell>Part Toyota Land Cruiser</TableCell>
                      <TableCell className="font-medium">{formatCurrency(360000)}</TableCell>
                      <TableCell>Virement</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Complété
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>10/01/2026</TableCell>
                      <TableCell>Part Mercedes GLE</TableCell>
                      <TableCell className="font-medium">{formatCurrency(450000)}</TableCell>
                      <TableCell>Virement</TableCell>
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

export default ClientImportDetailPage;
