

# Plan: Correction des erreurs TypeScript Backend

## Problemes identifies

Il y a **deux problemes distincts** a resoudre :

### 1. Erreurs TypeScript (12 erreurs)
- **Package manquant** : `@nestjs/mapped-types` n'est pas dans les dependances
- **Type implicite** : Le parametre `req` dans `auth.controller.ts` n'a pas de type
- **Type UpdateUserDto** : Les proprietes ne sont pas reconnues car `PartialType` ne fonctionne pas

### 2. Erreur base de donnees
- L'authentification PostgreSQL echoue car le mot de passe dans `.env` ne correspond pas a celui configure dans PostgreSQL

---

## Partie 1 : Corrections du code

### 1.1 Ajouter la dependance manquante

Fichier : `backend/package.json`

Ajouter dans les dependencies :
```json
"@nestjs/mapped-types": "^2.0.4"
```

### 1.2 Corriger le type du parametre Request

Fichier : `backend/src/modules/auth/auth.controller.ts`

Ligne 17 - Ajouter le type explicite :
```typescript
async getMe(@Request() req: any) {
```

### 1.3 Corriger le service users

Fichier : `backend/src/modules/users/users.service.ts`

Lignes 68-69 - Utiliser un cast pour acceder a password :
```typescript
const dto = updateUserDto as any;
if (dto.password) {
  dto.password = await bcrypt.hash(dto.password, 10);
}
```

---

## Partie 2 : Correction base de donnees (sur le VPS)

### 2.1 Verifier le mot de passe PostgreSQL

Sur le serveur, reinitialiser le mot de passe de l'utilisateur :

```bash
sudo -u postgres psql
```

Dans le prompt PostgreSQL :
```sql
ALTER USER vhlimport_user WITH PASSWORD 'VotreMotDePasseSecurise';
\q
```

### 2.2 Mettre a jour le fichier .env

Editer le fichier `/var/www/vhlimport/backend/.env` :
```bash
nano /var/www/vhlimport/backend/.env
```

Verifier que `DB_PASSWORD` correspond exactement au mot de passe defini ci-dessus.

---

## Partie 3 : Reinstaller et rebuilder

Apres les corrections du code (via git pull), executer :

```bash
cd /var/www/vhlimport/backend
rm -rf node_modules
npm install
npm run build
npm run migration:run
npm run seed:run
```

---

## Resume des fichiers a modifier

| Fichier | Modification |
|---------|--------------|
| `backend/package.json` | Ajouter `@nestjs/mapped-types` |
| `backend/src/modules/auth/auth.controller.ts` | Typer `req: any` |
| `backend/src/modules/users/users.service.ts` | Cast pour acceder a password |

---

## Commandes VPS post-correction

```bash
# 1. Corriger le mot de passe PostgreSQL
sudo -u postgres psql -c "ALTER USER vhlimport_user WITH PASSWORD 'VotreMotDePasseSecurise';"

# 2. Mettre a jour .env
nano /var/www/vhlimport/backend/.env

# 3. Pull les corrections
cd /var/www/vhlimport
git pull

# 4. Reinstaller et builder
cd backend
rm -rf node_modules
npm install
npm run build

# 5. Lancer les migrations
npm run migration:run
npm run seed:run
```

