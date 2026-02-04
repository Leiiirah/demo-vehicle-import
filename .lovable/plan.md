
# Plan: NestJS Backend + VPS Deployment for VHL Import

## Overview

This plan covers the complete setup of a NestJS backend for your vehicle import management platform, including database design, API endpoints, deployment to your VPS at `vhlimport.com` (77.37.122.252), and automatic GitHub Actions deployment.

---

## Part 1: NestJS Backend Structure

### 1.1 Backend Folder Structure

```text
backend/
+-- src/
|   +-- modules/
|   |   +-- auth/
|   |   |   +-- auth.controller.ts
|   |   |   +-- auth.service.ts
|   |   |   +-- auth.module.ts
|   |   |   +-- dto/
|   |   |   +-- guards/
|   |   +-- users/
|   |   +-- vehicles/
|   |   +-- suppliers/
|   |   +-- clients/
|   |   +-- passeports/
|   |   +-- dossiers/
|   |   +-- conteneurs/
|   |   +-- payments/
|   +-- entities/
|   |   +-- user.entity.ts
|   |   +-- vehicle.entity.ts
|   |   +-- supplier.entity.ts
|   |   +-- client.entity.ts
|   |   +-- passeport.entity.ts
|   |   +-- dossier.entity.ts
|   |   +-- conteneur.entity.ts
|   |   +-- payment.entity.ts
|   +-- database/
|   |   +-- migrations/
|   |   +-- seeds/
|   +-- config/
|   +-- common/
|   +-- app.module.ts
|   +-- main.ts
+-- ecosystem.config.js
+-- .env.example
+-- package.json
+-- tsconfig.json
```

### 1.2 Database Entities (PostgreSQL with TypeORM)

**User Entity:**
- id (UUID)
- name (string)
- email (string, unique)
- password (hashed)
- role (enum: admin, manager, user)
- status (enum: active, inactive)
- lastActive (timestamp)
- createdAt, updatedAt

**Supplier Entity:**
- id (UUID)
- name (string)
- location (string)
- creditBalance (decimal)
- totalPaid (decimal)
- remainingDebt (decimal)
- vehiclesSupplied (integer)
- rating (decimal)
- createdAt, updatedAt

**Dossier Entity:**
- id (UUID)
- reference (string, unique)
- supplierId (FK -> Supplier)
- dateCreation (date)
- status (enum: en_cours, termine, annule)
- createdAt, updatedAt

**Conteneur Entity:**
- id (UUID)
- numero (string, unique)
- dossierId (FK -> Dossier)
- type (enum: 20ft, 40ft, 40ft_hc)
- status (enum: en_chargement, en_transit, arrive, dedouane)
- coutTransport (decimal USD)
- dateDepart (date, nullable)
- dateArrivee (date, nullable)
- createdAt, updatedAt

**Vehicle Entity:**
- id (UUID)
- brand (string)
- model (string)
- year (integer)
- vin (string, unique)
- clientId (FK -> Client, nullable)
- supplierId (FK -> Supplier)
- conteneurId (FK -> Conteneur)
- status (enum: ordered, in_transit, arrived, sold)
- purchasePrice (decimal USD)
- transportCost (decimal - calculated)
- localFees (decimal DZD)
- totalCost (decimal DZD - calculated)
- sellingPrice (decimal DZD, nullable)
- orderDate (date)
- arrivalDate (date, nullable)
- soldDate (date, nullable)
- createdAt, updatedAt

**Client Entity:**
- id (UUID)
- nom (string)
- prenom (string)
- telephone (string)
- adresse (string)
- pourcentageBenefice (decimal)
- prixVente (decimal)
- coutRevient (decimal)
- detteBenefice (decimal - calculated)
- paye (boolean)
- createdAt, updatedAt

**Passeport Entity:**
- id (UUID)
- nom (string)
- prenom (string)
- telephone (string)
- adresse (string)
- numeroPasseport (string, unique)
- pdfPasseport (string - file path)
- montantDu (decimal)
- paye (boolean)
- createdAt, updatedAt

**Payment Entity:**
- id (UUID)
- date (date)
- amount (decimal)
- currency (enum: USD, DZD)
- exchangeRate (decimal)
- type (enum: supplier_payment, client_payment, transport, fees)
- reference (string)
- status (enum: completed, pending)
- supplierId (FK, nullable)
- clientId (FK, nullable)
- createdAt, updatedAt

### 1.3 API Endpoints

**Auth:**
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

**Users (admin only):**
- GET /api/users
- POST /api/users
- PATCH /api/users/:id
- DELETE /api/users/:id

**CRUD for each entity:**
- Suppliers: /api/suppliers
- Dossiers: /api/dossiers
- Conteneurs: /api/conteneurs
- Vehicles: /api/vehicles
- Clients: /api/clients
- Passeports: /api/passeports
- Payments: /api/payments

**Dashboard KPIs:**
- GET /api/dashboard/stats
- GET /api/dashboard/profit-history

---

## Part 2: Database Seeds & Admin User

### 2.1 Admin User Seed

```typescript
// backend/src/database/seeds/admin.seed.ts
{
  name: 'Administrateur NGB',
  email: 'admin@vhlimport.com',
  password: 'VHLAdmin2026!', // Will be hashed with bcrypt
  role: 'admin',
  status: 'active'
}
```

### 2.2 Sample Data Seeds

Seeds will include:
- 3 Suppliers (Guangzhou, Shanghai, Shenzhen)
- 3 Dossiers with references
- 5 Conteneurs linked to dossiers
- 5 Vehicles with pricing data
- 4 Clients with profit percentages
- 3 Passeports
- Sample payments

---

## Part 3: Frontend Changes

### 3.1 Remove Mock Data

- Delete `src/data/mockData.ts`
- Create API service layer: `src/services/api.ts`
- Create React Query hooks for each entity

### 3.2 API Service Configuration

```typescript
// src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'https://api.vhlimport.com';
```

### 3.3 Update All Pages

Replace mock data imports with API calls using React Query:
- Vehicles, Suppliers, Clients, Dossiers, Conteneurs, Passeports, Users

---

## Part 4: VPS Server Setup

### 4.1 Prerequisites on VPS

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 4.2 Create Database

```bash
sudo -u postgres psql

CREATE DATABASE vhlimport;
CREATE USER vhlimport_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE vhlimport TO vhlimport_user;
```

### 4.3 Project Directory

```bash
sudo mkdir -p /var/www/vhlimport
sudo chown $USER:$USER /var/www/vhlimport
cd /var/www/vhlimport
git clone YOUR_REPO_URL .
```

### 4.4 Backend Environment File

```bash
# /var/www/vhlimport/backend/.env
NODE_ENV=production
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=vhlimport_user
DB_PASSWORD=YOUR_SECURE_PASSWORD
DB_DATABASE=vhlimport

# JWT
JWT_SECRET=YOUR_SUPER_SECRET_KEY_MIN_32_CHARS
JWT_EXPIRATION=7d

# Frontend URL (CORS)
FRONTEND_URL=https://vhlimport.com
```

### 4.5 Nginx Configuration

```nginx
# /etc/nginx/sites-available/vhlimport.com

# Frontend
server {
    listen 80;
    server_name vhlimport.com www.vhlimport.com;
    
    root /var/www/vhlimport/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# API Backend
server {
    listen 80;
    server_name api.vhlimport.com;
    
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.6 Enable Site & SSL

```bash
sudo ln -s /etc/nginx/sites-available/vhlimport.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL Certificates
sudo certbot --nginx -d vhlimport.com -d www.vhlimport.com -d api.vhlimport.com
```

### 4.7 PM2 Ecosystem Config

```javascript
// backend/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'vhlimport-api',
    script: 'dist/main.js',
    cwd: '/var/www/vhlimport/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

---

## Part 5: GitHub Actions Deployment

### 5.1 Workflow File

```yaml
# .github/workflows/deploy.yml
name: Deploy VHL Import to VPS

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to VPS via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: 77.37.122.252
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script: |
            set -e
            
            echo "=== Starting VHL Import deployment ==="
            
            cd /var/www/vhlimport
            
            echo "=== Syncing with repository ==="
            git fetch origin main
            git reset --hard origin/main
            git clean -fd -e backend/.env
            
            echo "=== Building frontend ==="
            npm install --legacy-peer-deps
            npm run build
            
            echo "=== Building backend ==="
            cd backend
            rm -rf dist node_modules
            npm install --legacy-peer-deps
            npm run build
            
            echo "=== Running database migrations ==="
            npm run migration:run
            
            echo "=== Restarting API ==="
            pm2 delete vhlimport-api 2>/dev/null || true
            pm2 start ecosystem.config.js
            pm2 save
            
            echo "=== Deployment complete ==="
            pm2 list
```

### 5.2 GitHub Secrets Required

Add these secrets in GitHub repository settings:
- `VPS_USER`: Your SSH username (e.g., root or deploy user)
- `SSH_PRIVATE_KEY`: Your SSH private key
- `VPS_PORT`: SSH port (usually 22)

---

## Part 6: DNS Configuration

Configure these DNS records for `vhlimport.com`:

| Type | Name | Value |
|------|------|-------|
| A | @ | 77.37.122.252 |
| A | www | 77.37.122.252 |
| A | api | 77.37.122.252 |

---

## Part 7: Initial Deployment Steps

### Step-by-Step Commands on VPS:

```bash
# 1. Clone the repo
cd /var/www
git clone YOUR_REPO vhlimport
cd vhlimport

# 2. Build frontend
npm install --legacy-peer-deps
npm run build

# 3. Setup backend
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install --legacy-peer-deps
npm run build
npm run migration:run
npm run seed:run

# 4. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Summary of Files to Create

### Backend (new folder):
1. `backend/package.json` - NestJS dependencies
2. `backend/tsconfig.json` - TypeScript config
3. `backend/src/main.ts` - Entry point
4. `backend/src/app.module.ts` - Root module
5. All entity files (8 entities)
6. All module files (8 modules with controller/service)
7. Database migrations
8. Seeds for initial data
9. `backend/ecosystem.config.js` - PM2 config
10. `backend/.env.example` - Environment template

### Frontend updates:
1. `src/services/api.ts` - API client
2. `src/hooks/useApi.ts` - React Query hooks
3. Update all pages to use API instead of mock data
4. Remove `src/data/mockData.ts`
5. Add `VITE_API_URL` to `.env.example`

### DevOps:
1. `.github/workflows/deploy.yml` - GitHub Actions
2. Nginx config file (for manual setup)

---

## Technical Details

### Admin Credentials:
- **Email:** admin@vhlimport.com
- **Password:** VHLAdmin2026!

### Cost Calculation Logic (Backend):

```typescript
// Vehicle cost calculation
const transportPerVehicle = conteneur.coutTransport / conteneur.vehiculesCount;
const totalCostUSD = vehicle.purchasePrice + transportPerVehicle;
const totalCostDZD = (totalCostUSD * exchangeRate) + vehicle.localFees;
```

### JWT Authentication:
- Tokens expire in 7 days
- Stored in HTTP-only cookies or localStorage
- Guards protect all routes except /auth/login
