This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# 89Progress - Frontend

## Dépendances externes et leurs versions

### UI Components
- `@headlessui/react` (v2.2.0) - Composants UI accessibles sans styles imposés
- `@heroicons/react` (v2.2.0) - Collection d'icônes SVG pour React

### Gestion des données
- `@tanstack/react-query` (v5.67.3) - Librairie pour la gestion des requêtes et du cache
- `axios` (v1.8.3) - Client HTTP pour les requêtes API
- `date-fns` (v4.1.0) - Utilitaires de manipulation de dates
- `jwt-decode` (v4.0.0) - Décodage des tokens JWT côté client

### Gestion de formulaires et validation
- `react-hook-form` (v7.54.2) - Gestion des formulaires React
- `@hookform/resolvers` (v4.1.3) - Intégration des schémas de validation avec React Hook Form
- `zod` (v3.24.2) - Validation de schémas TypeScript-first

### Framework et Core
- `next` (v15.2.2) - Framework React avec rendu côté serveur
- `react` (v19.0.0) - Librairie UI
- `react-dom` (v19.0.0) - Rendu React pour le navigateur

### Développement et tooling
- Tailwind CSS (v4) - Framework CSS utilitaire
- TypeScript (v5) - Superset JavaScript avec typage statique
- ESLint (v9) - Linting de code

## Dépendances de services

### URLs des services

| Service | Environnement | URL |
|---------|--------------|-----|
| API Backend | Développement | `http://localhost:3000/api` |
| API Backend | Production | `https://api.89progress.ecole-89.com/api` |

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL de base de l'API backend | `https://api.89progress.ecole-89.com/api` |
| `NEXT_PUBLIC_APP_ENV` | Environnement d'exécution | `production`, `development` |
| `NEXTAUTH_SECRET` | Clé secrète pour Next Auth (si implémenté) | `your-secret-key` |

## Installation et exécution

### Prérequis
- Node.js 18.x ou supérieur
- npm 9.x ou supérieur

### Installation
```bash
# Installer les dépendances
npm install

# Pour le développement uniquement
npm install --only=dev
```

### Exécution
```bash
# Mode développement (avec hot-reload via turbopack)
npm run dev

# Build pour production
npm run build

# Lancer en mode production
npm run start
```
