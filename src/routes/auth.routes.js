const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../db/prisma');

const router = express.Router();

router.get('/login', (_req, res) => {
    res.render('auth/login');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return res.render('auth/login', { error: 'Utilisateur non trouvé' });
    }

    if (!user.isActive) {
        return res.render('auth/login', { error: 'Compte désactivé' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return res.render('auth/login', { error: 'Mot de passe incorrect' });
    }

    req.session.user = {
        id: user.id,
        role: user.role,
        name: user.name
    };

    res.redirect(user.role === 'admin' ? '/admin' : '/employee');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
