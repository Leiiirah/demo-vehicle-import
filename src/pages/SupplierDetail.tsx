import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { suppliers, vehicles } from '@/data/mockData';
import { 
  Building2, 
  Star, 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  TrendingUp,
  Car,
  FileText,
  Edit,
  MessageCircle
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

const SupplierDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const supplier = suppliers.find(s => s.id === id);
  const supplierVehicles = vehicles.filter(v => v.supplier === supplier?.name);

  const formatCurrency = (amount: number, currency: 'USD' | 'DZD' = 'USD') => {
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

  if (!supplier) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Fournisseur non trouvé</p>
          <Button onClick={() => navigate('/suppliers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux fournisseurs
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Mock additional data
  const supplierDetails = {
    phone: '+86 20 8888 9999',
    email: 'contact@' + supplier.name.toLowerCase().replace(/\s/g, '') + '.cn',
    wechat: 'wx_' + supplier.id.toLowerCase(),
    address: '123 Auto District, ' + supplier.location,
    bankName: 'Bank of China',
    swiftCode: 'BKCHCNBJ',
    accountNumber: '****' + Math.random().toString().slice(2, 6),
    paymentTerms: '30% avance / 70% avant expédition',
    incoterm: 'FOB',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/suppliers')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-accent flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{supplier.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{supplier.location}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(supplier.rating)
                          ? 'text-warning fill-warning'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    {supplier.rating}
                  </span>
                </div>
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
                  <p className="text-sm text-muted-foreground">Véhicules fournis</p>
                  <p className="text-2xl font-bold">{supplier.vehiclesSupplied}</p>
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
                  <p className="text-sm text-muted-foreground">Total payé</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(supplier.totalPaid)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Solde crédit</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(supplier.creditBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-danger/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-danger" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dette restante</p>
                  <p className="text-2xl font-bold text-danger">{formatCurrency(supplier.remainingDebt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="vehicles">Véhicules ({supplierVehicles.length})</TabsTrigger>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact</CardTitle>
                  <CardDescription>Informations de contact du fournisseur</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{supplierDetails.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{supplierDetails.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span>WeChat: {supplierDetails.wechat}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{supplierDetails.address}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Bancaire */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations bancaires</CardTitle>
                  <CardDescription>Pour les virements internationaux</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Banque</span>
                    <span className="font-medium">{supplierDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code SWIFT</span>
                    <span className="font-medium font-mono">{supplierDetails.swiftCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compte</span>
                    <span className="font-medium font-mono">{supplierDetails.accountNumber}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Commercial */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Conditions commerciales</CardTitle>
                  <CardDescription>Termes de paiement et livraison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Conditions de paiement</p>
                      <p className="font-medium mt-1">{supplierDetails.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Incoterm</p>
                      <p className="font-medium mt-1">{supplierDetails.incoterm}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Délai moyen</p>
                      <p className="font-medium mt-1">21-30 jours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Véhicules de ce fournisseur</CardTitle>
                <CardDescription>Liste des véhicules commandés auprès de {supplier.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {supplierVehicles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Véhicule</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Prix achat</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date commande</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierVehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
                              <p className="text-sm text-muted-foreground">{vehicle.year}</p>
                            </div>
                          </TableCell>
                          <TableCell>{vehicle.client}</TableCell>
                          <TableCell>{formatCurrency(vehicle.purchasePrice)}</TableCell>
                          <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                          <TableCell>{new Date(vehicle.orderDate).toLocaleDateString('fr-FR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun véhicule enregistré pour ce fournisseur
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Historique des paiements</CardTitle>
                  <CardDescription>Tous les paiements effectués à ce fournisseur</CardDescription>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Nouveau paiement
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>01/02/2026</TableCell>
                      <TableCell>Paiement VH001</TableCell>
                      <TableCell className="font-medium">{formatCurrency(45000)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Complété
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>15/01/2026</TableCell>
                      <TableCell>Acompte commande</TableCell>
                      <TableCell className="font-medium">{formatCurrency(25000)}</TableCell>
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

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
                <CardDescription>Contrats, factures et documents associés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['Contrat cadre 2026', 'Facture F-2026-001', 'Certificat d\'origine'].map((doc, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{doc}</p>
                        <p className="text-sm text-muted-foreground">PDF • 2.4 MB</p>
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

export default SupplierDetailPage;
