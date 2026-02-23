import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Payment } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentStats {
  totalDue: number;
  totalPaid: number;
  totalPaidDZD: number;
  remaining: number;
  progress: number;
  payments: Payment[];
}

interface DossierPaymentLedgerProps {
  dossierId: string;
}

export function DossierPaymentLedger({ dossierId }: DossierPaymentLedgerProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: stats, isLoading, error } = useQuery<PaymentStats>({
    queryKey: ['payments', 'dossier', dossierId, 'stats'],
    queryFn: () => api.request<PaymentStats>(`/api/payments/dossier/${dossierId}/stats`),
    enabled: !!dossierId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updatePayment(id, { status } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', 'dossier', dossierId, 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['caisse'] });
      toast({ title: 'Statut du paiement mis à jour' });
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <AlertCircle className="h-5 w-5 mr-2" />
        Erreur lors du chargement des paiements
      </div>
    );
  }

  const isPaidInFull = stats.progress >= 100;

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">État des paiements fournisseur</span>
          </div>
          {isPaidInFull ? (
            <Badge className="bg-success/10 text-success border-success/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Soldé
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              En cours
            </Badge>
          )}
        </div>

        <Progress value={Math.min(stats.progress, 100)} className="h-3 mb-3" />

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Total dû</p>
            <p className="font-semibold">{formatCurrency(stats.totalDue, 'USD')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payé</p>
            <p className="font-semibold text-primary">{formatCurrency(stats.totalPaid, 'USD')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Reste</p>
            <p className={`font-semibold ${stats.remaining > 0 ? 'text-warning' : 'text-success'}`}>
              {formatCurrency(stats.remaining, 'USD')}
            </p>
          </div>
        </div>

        {stats.totalPaidDZD > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Équivalent DZD versé : <span className="font-medium">{formatCurrency(stats.totalPaidDZD, 'DZD')}</span>
            </p>
          </div>
        )}
      </div>

      {/* Payment History */}
      {stats.payments && stats.payments.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead className="text-right">Montant USD</TableHead>
                <TableHead className="text-right">Taux</TableHead>
                <TableHead className="text-right">Équiv. DZD</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.payments.map((payment) => {
                const dzdAmount = Number(payment.amount) * Number(payment.exchangeRate);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="font-medium">{payment.reference}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(Number(payment.amount), 'USD')}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {Number(payment.exchangeRate).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(dzdAmount, 'DZD')}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={payment.status}
                        onValueChange={(val) =>
                          updateStatusMutation.mutate({ id: payment.id, status: val })
                        }
                      >
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-warning" />
                              En attente
                            </span>
                          </SelectItem>
                          <SelectItem value="completed">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-success" />
                              Complété
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
