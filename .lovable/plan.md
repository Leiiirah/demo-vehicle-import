
# Plan: Mise a jour du branding et ajout des tests API

## Partie 1 : Supprimer le branding Lovable

### Fichiers a modifier

**1. index.html**
- Changer le titre "Lovable App" en "VHL Import"
- Mettre a jour les meta descriptions
- Supprimer les references a Lovable dans les Open Graph tags
- Supprimer les liens vers les images Lovable (opengraph)
- Supprimer la reference au favicon actuel (on le garde vide ou on le remplace plus tard)

```text
Modifications :
- Ligne 7 : <title>VHL Import</title>
- Ligne 8 : <meta name="description" content="Plateforme de gestion d'importation de vehicules">
- Ligne 9 : Supprimer ou modifier <meta name="author">
- Lignes 11-19 : Mettre a jour les Open Graph et Twitter meta tags
```

---

## Partie 2 : Tests Backend (NestJS/Jest)

Le backend utilise Jest pour les tests (configure dans `backend/package.json`). Je vais creer des tests e2e pour tous les endpoints.

### Structure des tests

```text
backend/
├── test/
│   ├── app.e2e-spec.ts          # Test de base de l'application
│   ├── auth.e2e-spec.ts         # Tests authentification
│   ├── users.e2e-spec.ts        # Tests CRUD utilisateurs
│   ├── suppliers.e2e-spec.ts    # Tests CRUD fournisseurs
│   ├── dossiers.e2e-spec.ts     # Tests CRUD dossiers
│   ├── conteneurs.e2e-spec.ts   # Tests CRUD conteneurs
│   ├── vehicles.e2e-spec.ts     # Tests CRUD vehicules
│   ├── clients.e2e-spec.ts      # Tests CRUD clients
│   ├── passeports.e2e-spec.ts   # Tests CRUD passeports
│   ├── payments.e2e-spec.ts     # Tests CRUD paiements
│   ├── dashboard.e2e-spec.ts    # Tests dashboard stats
│   └── jest-e2e.json            # Configuration Jest E2E
```

### Endpoints a tester

| Module | Endpoints | Tests |
|--------|-----------|-------|
| **Auth** | POST /auth/login, GET /auth/me, POST /auth/logout | Login valide, credentials invalides, token JWT, /me avec token |
| **Users** | GET, GET/:id, POST, PATCH/:id, DELETE/:id | CRUD complet + validation + erreurs 404 |
| **Suppliers** | GET, GET/:id, POST, PATCH/:id, DELETE/:id | CRUD complet + relations |
| **Dossiers** | GET, GET/:id, POST, PATCH/:id, DELETE/:id | CRUD complet + lien supplier |
| **Conteneurs** | GET, GET/:id, POST, PATCH/:id, DELETE/:id | CRUD + lien dossier + vehicules |
| **Vehicles** | GET, GET/:id, POST, PATCH/:id, DELETE/:id | CRUD + calcul transport cost |
| **Clients** | GET, GET/:id, POST, PATCH/:id, DELETE/:id | CRUD + lien vehicules |
| **Passeports** | GET, GET/:id, POST, PATCH/:id, DELETE/:id | CRUD complet |
| **Payments** | GET, GET/:id, POST, PATCH/:id, DELETE/:id | CRUD + types paiement |
| **Dashboard** | GET /stats, /profit-history, /vehicles-by-status, /top-vehicles | Stats, historique, status |

### Configuration Jest E2E

Fichier `backend/test/jest-e2e.json` :
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1"
  }
}
```

### Structure type d'un test E2E

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/auth/login (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@vhlimport.com', password: 'VHLAdmin2026!' })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
        accessToken = res.body.accessToken;
      });
  });

  it('/api/auth/login (POST) - invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@vhlimport.com', password: 'wrongpassword' })
      .expect(401);
  });
});
```

### Scripts a ajouter dans package.json

```json
{
  "scripts": {
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

---

## Partie 3 : Tests Frontend (Vitest)

Le frontend utilise Vitest. Je vais ajouter des tests pour le service API et les composants critiques.

### Structure des tests frontend

```text
src/
├── services/
│   └── api.test.ts              # Tests du client API
├── contexts/
│   └── AuthContext.test.tsx     # Tests du contexte auth
├── pages/
│   └── Login.test.tsx           # Tests de la page login
└── components/
    └── auth/
        └── ProtectedRoute.test.tsx
```

### Tests du service API

```typescript
// Tests de la classe ApiClient
- Construction de l'URL de base
- Gestion du token (set/get/remove)
- Headers d'autorisation
- Gestion des erreurs 401
- Parsing JSON des reponses
```

### Tests des composants

```typescript
// Login.tsx
- Affichage du formulaire
- Validation des champs
- Soumission du formulaire
- Affichage des erreurs

// ProtectedRoute.tsx
- Redirection si non authentifie
- Affichage du contenu si authentifie
- Loading state
```

---

## Resume des fichiers a creer/modifier

### Nouveaux fichiers

| Fichier | Description |
|---------|-------------|
| backend/test/jest-e2e.json | Configuration Jest E2E |
| backend/test/auth.e2e-spec.ts | Tests auth endpoints |
| backend/test/users.e2e-spec.ts | Tests users CRUD |
| backend/test/suppliers.e2e-spec.ts | Tests suppliers CRUD |
| backend/test/dossiers.e2e-spec.ts | Tests dossiers CRUD |
| backend/test/conteneurs.e2e-spec.ts | Tests conteneurs CRUD |
| backend/test/vehicles.e2e-spec.ts | Tests vehicles CRUD |
| backend/test/clients.e2e-spec.ts | Tests clients CRUD |
| backend/test/passeports.e2e-spec.ts | Tests passeports CRUD |
| backend/test/payments.e2e-spec.ts | Tests payments CRUD |
| backend/test/dashboard.e2e-spec.ts | Tests dashboard stats |
| src/services/api.test.ts | Tests API client |
| src/pages/Login.test.tsx | Tests page login |

### Fichiers a modifier

| Fichier | Modification |
|---------|--------------|
| index.html | Titre, meta, favicon |
| backend/package.json | Script test:e2e + dependance supertest |

---

## Ordre d'execution

1. Modifier index.html (branding VHL Import)
2. Ajouter configuration Jest E2E
3. Ajouter dependance supertest au backend
4. Creer les 10 fichiers de tests E2E backend
5. Creer les tests frontend
6. Mettre a jour la CI/CD pour executer les tests

