import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Landmark, Pencil, Loader2, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useBanqueBalance, useSetBanqueBalance } from '@/hooks/useBanque';
import { useToast } from '@/hooks/use-toast';

export function BanqueBalanceCard() {
  const { data: balanceData, isLoading } = useBanqueBalance();
  const setBalanceMutation = useSetBanqueBalance();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleOpen = () => {
    setInputValue(String(balanceData?.balance ?? 0));
    setOpen(true);
  };

  const handleSave = () => {
    const val = Number(inputValue);
    if (isNaN(val)) {
      toast({ title: 'Montant invalide', variant: 'destructive' });
      return;
    }
    setBalanceMutation.mutate(val, {
      onSuccess: () => {
        toast({ title: 'Solde de banque mis à jour' });
        setOpen(false);
      },
      onError: (err: any) => {
        toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
      },
    });
  };

  const handleReset = () => {
    setBalanceMutation.mutate(0, {
      onSuccess: () => toast({ title: 'Solde de banque remis à zéro' }),
      onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
    });
  };

  const balance = balanceData?.balance ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Solde Banque (Disponible)</CardTitle>
        <div className="flex items-center gap-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remettre le solde banque à zéro ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Le solde de banque disponible sera remis à 0 DZD. Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Remettre à zéro
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleOpen}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Modifier le solde de banque</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Montant disponible (DZD)
                </label>
                <FormattedNumberInput
                  value={inputValue}
                  onValueChange={(v) => setInputValue(String(v))}
                  placeholder="0"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Ce montant sera automatiquement déduit lors des paiements fournisseurs (virement) et bloqué si insuffisant.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={setBalanceMutation.isPending}>
                  {setBalanceMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Landmark className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </div>
            {balanceData?.updatedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Mis à jour le {new Date(balanceData.updatedAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
