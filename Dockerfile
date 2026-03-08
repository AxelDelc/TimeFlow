# ---- Étape 1 : build des dépendances natives ----
FROM node:20-alpine AS builder

WORKDIR /app

# Outils requis pour compiler better-sqlite3 et bcrypt (modules natifs C++)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

# ---- Étape 2 : image finale légère ----
FROM node:20-alpine

WORKDIR /app

# Copie uniquement les node_modules déjà compilés pour Linux
COPY --from=builder /app/node_modules ./node_modules

# Copie le code source
COPY . .

EXPOSE 3000

# Initialise la BDD si nécessaire puis démarre le serveur
CMD ["sh", "-c", "node src/db/init-db.js && node src/db/seed-admin.js && node src/server.js"]
