

# Plan: Connexion Frontend-Backend et Auto-deploiement

## Analyse de la Situation Actuelle

Le projet a deux parties :
- **Frontend** : React/Vite (fonctionne sur vhlimport.com)
- **Backend** : NestJS sur port 3001 (fonctionne sur api.vhlimport.com)

### Problemes identifies

1. **Donnees simulees** : Toutes les pages utilisent `mockData.ts` au lieu de l'API reelle
2. **Page de connexion manquante** : Pas de login page, mais l'API l'exige
3. **CORS** : Le backend doit autoriser `https://vhlimport.com`
4. **Variable d'environnement** : Il faut creer `.env` sur le VPS avec `VITE_API_URL`
5. **DNS API** : Le sous-domaine `api.vhlimport.com` n'a pas de record DNS

---

## Etape 1 : Configuration DNS et SSL pour l'API

### 1.1 Ajouter un enregistrement DNS

Chez votre registrar (OVH, Cloudflare, etc.) :

| Type | Nom | Valeur |
|------|-----|--------|
| A | api | 77.37.122.252 |

### 1.2 Obtenir le certificat SSL

Une fois le DNS propage (verifier avec `nslookup api.vhlimport.com`) :

```bash
sudo certbot --nginx -d api.vhlimport.com
```

---

## Etape 2 : Configuration Backend (CORS)

### 2.1 Modifier le fichier .env du backend

Fichier : `/var/www/vhlimport/backend/.env`

```bash
FRONTEND_URL=https://vhlimport.com
```

### 2.2 Redemarrer l'API

```bash
cd /var/www/vhlimport/backend
pm2 restart vhlimport-api
```

---

## Etape 3 : Creer une Page de Connexion

Nouveau fichier : `src/pages/Login.tsx`

Page de connexion avec :
- Formulaire email/mot de passe
- Appel a l'API `/api/auth/login`
- Stockage du token JWT dans localStorage
- Redirection vers le dashboard apres connexion

---

## Etape 4 : Proteger les Routes

Modifications dans `src/App.tsx` :
- Creer un composant `ProtectedRoute`
- Verifier si l'utilisateur est connecte (token valide)
- Rediriger vers `/login` si non authentifie

---

## Etape 5 : Remplacer les Donnees Mock par l'API

### 5.1 Page Dashboard (Index.tsx)

Actuellement utilise `mockData.ts` :
```typescript
import { kpiData } from '@/data/mockData';
```

Sera remplace par les hooks API :
```typescript
import { useDashboardStats, useProfitHistory } from '@/hooks/useApi';
```

### 5.2 Pages a Migrer

| Page | Donnees Mock | Hook API |
|------|--------------|----------|
| Index.tsx | kpiData, profitHistory | useDashboardStats, useProfitHistory |
| Vehicles.tsx | vehicles | useVehicles |
| Suppliers.tsx | suppliers | useSuppliers |
| Clients.tsx | clients | useClients |
| Dossiers.tsx | dossiers | useDossiers |
| Conteneurs.tsx | conteneurs | useConteneurs |
| Passeports.tsx | passeports | usePasseports |
| Users.tsx | - | useUsers |

### 5.3 Composants Dashboard

| Composant | Modification |
|-----------|--------------|
| ProfitChart.tsx | Utiliser `useProfitHistory()` |
| StatusDonutChart.tsx | Utiliser `useVehiclesByStatus()` |
| TopVehiclesTable.tsx | Utiliser `useTopVehicles()` |
| RecentVehicles.tsx | Utiliser `useVehicles()` |

---

## Etape 6 : Configuration Frontend sur VPS

### 6.1 Creer le fichier .env

```bash
cd /var/www/vhlimport
echo "VITE_API_URL=https://api.vhlimport.com" > .env
```

### 6.2 Rebuild le frontend

```bash
npm run build
```

---

## Etape 7 : Configuration GitHub Actions

### 7.1 Ajouter les Secrets GitHub

Dans le repository GitHub : Settings > Secrets and variables > Actions

| Secret | Valeur |
|--------|--------|
| VPS_USER | root (ou votre utilisateur) |
| VPS_PORT | 22 (ou votre port SSH) |
| SSH_PRIVATE_KEY | Contenu de votre cle privee SSH |

### 7.2 Generer la cle SSH (si necessaire)

Sur votre machine locale :
```bash
ssh-keygen -t ed25519 -C "github-actions-vhlimport"
```

Copier la cle publique sur le VPS :
```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@77.37.122.252
```

Copier la cle privee dans GitHub Secrets.

---

## Etape 8 : Tests de Verification

### 8.1 Tester l'API

```bash
# Test sans authentification
curl https://api.vhlimport.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vhlimport.com","password":"VHLAdmin2026!"}'
```

### 8.2 Tester le deploiement automatique

Faire un commit sur la branche `main` et verifier que GitHub Actions deploie correctement.

---

## Resume des Fichiers a Creer/Modifier

### Nouveaux fichiers

| Fichier | Description |
|---------|-------------|
| src/pages/Login.tsx | Page de connexion |
| src/components/auth/ProtectedRoute.tsx | Protection des routes |
| src/contexts/AuthContext.tsx | Contexte d'authentification |

### Fichiers a modifier

| Fichier | Modification |
|---------|--------------|
| src/App.tsx | Ajouter route login + protection |
| src/pages/Index.tsx | Utiliser hooks API |
| src/pages/Vehicles.tsx | Utiliser useVehicles() |
| src/components/dashboard/*.tsx | Utiliser hooks API |
| Toutes les pages de listing | Remplacer mockData |

### Configuration VPS

| Action | Commande/Fichier |
|--------|------------------|
| DNS A record | api -> 77.37.122.252 |
| SSL API | `certbot --nginx -d api.vhlimport.com` |
| Backend .env | FRONTEND_URL=https://vhlimport.com |
| Frontend .env | VITE_API_URL=https://api.vhlimport.com |
| GitHub Secrets | VPS_USER, VPS_PORT, SSH_PRIVATE_KEY |

---

## Ordre d'Execution Recommande

1. Configurer DNS pour api.vhlimport.com
2. Attendre propagation DNS (~15 min)
3. Obtenir certificat SSL pour l'API
4. Modifier FRONTEND_URL dans backend/.env
5. Je cree la page de connexion et le systeme d'authentification
6. Je migre toutes les pages vers l'API reelle
7. Configurer GitHub Secrets pour le deploiement automatique
8. Tester le flux complet

