import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ZakatRecord } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { Heart, Pencil, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ZakatPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editRecord, setEditRecord] = useState<ZakatRecord | null>(null);
  const [editPaid, setEditPaid] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['zakat-records'],
    queryFn: () => api.getZakatRecords(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amountPaid?: number; notes?: string } }) =>
      api.updateZakatRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zakat-records'] });
      setEditOpen(false);
      toast({ title: 'Enregistrement mis à jour' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteZakatRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zakat-records'] });
      setDeleteId(null);
      toast({ title: 'Enregistrement supprimé' });
    },
  });

  const handleEdit = (record: ZakatRecord) => {
    setEditRecord(record);
    setEditPaid(String(record.amountPaid || 0));
    setEditNotes(record.notes || '');
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editRecord) return;
    updateMutation.mutate({
      id: editRecord.id,
      data: { amountPaid: parseFloat(editPaid) || 0, notes: editNotes || undefined },
    });
  };

  const totalZakat = records.reduce((sum, r) => sum + Number(r.zakatAmount), 0);
  const totalPaid = records.reduce((sum, r) => sum + Number(r.amountPaid), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-6 w-6 text-success" />
            Historique Zakat (زكاة)
          </h1>
          <p className="text-muted-foreground">
            Suivi annuel de la Zakat sur vos actifs commerciaux
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-success">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Zakat dû (toutes années)</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalZakat)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-info">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total payé</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalPaid)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Reste à payer</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalZakat - totalPaid)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Records table */}
        <Card>
          <CardHeader>
            <CardTitle>Enregistrements par année</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : records.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun enregistrement Zakat. Enregistrez votre première Zakat depuis le tableau de bord.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Année</TableHead>
                      <TableHead className="text-right">Actifs</TableHead>
                      <TableHead className="text-right">Dettes</TableHead>
                      <TableHead className="text-right">Assiette</TableHead>
                      <TableHead className="text-right">Zakat dû</TableHead>
                      <TableHead className="text-right">Payé</TableHead>
                      <TableHead className="text-right">Reste</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => {
                      const remaining = Number(record.zakatAmount) - Number(record.amountPaid);
                      const isPaid = remaining <= 0;
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-semibold">{record.year}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.assetsTotal)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.debtsTotal)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.zakatBase)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(record.zakatAmount)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.amountPaid)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Math.max(0, remaining))}</TableCell>
                          <TableCell>
                            <Badge variant={isPaid ? 'default' : 'destructive'}>
                              {isPaid ? 'Payé' : 'En cours'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {record.notes || '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => setDeleteId(record.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier Zakat {editRecord?.year}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Montant payé (DZD)</Label>
              <Input
                type="number"
                value={editPaid}
                onChange={(e) => setEditPaid(e.target.value)}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notes optionnelles..."
              />
            </div>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="w-full">
              {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Voulez-vous vraiment supprimer cet enregistrement Zakat ?</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
