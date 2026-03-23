require('dotenv').config();
const path = require('path');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('@prisma/client');

const dbUrl = 'file:' + path.resolve(__dirname, '../../dev.db').replace(/\\/g, '/');
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
