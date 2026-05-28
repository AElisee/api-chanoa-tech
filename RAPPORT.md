# Rapport d'analyse — `api-chanoa-tech`

> Généré le 2026-05-28

---

## Stack technique

| Outil | Version |
|---|---|
| NestJS | 11.0.1 |
| TypeScript | 5.7.3 |
| Base de données | PostgreSQL via TypeORM |
| Auth | Passport.js — JWT + LocalStrategy + Refresh Token |
| Validation | class-validator / class-transformer |
| Sécurité | bcrypt, soft delete |

---

## Architecture générale

Projet **e-commerce** structuré en modules NestJS :

| Module | Route | Statut |
|---|---|---|
| `auth` | `/auth` | Implémenté (login, register, refresh, logout, reset-password) |
| `user` | `/user` | Stub |
| `produits` | `/produits` | Stub |
| `categorie` | `/categorie` | Stub |
| `panier` | `/panier` | Stub |
| `produit_panier` | `/produit-panier` | Stub |
| `commande` | `/commande` | Stub |
| `produit_commande` | `/produit-commande` | Stub |
| `deliveries` | `/deliveries` | Stub |

Le module `auth` est le seul réellement implémenté. Tous les autres retournent des placeholders.

---

## Structure des fichiers

```
api-chanoa-tech/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── decorators/
│   │   │   └── permissions.decorator.ts
│   │   ├── guards/
│   │   │   └── permissions.guard.ts
│   │   └── strategies/
│   │       ├── jwt.strategy.ts
│   │       └── local.strategy.ts
│   ├── user/
│   ├── produits/
│   ├── categorie/
│   ├── panier/
│   ├── produit_panier/
│   ├── commande/
│   ├── produit_commande/
│   ├── deliveries/
│   ├── database/
│   │   └── database.module.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## Relations entre entités

```
Categorie (1) ──────── (Many) Produit
                           │
                           ├── (Many) ProduitPanier
                           │              │
                           │              └── (1) Panier
                           │
                           └── (Many) ProduitCommande
                                      │
                                      └── (1) Commande

User
 └── (Many) UserSession (auth — refresh tokens)

Delivery (standalone)
```

---

## Bugs critiques

### 1. ProduitPanier — champ dupliqué
Dans `src/produit_panier/entities/produit_panier.entity.ts`, le champ `productId` est déclaré deux fois avec `@PrimaryColumn`. TypeORM va planter au démarrage.

### 2. Panier — mauvaise relation
Dans `src/panier/entities/panier.entity.ts`, la relation est annotée `ManyToOne → ProduitPanier` alors que c'est l'inverse : un panier contient plusieurs produits → `OneToMany`.

### 3. Categorie — référence de type incorrecte
Dans `src/categorie/entities/categorie.entity.ts`, la relation `OneToMany` pointe vers le type `"Product"` (anglais) au lieu de `"Produit"`.

### 4. Clé JWT codée en dur
```typescript
// src/auth/auth.module.ts
secret: 'REPLACE_THIS_WITH_A_REAL_SECRET_LATER'  // ← dangereux
```
Doit passer par `ConfigService` et une variable d'environnement.

### 5. Incohérence MySQL / PostgreSQL
`package.json` installe `mysql2` mais `src/database/database.module.ts` configure TypeORM pour PostgreSQL. L'un des deux est inutile.

---

## Problèmes importants

- **Tous les DTOs sont vides** — aucune validation (`@IsString`, `@IsEmail`, etc.) sur aucun endpoint
- **Tous les services sont des stubs** — les endpoints ne font rien
- **`User.id`** déclaré en `number` mais génère un UUID (`uuid_generate_v4()`) → incohérence de type
- **Pas de fichier `.env`** ni de validation des variables d'environnement (joi est installé mais non configuré)
- **`synchronize: true`** dans `database.module.ts` est dangereux en production — prévoir des migrations

---

## Ce qui est bien fait

- Architecture modulaire propre et scalable
- Soft delete (`deletedAt`) sur toutes les entités
- Pattern refresh token avec `UserSession` (ip, userAgent, lastUsedAt)
- Enum `OrderStatus` bien défini : `DRAFT`, `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`
- `PermissionsGuard` + décorateur `@RequiredPermission` déjà en place
- Stratégies Passport séparées proprement (LocalStrategy, JwtStrategy)
- Endpoints auth complets : login, register, refresh, logout, forgot-password, reset-password

---

## Priorités recommandées

1. **Corriger les 3 bugs d'entités** (ProduitPanier, Panier, Categorie)
2. **Sortir le secret JWT** dans un `.env` + valider avec joi
3. **Remplir les DTOs** avec class-validator
4. **Implémenter les services** module par module (commencer par `user` et `produits`)
5. **Passer de `synchronize: true` à des migrations** avant tout déploiement
