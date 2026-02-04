# Plan: Connexion Frontend-Backend et Auto-deploiement

## ✅ TERMINÉ - Implémentation Frontend

### Étape 1 : Système d'authentification ✅
- [x] `src/contexts/AuthContext.tsx` - Contexte d'authentification avec JWT
- [x] `src/components/auth/ProtectedRoute.tsx` - Protection des routes
- [x] `src/pages/Login.tsx` - Page de connexion

### Étape 2 : Migration vers l'API ✅
- [x] `src/App.tsx` - Routes protégées + route login
- [x] `src/pages/Index.tsx` - Dashboard avec useDashboardStats()
- [x] `src/pages/Vehicles.tsx` - Liste des véhicules avec useVehicles()
- [x] `src/pages/Suppliers.tsx` - Fournisseurs avec useSuppliers()
- [x] `src/pages/Clients.tsx` - Clients avec useClients()
- [x] `src/pages/Dossiers.tsx` - Dossiers avec useDossiers()
- [x] `src/pages/Conteneurs.tsx` - Conteneurs avec useConteneurs()
- [x] `src/pages/Passeports.tsx` - Passeports avec usePasseports()
- [x] `src/pages/Users.tsx` - Utilisateurs avec useUsers()
- [x] `src/components/dashboard/ProfitChart.tsx` - Graphique avec useProfitHistory()
- [x] `src/components/dashboard/StatusDonutChart.tsx` - Donut avec useVehiclesByStatus()
- [x] `src/components/dashboard/TopVehiclesTable.tsx` - Table avec useTopVehicles()
- [x] `src/components/dashboard/RecentVehicles.tsx` - Top véhicules avec useVehicles()

---

## 📋 À FAIRE - Configuration VPS

### Étape 3 : Configuration DNS et SSL pour l'API
1. Ajouter un enregistrement DNS A : `api` → `77.37.122.252`
2. Attendre la propagation DNS (~15 min)
3. Obtenir le certificat SSL :
   ```bash
   sudo certbot --nginx -d api.vhlimport.com
   ```

### Étape 4 : Configuration Backend (CORS)
1. Modifier `/var/www/vhlimport/backend/.env` :
   ```bash
   FRONTEND_URL=https://vhlimport.com
   ```
2. Redémarrer l'API :
   ```bash
   pm2 restart vhlimport-api
   ```

### Étape 5 : Configuration Frontend sur VPS
1. Créer le fichier `.env` :
   ```bash
   cd /var/www/vhlimport
   echo "VITE_API_URL=https://api.vhlimport.com" > .env
   ```
2. Rebuild le frontend :
   ```bash
   npm install --legacy-peer-deps
   npm run build
   ```

### Étape 6 : Configuration GitHub Actions
1. Ajouter les Secrets GitHub :
   - `VPS_USER` : root (ou votre utilisateur)
   - `VPS_PORT` : 22 (ou votre port SSH)
   - `SSH_PRIVATE_KEY` : Contenu de votre clé privée SSH

### Étape 7 : Tests de Vérification
```bash
# Tester l'API
curl https://api.vhlimport.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vhlimport.com","password":"VHLAdmin2026!"}'
```

---

## Identifiants par défaut
- **Email** : admin@vhlimport.com
- **Mot de passe** : VHLAdmin2026!

