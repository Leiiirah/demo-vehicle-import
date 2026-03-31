## Section Zakat sur le Tableau de Bord

### Comment la Zakat sera calculée

La Zakat islamique (زكاة) pour une activité commerciale en Algérie se calcule à **2.5% sur les actifs zakatable nets** détenus pendant un an (hawl). Voici la formule adaptée à votre plateforme :

```text
Zakat = 2.5% × (Actifs zakatable - Dettes)

Actifs zakatable :
  + Valeur du stock (véhicules en stock, totalCost)     → déjà calculé
  + Valeur véhicules chargées (en transit, purchasePrice × taux) → déjà calculé
  + Créances clients (detteBenefice)                     → déjà calculé
  + Solde caisse (totalCaisse)                           → déjà calculé

Dettes à déduire :
  - Dettes fournisseurs (remainingDebt)                  → déjà calculé

Montant Zakat = 2.5% × (valeurStock + valeurChargées×taux + créanceTotal + totalCaisse - dettesTotal)
```

Toutes ces valeurs existent déjà dans le endpoint `dashboard/stats`. Le calcul se fera côté backend et sera retourné dans la réponse stats.

### Plan d'implémentation

**1. Backend - Ajouter le calcul Zakat dans `dashboard.service.ts**`

- Après le calcul des KPI existants, calculer :
  - `assetsZakatable = valeurStock + (valeurChargees * theoreticalRate moyen) + creanceTotal + totalCaisse`
  - `zakatBase = max(0, assetsZakatable - dettesTotal)`
  - `zakatAmount = zakatBase * 0.025`
- Retourner `zakatBase` et `zakatAmount` dans la réponse stats

**2. Frontend - Ajouter une carte Zakat sur le dashboard (`Index.tsx`)**

- Ajouter une nouvelle section sous les KPI existants avec une carte dédiée affichant :
  - **Assiette Zakat** : le montant net zakatable
  - **Montant Zakat dû** : 2.5% de l'assiette
  - Icône appropriée (ex: Heart/HandHeart)
  - Style visuel distinct avec une bordure verte

### Notes

- La valeur des véhicules chargées (en USD) sera convertie en DZD en utilisant le taux théorique moyen des véhicules pour homogénéiser le calcul for this one use le taux moyen for all year in for taux moyen dechanges
- Le Nissab (seuil minimum) en Algérie est environ 85g d'or (~2,500,000 DZD) ; si l'assiette est en dessous, la Zakat affichera 0
- Le filtre mois/année existant s'appliquera aussi à cette section