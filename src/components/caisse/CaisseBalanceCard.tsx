import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Landmark, Pencil, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCaisseBalance, useSetCaisseBalance } from '@/hooks/useCaisse';
import { useToast } from '@/hooks/use-toast';

export function CaisseBalanceCard() {
  const { data: balanceData, isLoading } = useCaisseBalance();
  const setBalanceMutation = useSetCaisseBalance();
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
        toast({ title: 'Solde de caisse mis à jour' });
        setOpen(false);
      },
      onError: (err: any) => {
        toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
      },
    });
  };

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Solde Caisse (Disponible)</CardTitle>
        <div className="flex items-center gap-1">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleOpen}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Modifier le solde de caisse</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Montant disponible (DZD)
                </label>
                <Input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="0"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Ce montant sera automatiquement déduit lors des paiements fournisseurs et véhicules.
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
          <Landmark className="h-4 w-4 text-amber-600" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <div className={`text-2xl font-bold ${(balanceData?.balance ?? 0) >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
              {formatCurrency(balanceData?.balance ?? 0)}
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
