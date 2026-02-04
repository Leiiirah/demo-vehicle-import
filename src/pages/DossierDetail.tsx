import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Building2, Container, Car, Plus, Calendar, Edit } from 'lucide-react';
import { AddConteneurDialog } from '@/components/conteneurs/AddConteneurDialog';

// Mock data
const mockDossier = {
  id: 'DOS001',
  reference: 'DOS-2026-001',
  supplierId: 'SUP001',
  supplierName: 'Guangzhou Auto Export',
  dateCreation: '2026-01-15',
  status: 'en_cours' as const,
  totalVehicles: 4,
  totalConteneurs: 2,
  notes: 'Commande premium pour clients VIP',
};

const mockConteneurs = [
  {
    id: 'CONT001',
    numero: 'MSKU1234567',
    type: '40ft' as const,
    status: 'en_transit' as const,
    dateDepart: '2026-01-20',
    vehiculesCount: 2,
  },
  {
    id: 'CONT002',
    numero: 'TCLU7654321',
    type: '40ft_hc' as const,
    status: 'en_chargement' as const,
    vehiculesCount: 2,
  },
];

const statusConfig = {
  en_cours: { label: 'En cours', className: 'bg-primary/10 text-primary border-primary/30' },
  termine: { label: 'Terminé', className: 'bg-success/10 text-success border-success/30' },
  annule: { label: 'Annulé', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const conteneurStatusConfig = {
  en_chargement: { label: 'En chargement', className: 'bg-warning/10 text-warning border-warning/30' },
  en_transit: { label: 'En transit', className: 'bg-primary/10 text-primary border-primary/30' },
  arrive: { label: 'Arrivé', className: 'bg-success/10 text-success border-success/30' },
  dedouane: { label: 'Dédouané', className: 'bg-muted text-muted-foreground border-muted-foreground/30' },
};

const typeLabels = {
  '20ft': '20 pieds',
  '40ft': '40 pieds',
  '40ft_hc': '40 pieds HC',
};

export default function DossierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [addConteneurOpen, setAddConteneurOpen] = useState(false);
  const dossier = mockDossier;
  const conteneurs = mockConteneurs;
  const status = statusConfig[dossier.status];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dossiers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{dossier.reference}</h1>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">Dossier #{id}</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fournisseur</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{dossier.supplierName}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <button
                  className="hover:underline text-primary"
                  onClick={() => navigate(`/suppliers/${dossier.supplierId}`)}
                >
                  Voir le fournisseur →
                </button>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Date Création</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {new Date(dossier.dateCreation).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dossier.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                dans {dossier.totalConteneurs} conteneurs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conteneurs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Conteneurs</CardTitle>
              <CardDescription>Liste des conteneurs de ce dossier</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => setAddConteneurOpen(true)}>
              <Plus className="h-4 w-4" />
              Ajouter Conteneur
            </Button>
            <AddConteneurDialog 
              open={addConteneurOpen} 
              onOpenChange={setAddConteneurOpen}
              preSelectedDossierId={dossier.id}
            />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Départ</TableHead>
                    <TableHead className="text-center">Véhicules</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conteneurs.map((conteneur) => {
                    const cStatus = conteneurStatusConfig[conteneur.status];
                    return (
                      <TableRow
                        key={conteneur.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/conteneurs/${conteneur.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Container className="h-4 w-4 text-muted-foreground" />
                            {conteneur.numero}
                          </div>
                        </TableCell>
                        <TableCell>{typeLabels[conteneur.type]}</TableCell>
                        <TableCell>
                          {conteneur.dateDepart
                            ? new Date(conteneur.dateDepart).toLocaleDateString('fr-FR')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center">{conteneur.vehiculesCount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cStatus.className}>
                            {cStatus.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {dossier.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{dossier.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
