const express = require('express');
const { requireAdmin } = require('../middlewares/auth.middleware');
const prisma = require('../db/prisma');
const bcrypt = require('bcrypt');

const router = express.Router();

// Dashboard avec stats
router.get('/', requireAdmin, async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // count() : compte le nombre de lignes correspondant au filtre where
    const [totalEmployees, activeEmployees, sessionsToday, currentlyIn] = await Promise.all([
        prisma.user.count({ where: { role: 'employee' } }),
        prisma.user.count({ where: { role: 'employee', isActive: true } }),
        prisma.workSession.count({ where: { startTime: { gte: today } } }),
        prisma.workSession.count({ where: { endTime: null } }),
    ]);

    // findMany() : récupère plusieurs lignes — include charge la relation (JOIN automatique)
    const recentSessions = await prisma.workSession.findMany({
        include: { user: true },
        orderBy: { startTime: 'desc' },
        take: 10,
    });

    // findMany() avec where : filtre les sessions sans heure de fin (employés encore présents)
    const activeNow = await prisma.workSession.findMany({
        where: { endTime: null },
        include: { user: true },
        orderBy: { startTime: 'desc' },
    });

    res.render('admin/dashboard', {
        user: req.session.user,
        stats: { totalEmployees, activeEmployees, sessionsToday, currentlyIn },
        recentSessions,
        activeNow,
    });
});

// Liste des salariés
router.get('/employees', requireAdmin, async (req, res) => {
    // findMany() avec select : récupère uniquement les colonnes listées (pas tout le modèle)
    const employees = await prisma.user.findMany({
        where: { role: 'employee' },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, email: true, isActive: true },
    });

    res.render('admin/employees', { employees, user: req.session.user });
});

// Formulaire nouveau salarié
router.get('/employees/new', requireAdmin, (_req, res) => {
    res.render('admin/new-employee', { user: _req.session.user });
});

// Création salarié
router.post('/employees/new', requireAdmin, async (req, res) => {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    try {
        // create() : insère une nouvelle ligne — lève une erreur si l'email est déjà pris (contrainte unique)
        // create() : insère une nouvelle ligne — lève une erreur si l'email est déjà pris (contrainte unique)
        await prisma.user.create({
            data: { name, email, passwordHash: hash, role: 'employee' },
        });

        res.redirect('/admin/employees');
    } catch (err) {
        // P2002 = violation de contrainte unique (email déjà utilisé)
        const error = err.code === 'P2002'
            ? 'Cette adresse email est déjà utilisée.'
            : `Erreur lors de la création : ${err.message}`;

        console.error('Erreur création employé:', err);
        res.render('admin/new-employee', { user: req.session.user, error });
    }
});

// Pointages d'un salarié
router.get('/employees/:id/sessions', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    // findFirst() : récupère la première ligne correspondante (ou null si aucune)
    const employee = await prisma.user.findFirst({
        where: { id, role: 'employee' },
        select: { id: true, name: true, email: true, isActive: true },
    });

    if (!employee) return res.status(404).send('Salarié introuvable');

    // findMany() : récupère tous les pointages de cet employé
    const sessions = await prisma.workSession.findMany({
        where: { userId: id },
        orderBy: { startTime: 'desc' },
    });

    res.render('admin/employee-sessions', { employee, sessions, user: req.session.user });
});

// Désactiver un salarié
router.post('/employees/:id/disable', requireAdmin, async (req, res) => {
    // update() : modifie les colonnes listées dans data pour la ligne ciblée par where
    await prisma.user.update({
        where: { id: parseInt(req.params.id) },
        data: { isActive: false },
    });
    res.redirect('/admin/employees');
});

// Réactiver un salarié
router.post('/employees/:id/enable', requireAdmin, async (req, res) => {
    // update() : même principe, on repasse isActive à true
    await prisma.user.update({
        where: { id: parseInt(req.params.id) },
        data: { isActive: true },
    });
    res.redirect('/admin/employees');
});

// Tous les pointages
router.get('/sessions', requireAdmin, async (_req, res) => {
    // findMany() avec take : limite les résultats à 200 lignes (équivalent SQL LIMIT)
    const sessions = await prisma.workSession.findMany({
        include: { user: true },
        orderBy: { startTime: 'desc' },
        take: 200,
    });

        
    res.render('admin/sessions', { sessions, user: _req.session.user });
});


// afficher le planning d'un employé
router.get('/schedule/:userId', requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const employeeRole = await prisma.user.findFirst({
            where: { id: userId, role: 'employee' },
        });
        if (!employeeRole) return res.status(404).send('Employé introuvable');
        
        const weekStart = req.query.weekStart ? new Date(req.query.weekStart) : new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lundi de la semaine
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Dimanche de la semaine
        weekEnd.setHours(23, 59, 59, 999);

        const timeSchedule = await prisma.scheduleSlot.findMany({
            where: {
                userId,
                date: { gte: weekStart, lte: weekEnd },
            },
            orderBy: { date: 'asc' },
        });

        const restrictions = await prisma.employeeRestrictions.findUnique({
            where: { userId },
        });

        res.render('admin/schedule', { employeeRole, timeSchedule, restrictions, user: req.session.user });

    } catch (error) {
        console.error(error);
        res.status(404).send('Erreur lors de la récupération du planning');
    }
});

module.exports = router;
