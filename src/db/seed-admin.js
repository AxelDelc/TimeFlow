const bcrypt = require('bcrypt');
const db = require('./database');

const existing = db.prepare(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`).get();

if (!existing) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES ('Admin', 'admin@local.dev', ?, 'admin')
    `).run(hash);
    console.log('Compte admin créé : admin@local.dev / admin123');
} else {
    console.log('Compte admin déjà existant, rien à faire.');
}
