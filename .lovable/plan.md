
# Connecting Lovable Preview to Your Backend

## Current Situation

Your frontend is configured to call the API at `https://api.vhlimport.com` (default in `src/services/api.ts`). The Lovable preview cannot connect to your backend because:

1. **No `VITE_API_URL` secret configured** - The preview needs this environment variable set to your backend URL
2. **CORS restriction** - Your backend only allows requests from `FRONTEND_URL` (configured in `backend/.env`)
3. **Some pages still use mock data** - Reports, Sales, Calculator, and Header still import from `mockData.ts`

## Solution Overview

```text
+------------------+     HTTPS      +------------------+
|  Lovable Preview | -------------> |  Your VPS API    |
|  (*.lovable.app) |                | api.vhlimport.com|
+------------------+                +------------------+
         |                                   |
         v                                   v
   VITE_API_URL                    FRONTEND_URL (CORS)
   secret in Lovable               must include lovable.app
```

## Implementation Steps

### Step 1: Configure VITE_API_URL in Lovable

You need to add a secret in your Lovable project settings:

- **Secret name**: `VITE_API_URL`  
- **Value**: `https://api.vhlimport.com` (your backend URL)

This will be injected at build time and the frontend will call your real API.

### Step 2: Update Backend CORS to Allow Lovable Preview

On your VPS, update `/var/www/vhlimport/backend/.env` to allow multiple origins:

```env
FRONTEND_URL=https://vhlimport.com,https://id-preview--b31fb60f-4b84-4b9e-be7f-f96249485ebd.lovable.app
```

Then update the backend CORS configuration to handle multiple origins:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:8080')
      .split(',')
      .map(o => o.trim());
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

### Step 3: Migrate Remaining Pages from Mock Data to API

Four files still use mock data and need to be connected to the API:

| File | Mock Data Used | Solution |
|------|----------------|----------|
| `src/pages/Reports.tsx` | `profitHistory`, `suppliers`, `clients` | Use `useProfitHistory()`, `useSuppliers()`, `useClients()` |
| `src/pages/Sales.tsx` | `vehicles` | Use `useVehicles()` |
| `src/pages/Calculator.tsx` | `exchangeRate` | Create settings API or hardcode/config |
| `src/components/layout/Header.tsx` | `kpiData` | Use `useDashboardStats()` |

### Step 4: Test the Connection

After configuration:
1. Restart PM2 on VPS: `pm2 restart vhlimport-api`
2. Refresh the Lovable preview
3. Login with `admin@vhlimport.com` / `VHLAdmin2026!`

---

## Technical Details

### Files to Modify

1. **`backend/src/main.ts`** - Update CORS to accept multiple origins
2. **`src/pages/Reports.tsx`** - Replace mock imports with API hooks
3. **`src/pages/Sales.tsx`** - Replace `vehicles` mock with `useVehicles()`
4. **`src/pages/Calculator.tsx`** - Handle exchange rate (config or API)
5. **`src/components/layout/Header.tsx`** - Remove `kpiData` mock import

### VPS Configuration Required

Update `/var/www/vhlimport/backend/.env`:
```env
FRONTEND_URL=https://vhlimport.com,https://id-preview--b31fb60f-4b84-4b9e-be7f-f96249485ebd.lovable.app
```

### Lovable Secret Required

Add in Lovable Project Settings > Secrets:
- **Name**: `VITE_API_URL`
- **Value**: `https://api.vhlimport.com`

---

## Summary

To connect the preview to your backend:
1. Add `VITE_API_URL` secret in Lovable settings
2. Update CORS on your VPS to allow the Lovable preview domain
3. Migrate remaining pages from mock data to real API calls
4. Restart the API and test the connection
