import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Container, FolderOpen, Ship, Anchor } from 'lucide-react';

// Mock data pour les conteneurs
const mockConteneurs = [
  {
    id: 'CONT001',
    numero: 'MSKU1234567',
    dossierId: 'DOS001',
    dossierRef: 'DOS-2026-001',
    type: '40ft' as const,
    status: 'en_transit' as const,
    dateDepart: '2026-01-20',
    dateArrivee: undefined,
    vehiculesCount: 2,
  },
  {
    id: 'CONT002',
    numero: 'TCLU7654321',
    dossierId: 'DOS001',
    dossierRef: 'DOS-2026-001',
    type: '40ft_hc' as const,
    status: 'en_chargement' as const,
    dateDepart: undefined,
    dateArrivee: undefined,
    vehiculesCount: 2,
  },
  {
    id: 'CONT003',
    numero: 'CMAU9876543',
    dossierId: 'DOS002',
    dossierRef: 'DOS-2026-002',
    type: '40ft' as const,
    status: 'arrive' as const,
    dateDepart: '2026-01-10',
    dateArrivee: '2026-01-28',
    vehiculesCount: 3,
  },
  {
    id: 'CONT004',
    numero: 'HLXU5432109',
    dossierId: 'DOS002',
    dossierRef: 'DOS-2026-002',
    type: '20ft' as const,
    status: 'dedouane' as const,
    dateDepart: '2026-01-08',
    dateArrivee: '2026-01-25',
    vehiculesCount: 1,
  },
  {
    id: 'CONT005',
    numero: 'OOLU1122334',
    dossierId: 'DOS003',
    dossierRef: 'DOS-2026-003',
    type: '40ft_hc' as const,
    status: 'en_chargement' as const,
    dateDepart: undefined,
    dateArrivee: undefined,
    vehiculesCount: 2,
  },
];

const statusConfig = {
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

export default function ConteneursPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [conteneurs] = useState(mockConteneurs);

  const filteredConteneurs = conteneurs.filter(
    (conteneur) =>
      conteneur.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conteneur.dossierRef.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enTransit = conteneurs.filter((c) => c.status === 'en_transit').length;
  const arrives = conteneurs.filter((c) => c.status === 'arrive' || c.status === 'dedouane').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conteneurs</h1>
            <p className="text-muted-foreground">Suivez vos conteneurs en temps réel</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Conteneur
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Container className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conteneurs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Transit</CardTitle>
              <Ship className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{enTransit}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Arrivés</CardTitle>
              <Anchor className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{arrives}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {conteneurs.reduce((acc, c) => acc + c.vehiculesCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Conteneurs</CardTitle>
            <CardDescription>Cliquez sur un conteneur pour voir ses détails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou dossier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Dossier</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Départ</TableHead>
                    <TableHead>Arrivée</TableHead>
                    <TableHead className="text-center">Véhicules</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConteneurs.map((conteneur) => {
                    const status = statusConfig[conteneur.status];
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
                        <TableCell>
                          <button
                            className="text-primary hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dossiers/${conteneur.dossierId}`);
                            }}
                          >
                            {conteneur.dossierRef}
                          </button>
                        </TableCell>
                        <TableCell>{typeLabels[conteneur.type]}</TableCell>
                        <TableCell>
                          {conteneur.dateDepart
                            ? new Date(conteneur.dateDepart).toLocaleDateString('fr-FR')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {conteneur.dateArrivee
                            ? new Date(conteneur.dateArrivee).toLocaleDateString('fr-FR')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center">{conteneur.vehiculesCount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.className}>
                            {status.label}
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
