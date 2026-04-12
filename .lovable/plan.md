

## Taux de Change — Arrondi à l'entier

**Objectif**: Arrondir le taux de change moyen pondéré à l'entier le plus proche (au lieu de 2 décimales) avant tout calcul USD → DZD.

**Changement**: Remplacer `Math.round(... * 100) / 100` par `Math.round(...)` dans 5 fichiers :

### Fichiers à modifier

1. **`backend/src/modules/payments/payments.service.ts`** (ligne 206) — C'est le calcul principal côté serveur qui persiste `theoreticalRate` et `totalCost` sur chaque véhicule. Arrondir à l'entier ici impacte tous les coûts stockés en base.

2. **`src/pages/Vehicles.tsx`** (ligne 103) — Affichage du taux sur la page véhicules.

3. **`src/pages/Stock.tsx`** (ligne 77) — Affichage du taux sur la page stock.

4. **`src/pages/VehicleDetail.tsx`** (ligne 92) — Affichage du taux sur le détail véhicule.

5. **`src/components/dossiers/DossierAnalytics.tsx`** (ligne 36) — Calcul du taux pour l'analytique dossier.

### Détail technique

Dans chaque fichier, le pattern :
```typescript
Math.round(weightedSum / totalPaid * 100) / 100
```
devient :
```typescript
Math.round(weightedSum / totalPaid)
```

Après déploiement, un appel à `POST /api/payments/recalculate-all-costs` (déclenché automatiquement au montage des pages Vehicles/Stock) recalculera tous les coûts avec le nouveau taux arrondi.

