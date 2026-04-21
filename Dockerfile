# ---- Étape 1 : build (avec prisma CLI pour generate) ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# ---- Étape 2 : image finale de production ----
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY . .

EXPOSE 3000

# Applique les migrations, seed l'admin, puis démarre
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node src/db/seed-admin.js && node src/server.js"]
