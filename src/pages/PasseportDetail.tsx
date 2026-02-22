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
  AlertCircle,
  Download,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EditPasseportDialog } from '@/components/clients/EditPasseportDialog';

const PasseportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { data: passeport, isLoading, error } = usePasseport(id || '');

  const exportPDF = () => {
    if (!passeport) return;

    const content = `
      <html>
      <head>
        <title>Passeport - ${passeport.nom} ${passeport.prenom}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 10px; }
          .section { margin: 20px 0; }
          .label { font-weight: bold; color: #555; display: inline-block; width: 220px; }
          .value { display: inline-block; }
          .row { padding: 8px 0; border-bottom: 1px solid #eee; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { font-size: 24px; }
          .header p { color: #666; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Fiche Passeport</h1>
          <p>Date d'export : ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <div class="section">
          <div class="row"><span class="label">Nom :</span><span class="value">${passeport.nom}</span></div>
          <div class="row"><span class="label">Prénom :</span><span class="value">${passeport.prenom}</span></div>
          <div class="row"><span class="label">Téléphone :</span><span class="value">${passeport.telephone}</span></div>
          <div class="row"><span class="label">Adresse :</span><span class="value">${passeport.adresse || '-'}</span></div>
          <div class="row"><span class="label">Numéro de passeport :</span><span class="value">${passeport.numeroPasseport}</span></div>
          <div class="row"><span class="label">NIN :</span><span class="value">${passeport.nin || '-'}</span></div>
          <div class="row"><span class="label">Date de création :</span><span class="value">${new Date(passeport.createdAt).toLocaleDateString('fr-FR')}</span></div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
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
            <Button variant="outline" onClick={exportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
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
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">NIN : </span>
                  <span className="font-mono">{passeport.nin || '-'}</span>
                </div>
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
