# Plan: Remove Default Exchange Rate and Hide DZD Costs Until Payment

## Problem

The system currently defaults `theoreticalRate` to 134.5 everywhere (vehicle entity, creation logic, payment forms). DZD-based costs (totalCost, prix de revient, benefice) are calculated and displayed even before any payment is made. The user's rule: **no exchange rate or DZD costs should exist or be visible until the admin enters a real rate through an actual payment**.

## Changes

### 1. Backend: Remove default exchange rate from vehicle entity and creation logic

`**backend/src/entities/vehicle.entity.ts**`

- Change `theoreticalRate` default from `134.5` to `null` (nullable)

`**backend/src/modules/vehicles/vehicles.service.ts**`

- On vehicle creation: set `theoreticalRate` to `null` instead of `134.5`, and set `totalCost` to `0` (no DZD calculation without a rate)
- On vehicle update: only recalculate `totalCost` if `theoreticalRate > 0`; otherwise keep `totalCost = 0`
- In `recalculateContainerTransportCosts`: only recalculate totalCost for vehicles that have `theoreticalRate > 0`

`**backend/src/modules/dashboard/dashboard.service.ts**`

- Remove `134.5` fallback for avgRate in Zakat calculation; use 0 if no vehicles have rates

**New migration** to remove the default 134.5 from the `theoreticalRate` column:

- `ALTER TABLE vehicles ALTER COLUMN "theoreticalRate" SET DEFAULT NULL`

### 2. Frontend: Remove default exchange rate from payment form

`**src/components/payments/AddPaymentDialog.tsx**`

- Remove `exchangeRate: 134.5` default; leave field empty so admin must enter it

### 3. Frontend: Hide DZD cost columns/cards when no rate exists

`**src/pages/Conteneurs.tsx**`

- The "Coût total DZD" column: show `-` when vehicles have no theoreticalRate (totalCost = 0)

`**src/pages/Sales.tsx**`

- "Coût total" KPI and profit calculations: only include vehicles where `totalCost > 0`

`**src/pages/ClientDetail.tsx**` and `**src/pages/ClientSales.tsx**`

- Profit/cost calculations: only use vehicles with `totalCost > 0`

`**src/pages/Reports.tsx**`

- Same: filter on `totalCost > 0` for profit calculations

`**src/components/vehicles/EditVehicleDialog.tsx**`

-  the "Coût total (DZD)" field   keep it  autocalculated and editable if the admin wants

`**src/pages/VehicleDetail.tsx**`

- Already correctly hidden behind `vehicle.status === 'sold'` and `tauxChangeReel > 0` checks -- no change needed

`**src/components/dossiers/DossierAnalytics.tsx**`

- Already gated behind `isDossierSolde` and `theoreticalRate > 0` -- no change needed

### 4. Frontend: Remove exchange rate input from AddVehicleDialog versements

`**src/components/vehicles/AddVehicleDialog.tsx**`

- The vehicle creation dialog has "versements" with exchange rate fields. These vehicle-level payments already go through the vehicle-payment system. The exchange rate field here is fine since it's explicitly entered by the admin per payment -- no change needed.

## Summary

- Default 134.5 removed from entity, service, migration, and payment form
- DZD costs (totalCost, prix de revient, benefice) only calculated when a real rate is provided
- All pages showing DZD costs gracefully handle missing rates by showing `-` or `0`