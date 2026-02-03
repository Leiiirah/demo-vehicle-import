import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { clients, vehicles } from '@/data/mockData';
import { 
  User, 
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
  Percent
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

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const client = clients.find(c => c.id === id);
  const clientVehicles = vehicles.filter(v => v.client === client?.name);

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
          <p className="text-muted-foreground">Client non trouvé</p>
          <Button onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux clients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Mock additional data
  const clientDetails = {
    phone2: '+213 555 999 888',
    wilaya: 'Alger',
    commune: 'Hydra',
    address: '25 Rue des Pins, Hydra',
    nif: '000123456789012',
    createdAt: '2025-06-15',
  };

  const mockDocuments = [
    { name: 'Passeport', status: 'valid', file: 'passeport_benali.pdf' },
    { name: 'Carte d\'identité', status: 'valid', file: 'cni_benali.pdf' },
    { name: 'NIF', status: 'valid', file: 'nif_benali.pdf' },
    { name: 'Justificatif de domicile', status: 'expired', file: 'domicile_benali.pdf' },
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
              onClick={() => navigate('/clients')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-accent flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-foreground">{client.name}</h1>
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
                  Client depuis {new Date(clientDetails.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Véhicules importés</p>
                  <p className="text-2xl font-bold">{client.vehiclesImported}</p>
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
                  <p className="text-sm text-muted-foreground">Profit total</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(client.totalProfit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marge moyenne</p>
                  <p className="text-2xl font-bold text-primary">{client.marginPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Car className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En cours</p>
                  <p className="text-2xl font-bold text-warning">
                    {clientVehicles.filter(v => v.status !== 'sold').length}
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
            <TabsTrigger value="vehicles">Véhicules ({clientVehicles.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                  <CardDescription>Informations de contact du client</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{clientDetails.phone2}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Adresse */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adresse</CardTitle>
                  <CardDescription>Localisation du client</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wilaya</span>
                    <span className="font-medium">{clientDetails.wilaya}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commune</span>
                    <span className="font-medium">{clientDetails.commune}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{clientDetails.address}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Fiscal */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Informations fiscales</CardTitle>
                  <CardDescription>Données d'identification fiscale</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">NIF</p>
                      <p className="font-medium font-mono mt-1">{clientDetails.nif}</p>
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

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Véhicules du client</CardTitle>
                <CardDescription>Historique des véhicules importés pour {client.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {clientVehicles.length > 0 ? (
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
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun véhicule enregistré pour ce client
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dossier client</CardTitle>
                <CardDescription>Documents légaux requis pour l'importation</CardDescription>
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
                          : 'bg-danger/10 text-danger border-danger/20'
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
                  <CardTitle className="text-lg">Historique des paiements</CardTitle>
                  <CardDescription>Tous les paiements reçus de ce client</CardDescription>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                      <TableCell>25/01/2026</TableCell>
                      <TableCell>Toyota Land Cruiser</TableCell>
                      <TableCell className="font-medium">{formatCurrency(7200000)}</TableCell>
                      <TableCell>Virement</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Complété
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>10/01/2026</TableCell>
                      <TableCell>Acompte Mercedes GLE</TableCell>
                      <TableCell className="font-medium">{formatCurrency(3000000)}</TableCell>
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

export default ClientDetailPage;
