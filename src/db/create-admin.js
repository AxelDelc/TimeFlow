const bcrypt = require('bcrypt');
const db = require('./database');

//  infos temporaires
const name = 'Admin';
const email = 'admin@local.dev';
const password = 'admin123';
const passwordHash = bcrypt.hashSync(password, 10);

// insertion en DB
db.prepare(`
  INSERT INTO users (name, email, password_hash, role)
  VALUES (?, ?, ?, 'admin')
`).run(name, email, passwordHash);

console.log('Admin créé avec succès');
