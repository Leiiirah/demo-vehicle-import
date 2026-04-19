

## Problem

The summary correctly aggregates charges (manual + vehicle charges + transit/fees payments + retraits = `totalCharges`), but in the **/caisse table** these rows are confusing or hidden:

| Source | `_source` | `type` | Badge shown | Visible? |
|---|---|---|---|---|
| Manual charge | `manual` | `charge` | red "Charge" | ✅ |
| Vehicle charge (frais véhicule) | `payment` | `charge` | **purple "Paiement"** | ✅ but mislabeled |
| Transit / Frais payment | `payment` | `charge` | **purple "Paiement"** | ✅ but mislabeled |
| Supplier payment | `dossier_payment` | `charge` | — | ❌ filtered out (correct, belongs to Banque) |
| Retrait | `manual` | `retrait` | orange "Retrait" | ✅ |

Two issues:
1. Vehicle charges and transit/fees rows show the **purple "Paiement"** badge (because `_source === 'payment'` triggers it in `getTypeBadge`) instead of the red "Charge" badge — even though they ARE charges in the summary.
2. The "Type" filter dropdown has no way to isolate them as charges — selecting "Charges" misses these rows because the badge logic short-circuits.

## Fix

**File: `src/pages/Caisse.tsx`** — adjust the badge + filter logic so that any row with `type === 'charge'` is treated as a charge regardless of `_source`:

1. **`getTypeBadge`** (line ~91): only return the purple "Paiement" badge when `_source === 'payment'` **AND** `type === 'entree'` (i.e. real client payments). For `type === 'charge'`, fall through to the red "Charge" badge — and append a sub-label ("Frais véhicule", "Transit", "Frais") derived from the description so the user can distinguish them visually.

2. **Type filter** (line ~76): the `'payment'` filter currently matches `_source === 'payment'` — keep that for `entree` (client payments) but also ensure the `'charge'` filter catches vehicle charges and transit/fees rows (it already does since they have `type === 'charge'`, so this works once the badge is fixed — the rows are already visible, just mislabeled).

3. **Optional clarity**: in the Type filter, rename "Paiements" → "Paiements clients" to remove ambiguity.

## Out of scope

- No backend changes — the ledger and summary logic is already correct.
- Supplier payments stay filtered out (they live in /banque).

