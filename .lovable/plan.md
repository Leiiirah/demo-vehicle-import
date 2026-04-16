

## Problem

The "Taux de change (moyen pondéré)" on the Vehicle Detail page currently computes the weighted average from **dossier-level supplier payments** (`/api/payments/dossier/:id/stats`). This is incorrect — it should use the **vehicle's own payments** from the `vehicle_payments` table, which store per-vehicle `amountUSD` and `exchangeRate` values entered during vehicle creation (the "Versements" step).

Since the dossier may have only 1 or 2 payments with different amounts, the weighted average ends up being dominated by (or equal to) the last payment's rate — which is exactly what the user is observing.

## Plan

### 1. Fetch vehicle payments in VehicleDetail.tsx
- Import and call `useVehiclePayments(id)` to get the vehicle's own payments from the `vehicle_payments` table.

### 2. Recalculate `tauxChangeFinal` from vehicle payments
- Replace the current calculation (based on dossier payments) with a weighted average from vehicle payments:
  ```
  Σ(amountUSD × exchangeRate) / Σ(amountUSD)
  ```
- Keep `Math.round()` per existing rounding rules.

### 3. Update DossierAnalytics.tsx similarly
- The same incorrect pattern exists in `DossierAnalytics.tsx` for computing per-vehicle theoretical rates. This will also be corrected to use vehicle-level payments when computing profit for sold vehicles.

### Files to modify
- `src/pages/VehicleDetail.tsx` — switch from dossier payments to vehicle payments for rate calculation
- `src/components/dossiers/DossierAnalytics.tsx` — use vehicle-level payment rates for profit calculation

