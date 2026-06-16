const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../db/prisma');

const router = express.Router();

router.get('/setup', async (req, res) => {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (admin) return res.redirect('/login');
  res.render('auth/setup', { error: undefined });
});

router.post('/setup', async (req, res) => {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (admin) return res.redirect('/login');

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render('auth/setup', { error: 'Tous les champs sont obligatoires.' });
  }

  if (password.length < 8) {
    return res.render('auth/setup', { error: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, passwordHash: hash, role: 'admin' },
    });
    res.redirect('/login');
  } catch (err) {
    const error =
      err.code === 'P2002'
        ? 'Cette adresse email est déjà utilisée.'
        : 'Une erreur est survenue lors de la création du compte.';
    res.render('auth/setup', { error });
  }
});

module.exports = router;