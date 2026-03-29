import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, CarModel } from '@/services/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Pencil, Trash2, Car, Image, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function ModelsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<CarModel | null>(null);
  const [form, setForm] = useState({ brand: '', model: '', imageUrl: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: carModels = [], isLoading } = useQuery({
    queryKey: ['car-models'],
    queryFn: () => api.getCarModels(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { brand: string; model: string; imageUrl?: string }) =>
      api.createCarModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-models'] });
      toast.success('Modèle ajouté avec succès');
      closeDialog();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ brand: string; model: string; imageUrl?: string }> }) =>
      api.updateCarModel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-models'] });
      toast.success('Modèle mis à jour');
      closeDialog();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteCarModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-models'] });
      toast.success('Modèle supprimé');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    if (!search) return carModels;
    const q = search.toLowerCase();
    return carModels.filter(
      (m) => m.brand.toLowerCase().includes(q) || m.model.toLowerCase().includes(q)
    );
  }, [carModels, search]);

  // Group by brand
  const grouped = useMemo(() => {
    const map: Record<string, CarModel[]> = {};
    filtered.forEach((m) => {
      if (!map[m.brand]) map[m.brand] = [];
      map[m.brand].push(m);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const brands = useMemo(() => {
    const set = new Set(carModels.map((m) => m.brand));
    return Array.from(set).sort();
  }, [carModels]);

  function openAdd() {
    setEditingModel(null);
    setForm({ brand: '', model: '', imageUrl: '' });
    setDialogOpen(true);
  }

  function openEdit(m: CarModel) {
    setEditingModel(m);
    setForm({ brand: m.brand, model: m.model, imageUrl: m.imageUrl || '' });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingModel(null);
    setForm({ brand: '', model: '', imageUrl: '' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.brand.trim() || !form.model.trim()) {
      toast.error('Marque et modèle sont requis');
      return;
    }
    const data = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
    };
    if (editingModel) {
      updateMutation.mutate({ id: editingModel.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Modèles Véhicules</h1>
            <p className="text-muted-foreground">
              Base de données des marques et modèles — {carModels.length} entrée{carModels.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un modèle
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher marque ou modèle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Chargement...</div>
        ) : grouped.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Aucun modèle trouvé</p>
              <Button onClick={openAdd} variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Ajouter le premier modèle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {grouped.map(([brand, models]) => (
              <Card key={brand}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Car className="h-5 w-5 text-primary" />
                    {brand}
                    <Badge variant="secondary" className="ml-2">{models.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Image</TableHead>
                        <TableHead>Modèle</TableHead>
                        <TableHead className="text-right w-28">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {models.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            {m.imageUrl ? (
                              <img
                                src={m.imageUrl}
                                alt={`${m.brand} ${m.model}`}
                                className="h-10 w-14 object-cover rounded border border-border"
                              />
                            ) : (
                              <div className="h-10 w-14 rounded border border-border bg-muted flex items-center justify-center">
                                <Image className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{m.model}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(m)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm(`Supprimer ${m.brand} ${m.model} ?`))
                                    deleteMutation.mutate(m.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModel ? 'Modifier le modèle' : 'Ajouter un modèle'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marque *</Label>
              <Input
                id="brand"
                placeholder="Ex: Toyota"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                list="brand-suggestions"
              />
              <datalist id="brand-suggestions">
                {brands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modèle *</Label>
              <Input
                id="model"
                placeholder="Ex: Land Cruiser"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de l'image</Label>
              <Input
                id="imageUrl"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Aperçu"
                  className="h-20 w-28 object-cover rounded border border-border mt-2"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingModel ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
