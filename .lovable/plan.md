

## Enhanced Debt Display for Suppliers

### Current behavior
- `remainingDebt = Math.max(totalInvestment - totalPaid, 0)` -- always >= 0, clamped
- Displayed in red regardless of actual balance

### New behavior
- Remove the `Math.max(0, ...)` clamp -- allow negative values
- **Positive debt** (admin owes supplier): show as `-X USD` in **red** with "Vous devez" label
- **Negative debt / overpayment** (admin has credit with supplier): show as `+X USD` in **green** with "Crédit" label
- **Zero**: neutral display

### Changes

**1. Backend: `suppliers.service.ts`** (line ~39)
- Remove `Math.max` from `remainingDebt` calculation so it can be negative (negative = admin overpaid = has credit)

**2. Frontend: `SupplierDetail.tsx`**
- Remove `Math.max(0, ...)` from `filteredStats.remainingDebt` (line 121)
- Update the "Dette restante" KPI card (lines 277-289):
  - If `remainingDebt > 0`: red text, minus sign, label "Vous devez"
  - If `remainingDebt < 0`: green text, plus sign, label "Crédit fournisseur"
  - If `0`: neutral

**3. Frontend: `Suppliers.tsx`**
- Update the "Dette totale en cours" summary card (lines 123-128): split into net debt vs net credit display
- Update the table "Dette restante" column (lines 180-184):
  - Positive: red with `-` prefix
  - Negative: green with `+` prefix (show absolute value as credit)
  - Zero: neutral/muted

