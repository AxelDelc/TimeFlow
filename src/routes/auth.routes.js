const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/database');
//const { use } = require('react');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('auth/login');
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
        return res.render('auth/login', { error: 'Utilisateur non trouvé' });
    }

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
        return res.render('auth/login', { error: 'Mot de passe incorrect' });
    }

    req.session.user = {
        id: user.id,
        role: user.role,
        name: user.name
    };

    res.redirect(user.role === 'admin' ? '/admin' : '/employee');

    if (user.is_active === 0) {
        return res.render('auth/login', {
            error: 'Compte désactivé'
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


module.exports = router;