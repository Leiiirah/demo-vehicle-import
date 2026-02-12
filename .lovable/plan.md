

# Simplifier le formulaire "Ajouter Client" - Section Calcul du benefice

## Probleme actuel
Le formulaire de creation de client contient des champs manuels "Prix de vente (DZD)" et "Cout de revient (DZD)" qui ne devraient pas etre saisis a la main. Ces valeurs sont calculees automatiquement a partir des vehicules assignes au client (prix de revient = cout calcule du vehicule, prix de vente = prix de vente defini sur le vehicule).

Au moment de la creation du client, aucun vehicule n'est encore assigne, donc ces champs n'ont pas de sens.

## Modification prevue

### Fichier : `src/components/clients/AddClientDialog.tsx`

1. **Supprimer les champs manuels** : Retirer les inputs "Prix de vente (DZD)" et "Coût de revient (DZD)" du formulaire
2. **Supprimer les states associes** : Retirer `prixVente`, `setPrixVente`, `coutRevient`, `setCoutRevient`
3. **Supprimer le calcul local** : Retirer les variables `benefice` et `dette` et le bloc d'apercu conditionnel
4. **Garder uniquement le pourcentage** : Le champ "Pourcentage sur benefice (%)" reste le seul champ dans la section "Calcul du benefice"
5. **Ajouter une note explicative** : Un texte d'information sous le champ pourcentage indiquant que le benefice sera calcule automatiquement une fois les vehicules assignes
6. **Nettoyer le submit** : Ne plus envoyer `prixVente`, `coutRevient`, ni `detteBenefice` lors de la creation (envoyer 0 par defaut)

### Resultat visuel
La section "Calcul du benefice" affichera uniquement :
- Le champ pourcentage (avec son input numerique et le symbole %)
- Une note : "Le benefice et la dette seront calcules automatiquement en fonction des vehicules assignes."
