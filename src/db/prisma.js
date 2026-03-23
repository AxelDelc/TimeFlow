require('dotenv').config();
const path = require('path');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');

const dbPath = (process.env.DATABASE_URL || `file:${path.resolve(__dirname, '../../dev.db')}`).replace(/\\/g, '/');

const adapter = new PrismaLibSql({ url: dbPath });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
