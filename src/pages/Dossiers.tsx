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
import { Plus, Search, FolderOpen, Building2, Container, Car } from 'lucide-react';
import { AddDossierDialog } from '@/components/dossiers/AddDossierDialog';

// Mock data pour les dossiers
const mockDossiers = [
  {
    id: 'DOS001',
    reference: 'DOS-2026-001',
    supplierId: 'SUP001',
    supplierName: 'Guangzhou Auto Export',
    dateCreation: '2026-01-15',
    status: 'en_cours' as const,
    totalVehicles: 4,
    totalConteneurs: 2,
  },
  {
    id: 'DOS002',
    reference: 'DOS-2026-002',
    supplierId: 'SUP002',
    supplierName: 'Shanghai Motors Ltd',
    dateCreation: '2026-01-20',
    status: 'termine' as const,
    totalVehicles: 6,
    totalConteneurs: 3,
  },
  {
    id: 'DOS003',
    reference: 'DOS-2026-003',
    supplierId: 'SUP003',
    supplierName: 'Shenzhen Auto Hub',
    dateCreation: '2026-02-01',
    status: 'en_cours' as const,
    totalVehicles: 2,
    totalConteneurs: 1,
  },
];

const statusConfig = {
  en_cours: { label: 'En cours', className: 'bg-primary/10 text-primary border-primary/30' },
  termine: { label: 'Terminé', className: 'bg-success/10 text-success border-success/30' },
  annule: { label: 'Annulé', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export default function DossiersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dossiers] = useState(mockDossiers);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredDossiers = dossiers.filter(
    (dossier) =>
      dossier.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dossiers</h1>
            <p className="text-muted-foreground">Gérez vos commandes d'importation</p>
          </div>
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouveau Dossier
          </Button>
        </div>

        <AddDossierDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dossiers</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dossiers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conteneurs</CardTitle>
              <Container className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dossiers.reduce((acc, d) => acc + d.totalConteneurs, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dossiers.reduce((acc, d) => acc + d.totalVehicles, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Dossiers</CardTitle>
            <CardDescription>Cliquez sur un dossier pour voir ses détails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par référence ou fournisseur..."
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
                    <TableHead>Référence</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Date Création</TableHead>
                    <TableHead className="text-center">Conteneurs</TableHead>
                    <TableHead className="text-center">Véhicules</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDossiers.map((dossier) => {
                    const status = statusConfig[dossier.status];
                    return (
                      <TableRow
                        key={dossier.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/dossiers/${dossier.id}`)}
                      >
                        <TableCell className="font-medium">{dossier.reference}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {dossier.supplierName}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-center">{dossier.totalConteneurs}</TableCell>
                        <TableCell className="text-center">{dossier.totalVehicles}</TableCell>
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
