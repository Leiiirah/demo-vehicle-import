

## Problem

When you create a new "entrée" in the caisse, it appears below older "paiement" entries from the same day. The sorting uses `date` (date-only, no time) as primary key and `createdAt` as secondary — but the backend only sorts by `date`, losing the time-based ordering.

## Fix

### 1. Backend: Add `createdAt` as secondary sort (`backend/src/modules/caisse/caisse.service.ts`)
Update the final sort (line 179) to use `createdAt` as a tiebreaker for same-day entries:
```typescript
all.sort((a, b) => {
  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
  if (dateDiff !== 0) return dateDiff;
  const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return cb - ca;
});
```

### 2. Frontend: Keep existing sort as-is (`src/pages/Caisse.tsx`)
The frontend sort on lines 72-78 is already correct with the same logic. No changes needed — the backend fix ensures data arrives properly ordered.

### Files
- `backend/src/modules/caisse/caisse.service.ts` — update line 179 sort to include `createdAt` tiebreaker

