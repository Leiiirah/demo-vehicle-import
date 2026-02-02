import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { exchangeRate } from '@/data/mockData';
import {
  Calculator,
  Plus,
  Trash2,
  RefreshCw,
  DollarSign,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  amount: number;
  exchangeRate: number;
  description: string;
}

const CostCalculatorPage = () => {
  const [purchasePrice, setPurchasePrice] = useState<number>(45000);
  const [transportCost, setTransportCost] = useState<number>(2500);
  const [localFees, setLocalFees] = useState<number>(350000);
  const [payments, setPayments] = useState<Payment[]>([
    { id: '1', amount: 20000, exchangeRate: 134.50, description: 'Initial deposit' },
    { id: '2', amount: 25000, exchangeRate: 135.20, description: 'Final payment' },
  ]);

  const addPayment = () => {
    setPayments([
      ...payments,
      {
        id: Date.now().toString(),
        amount: 0,
        exchangeRate: exchangeRate.USD_DZD,
        description: '',
      },
    ]);
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  const updatePayment = (id: string, field: keyof Payment, value: number | string) => {
    setPayments(
      payments.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const calculations = useMemo(() => {
    // Calculate total paid using individual exchange rates
    const totalPaidDZD = payments.reduce(
      (sum, p) => sum + p.amount * p.exchangeRate,
      0
    );

    // Calculate total USD costs
    const totalUSDCosts = purchasePrice + transportCost;
    
    // Weighted average exchange rate
    const totalUSDPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const weightedAvgRate = totalUSDPayments > 0
      ? totalPaidDZD / totalUSDPayments
      : exchangeRate.USD_DZD;

    // Total cost in DZD
    const totalCostDZD = totalPaidDZD + localFees;

    // Remaining to pay (if payments don't cover full amount)
    const remainingUSD = totalUSDCosts - totalUSDPayments;
    const remainingDZD = remainingUSD * exchangeRate.USD_DZD;

    // Final cost including any remaining balance at current rate
    const finalCostDZD = totalCostDZD + (remainingUSD > 0 ? remainingDZD : 0);

    return {
      totalPaidDZD,
      totalUSDCosts,
      totalUSDPayments,
      weightedAvgRate,
      totalCostDZD,
      remainingUSD,
      remainingDZD,
      finalCostDZD,
    };
  }, [purchasePrice, transportCost, localFees, payments]);

  const formatCurrency = (amount: number, currency: 'USD' | 'DZD' = 'DZD') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount);
    }
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount) + ' DZD';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Dynamic Cost Calculator
          </h1>
          <p className="text-muted-foreground">
            Calculate accurate vehicle costs with multiple payments and exchange rates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Base Costs */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-info" />
                Base Costs (USD)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchasePrice" className="text-sm font-medium">
                    Purchase Price (USD)
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="transportCost" className="text-sm font-medium">
                    Transport Cost (USD)
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="transportCost"
                      type="number"
                      value={transportCost}
                      onChange={(e) => setTransportCost(Number(e.target.value))}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Local Fees */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Local Fees (DZD)
              </h2>
              <div>
                <Label htmlFor="localFees" className="text-sm font-medium">
                  Customs, Registration & Other Fees
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="localFees"
                    type="number"
                    value={localFees}
                    onChange={(e) => setLocalFees(Number(e.target.value))}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    DZD
                  </span>
                </div>
              </div>
            </div>

            {/* Payments */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    Payments with Exchange Rates
                  </h2>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Enter each payment separately with the exchange rate at the
                        time of payment for accurate cost calculation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button onClick={addPayment} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Payment
                </Button>
              </div>

              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="grid grid-cols-12 gap-3 items-end p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="col-span-12 md:col-span-4">
                      <Label className="text-xs text-muted-foreground">
                        Payment {index + 1} (USD)
                      </Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          value={payment.amount}
                          onChange={(e) =>
                            updatePayment(payment.id, 'amount', Number(e.target.value))
                          }
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="col-span-8 md:col-span-3">
                      <Label className="text-xs text-muted-foreground">
                        Exchange Rate
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={payment.exchangeRate}
                          onChange={(e) =>
                            updatePayment(
                              payment.id,
                              'exchangeRate',
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="col-span-8 md:col-span-4">
                      <Label className="text-xs text-muted-foreground">
                        Description
                      </Label>
                      <Input
                        type="text"
                        value={payment.description}
                        onChange={(e) =>
                          updatePayment(payment.id, 'description', e.target.value)
                        }
                        placeholder="e.g., Initial deposit"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePayment(payment.id)}
                        className="text-danger hover:text-danger hover:bg-danger-muted"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="col-span-12 text-right text-sm text-muted-foreground">
                      = {formatCurrency(payment.amount * payment.exchangeRate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="h-5 w-5 text-info" />
                <h2 className="text-lg font-semibold text-foreground">
                  Cost Summary
                </h2>
              </div>

              <div className="space-y-4">
                {/* USD Costs */}
                <div className="pb-4 border-b border-border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    USD Costs
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Purchase Price</span>
                      <span className="text-foreground font-medium">
                        {formatCurrency(purchasePrice, 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transport</span>
                      <span className="text-foreground font-medium">
                        {formatCurrency(transportCost, 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-2 border-t border-dashed border-border">
                      <span className="text-foreground">Total USD</span>
                      <span className="text-foreground">
                        {formatCurrency(calculations.totalUSDCosts, 'USD')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payments */}
                <div className="pb-4 border-b border-border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    Payments Made
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Paid (USD)</span>
                      <span className="text-foreground font-medium">
                        {formatCurrency(calculations.totalUSDPayments, 'USD')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Rate</span>
                      <span className="text-foreground font-medium">
                        {calculations.weightedAvgRate.toFixed(2)} DZD/USD
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total in DZD</span>
                      <span className="text-foreground font-medium">
                        {formatCurrency(calculations.totalPaidDZD)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remaining */}
                {calculations.remainingUSD > 0 && (
                  <div className="pb-4 border-b border-border">
                    <p className="text-xs uppercase tracking-wider text-warning mb-3">
                      Remaining Balance
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining USD</span>
                        <span className="text-warning font-medium">
                          {formatCurrency(calculations.remainingUSD, 'USD')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          @ Current Rate
                          <Tooltip>
                            <TooltipTrigger>
                              <RefreshCw className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{exchangeRate.USD_DZD} DZD/USD</p>
                            </TooltipContent>
                          </Tooltip>
                        </span>
                        <span className="text-warning font-medium">
                          {formatCurrency(calculations.remainingDZD)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Local Fees */}
                <div className="pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Local Fees</span>
                    <span className="text-foreground font-medium">
                      {formatCurrency(localFees)}
                    </span>
                  </div>
                </div>

                {/* Final Cost */}
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">
                      Final Cost
                    </span>
                    <span className="text-2xl font-bold text-info">
                      {formatCurrency(calculations.finalCostDZD)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    ≈ {formatCurrency(calculations.finalCostDZD / exchangeRate.USD_DZD, 'USD')}
                  </p>
                </div>
              </div>
            </div>

            {/* Transparency Note */}
            <div className="bg-info-muted rounded-xl p-4">
              <p className="text-sm text-info font-medium mb-1">
                Accurate Cost Tracking
              </p>
              <p className="text-xs text-muted-foreground">
                Each payment is calculated with its actual exchange rate at the time
                of transaction, ensuring precise cost tracking regardless of currency
                fluctuations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CostCalculatorPage;
