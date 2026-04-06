
Goal

Make `/vehicles` show **Total (DZD)** as soon as the dossier has a real supplier payment/rate, instead of showing `-`.

What I found

- `src/pages/Vehicles.tsx` only shows the value when `Number(vehicle.totalCost) > 0`; otherwise it hardcodes `-`.
- That page already loads dossier payment stats and even defines `isVehiclePaid()`, but never uses it to compute/display a fallback amount.
- `src/pages/VehicleDetail.tsx` already knows how to calculate the weighted exchange rate from dossier payments, so the detail page and list page are using different logic.
- The backend recalculation in `backend/src/modules/payments/payments.service.ts` helps, but stale/older vehicles can still keep `totalCost = 0`, and the stored total is not fully aligned with `vehicle_charges`.

Implementation plan

1. Fix the `/vehicles` display logic
   - Update `src/pages/Vehicles.tsx` to use the dossier payment payload (`payments`), not only `progress`.
   - Build a per-dossier weighted rate map using the same formula as `VehicleDetail.tsx`:
     `sum(amount * exchangeRate) / sum(amount)`.
   - Compute a `displayTotalDzd` fallback for each row when stored `totalCost` is `0` but the dossier has a usable payment rate.
   - Use the same business formula the detail page expects:
     ````text
     (purchasePrice + transportCost) * weightedRate
     + localFees
     + passeportCost
     + totalChargesDivers
     ````
   - Render that computed amount instead of `-`.

2. Make backend totals consistent
   - Refactor the recalculation logic into one shared backend path so payments and vehicle-charge updates use the same formula.
   - Include `vehicle_charges` in the stored total, so `/vehicles`, `/vehicles/:id`, dossier analytics, and exports stay aligned.
   - Prefer counting only relevant supplier payments (completed ones) for progress/rate calculations.

3. Refresh data immediately after mutations
   - Invalidate `vehicles`, `vehicle`, and dossier payment stats queries after:
     - creating/updating/deleting dossier payments
     - creating/updating/deleting vehicle charges
   - This avoids needing a manual refresh before `/vehicles` updates.

4. Add regression coverage
   - Extend backend payment/vehicle tests so a dossier payment recalculates vehicle totals.
   - Verify an already-paid dossier with old `totalCost = 0` now shows a DZD total in `/vehicles`.
   - Verify adding/editing charges still changes the final total correctly.

Technical details

- Main files involved:
  - `src/pages/Vehicles.tsx`
  - `src/pages/VehicleDetail.tsx`
  - `src/components/payments/AddPaymentDialog.tsx`
  - `src/components/dossiers/DossierPaymentLedger.tsx`
  - `src/hooks/useApi.ts`
  - `backend/src/modules/payments/payments.service.ts`
  - `backend/src/modules/vehicles/vehicles.service.ts`
- No database schema change is needed.
- Best design: centralize the server-side “recalculate vehicle total” logic once, because both payment mutations and vehicle-charge mutations need it.
