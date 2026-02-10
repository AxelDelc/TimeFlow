const bcrypt = require('bcrypt');
const db = require('./database');

const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

db.prepare(`
  INSERT INTO users (name, email, password_hash, role)
  VALUES (?, ?, ?, 'admin')
`).run('Admin', 'admin@local.dev', hash);

console.log('Admin créé');
