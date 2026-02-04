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
import { ArrowLeft, Container, FolderOpen, Car, Calendar, Edit, Plus, Ship, Anchor } from 'lucide-react';
import { AffecterVehiculeDialog } from '@/components/conteneurs/AffecterVehiculeDialog';

// Mock data
const mockConteneur = {
  id: 'CONT001',
  numero: 'MSKU1234567',
  dossierId: 'DOS001',
  dossierRef: 'DOS-2026-001',
  type: '40ft' as const,
  status: 'en_transit' as const,
  dateDepart: '2026-01-20',
  dateArrivee: undefined,
  vehiculesCount: 2,
  compagnieMaritime: 'Maersk Line',
  portDepart: 'Shanghai, Chine',
  portArrivee: 'Alger, Algérie',
};

const mockVehicules = [
  {
    id: 'VH001',
    brand: 'Toyota',
    model: 'Land Cruiser',
    year: 2024,
    vin: 'JTMWF4DV4P5012345',
    status: 'in_transit' as const,
  },
  {
    id: 'VH005',
    brand: 'Porsche',
    model: 'Cayenne',
    year: 2024,
    vin: 'WP1AB2A53PLB12345',
    status: 'in_transit' as const,
  },
];

const statusConfig = {
  en_chargement: { label: 'En chargement', className: 'bg-warning/10 text-warning border-warning/30' },
  en_transit: { label: 'En transit', className: 'bg-primary/10 text-primary border-primary/30' },
  arrive: { label: 'Arrivé', className: 'bg-success/10 text-success border-success/30' },
  dedouane: { label: 'Dédouané', className: 'bg-muted text-muted-foreground border-muted-foreground/30' },
};

const vehicleStatusConfig = {
  ordered: { label: 'Commandé', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  in_transit: { label: 'En transit', className: 'bg-primary/10 text-primary border-primary/30' },
  arrived: { label: 'Arrivé', className: 'bg-success/10 text-success border-success/30' },
  sold: { label: 'Vendu', className: 'bg-muted text-muted-foreground border-muted-foreground/30' },
};

const typeLabels = {
  '20ft': '20 pieds',
  '40ft': '40 pieds',
  '40ft_hc': '40 pieds HC',
};

export default function ConteneurDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [affecterVehiculeOpen, setAffecterVehiculeOpen] = useState(false);
  const conteneur = mockConteneur;
  const vehicules = mockVehicules;
  const status = statusConfig[conteneur.status];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/conteneurs')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Container className="h-8 w-8 text-muted-foreground" />
              <h1 className="text-3xl font-bold tracking-tight">{conteneur.numero}</h1>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">Conteneur #{id}</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dossier</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{conteneur.dossierRef}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <button
                  className="hover:underline text-primary"
                  onClick={() => navigate(`/dossiers/${conteneur.dossierId}`)}
                >
                  Voir le dossier →
                </button>
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Type</CardTitle>
              <Container className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{typeLabels[conteneur.type]}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conteneur.vehiculesCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compagnie</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{conteneur.compagnieMaritime}</div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Trajet</CardTitle>
            <CardDescription>Suivi du transport maritime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-success/10 mx-auto mb-2">
                  <Ship className="h-6 w-6 text-success" />
                </div>
                <p className="font-medium">{conteneur.portDepart}</p>
                {conteneur.dateDepart && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(conteneur.dateDepart).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <div className="flex-1 mx-4">
                <div className="h-1 bg-muted rounded-full relative">
                  <div
                    className="absolute h-1 bg-primary rounded-full"
                    style={{ width: conteneur.status === 'en_transit' ? '50%' : conteneur.status === 'arrive' || conteneur.status === 'dedouane' ? '100%' : '0%' }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className={`flex items-center justify-center h-12 w-12 rounded-full mx-auto mb-2 ${conteneur.dateArrivee ? 'bg-success/10' : 'bg-muted'}`}>
                  <Anchor className={`h-6 w-6 ${conteneur.dateArrivee ? 'text-success' : 'text-muted-foreground'}`} />
                </div>
                <p className="font-medium">{conteneur.portArrivee}</p>
                {conteneur.dateArrivee ? (
                  <p className="text-sm text-muted-foreground">
                    {new Date(conteneur.dateArrivee).toLocaleDateString('fr-FR')}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">En attente</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Véhicules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Véhicules</CardTitle>
              <CardDescription>Véhicules chargés dans ce conteneur</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => setAffecterVehiculeOpen(true)}>
              <Plus className="h-4 w-4" />
              Affecter Véhicule
            </Button>
            <AffecterVehiculeDialog 
              open={affecterVehiculeOpen} 
              onOpenChange={setAffecterVehiculeOpen}
              conteneurId={conteneur.id}
              conteneurNumero={conteneur.numero}
            />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicules.map((vehicule) => {
                    const vStatus = vehicleStatusConfig[vehicule.status];
                    return (
                      <TableRow
                        key={vehicule.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/vehicles/${vehicule.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            {vehicule.brand} {vehicule.model}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{vehicule.vin}</TableCell>
                        <TableCell>{vehicule.year}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={vStatus.className}>
                            {vStatus.label}
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
      </div>
    </DashboardLayout>
  );
}
