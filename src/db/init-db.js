const db = require('./database');
const fs = require('fs');
const path = require('path');

const schema = fs.readFileSync(
    path.join(__dirname, 'schema.sql'),
    'utf8'
);

db.exec(schema);

// Migration : ajoute is_active si la colonne n'existe pas encore
try {
    db.exec(`ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1`);
} catch (e) {
    // Colonne déjà présente, rien à faire
}

console.log('Base de données initialisée');
