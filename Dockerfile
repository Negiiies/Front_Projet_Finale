# 🔧 Étape 1 : Build de l'application
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer toutes les dépendances (y compris dev)
RUN npm install

# Copier tous les fichiers sources (incluant next.config.js)
COPY . .

# Lancer le build
RUN npm run build || npm run build -- --no-lint


# 🚀 Étape 2 : Image finale pour exécution
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./

# Installer seulement les dépendances de production
RUN npm install --omit=dev

# Copier les fichiers buildés depuis l'étape "builder"
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Exposer le port utilisé par Next.js
EXPOSE 3001

# Démarrer l'application
CMD ["npm", "start"]
