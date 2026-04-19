
Regroup the client PDF export by **sale** instead of by vehicle, so the "Payé" / "Reste" amounts reflect real per-sale payments rather than fictional proportional allocations.

## Changes

**1. `src/lib/exportClientTransactionsPDF.ts`** — extend the legacy "all transactions" branch to accept grouped sales:

- New input shape: `sales: Array<{ date, totalSellingPrice, amountPaid, debt, carriedDebt, vehicles: VehicleTransaction[] }>` (alongside the existing single-sale path which stays untouched).
- For each sale, render a block:
  - Sale header line: `Vente du JJ/MM/AAAA` + sale totals on the right.
  - Indented vehicle rows underneath: `Désignation | VIN | Prix de vente` (no Payé/Reste/Statut per vehicle).
  - Sale footer line: `Total vente | Payé | Reste | Statut` (status derived from sale-level debt: Soldé / Versement / En attente).
- Page-break safety: if a sale block won't fit, push to next page; long sales paginate normally.
- Global summary at the end: total ventes count, total facturé, total payé, total reste.

**2. `src/pages/ClientDetail.tsx`** — replace the proportional allocation (lines ~222-244) in the export handler:

- Build the `sales` array directly from the client's `sales` relation (already loaded with `vehicles` per the backend `findOne`).
- Drop the per-vehicle `vehiclePaid = (price/total)*salePaid` math entirely.
- Pass `sales` to the new PDF function path.
- Keep the existing single-sale invoice path (used by "Facture" buttons) unchanged.

## Out of scope
- No backend changes (sale data already exposed via `clients/:id`).
- The single-sale invoice PDF (`saleInfo` branch) stays as-is.
- On-screen vehicle table in `ClientDetail` is not modified — only the PDF export.
