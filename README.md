# Les Plombiers du Bénin 🇧🇯

Plateforme numérique officielle regroupant les artisans plombiers certifiés du Bénin. Cette application permet aux plombiers de s'inscrire, d'obtenir un badge professionnel numérique avec QR Code, et aux clients de trouver des plombiers vérifiés dans leur région.

## 🚀 Fonctionnalités

- **Annuaire des Plombiers** : Recherche et filtrage de plombiers certifiés par localisation
- **Inscription Plombiers** : Formulaire d'inscription avec validation et vérification
- **Badge Professionnel** : Génération de badge numérique avec QR Code pour chaque plombier
- **Système de Notation** : Avis et notes laissés par les clients
- **Gestion des Paiements** : Suivi des membres actifs et paiements

## 🏗️ Architecture

### Stack Technique

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript
- **Base de données** : PostgreSQL avec Prisma ORM
- **Styling** : Tailwind CSS 4
- **Upload d'images** : Cloudinary
- **Validation** : Zod
- **Formulaires** : React Hook Form

### Structure du Projet

```
plombier-benin/
├── app/                    # Pages et routes Next.js
│   ├── actions/            # Server Actions
│   ├── api/                # API Routes
│   ├── annuaire/           # Page annuaire
│   ├── badge/              # Page badge professionnel
│   └── register/           # Page d'inscription
├── components/             # Composants React réutilisables
├── constants/              # Constantes (localisations, etc.)
├── lib/                    # Utilitaires et helpers
│   ├── prisma.ts           # Singleton Prisma Client
│   ├── logger.ts           # Système de logging
│   ├── sanitize.ts         # Fonctions de sanitization
│   ├── rate-limit.ts       # Rate limiting
│   └── cloudinary.ts       # Utilitaires Cloudinary
├── types/                  # Types TypeScript
├── prisma/                 # Schéma Prisma
└── public/                 # Assets statiques
```

### Modèles de Données

- **Plumber** : Informations des plombiers (nom, téléphone, localisation, statut)
- **Payment** : Historique des paiements
- **Review** : Avis et notes des clients

## 📦 Installation

### Prérequis

- Node.js 18+ 
- PostgreSQL
- Compte Cloudinary (pour l'upload d'images)

### Étapes d'installation

1. **Cloner le repository**
   ```bash
   git clone git@github.com:Baroka-wp/plombiers-du-benin.git
   cd plombier-benin
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   
   Créez un fichier `.env.local` à la racine du projet :
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/plombier_benin?schema=public"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here" # Générer avec: openssl rand -base64 32
   
   # ClickSend SMS (pour l'envoi de SMS et OTP)
   CLICKSEND_USERNAME="your_clicksend_username"
   CLICKSEND_API_KEY="your_clicksend_api_key"
   CLICKSEND_SENDER_ID="Plombier" # Optionnel, par défaut "Plombier"
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your_upload_preset_name"
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   ```

4. **Configurer la base de données**
   ```bash
   # Générer le client Prisma
   npm run db:generate
   
   # Appliquer les migrations
   npm run db:push
   
   # Créer un compte admin
   npx tsx scripts/create-admin.ts admin@example.com motdepasse123 "Nom Admin"
   
   # (Optionnel) Ouvrir Prisma Studio
   npm run db:studio
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

   L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🛠️ Scripts Disponibles

- `npm run dev` : Lancer le serveur de développement
- `npm run build` : Construire l'application pour la production
- `npm run start` : Lancer le serveur de production
- `npm run lint` : Vérifier le code avec ESLint
- `npm run lint:fix` : Corriger automatiquement les erreurs ESLint
- `npm run type-check` : Vérifier les types TypeScript
- `npm run format` : Formater le code avec Prettier
- `npm run format:check` : Vérifier le formatage
- `npm run db:generate` : Générer le client Prisma
- `npm run db:push` : Pousser le schéma vers la DB
- `npm run db:migrate` : Créer une migration
- `npm run db:studio` : Ouvrir Prisma Studio

## 🔒 Sécurité

### Mesures Implémentées

- **Sanitization** : Tous les inputs utilisateur sont sanitizés avant traitement
- **Validation stricte** : Validation Zod avec règles strictes pour tous les formulaires
- **Rate Limiting** : Protection contre le spam sur les routes API (20 req/min)
- **Logging sécurisé** : Système de logging qui n'expose pas d'informations sensibles en production
- **Singleton Prisma** : Gestion optimale des connexions DB pour éviter la saturation

### Bonnes Pratiques

- Ne jamais commiter les fichiers `.env*`
- Utiliser des variables d'environnement pour toutes les configurations sensibles
- Valider et sanitizer tous les inputs côté serveur
- Utiliser HTTPS en production

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connecter votre repository GitHub à Vercel
2. Configurer les variables d'environnement dans le dashboard Vercel
3. Vercel détectera automatiquement Next.js et déploiera

### Variables d'environnement requises

- `DATABASE_URL` : URL de connexion PostgreSQL
- `NEXTAUTH_URL` : URL de base de l'application (ex: `http://localhost:3000` en dev, `https://yourdomain.com` en prod)
- `NEXTAUTH_SECRET` : Clé secrète pour NextAuth (générer avec `openssl rand -base64 32`)
- `CLICKSEND_USERNAME` : Nom d'utilisateur ClickSend (votre email ClickSend)
- `CLICKSEND_API_KEY` : Clé API ClickSend pour l'envoi de SMS
- `CLICKSEND_SENDER_ID` : ID de l'expéditeur SMS (optionnel, par défaut "Plombier")
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` : Preset Cloudinary
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` : Nom du cloud Cloudinary

## 📝 Développement

### Conventions de Code

- **TypeScript strict** : Tous les fichiers doivent être typés
- **ESLint** : Respecter les règles ESLint configurées
- **Prettier** : Code formaté automatiquement avec Prettier
- **Commits** : Utiliser des messages de commit conventionnels

### Structure des Commits

```
type(scope): description

Exemples:
- feat(register): add phone validation
- fix(api): fix rate limiting bug
- refactor(prisma): implement singleton pattern
```

## 🔐 Interface Admin

L'application dispose d'un dashboard administrateur complet pour gérer la plateforme.

### Accès Admin

1. **Créer un compte admin** :
   ```bash
   npx tsx scripts/create-admin.ts admin@example.com motdepasse123 "Nom Admin"
   ```

2. **Se connecter** :
   - Aller sur `/admin/login`
   - Utiliser l'email et le mot de passe créés

### Fonctionnalités Admin

- **Dashboard** (`/admin/dashboard`) : Vue d'ensemble avec statistiques
  - Nombre total de plombiers
  - Plombiers vérifiés et ayant payé
  - Statistiques de paiements
  - Répartition par département et ville
  - Plombiers et paiements récents

- **Gestion des Plombiers** (`/admin/plumbers`) :
  - Liste complète avec filtres (recherche, département, statut)
  - Vérifier/désactiver un plombier
  - Marquer comme ayant payé
  - Voir les détails de chaque plombier

### Sécurité

⚠️ **Important** : En production, implémenter un système d'authentification plus robuste avec :
- Tokens JWT sécurisés
- Sessions serveur
- Protection CSRF
- Rate limiting sur les routes admin

## 🧪 Tests

Les tests seront ajoutés dans une prochaine version avec Jest/Vitest et Testing Library.

## 📄 Licence

Ce projet est privé et propriété de l'Association des Plombiers du Bénin.

## 🤝 Contribution

Pour contribuer au projet :

1. Créer une branche depuis `dev`
2. Faire vos modifications
3. Créer une Pull Request vers `dev`
4. Attendre la revue de code

## 📞 Contact

Pour toute question ou support :
- Email : contact@plombiersbenin.bj
- Téléphone : +229 01 00 00 00

---

Fait avec ❤️ pour les artisans du Bénin
