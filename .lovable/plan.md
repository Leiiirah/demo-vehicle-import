

# Plan: Generate Project Documentation PDF

## What
Generate a comprehensive PDF document explaining the VHL Import (NGB) vehicle import management system -- its architecture, modules, data flow, and business logic -- suitable for a project manager.

## Technical Approach

1. **Write a Python script** using `reportlab` to generate a multi-page PDF at `/mnt/documents/VHL_Import_Documentation.pdf`

2. **Content outline:**
   - **Cover page**: Project name, date, version
   - **Overview**: What the system does (vehicle import management for Algeria)
   - **Architecture**: Frontend (React/Vite/Tailwind) + Backend (NestJS/PostgreSQL) + deployment (VPS/PM2/Nginx)
   - **Module descriptions** (13 modules):
     - Suppliers, Dossiers, Conteneurs, Vehicles, Clients, Passeports, Payments, Caisse, Car Models, Zakat, Dashboard, Search, Users/Auth
   - **Data flow diagram** (text-based): Supplier -> Dossier -> Conteneur -> Vehicle -> Client (sale)
   - **Vehicle lifecycle**: ordered -> in_transit -> arrived -> sold/vendu_bare
   - **Container lifecycle**: charge -> arrivee -> decharge (with cascade to vehicles)
   - **Financial flow**: Purchase price (USD) + transport + passport cost + local fees = total cost (DZD); selling price - total cost = profit
   - **Caisse system**: entries, charges, retraits, auto vente entries, balance
   - **Zakat calculation**: assets - debts, nissab threshold
   - **User roles**: admin, manager, user
   - **Export features**: PDF exports for suppliers, passports, client transactions
   - **API structure**: REST endpoints overview

3. **QA**: Convert PDF pages to images and inspect each one

## Files Created
- `/mnt/documents/VHL_Import_Documentation.pdf`

