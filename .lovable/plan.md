

## Problem

On the `/vehicles` page, the **Total (DZD)** column shows `-` for vehicles whose dossier is fully paid. This happens because `totalCost` in the database stays at `0` — the backend never updates it when payments are made. The weighted average exchange rate (`tauxChangeFinal`) is only computed client-side on the vehicle detail page.

## Solution

Update the backend so that when a dossier payment is created, updated, or deleted, the vehicles in that dossier have their `theoreticalRate` and `totalCost` recalculated using the weighted average exchange rate from all dossier payments.

## Changes

### 1. `backend/src/modules/payments/payments.service.ts`

Add a new method `recalculateVehicleCosts(dossierId)` that:
- Fetches all payments for the dossier
- Computes the weighted average exchange rate: `sum(amount * exchangeRate) / sum(amount)`
- Fetches all vehicles in that dossier (via conteneur relation)
- Updates each vehicle's `theoreticalRate` and recalculates `totalCost` using the formula: `(purchasePrice + transportCost) * weightedRate + localFees + passeportCost`
- Saves all updated vehicles

Call this method after every `create`, `update`, and `remove` payment (alongside `autoUpdateDossierStatus`).

### 2. `src/pages/Vehicles.tsx` (minor safety)

No changes needed — the page already displays `vehicle.totalCost` from the API. Once the backend populates it correctly, it will show up automatically.

## Why this approach

- Keeps the source of truth in the database rather than duplicating client-side calculations
- All pages that read `totalCost` (vehicles list, dashboard, caisse, reports) automatically get correct values
- The existing `VehicleDetail.tsx` client-side calculation will match the stored value

