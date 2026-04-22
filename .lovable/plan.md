

## Fix data mismatches in seed dataset

The audit revealed inconsistencies between stored values and the values that should derive from the documented business formulas. Goal: align stored fields with the formulas, without changing any logic, components, or routes.

### What gets fixed in `src/mocks/seedData.ts`

**1. Vehicle `transportCost` (15 vehicles)** — formula: `transportCost = container.coutTransport / vehicleCountInContainer`. Recompute and update `transportCost`, then recompute `totalCost = (purchasePrice + transportCost) * theoreticalRate + localFees + passeportCost` so the stored `totalCost` stays correct after the change.

| Vehicle | Container | New transport | New totalCost |
|---|---|---|---|
| veh-1 | con-1 (4200/2) | 2100 | 6 681 400 |
| veh-2 | con-1 (4200/2) | 2100 | 9 049 400 |
| veh-3 | con-2 (3800/2) | 1900 | 8 456 600 |
| veh-4 | con-3 (4500/2) | 2250 | 8 111 500 |
| veh-5 | con-3 (4500/2) | 2250 | 11 323 500 |
| veh-6 | con-4 (3700/1) | 3700 | 12 827 800 |
| veh-7 | con-5 (2400/2) | 1200 | 13 520 800 |
| veh-8 | con-5 (2400/2) | 1200 | 4 688 800 |
| veh-9 | con-6 (4300/2) | 2150 | 4 300 100 |
| veh-10 | con-6 (4300/2) | 2150 | 4 578 100 |
| veh-11 | con-7 (3600/2) | 1800 | 10 359 200 |
| veh-12 | con-7 (3600/2) | 1800 | 3 859 200 |
| veh-13 | con-8 (2300/2) | 1150 | 7 532 100 |
| veh-14 | con-8 (2300/2) | 1150 | 5 988 100 |
| veh-15 | con-2 (3800/2) | 1900 | 4 360 600 |

**2. Sale `totalCost` / `totalProfit` (5 sales)** — recompute from each sale's vehicles using the new vehicle `totalCost`:
- `sal-1` (veh-9): cost 4 300 100, profit 449 900
- `sal-2` (veh-10): cost 4 578 100, profit 471 900
- `sal-3` (veh-5): cost 11 323 500, profit 1 176 500
- `sal-4` (veh-2): cost 9 049 400, profit 750 600
- `sal-5` (veh-1): cost 6 681 400, profit 518 600

**3. Caisse `vente_auto` margins (`cai-3`, `cai-4`)** — `prixRevient` and `benefice` re-aligned to the new vehicle `totalCost`:
- `cai-3` (veh-10): prixRevient 4 578 100, benefice 471 900
- `cai-4` (veh-9): prixRevient 4 300 100, benefice 449 900

**4. Supplier metrics (5 suppliers)** — recompute from related vehicles + dossier payments:

| Supplier | vehiclesSupplied | totalPaid (USD) | remainingDebt (USD) |
|---|---|---|---|
| sup-1 | 4 | 150 000 | 54 300 |
| sup-2 | 3 | 145 000 | 85 300 |
| sup-3 | 2 | 70 000 | 61 600 |
| sup-4 | 2 | 62 600 | 0 |
| sup-5 | 4 | 50 000 | 152 000 |

(`creditBalance` and `rating` left untouched — they're not derivable from the dataset.)

**5. `seedCaisseBalance`** — change `8 200 000` → `31 905 000` (sum of 3 entrées + 2 ventes − 3 charges).

**6. Status coherence (`veh-13`, `veh-14`)** — both have a `clientId` + `passeportId` + `paymentStatus: 'versement'` but `status: 'ordered'`. Per the rule "a vehicle assigned to a client must be `sold`", flip to `status: 'sold'` and add a `soldDate: '2026-04-10'` so they appear correctly in the Stock/Sales filters. (Their containers stay `charge` — no cascade needed since the rule only requires the vehicle to be marked sold once a client is attached; sale aggregation isn't impacted because they aren't yet linked to a `Sale` record, matching the "partial sale" pattern already present elsewhere.)

   Alternative considered: drop the `clientId` to make them true "ordered" stock. Rejected because removing the assignment also wipes the existing `amountPaid` history and reduces sales coverage.

### Cache invalidation in `src/services/api.ts`

Bump `LS_KEY` from `vih_mock_db_v5` → `vih_mock_db_v6` so every browser session picks up the corrected seed on next load.

### Out of scope

- No component, hook, route, or type signature changes.
- `creditBalance` (suppliers) and `rating` are presentational seed values — kept as-is.
- `cai-3` / `cai-4` keep type `vente_auto`: it is a valid documented enum value used by the API itself when a sale is recorded, and these entries correctly mirror `sal-1` / `sal-2`.
- Coverage gaps flagged in the audit (no `vendu_bare`, no `annule` dossier, no `inactive` user, no `retrait` caisse) are NOT addressed here — adding them would expand the dataset rather than fix the existing mismatch. Can be done in a follow-up if desired.

### Verification after changes

After reload (forced by the LS key bump), sanity-check three pages:
- `/vehicles/veh-1` — totalCost shows 6 681 400 DZD.
- `/suppliers` — Total payé column sums to 477 600 USD; net dette to 353 200 USD.
- `/caisse` — header balance shows 31 905 000 DZD matching the entries below.

