import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollableDialogContent,
  ScrollableDialogBody,
  ScrollableDialogFooter,
} from '@/components/ui/scrollable-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

const paymentSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  currency: z.enum(['USD', 'DZD']),
  exchangeRate: z.number().min(0.01, 'Le taux de change est requis'),
  reference: z.string().min(1, 'La référence est requise'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedSupplierId?: string;
  preSelectedDossierId?: string;
}

export function AddPaymentDialog({ open, onOpenChange, preSelectedSupplierId, preSelectedDossierId }: AddPaymentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      currency: 'USD',
      exchangeRate: 134.5,
    },
  });

  const currency = watch('currency');

  const createPaymentMutation = useMutation({
    mutationFn: (data: { date: string; amount: number; currency: 'USD' | 'DZD'; exchangeRate: number; type: 'supplier_payment' | 'client_payment' | 'transport' | 'fees'; reference: string; status: 'completed' | 'pending'; supplierId?: string; dossierId?: string }) => api.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      toast({
        title: 'Paiement ajouté',
        description: 'Le paiement a été enregistré avec succès.',
      });
      reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || "Impossible d'ajouter le paiement.",
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      await createPaymentMutation.mutateAsync({
        date: data.date,
        amount: data.amount,
        currency: data.currency,
        exchangeRate: data.exchangeRate,
        type: data.type,
        reference: data.reference,
        status: data.status,
        supplierId: preSelectedSupplierId,
        dossierId: preSelectedDossierId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ScrollableDialogContent className="sm:max-w-[500px]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Nouveau Paiement</DialogTitle>
          <DialogDescription>
            Enregistrez un nouveau paiement pour ce dossier.
          </DialogDescription>
        </DialogHeader>

        <ScrollableDialogBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Référence *</Label>
                <Input
                  id="reference"
                  placeholder="REF-001"
                  {...register('reference')}
                />
                {errors.reference && (
                  <p className="text-sm text-destructive">{errors.reference.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant *</Label>
                <FormattedNumberInput
                  id="amount"
                  allowDecimals
                  placeholder="10 000"
                  value={watch('amount') || ''}
                  onValueChange={(v) => setValue('amount', v)}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select value={currency} onValueChange={(val) => setValue('currency', val as 'USD' | 'DZD')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="DZD">DZD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exchangeRate">Taux de change (USD/DZD)</Label>
                <FormattedNumberInput
                  id="exchangeRate"
                  allowDecimals
                  value={watch('exchangeRate') || ''}
                  onValueChange={(v) => setValue('exchangeRate', v)}
                />
                {errors.exchangeRate && (
                  <p className="text-sm text-destructive">{errors.exchangeRate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(val) => setValue('type', val as PaymentFormData['type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier_payment">Paiement fournisseur</SelectItem>
                    <SelectItem value="client_payment">Paiement client</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="fees">Frais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={status} onValueChange={(val) => setValue('status', val as 'completed' | 'pending')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Complété</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </ScrollableDialogBody>

        <ScrollableDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
}
