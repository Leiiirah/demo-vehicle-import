
Goal: Fix the “Nouveau Conteneur” modal so its long form always scrolls (inputs never get “stuck”/hidden), and apply the same robust, responsive scrolling pattern to all creation/edit dialogs.

Context / what’s happening
- The “Nouveau Conteneur” dialog already uses a flex column layout + Radix ScrollArea.
- Despite min-h-0 tweaks, the screenshot shows content being clipped (the “Suivi du transport” section starts but its fields are unreachable) and the scroll gesture does nothing.
- This strongly suggests the scroll container isn’t actually becoming the element that scrolls in real browsers (a known pain point when combining fixed-position dialogs, flex children, and Radix ScrollArea viewport sizing).

Decision (to make it robust everywhere)
- Stop relying on Radix ScrollArea for dialog-body scrolling.
- Use a plain, native scrolling div for the dialog body:
  - It is the most reliable across trackpads, mouse wheels, Windows, macOS, and mobile Safari.
  - Radix Select/Popover content is portaled, so it won’t be clipped by an overflow container.

Implementation approach
A) Create a reusable “Scrollable Dialog” scaffold (so all forms stay consistent)
1) Add a small reusable component (example name):
   - src/components/ui/scrollable-dialog.tsx (or src/components/layout/ScrollableDialogLayout.tsx)
2) It will standardize:
   - DialogContent: fixed max height + flex column + overflow hidden
   - Header: fixed (non-scrolling) area
   - Body: the only scrolling region (overflow-y-auto)
   - Footer: fixed action bar (always visible)

Recommended class strategy (core of the fix)
- DialogContent:
  - max-h-[90dvh] (use dvh to behave better on mobile address bars)
  - w-full / max-w-* as before
  - flex flex-col
  - min-h-0
  - overflow-hidden
  - p-0
  - gap-0 (avoid inherited grid gap from base dialog styles)
- Body (scroll region):
  - flex-1 min-h-0
  - overflow-y-auto overscroll-contain
  - px-6 pb-4
  - [-webkit-overflow-scrolling:touch] (important for iOS)
  - optional: scrollbar-thin utility (you already have it in src/index.css)
- Footer:
  - shrink-0
  - border-t bg-background
  - px-6 py-4

B) Refactor “Nouveau Conteneur” dialog first (the reported bug)
1) Update src/components/conteneurs/AddConteneurDialog.tsx:
   - Replace <ScrollArea ...> with a simple <div> body scroller using the pattern above.
   - Ensure the padding currently inside the ScrollArea content moves to the body scroller (to keep visual spacing identical).
2) Confirm that:
   - The “Suivi du transport” date fields are reachable via scroll.
   - The footer buttons remain visible at all times.

C) Apply the same pattern to all other dialogs (so this doesn’t reappear elsewhere)
Update every dialog that currently uses ScrollArea for its form body (or has inconsistent overflow):
- src/components/dossiers/AddDossierDialog.tsx
- src/components/dossiers/EditDossierDialog.tsx
- src/components/clients/AddClientDialog.tsx
- src/components/clients/EditClientDialog.tsx
- src/components/clients/AddPasseportDialog.tsx
- src/components/clients/EditPasseportDialog.tsx
- src/components/conteneurs/EditConteneurDialog.tsx
- src/components/conteneurs/AffecterVehiculeDialog.tsx
- src/components/suppliers/AddSupplierDialog.tsx
- src/components/suppliers/EditSupplierDialog.tsx
- src/components/payments/AddPaymentDialog.tsx
- src/components/vehicles/EditVehicleDialog.tsx
Also normalize any outliers:
- src/components/vehicles/AddVehicleDialog.tsx currently uses DialogContent overflow-y-auto; bring it into the same header/body/footer layout so buttons stay visible and behavior is consistent.

D) Keep the existing ScrollArea component for non-dialog use
- Do not remove or break src/components/ui/scroll-area.tsx, since it may be used for other screens (tables, sidebars, etc.).
- The dialog fix will avoid the Radix ScrollArea edge cases by not using it inside DialogContent.

Testing checklist (must do on your side after I implement)
1) Desktop (laptop height):
   - Open “Nouveau Conteneur”
   - Scroll with trackpad and mouse wheel inside the form
   - Verify you can reach Date départ / Date d’arrivée and the helper text
   - Ensure footer buttons remain visible
2) Mobile + tablet (Lovable device icons):
   - Repeat the same for at least: Nouveau Dossier, Nouveau Client, Nouveau Paiement
3) Regression sweep:
   - Open each dialog quickly and confirm at least one scroll gesture works and no fields are unreachable.

Expected outcome
- All modals will have:
  - Fixed header
  - Scrollable form body (native scroll, very reliable)
  - Fixed footer with actions always accessible
- The “Nouveau Conteneur” dialog will no longer clip inputs and scrolling will work consistently across devices.

Notes / edge cases handled
- Radix Select dropdowns: safe, they render in a portal and won’t be clipped by overflow-y-auto containers.
- iOS scrolling: improved with -webkit-overflow-scrolling: touch and dvh units.
- Flexbox min-height trap: avoided by explicitly setting min-h-0 on the scrolling body and DialogContent.

Files to be added/edited (once you approve)
- Add:
  - src/components/ui/scrollable-dialog.tsx (new reusable scaffold)
- Edit (refactor to use the scaffold / native body scroll):
  - src/components/conteneurs/AddConteneurDialog.tsx
  - plus the dialog list in section C above
