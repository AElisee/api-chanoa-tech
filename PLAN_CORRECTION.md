# Plan de correction complet — `api-chanoa-tech`

> Rédigé le 2026-05-28  
> Base de données cible : **MySQL** via TypeORM

---

## Vue d'ensemble

Ce plan est organisé en 5 phases ordonnées. Chaque phase doit être complétée avant de passer à la suivante car certaines corrections sont des prérequis d'autres.

```
Phase 1 — Configuration & environnement     (bloquant au démarrage)
Phase 2 — Correction des entités            (bloquant TypeORM)
Phase 3 — Complétion des DTOs               (bloquant la validation)
Phase 4 — Implémentation des services       (logique métier)
Phase 5 — Finalisation & sécurité           (production-ready)
```

---

## Phase 1 — Configuration & environnement

### 1.1 Créer le fichier `.env`

Créer `src/.env` (et ajouter `.env` dans `.gitignore`) :

```env
# App
PORT=3000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=chanoa_tech

# JWT
JWT_SECRET=un_secret_fort_minimum_32_caracteres
JWT_EXPIRES_IN=60m
JWT_REFRESH_SECRET=un_autre_secret_fort_pour_refresh
JWT_REFRESH_EXPIRES_IN=7d
```

---

### 1.2 Corriger `database.module.ts`

**Problème** : configuré pour PostgreSQL, on passe à MySQL. Les options `url` et `timestamp with time zone` n'existent pas en MySQL.

**Fichier** : `src/database/database.module.ts`

```typescript
// AVANT
type: 'postgres',
url: configService.get<string>('DATABASE_URL'),

// APRÈS
type: 'mysql',
host: configService.get<string>('DB_HOST'),
port: configService.get<number>('DB_PORT'),
username: configService.get<string>('DB_USERNAME'),
password: configService.get<string>('DB_PASSWORD'),
database: configService.get<string>('DB_NAME'),
charset: 'utf8mb4',
```

---

### 1.3 Corriger `auth.module.ts` — secret JWT en dur

**Problème** : `secret: 'REPLACE_THIS_WITH_A_REAL_SECRET_LATER'` codé en dur.

**Fichier** : `src/auth/auth.module.ts`

```typescript
// AVANT
JwtModule.register({
  secret: 'REPLACE_THIS_WITH_A_REAL_SECRET_LATER',
  signOptions: { expiresIn: '60m' },
}),

// APRÈS
JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
  }),
}),
```

---

### 1.4 Corriger `app.module.ts` — modules manquants

**Problème** : `DatabaseModule` et `ConfigModule` ne sont pas importés dans le module racine.

**Fichier** : `src/app.module.ts`

```typescript
// Ajouter ces imports
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // Variables d'environnement globales
    DatabaseModule,
    AuthModule,
    ProduitsModule,
    PanierModule,
    CommandeModule,
    UserModule,
    CategorieModule,
    ProduitPanierModule,
    ProduitCommandeModule,
    DeliveriesModule,
  ],
  ...
})
```

---

### 1.5 Corriger `main.ts` — validation globale & CORS

**Fichier** : `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // supprime les champs non déclarés dans les DTOs
    forbidNonWhitelisted: true,
    transform: true,       // convertit automatiquement les types
  }));

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

---

## Phase 2 — Correction des entités

> **Règle MySQL** : remplacer tous les types PostgreSQL incompatibles :
> - `timestamp with time zone` → `datetime`
> - `numeric` → `decimal`
> - `text[]` (tableau) → `json` ou table dédiée
> - `PrimaryGeneratedColumn` avec `type: 'uuid'` → utiliser `'uuid'` comme stratégie, type TS `string`

---

### 2.1 `user.entity.ts` — 3 corrections

**Fichier** : `src/user/entities/user.entity.ts`

| # | Problème | Correction |
|---|---|---|
| 1 | `id: number` alors que c'est un UUID | `id: string` |
| 2 | `type: 'timestamp with time zone'` invalide en MySQL | `type: 'datetime'` |
| 3 | Champ `password` absent (AuthService en a besoin) | Ajouter le champ |
| 4 | Faute de frappe : `delectedAt` | Renommer en `deletedAt` |

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;  // string, pas number

  @Column('varchar', { name: 'email', length: 100, unique: true, nullable: false })
  email: string;

  @Column('varchar', { name: 'full_name', length: 255, nullable: false })
  name: string;

  @Column('varchar', { name: 'phone', length: 20, nullable: true })
  phone: string;

  @Column('varchar', { name: 'password', nullable: false, select: false })
  password: string;  // ← CHAMP MANQUANT — bloque l'auth

  @Column('varchar', { name: 'role', nullable: false, default: 'client' })
  role: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;  // ← faute corrigée (delectedAt → deletedAt)
}
```

---

### 2.2 `categorie.entity.ts` — 2 corrections

**Fichier** : `src/categorie/entities/categorie.entity.ts`

| # | Problème | Correction |
|---|---|---|
| 1 | `product: Product[]` — type `Product` non importé/non défini | `produits: Produit[]` |
| 2 | `type: 'timestamp with time zone'` | `type: 'datetime'` |

```typescript
// AVANT
@OneToMany(() => Produit, (product) => product.categorie, {
  cascade: ['soft-remove'],
})
product: Product[];  // ← Product n'existe pas

// APRÈS
@OneToMany(() => Produit, (produit) => produit.categorie, {
  cascade: ['soft-remove'],
})
produits: Produit[];
```

---

### 2.3 `produit.entity.ts` — 4 corrections

**Fichier** : `src/produits/entities/produit.entity.ts`

| # | Problème | Correction |
|---|---|---|
| 1 | `id: number` avec UUID | `id: string` |
| 2 | `type: 'timestamp with time zone'` | `type: 'datetime'` |
| 3 | `numeric` | `decimal` |
| 4 | `images: string[]` avec `type: 'text'` | `type: 'json'` ou entité dédiée |
| 5 | `search_vector` sans nullable | Ajouter `nullable: true` |
| 6 | `PrimaryGeneratedColumn('increment', { type: 'uuid' })` — incohérent | `PrimaryGeneratedColumn('uuid')` |

```typescript
@Entity('products')
export class Produit {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('decimal', { precision: 12, scale: 2, name: 'price', nullable: false })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'compare_price', nullable: false })
  compare_price: number;

  @Column('json', { name: 'images', nullable: true })
  images: string[];

  @Column('varchar', { name: 'search_vector', nullable: true })
  search_vector: string;

  // timestamps : remplacer 'timestamp with time zone' par 'datetime'
  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;
  // ...
}
```

---

### 2.4 `panier.entity.ts` — 2 corrections (CRITIQUE)

**Fichier** : `src/panier/entities/panier.entity.ts`

| # | Problème | Correction |
|---|---|---|
| 1 | **`@ManyToOne` → `ProduitPanier`** — sens de relation inversé | **`@OneToMany`** |
| 2 | `id: number` avec UUID | `id: string` |
| 3 | `type: 'timestamp with time zone'` | `type: 'datetime'` |
| 4 | Manque la relation vers `User` | Ajouter `userId` + relation |

```typescript
@Entity('carts')
export class Panier {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  // AVANT (FAUX) : @ManyToOne(() => ProduitPanier, ...)
  // APRÈS (CORRECT) :
  @OneToMany(() => ProduitPanier, (item) => item.panier, { cascade: true })
  items: ProduitPanier[];

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
```

---

### 2.5 `produit_panier.entity.ts` — 3 corrections (CRITIQUE)

**Fichier** : `src/produit_panier/entities/produit_panier.entity.ts`

| # | Problème | Correction |
|---|---|---|
| 1 | **Champ `productId` déclaré deux fois** — TypeScript refuse de compiler | Renommer le 2ème en `panierId` |
| 2 | **Deux `@PrimaryColumn` en plus de `@PrimaryGeneratedColumn`** — clé composite conflictuelle | Supprimer les `@PrimaryColumn`, garder seulement `@Column` pour les FK |
| 3 | `type: 'timestamp with time zone'` | `type: 'datetime'` |

```typescript
@Entity('carts_items')
export class ProduitPanier {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column('int', { name: 'quantity', nullable: false, default: 1 })
  quantity: number;

  // AVANT (FAUX) :
  // @PrimaryColumn('integer', { name: 'product_id' }) productId: number;
  // @PrimaryColumn('integer', { name: 'panier_id' }) productId: number;  ← doublon !

  // APRÈS (CORRECT) :
  @Column({ name: 'product_id', nullable: false })
  productId: string;

  @Column({ name: 'panier_id', nullable: false })
  panierId: string;

  @ManyToOne(() => Produit, (produit) => produit.produiPanier, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Produit;

  @ManyToOne(() => Panier, (panier) => panier.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'panier_id' })
  panier: Panier;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
```

---

### 2.6 `commande.entity.ts` — 3 corrections

**Fichier** : `src/commande/entities/commande.entity.ts`

| # | Problème | Correction |
|---|---|---|
| 1 | `id: number` avec UUID | `id: string` |
| 2 | `type: 'timestamp with time zone'` | `type: 'datetime'` |
| 3 | Aucune relation vers `User` ou `ProduitCommande` | Ajouter les relations |
| 4 | `numeric` | `decimal` |

```typescript
@Entity('orders')
export class Commande {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  // ...champs existants corrigés...

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ProduitCommande, (item) => item.commande, { cascade: true })
  items: ProduitCommande[];

  @OneToOne(() => Delivery, { nullable: true, cascade: true })
  @JoinColumn()
  delivery: Delivery;
}
```

---

### 2.7 `produit_commande.entity.ts` — 3 corrections

**Fichier** : `src/produit_commande/entities/produit_commande.entity.ts`

| # | Problème | Correction |
|---|---|---|
| 1 | `@PrimaryColumn` sur `productId` en plus de `@PrimaryGeneratedColumn` | Remplacer par `@Column` |
| 2 | `id: number` avec UUID | `id: string` |
| 3 | Aucune relation vers `Commande` | Ajouter la relation |

```typescript
@Entity('order_items')
export class ProduitCommande {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  // AVANT (FAUX) : @PrimaryColumn('integer', { name: 'product_id' }) productId: number;
  // APRÈS (CORRECT) :
  @Column({ name: 'product_id', nullable: false })
  productId: string;

  @Column({ name: 'commande_id', nullable: false })
  commandeId: string;

  @Column('decimal', { precision: 12, scale: 2, nullable: false })
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: false })
  price: number;

  @ManyToOne(() => Produit, (produit) => produit.produitCommande, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Produit;

  @ManyToOne(() => Commande, (commande) => commande.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commande_id' })
  commande: Commande;
}
```

---

### 2.8 `delivery.entity.ts` — 2 corrections

**Fichier** : `src/deliveries/entities/delivery.entity.ts`

| # | Problème | Correction |
|---|---|---|
| 1 | `id: number` avec UUID | `id: string` |
| 2 | `timestamp with time zone` | `datetime` |
| 3 | Aucun lien avec `Commande` | Ajouter relation inverse |

---

### 2.9 Nettoyage des imports inutilisés dans toutes les entités

Les imports suivants sont présents mais inutilisés dans plusieurs entités. Les supprimer pour éviter les warnings TypeScript :

```typescript
// À supprimer si non utilisés selon l'entité :
Index, JoinColumn, ManyToOne, OneToMany, BeforeInsert, BeforeUpdate, BeforeRemove, getManager
```

---

## Phase 3 — Complétion des DTOs

Tous les DTOs sont vides. Sans décorateurs de validation, `ValidationPipe` ne filtre rien.

### 3.1 `create-user.dto.ts`

```typescript
import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['admin', 'client', 'livreur'])
  role?: string;
}
```

### 3.2 `create-produit.dto.ts`

```typescript
import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateProduitDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  compare_price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
```

### 3.3 `create-categorie.dto.ts`

```typescript
import { IsString, IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateCategorieDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;
}
```

### 3.4 `create-commande.dto.ts`

```typescript
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderStatus } from '../entities/commande.entity';

export class CreateCommandeDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
```

### 3.5 `create-panier.dto.ts`

```typescript
import { IsOptional, IsUUID } from 'class-validator';

export class CreatePanierDto {
  @IsOptional()
  @IsUUID()
  userId?: string;
}
```

### 3.6 `create-produit_panier.dto.ts`

```typescript
import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateProduitPanierDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  panierId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
```

> Appliquer le même principe pour tous les `UpdateXxxDto` en étendant avec `PartialType(CreateXxxDto)`.

---

## Phase 4 — Implémentation des services

À implémenter module par module dans cet ordre (du plus simple au plus complexe) :

### Ordre recommandé

```
1. UserService     → base pour tous les autres
2. CategorieService
3. ProduitsService
4. PanierService + ProduitPanierService   (ensemble, ils sont liés)
5. CommandeService + ProduitCommandeService
6. DeliveriesService
```

### Pattern standard pour chaque service

```typescript
@Injectable()
export class XxxService {
  constructor(
    @InjectRepository(Xxx)
    private readonly repo: Repository<Xxx>,
  ) {}

  async create(dto: CreateXxxDto): Promise<Xxx> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(): Promise<Xxx[]> {
    return this.repo.find({ where: { deletedAt: IsNull() } });
  }

  async findOne(id: string): Promise<Xxx> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Xxx #${id} introuvable`);
    return entity;
  }

  async update(id: string, dto: UpdateXxxDto): Promise<Xxx> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.softDelete(id);
  }
}
```

---

## Phase 5 — Finalisation & sécurité

### 5.1 Passer de `synchronize: true` aux migrations

`synchronize: true` détruit des données en production si une entité change.

```typescript
// database.module.ts — désactiver synchronize
synchronize: false,
migrations: [__dirname + '/../migrations/*{.ts,.js}'],
migrationsRun: true,
```

Générer les migrations :
```bash
npx typeorm migration:generate src/migrations/InitialSchema -d src/data-source.ts
```

### 5.2 Créer `src/data-source.ts` pour les migrations CLI

```typescript
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
```

### 5.3 Validation des variables d'environnement avec Joi

Joi est déjà installé, l'utiliser dans `app.module.ts` :

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    PORT: Joi.number().default(3000),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRES_IN: Joi.string().default('60m'),
  }),
}),
```

### 5.4 Sécuriser la route `/auth/profile`

Vérifier que `JwtAuthGuard` est bien appliqué :

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}
```

### 5.5 Supprimer `pg` et `@types/pg` de `package.json`

On utilise MySQL, PostgreSQL ne doit pas rester :

```bash
npm uninstall pg @types/pg
# mysql2 est déjà installé — ne rien changer
```

---

## Récapitulatif des corrections

| # | Fichier | Sévérité | Type |
|---|---|---|---|
| 1 | `produit_panier.entity.ts` | CRITIQUE | Champ dupliqué + PrimaryColumn erronés |
| 2 | `panier.entity.ts` | CRITIQUE | Relation ManyToOne → doit être OneToMany |
| 3 | `categorie.entity.ts` | CRITIQUE | Type `Product` non défini |
| 4 | `user.entity.ts` | CRITIQUE | Champ `password` manquant |
| 5 | `auth.module.ts` | HAUTE | Secret JWT codé en dur |
| 6 | `database.module.ts` | HAUTE | PostgreSQL → MySQL |
| 7 | `app.module.ts` | HAUTE | DatabaseModule et ConfigModule manquants |
| 8 | `main.ts` | HAUTE | ValidationPipe absent |
| 9 | Toutes les entités | HAUTE | `timestamp with time zone` invalide MySQL |
| 10 | Toutes les entités | HAUTE | `id: number` pour des UUID (doit être `string`) |
| 11 | `produit_commande.entity.ts` | HAUTE | @PrimaryColumn parasite sur productId |
| 12 | Tous les DTOs | MOYENNE | Vides, aucune validation |
| 13 | Tous les services | MOYENNE | Méthodes non implémentées |
| 14 | `commande.entity.ts` | MOYENNE | Relations User et ProduitCommande absentes |
| 15 | `delivery.entity.ts` | BASSE | Pas de lien avec Commande |
| 16 | `package.json` | BASSE | Dépendances PostgreSQL à supprimer |
| 17 | Toutes les entités | BASSE | Imports TypeORM inutilisés |

---

## Ordre d'exécution résumé

```
1. Créer .env
2. Corriger database.module.ts (MySQL)
3. Corriger app.module.ts (ConfigModule + DatabaseModule)
4. Corriger main.ts (ValidationPipe)
5. Corriger auth.module.ts (JWT depuis env)
6. Corriger user.entity.ts (password + types)
7. Corriger categorie.entity.ts (Product → Produit)
8. Corriger panier.entity.ts (ManyToOne → OneToMany)
9. Corriger produit_panier.entity.ts (doublon productId)
10. Corriger produit.entity.ts (types MySQL)
11. Corriger commande.entity.ts (relations + types)
12. Corriger produit_commande.entity.ts (@PrimaryColumn → @Column)
13. Corriger delivery.entity.ts (types MySQL)
14. Remplir tous les DTOs
15. Supprimer pg de package.json
16. Implémenter les services
17. Remplacer synchronize par des migrations
18. Ajouter la validation Joi des variables d'environnement
```
