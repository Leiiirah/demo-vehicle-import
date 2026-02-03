import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Edit,
  ShoppingCart,
  Percent,
  Check,
  X,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data
const clients = [
  {
    id: 'client-1',
    nom: 'Kaci',
    prenom: 'Mohamed',
    telephone: '+213 555 111 222',
    adresse: '12 Rue des Oliviers, Blida',
    pourcentageBenefice: 5,
    prixVente: 10000000,
    coutRevient: 8500000,
    detteBenefice: 75000,
    paye: false,
    createdAt: '2026-01-15',
  },
  {
    id: 'client-2',
    nom: 'Boudiaf',
    prenom: 'Yacine',
    telephone: '+213 555 333 444',
    adresse: '45 Avenue 8 Mai 1945, Sétif',
    pourcentageBenefice: 10,
    prixVente: 14000000,
    coutRevient: 11000000,
    detteBenefice: 300000,
    paye: true,
    createdAt: '2026-01-20',
  },
  {
    id: 'client-3',
    nom: 'Sahraoui',
    prenom: 'Nadia',
    telephone: '+213 555 555 666',
    adresse: '8 Cité AADL, Bab Ezzouar, Alger',
    pourcentageBenefice: 3,
    prixVente: 7200000,
    coutRevient: 6000000,
    detteBenefice: 36000,
    paye: true,
    createdAt: '2026-01-25',
  },
  {
    id: 'client-4',
    nom: 'Hamidi',
    prenom: 'Rachid',
    telephone: '+213 555 777 888',
    adresse: '20 Rue Zighoud Youcef, El Bouni, Annaba',
    pourcentageBenefice: 8,
    prixVente: 21000000,
    coutRevient: 17500000,
    detteBenefice: 280000,
    paye: false,
    createdAt: '2026-01-28',
  },
];

const ClientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const client = clients.find(c => c.id === id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
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

  const benefice = client.prixVente - client.coutRevient;

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
              <div className="h-16 w-16 rounded-xl bg-success/10 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-success" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-foreground">
                    {client.nom} {client.prenom}
                  </h1>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Client
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {client.pourcentageBenefice}% du bénéfice
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Client depuis {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
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
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pourcentage</p>
                  <p className="text-2xl font-bold text-primary">{client.pourcentageBenefice}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prix vente</p>
                  <p className="text-lg font-bold">{formatCurrency(client.prixVente)}</p>
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
                  <p className="text-sm text-muted-foreground">Bénéfice</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(benefice)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dette client</p>
                  <p className="text-lg font-bold text-warning">{formatCurrency(client.detteBenefice)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.telephone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{client.adresse}</span>
              </div>
            </CardContent>
          </Card>

          {/* Calcul du bénéfice */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calcul du bénéfice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix de vente</span>
                <span className="font-medium">{formatCurrency(client.prixVente)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coût de revient</span>
                <span className="font-medium">- {formatCurrency(client.coutRevient)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-medium">Bénéfice</span>
                <span className="font-bold text-success">{formatCurrency(benefice)}</span>
              </div>
              <div className="flex justify-between bg-warning/10 p-3 rounded-lg">
                <span className="font-medium">Part client ({client.pourcentageBenefice}%)</span>
                <span className="font-bold text-warning">{formatCurrency(client.detteBenefice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Statut paiement */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Statut du paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-warning/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Dette totale</p>
                  <p className="text-2xl font-bold text-warning mt-1">
                    {formatCurrency(client.detteBenefice)}
                  </p>
                </div>
                <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <div className="mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
                        client.paye
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      )}
                    >
                      {client.paye ? (
                        <>
                          <Check className="h-4 w-4" />
                          Payé
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          Non payé
                        </>
                      )}
                    </span>
                  </div>
                </div>
                {!client.paye && (
                  <div className="flex items-center">
                    <Button className="bg-success text-success-foreground hover:bg-success/90">
                      <Check className="h-4 w-4 mr-2" />
                      Marquer comme payé
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetailPage;
