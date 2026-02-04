import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePasseport, useUpdatePasseport } from '@/hooks/useApi';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Edit,
  BookUser,
  FileText,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EditPasseportDialog } from '@/components/clients/EditPasseportDialog';

const PasseportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { data: passeport, isLoading, error } = usePasseport(id || '');
  const updatePasseport = useUpdatePasseport();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  const handleMarkAsPaid = () => {
    if (passeport) {
      updatePasseport.mutate({ id: passeport.id, data: { paye: true } });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-32" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !passeport) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
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
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setEditDialogOpen(true)}
            >
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
                <span>{passeport.adresse || '-'}</span>
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
              {passeport.pdfPasseport ? (
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
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Aucun document attaché
                </p>
              )}
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
                    {formatCurrency(passeport.montantDu || 0)}
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
                    <Button 
                      className="bg-success text-success-foreground hover:bg-success/90"
                      onClick={handleMarkAsPaid}
                      disabled={updatePasseport.isPending}
                    >
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

      <EditPasseportDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        passeport={passeport}
      />
    </DashboardLayout>
  );
};

export default PasseportDetailPage;
