import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Search, Folder, User, Car, Loader2 } from 'lucide-react';

interface SearchResult {
  dossiers: Array<{
    id: string;
    type: 'dossier';
    reference: string;
    supplier?: string;
    status: string;
  }>;
  clients: Array<{
    id: string;
    type: 'client';
    name: string;
    telephone: string;
  }>;
  vehicles: Array<{
    id: string;
    type: 'vehicle';
    vin: string;
    brand: string;
    model: string;
    dossierRef?: string;
  }>;
}

const statusConfig = {
  en_cours: { label: 'En cours', className: 'bg-primary/10 text-primary border-primary/30' },
  solde: { label: 'Soldé', className: 'bg-success/10 text-success border-success/30' },
  annule: { label: 'Annulé', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  const { data: results, isLoading } = useQuery<SearchResult>({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) {
        return { dossiers: [], clients: [], vehicles: [] };
      }
      return api.request<SearchResult>(`/api/search?q=${encodeURIComponent(searchTerm)}`);
    },
    enabled: searchTerm.length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
    setSearchParams({ q: query });
  };

  const totalResults =
    (results?.dossiers?.length || 0) +
    (results?.clients?.length || 0) +
    (results?.vehicles?.length || 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recherche</h1>
          <p className="text-muted-foreground">
            Recherchez dans les dossiers, clients et véhicules
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par référence dossier, nom client ou VIN..."
                  className="pl-10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={query.length < 2}>
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : searchTerm.length >= 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>Résultats</CardTitle>
              <CardDescription>
                {totalResults} résultat{totalResults !== 1 ? 's' : ''} pour "{searchTerm}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">
                    Tous ({totalResults})
                  </TabsTrigger>
                  <TabsTrigger value="dossiers">
                    Dossiers ({results?.dossiers?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="clients">
                    Clients ({results?.clients?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="vehicles">
                    Véhicules ({results?.vehicles?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  {/* Dossiers */}
                  {results?.dossiers && results.dossiers.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        Dossiers
                      </h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Référence</TableHead>
                              <TableHead>Fournisseur</TableHead>
                              <TableHead>Statut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.dossiers.map((d) => {
                              const status = statusConfig[d.status as keyof typeof statusConfig];
                              return (
                                <TableRow
                                  key={d.id}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => navigate(`/dossiers/${d.id}`)}
                                >
                                  <TableCell className="font-medium">{d.reference}</TableCell>
                                  <TableCell>{d.supplier || '-'}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={status?.className}>
                                      {status?.label || d.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Clients */}
                  {results?.clients && results.clients.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Clients
                      </h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nom</TableHead>
                              <TableHead>Téléphone</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.clients.map((c) => (
                              <TableRow
                                key={c.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => navigate(`/clients/${c.id}`)}
                              >
                                <TableCell className="font-medium">{c.name}</TableCell>
                                <TableCell>{c.telephone}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Vehicles */}
                  {results?.vehicles && results.vehicles.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Véhicules
                      </h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>VIN</TableHead>
                              <TableHead>Véhicule</TableHead>
                              <TableHead>Dossier</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.vehicles.map((v) => (
                              <TableRow
                                key={v.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => navigate(`/vehicles/${v.id}`)}
                              >
                                <TableCell className="font-mono text-sm">{v.vin}</TableCell>
                                <TableCell className="font-medium">
                                  {v.brand} {v.model}
                                </TableCell>
                                <TableCell>{v.dossierRef || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {totalResults === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun résultat trouvé pour "{searchTerm}"
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="dossiers">
                  {results?.dossiers && results.dossiers.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Référence</TableHead>
                            <TableHead>Fournisseur</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.dossiers.map((d) => {
                            const status = statusConfig[d.status as keyof typeof statusConfig];
                            return (
                              <TableRow
                                key={d.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => navigate(`/dossiers/${d.id}`)}
                              >
                                <TableCell className="font-medium">{d.reference}</TableCell>
                                <TableCell>{d.supplier || '-'}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={status?.className}>
                                    {status?.label || d.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun dossier trouvé
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="clients">
                  {results?.clients && results.clients.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Téléphone</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.clients.map((c) => (
                            <TableRow
                              key={c.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => navigate(`/clients/${c.id}`)}
                            >
                              <TableCell className="font-medium">{c.name}</TableCell>
                              <TableCell>{c.telephone}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun client trouvé
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="vehicles">
                  {results?.vehicles && results.vehicles.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>VIN</TableHead>
                            <TableHead>Véhicule</TableHead>
                            <TableHead>Dossier</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.vehicles.map((v) => (
                            <TableRow
                              key={v.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => navigate(`/vehicles/${v.id}`)}
                            >
                              <TableCell className="font-mono text-sm">{v.vin}</TableCell>
                              <TableCell className="font-medium">
                                {v.brand} {v.model}
                              </TableCell>
                              <TableCell>{v.dossierRef || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun véhicule trouvé
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Entrez au moins 2 caractères pour lancer une recherche</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
