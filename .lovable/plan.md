
# Plan: Corriger les erreurs de build des tests backend

## Probleme identifie

Le build du backend echoue avec 52 erreurs TypeScript :

1. **Module `supertest` introuvable** - Le package n'est pas dans les dependances
2. **Type `any` implicite** - `noImplicitAny: true` dans tsconfig.json exige des types explicites pour les parametres `res`
3. **Fichiers de test inclus dans le build** - Le dossier `test/` est compile avec le code source

## Corrections a effectuer

### 1. Ajouter les dependances manquantes

Modifier `backend/package.json` pour ajouter dans devDependencies :

```json
"supertest": "^7.0.0",
"@types/supertest": "^6.0.2"
```

### 2. Exclure les tests du build de production

Modifier `backend/tsconfig.json` pour exclure le dossier test :

```json
{
  "compilerOptions": {
    // ... existing options
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### 3. Creer un tsconfig separe pour les tests E2E

Creer `backend/test/tsconfig.e2e.json` :

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "noImplicitAny": false
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 4. Mettre a jour la configuration Jest E2E

Modifier `backend/test/jest-e2e.json` pour utiliser le tsconfig des tests :

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": ["ts-jest", {
      "tsconfig": "test/tsconfig.e2e.json"
    }]
  },
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1"
  }
}
```

### 5. Ajouter le script test:e2e dans package.json

Ajouter le script :

```json
"test:e2e": "jest --config ./test/jest-e2e.json --runInBand"
```

## Resume des fichiers

| Fichier | Action |
|---------|--------|
| backend/package.json | Ajouter supertest et @types/supertest + script test:e2e |
| backend/tsconfig.json | Ajouter exclude pour le dossier test |
| backend/test/tsconfig.e2e.json | Creer (config TypeScript pour les tests) |
| backend/test/jest-e2e.json | Mettre a jour avec le bon tsconfig |

## Resultat attendu

Apres ces modifications :
- `npm run build` compilera uniquement le code source (pas les tests)
- `npm run test:e2e` executera les tests E2E avec leur propre configuration TypeScript
- Le deploiement CI/CD fonctionnera sans erreurs
