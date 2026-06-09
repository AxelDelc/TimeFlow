
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm install

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node src/db/seed-admin.js && node src/server.js"]
