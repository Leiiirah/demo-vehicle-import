import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Edit,
  BookUser,
  FileText,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Mock data
const passeports = [
  {
    id: 'pass-1',
    nom: 'Benali',
    prenom: 'Ahmed',
    telephone: '+213 555 123 456',
    adresse: '25 Rue des Pins, Hydra, Alger',
    numeroPasseport: 'A12345678',
    pdfPasseport: 'passeport_benali.pdf',
    montantDu: 10000,
    paye: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'pass-2',
    nom: 'Meziane',
    prenom: 'Karim',
    telephone: '+213 555 789 012',
    adresse: '10 Boulevard Front de Mer, Oran',
    numeroPasseport: 'B98765432',
    pdfPasseport: 'passeport_meziane.pdf',
    montantDu: 10000,
    paye: false,
    createdAt: '2026-01-20',
  },
  {
    id: 'pass-3',
    nom: 'Hadj',
    prenom: 'Sofiane',
    telephone: '+213 555 456 789',
    adresse: '5 Rue Ali Mendjeli, Constantine',
    numeroPasseport: 'C55667788',
    pdfPasseport: 'passeport_hadj.pdf',
    montantDu: 15000,
    paye: true,
    createdAt: '2026-01-25',
  },
];

const PasseportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const passeport = passeports.find(p => p.id === id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  if (!passeport) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Passeport non trouvé</p>
          <Button onClick={() => navigate('/passeports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux passeports
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
              onClick={() => navigate('/passeports')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookUser className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-foreground">
                    {passeport.nom} {passeport.prenom}
                  </h1>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Passeport
                  </Badge>
                </div>
                <p className="text-muted-foreground font-mono">
                  N° {passeport.numeroPasseport}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ajouté le {new Date(passeport.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
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
                <span>{passeport.telephone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{passeport.adresse}</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{passeport.numeroPasseport}</span>
              </div>
            </CardContent>
          </Card>

          {/* Document */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-accent/30">
                <div className="flex items-center gap-3">
                  <FileText className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium">{passeport.pdfPasseport}</p>
                    <p className="text-sm text-muted-foreground">PDF du passeport</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Télécharger
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Paiement */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Montant dû</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {formatCurrency(passeport.montantDu)}
                  </p>
                </div>
                <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <div className="mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
                        passeport.paye
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      )}
                    >
                      {passeport.paye ? (
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
                {!passeport.paye && (
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

export default PasseportDetailPage;
