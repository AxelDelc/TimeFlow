const express = require('express');
const { requireAdmin } = require('../middlewares/auth.middleware');
const db = require('../db/database');
const bcrypt = require('bcrypt');

const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
    res.render('admin/dashboard', {
        user: req.session.user
    });
});

// liste salariés
router.get('/employees', requireAdmin, (req, res) => {
    const employees = db.prepare(`
    SELECT id, name, email, is_active
    FROM users
    WHERE role = 'employee'
  `).all();

    res.render('admin/employees', { employees });
});

// formulaire
router.get('/employees/new', requireAdmin, (req, res) => {
    res.render('admin/new-employee');
});

// création
router.post('/employees/new', requireAdmin, (req, res) => {
    const { name, email, password } = req.body;

    const hash = bcrypt.hashSync(password, 10);

    try {
        db.prepare(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (?, ?, ?, 'employee')
    `).run(name, email, hash);

        res.redirect('/admin/employees');
    } catch (err) {
        res.send('Erreur : email déjà utilisé');
    }
});

router.post('/employees/:id/disable', requireAdmin, (req, res) => {
    const { id } = req.params;

    db.prepare(`
    UPDATE users
    SET is_active = 0
    WHERE id = ?
  `).run(id);

    res.redirect('/admin/employees');
});

module.exports = router;
