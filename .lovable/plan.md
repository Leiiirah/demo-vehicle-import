

## Fix: Payment Should Check Caisse Summary, Not Balance Table

### Problem
Payments check `caisse_balance` table (manually set, stale at 3,720,000 DZD) instead of the dynamic summary (102,480,000 DZD computed from entries).

### Solution
Change the payment service to use the **Solde Actuel** from the caisse summary (totalEntrees - totalCharges) as the source of truth for balance validation.

### Changes

**1. `backend/src/modules/payments/payments.service.ts`**
- Replace `caisseBalanceService.getBalance()` check with `caisseService.getSummary()` to get `soldeActuel`
- Compare `deductAmount` against `soldeActuel` instead of the static balance
- Remove `caisseBalanceService.deduct()` call after payment — instead, the payment already creates a caisse entry (charge) which automatically reduces `soldeActuel`
- Inject `CaisseService` instead of (or alongside) `CaisseBalanceService`

**2. `backend/src/modules/payments/payments.module.ts`**
- Import `CaisseModule` or provide `CaisseService` so it can be injected

**3. Ensure payment creates a caisse entry**
- After saving the payment, create a `CaisseEntry` of type `CHARGE` with the DZD amount so the summary automatically reflects the deduction
- On payment deletion, create an `ENTREE` to reverse it

This way the single source of truth is the caisse entries table, and the stale `caisse_balance` table is no longer involved in payment validation.

