

## Plan: Add "Payer" action to Client Detail page (`/clients/:id`)

### Goal
Add the same payment functionality from `/client-sales` to the client detail page. Each vehicle in a sale with a remaining balance gets a "Payer" button. The payment dialog offers Versement (Caisse) vs Virement (Banque), identical to the supplier payment workflow.

### Changes

**1. `src/pages/ClientDetail.tsx`**

- Import missing dependencies: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, `Label`, `FormattedNumberInput`, `Landmark`, `Loader2`, `ExternalLink`, `useUpdateVehicle`, `useCreateCaisseEntry`
- Add state variables: `versementDialogOpen`, `versementVehicle`, `versementAmount`, `versementMode`
- Add `handleVersementSubmit` function (same logic as ClientSales): updates vehicle `amountPaid`/`paymentStatus`, creates caisse entry with appropriate `paymentMethod`
- Modify the sales table in each sale card:
  - Add columns: "Montant payé", "Montant restant", "Action"
  - Add "Payer" button per vehicle row when `remaining > 0`
- Add the Versement Dialog (copy from ClientSales): payment mode toggle (Versement/Virement), amount input, vehicle summary

### Technical notes
- Reuses the same `useUpdateVehicle` and `useCreateCaisseEntry` hooks already used in ClientSales
- Payment method determines destination: `versement` → Caisse, `virement` → Banque
- Auto-marks vehicle as `soldé` when cumulative payments reach selling price

