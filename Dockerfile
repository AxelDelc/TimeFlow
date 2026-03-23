FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copie le code source et le schéma Prisma
COPY . .

EXPOSE 3000

# Applique les migrations en attente, seed l'admin si besoin, puis démarre
CMD ["sh", "-c", "npx prisma migrate deploy && node src/db/seed-admin.js && node src/server.js"]
