

## Plan: Add Transaction Summary and PDF Export to Client Sales and Client Detail Pages

### What changes

**1. `/client-sales` page — Add per-client transaction KPIs**
- Add a new KPI card: **Total Transactions** (count of all sold vehicles)
- Add a new KPI card: **Total Payé** (sum of `amountPaid` across all sold vehicles)  
- Add a new KPI card: **Reste à payer** (sum of remaining amounts across all sold vehicles)

**2. `/client-sales` page — Add PDF export button per client row**
- Add a "PDF" button in the Actions column next to the Eye button
- Clicking it generates a PDF for that client's transactions containing:
  - Client info (name, phone)
  - Table of all vehicles sold to that client (vehicle name, VIN, selling price, amount paid, remaining, status)
  - Summary totals at the bottom (total selling price, total paid, total remaining)

**3. `/clients/:id` (ClientDetail) page — Add transaction summary section**
- Add a new Card section showing all vehicle transactions for this client:
  - Table with: Vehicle, Prix de vente, Montant payé, Reste, Statut
  - Summary row at bottom: Total prix de vente, Total payé, Total reste
- Add a "Exporter PDF" button that generates the same PDF as above

**4. Shared PDF generation utility**
- Create `src/lib/exportClientTransactionsPDF.ts` using jsPDF (already in the project)
- Accepts client info + vehicles array, generates a formatted PDF with:
  - Header: Client name, phone, date
  - Transaction table
  - Totals summary

### Technical details

**Files to create:**
- `src/lib/exportClientTransactionsPDF.ts` — shared PDF generator using jsPDF

**Files to modify:**
- `src/pages/ClientSales.tsx`:
  - Add "Total Transactions", "Total Payé", "Reste à payer" KPI cards
  - Add PDF export button per row (group vehicles by client, generate PDF for selected client)
  - Add a FileText icon button in the actions column
- `src/pages/ClientDetail.tsx`:
  - Add a transaction summary card with vehicle payment table and totals
  - Add "Exporter PDF" button using the shared utility
- `src/components/clients/ClientVehiclesSection.tsx`:
  - Add columns for "Prix de vente", "Montant payé", "Reste" and a totals row

