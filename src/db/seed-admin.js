const bcrypt = require('bcrypt');
const prisma = require('./prisma');

async function main() {
    const existing = await prisma.user.findFirst({ where: { role: 'admin' } });

    if (!existing) {
        const hash = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                name: 'Admin',
                email: 'admin@local.dev',
                passwordHash: hash,
                role: 'admin',
            },
        });
        console.log('Compte admin créé : admin@local.dev / admin123');
    } else {
        console.log('Compte admin déjà existant, rien à faire.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
