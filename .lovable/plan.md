## Plan: Système de Ventes Groupées

### 1. Backend - Nouvelle entité Sale
- Créer `backend/src/entities/sale.entity.ts` avec: id, clientId, date, totalSellingPrice, totalCost, totalProfit, amountPaid, debt, status
- Relation OneToMany avec Vehicle (un Sale peut avoir plusieurs véhicules)
- Ajouter `saleId` sur Vehicle entity

### 2. Backend - Migration
- Créer table `sales` avec les champs nécessaires
- Ajouter colonne `saleId` sur `vehicles`

### 3. Backend - Module Sales
- Controller, Service, DTOs pour CRUD des ventes
- Endpoint POST /sales pour créer une vente groupée (client + véhicules + prix)
- Calcul automatique de la dette: prix total vente - montant payé + dettes des ventes précédentes

### 4. Frontend - Mise à jour NewSaleDialog
- Au lieu d'updater chaque véhicule individuellement, créer une Sale via l'API
- Le backend gère l'affectation des véhicules au client et au sale

### 5. Frontend - Page Client
- Afficher les ventes comme lignes résumées dans le tableau principal
- Section détaillée expandable montrant les véhicules de chaque vente
- Afficher la dette cumulée

### 6. Frontend - Page Client Sales
- Grouper les véhicules par vente
- Afficher le cumul de dette entre ventes

### Logique de dette
- À l'affectation: dette = prix vente total - 0 (pas encore payé) + dette précédente
- Quand un paiement est fait, il réduit la dette de la vente la plus ancienne d'abord
