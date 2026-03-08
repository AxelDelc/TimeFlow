const express = require('express');
const { requireAdmin } = require('../middlewares/auth.middleware');
const db = require('../db/database');
const bcrypt = require('bcrypt');

const router = express.Router();

// Dashboard avec stats
router.get('/', requireAdmin, (req, res) => {
    const stats = {
        totalEmployees: db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'employee'`).get().c,
        activeEmployees: db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'employee' AND is_active = 1`).get().c,
        sessionsToday: db.prepare(`SELECT COUNT(*) as c FROM work_sessions WHERE date(start_time) = date('now')`).get().c,
        currentlyIn: db.prepare(`SELECT COUNT(*) as c FROM work_sessions WHERE end_time IS NULL`).get().c,
    };

    const recentSessions = db.prepare(`
        SELECT ws.*, u.name as employee_name
        FROM work_sessions ws
        JOIN users u ON ws.user_id = u.id
        ORDER BY ws.start_time DESC
        LIMIT 10
    `).all();

    const activeNow = db.prepare(`
        SELECT u.name, ws.start_time
        FROM work_sessions ws
        JOIN users u ON ws.user_id = u.id
        WHERE ws.end_time IS NULL
        ORDER BY ws.start_time DESC
    `).all();

    res.render('admin/dashboard', {
        user: req.session.user,
        stats,
        recentSessions,
        activeNow,
    });
});

// Liste des salariés
router.get('/employees', requireAdmin, (req, res) => {
    const employees = db.prepare(`
        SELECT id, name, email, is_active
        FROM users
        WHERE role = 'employee'
        ORDER BY name ASC
    `).all();

    res.render('admin/employees', { employees, user: req.session.user });
});

// Formulaire nouveau salarié
router.get('/employees/new', requireAdmin, (req, res) => {
    res.render('admin/new-employee', { user: req.session.user });
});

// Création salarié
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
        res.render('admin/new-employee', {
            user: req.session.user,
            error: 'Cette adresse email est déjà utilisée.'
        });
    }
});

// Pointages d'un salarié
router.get('/employees/:id/sessions', requireAdmin, (req, res) => {
    const { id } = req.params;
    const employee = db.prepare(`
        SELECT id, name, email, is_active FROM users WHERE id = ? AND role = 'employee'
    `).get(id);

    if (!employee) return res.status(404).send('Salarié introuvable');

    const sessions = db.prepare(`
        SELECT * FROM work_sessions WHERE user_id = ? ORDER BY start_time DESC
    `).all(id);

    res.render('admin/employee-sessions', { employee, sessions, user: req.session.user });
});

// Désactiver un salarié
router.post('/employees/:id/disable', requireAdmin, (req, res) => {
    db.prepare(`UPDATE users SET is_active = 0 WHERE id = ?`).run(req.params.id);
    res.redirect('/admin/employees');
});

// Réactiver un salarié
router.post('/employees/:id/enable', requireAdmin, (req, res) => {
    db.prepare(`UPDATE users SET is_active = 1 WHERE id = ?`).run(req.params.id);
    res.redirect('/admin/employees');
});

// Tous les pointages
router.get('/sessions', requireAdmin, (req, res) => {
    const sessions = db.prepare(`
        SELECT ws.*, u.name as employee_name
        FROM work_sessions ws
        JOIN users u ON ws.user_id = u.id
        ORDER BY ws.start_time DESC
        LIMIT 200
    `).all();

    res.render('admin/sessions', { sessions, user: req.session.user });
});

module.exports = router;
