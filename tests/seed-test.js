const bcrypt = require('bcrypt');
const prisma = require('../src/db/prisma');

async function seedTest() {
    await prisma.user.upsert({
        where: { email: 'test-admin@test.dev' },
        update: {},
        create: {
            name: 'Test Admin',
            email: 'test-admin@test.dev',
            passwordHash: await bcrypt.hash('test123', 10),
            role: 'admin',
        },
    });
    console.log('Compte test créé : test-admin@test.dev / test123');
    await prisma.$disconnect();
}

// Exécute directement si lancé avec `node tests/seed-test.js`
if (require.main === module) {
    seedTest().catch(console.error);
}

// Exporte pour Playwright globalSetup
module.exports = seedTest;
