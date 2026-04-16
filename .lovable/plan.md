

## Problem

Two issues:

1. **Taux de change (moyen pondéré)** on VehicleDetail page uses `vehiclePayments` (from `VehiclePayment` table — per-vehicle payments) instead of the **dossier-level supplier payments** (from `Payment` table). The VehiclePayment entries don't represent supplier installments — they're a different concept. The weighted average exchange rate should come from `dossierPaymentStats.payments`, which contains the actual supplier payments with exchange rates.

2. **"Broke everything"** — likely a downstream effect: since the rate is wrong, all cost calculations (prix de revient, totalCost) display incorrectly.

## Fix

### File: `src/pages/VehicleDetail.tsx`

**Change the `tauxChangeFinal` calculation (lines 86-93)** to use `dossierPaymentStats.payments` instead of `vehiclePayments`:

```typescript
const tauxChangeFinal = (() => {
  const dossierPayments = dossierPaymentStats?.payments || [];
  if (!dossierPayments.length) return 0;
  const totalAmountUSD = dossierPayments.reduce(
    (sum: number, p: any) => sum + Number(p.amount), 0
  );
  if (totalAmountUSD === 0) return 0;
  const weightedRate = dossierPayments.reduce(
    (sum: number, p: any) => sum + Number(p.amount) * Number(p.exchangeRate), 0
  );
  return Math.round(weightedRate / totalAmountUSD);
})();
```

This uses the **dossier supplier payments** (which have `amount` and `exchangeRate` fields) to compute the true weighted average, matching what the backend does in `recalculateVehicleCosts`.

### File: `src/components/dossiers/DossierAnalytics.tsx`

**Same fix for profit calculation (lines 83-96)** — replace `vehiclePayments` usage with dossier payments:

```typescript
// Use dossier-level payments for weighted average rate
const dossierPayments = dossierPaymentStats?.payments || [];
const totalPaidUSD = dossierPayments.reduce((s, p) => s + Number(p.amount), 0);
const weightedRate = totalPaidUSD > 0
  ? Math.round(dossierPayments.reduce((s, p) => s + Number(p.amount) * Number(p.exchangeRate), 0) / totalPaidUSD)
  : 0;
```

Then use this single `weightedRate` for all sold vehicle cost calculations instead of per-vehicle payment lookups.

### Summary
- **1 root cause**: wrong data source for exchange rate (vehicle payments vs dossier payments)
- **2 files** to update
- No backend changes needed — the backend `recalculateVehicleCosts` already uses dossier payments correctly

