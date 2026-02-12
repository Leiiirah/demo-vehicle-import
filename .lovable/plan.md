

# Section "Ventes" sur la page Client

## Objectif
Ajouter une section complète "Ventes" sur la page de detail du client qui affiche tous les vehicules assignes avec leur statut de paiement (Solde/Non solde), les details financiers et la possibilite de filtrer.

## Modifications

### 1. Backend - Enrichir les relations chargees (clients.service.ts)
Modifier `findOne()` pour charger les relations profondes necessaires :
- `vehicles.conteneur.dossier` (pour acceder au dossierId et determiner le statut Solde)
- `vehicles.charges` si necessaire pour les charges locales

### 2. Frontend - Nouvelle section "Ventes" (ClientDetail.tsx)

Ajouter apres la section "Statut du paiement" une nouvelle Card pleine largeur :

**En-tete** : "Vehicules assignes" avec un compteur et des filtres (Tous / Solde / Non solde)

**Tableau avec colonnes** :
- Designation (marque + modele + annee)
- VIN (raccourci)
- Prix de revient approx. (base sur taux theorique)
- Prix de revient final (si dossier solde, base sur taux moyen pondere)
- Taux de change utilise
- Date de vente (soldDate)
- Statut : Badge vert "Solde" ou orange "Non solde"

**Logique de calcul pour chaque vehicule** :
- Recuperer les stats de paiement du dossier parent via `/api/payments/dossier/{dossierId}/stats`
- Si progress >= 100% : afficher le prix de revient final avec le taux moyen pondere
- Sinon : afficher uniquement le prix de revient approximatif

**Filtre** : Un `TabsList` simple (Tous / Solde / Non solde) pour filtrer les vehicules affiches

### Details techniques

**Fichiers modifies** :

1. `backend/src/modules/clients/clients.service.ts`
   - Ajouter `vehicles.conteneur.dossier` aux relations dans `findOne()`

2. `src/pages/ClientDetail.tsx`
   - Ajouter un state `filter` pour le filtre (tous/solde/non-solde)
   - Pour chaque vehicule ayant un `conteneur.dossier.id`, faire un appel aux stats de paiement du dossier via `useQuery`
   - Creer un sous-composant `ClientVehicleRow` qui charge les stats du dossier et affiche la ligne avec le calcul du taux final
   - Ajouter les imports necessaires : `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `Tabs`, `TabsList`, `TabsTrigger`
   - Section placee en `md:col-span-2` apres le bloc "Statut du paiement"

**Calcul du taux de change final (par vehicule)** :
```text
taux = somme(montant_i * taux_i) / somme(montant_i)  pour tous les versements du dossier
prix_revient_final = (purchasePrice + transportCost) * taux + localFees
```

**Structure du sous-composant ClientVehicleRow** :
- Recoit le vehicule en props
- Fait un useQuery sur `/api/payments/dossier/{dossierId}/stats`
- Calcule isDossierSolde et tauxChangeFinal
- Rend une TableRow avec toutes les colonnes demandees
- Le badge Solde/Non solde est cliquable pour naviguer vers la page du vehicule
