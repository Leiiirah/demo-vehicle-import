## Problem

Old vehicles in the database have stale `totalCost` values (e.g., calculated with rate 134.5 instead of the correct weighted average 253.00). The backend recalculation logic only runs when a payment is created/updated/deleted -- it never retroactively fixes existing data.

The vehicle detail page shows the correct value because it calculates client-side from dossier payments, but the `/vehicles` list reads the stored `totalCost` which is wrong for old records.

## Solution

Two-part fix:

### 1. Add a "recalculate all" endpoint (backend)

Add a new endpoint `POST /api/payments/recalculate-all-costs` in `payments.controller.ts` that:

- Fetches all dossiers that have at least one payment
- Calls the existing `recalculateVehicleCosts(dossierId)` for each one
- This fixes all stale vehicle totals in one shot

Make `recalculateVehicleCosts` public so the controller can call it.

**File: `backend/src/modules/payments/payments.controller.ts**` -- Add new POST endpoint  
**File: `backend/src/modules/payments/payments.service.ts**` -- Make `recalculateVehicleCosts` public, add `recalculateAllDossierCosts()` method that loops through all dossiers with payments

### 2. Auto-trigger recalculation on app startup or via admin action (frontend)

Add a button in the Settings page or call the recalculate endpoint once from the Vehicles page on mount to fix stale data. A simple approach: add a "Recalculer les coûts" button on the `/vehicles` page that calls the endpoint.  


**File:** `src/pages/Vehicles.tsx` -- Add a small admin button to trigger recalculation dont add a button make it automatique 

### Files to change

1. `**backend/src/modules/payments/payments.service.ts**` -- Make `recalculateVehicleCosts` public, add `recalculateAllDossierCosts()` that fetches distinct dossier IDs from payments table and loops recalculation
2. `**backend/src/modules/payments/payments.controller.ts**` -- Add `POST /payments/recalculate-all-costs` endpoint
3. `**src/pages/Vehicles.tsx**` -- Add a "Recalculer les coûts" button that calls the new endpoint and invalidates the vehicles query