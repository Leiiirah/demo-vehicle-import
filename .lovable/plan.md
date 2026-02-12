

# Fix the /sales page to display correct data

## Problem
The Sales page filters vehicles by `v.status === 'sold'`, but in the system, vehicles assigned to clients may not have this exact status. The page shows "Aucune vente enregistree" because the filter is too restrictive. The page should display all vehicles that have been assigned to a client (have a `clientId`) as sales records.

## Changes

### File: `src/pages/Sales.tsx`

1. **Broaden the "sold" filter**: Instead of only `status === 'sold'`, show all vehicles that have a `clientId` (assigned to a client). This captures all sales regardless of the vehicle's lifecycle status.

2. **Add a "Date de vente" column**: Display `soldDate` if available for each vehicle.

3. **Improve profit display**: Handle negative profit with red color styling, not just green.

4. **Make search filter functional**: Wire up the search input to filter vehicles by brand, model, VIN, or client name.

5. **Make client filter functional**: Populate the client dropdown with actual clients from the sold vehicles list.

6. **Add click navigation**: Make rows clickable to navigate to the vehicle detail page.

## Technical Details

- Change filter from `vehicles.filter(v => v.status === 'sold')` to `vehicles.filter(v => v.clientId)` to include all assigned vehicles
- Add `useState` for `searchTerm` and `clientFilter`
- Populate client `Select` dropdown dynamically from unique clients in the vehicle list
- Apply search filtering on brand, model, VIN, and client name
- Apply client filtering on `clientId`
- Add `useNavigate` for row click navigation to `/vehicles/{id}`
- Add `soldDate` column display with French date formatting

