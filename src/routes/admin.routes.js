const express = require('express');
const { requireAdmin } = require('../middlewares/auth.middleware');
const prisma = require('../db/prisma');
const bcrypt = require('bcrypt');
const moment = require('moment');
moment.locale('fr');

const router = express.Router();

// Dashboard avec stats
router.get('/', requireAdmin, async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // compte le nombre de lignes correspondant au filtre where
  const [totalEmployees, activeEmployees, sessionsToday, currentlyIn] = await Promise.all([
    prisma.user.count({ where: { role: 'employee' } }),
    prisma.user.count({ where: { role: 'employee', isActive: true } }),
    prisma.workSession.count({ where: { startTime: { gte: today } } }),
    prisma.workSession.count({ where: { endTime: null } }),
  ]);

  // récupère plusieurs lignes et include charge la relation
  const recentSessions = await prisma.workSession.findMany({
    where: { user: { isActive: true } },
    include: { user: true },
    orderBy: { startTime: 'desc' },
    take: 10,
  });

  // sessions actives (endTime null) avec utilisateur actif
  const activeNow = await prisma.workSession.findMany({
    where: { endTime: null, user: { isActive: true } },
    include: { user: true },
    orderBy: { startTime: 'desc' },
  });

  const fmt = (d) => (d ? moment(d).format('DD/MM à HH[h]mm') : null);

  res.render('admin/dashboard', {
    user: req.session.user,
    stats: { totalEmployees, activeEmployees, sessionsToday, currentlyIn },
    recentSessions: recentSessions.map((s) => ({
      ...s,
      startTime: fmt(s.startTime),
      endTime: fmt(s.endTime),
    })),
    activeNow: activeNow.map((s) => ({
      ...s,
      startTime: moment(s.startTime).format('HH[h]mm'),
    })),
  });
});

// Liste des salariés
router.get('/employees', requireAdmin, async (req, res) => {
  // récupère uniquement les colonnes listées
  const employees = await prisma.user.findMany({
    where: { role: 'employee' },
    orderBy: { name: 'asc' },
    select: { idUser: true, name: true, email: true, isActive: true },
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
    await prisma.user.create({
      data: { name, email, passwordHash: hash, role: 'employee' },
    });

    res.redirect('/admin/employees');
  } catch (err) {
    const error =
      err.code === 'P2002'
        ? 'Cette adresse email est déjà utilisée.'
        : `Erreur lors de la création : ${err.message}`;

    console.error('Erreur création employé:', err);
    res.render('admin/new-employee', { user: req.session.user, error });
  }
});

// Désactiver un salarié
router.post('/employees/:id/disable', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);

  await prisma.$transaction([
    prisma.workSession.updateMany({
      where: { userId: id, endTime: null },
      data: { endTime: new Date() },
    }),
    prisma.user.update({
      where: { idUser: id },
      data: { isActive: false },
    }),
  ]);

  res.redirect('/admin/employees');
});

// Réactiver un salarié
router.post('/employees/:id/enable', requireAdmin, async (req, res) => {
  // update() : même principe, on repasse isActive à true
  await prisma.user.update({
    where: { idUser: parseInt(req.params.id) },
    data: { isActive: true },
  });
  res.redirect('/admin/employees');
});

// Tous les pointages
router.get('/sessions', requireAdmin, async (_req, res) => {
  const raw = await prisma.workSession.findMany({
    include: { user: true },
    orderBy: { startTime: 'desc' },
  });

  const grouped = {};
  raw.forEach((s) => {
    if (!grouped[s.userId]) grouped[s.userId] = { employee: s.user, sessions: [] };
    grouped[s.userId].sessions.push({
      ...s,
      startTime: moment(s.startTime).format('DD/MM/YYYY à HH[h]mm'),
      endTime: s.endTime ? moment(s.endTime).format('DD/MM/YYYY à HH[h]mm') : null,
    });
  });

  res.render('admin/sessions', { grouped: Object.values(grouped), user: _req.session.user });
});

// afficher le planning d'un employé
router.get('/schedule/:userId', requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const employeeRole = await prisma.user.findFirst({
      where: { idUser: userId, role: 'employee' },
    });
    if (!employeeRole) return res.status(404).send('Employé introuvable');

    const dateStr = req.query.weekStart || new Date().toISOString().split('T')[0];
    const [y, m, d] = dateStr.split('-').map(Number);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const weekStart = new Date(Date.UTC(y, m - 1, d + mondayOffset));
    const weekEnd = new Date(Date.UTC(y, m - 1, d + mondayOffset + 6, 23, 59, 59, 999));

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

    res.render('admin/schedule', {
      employee: employeeRole,
      timeSchedule,
      restrictions,
      weekStart,
      user: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send('Erreur lors de la récupération du planning');
  }
});

// Demandes de changement de planning
router.get('/change-requests', requireAdmin, async (req, res) => {
  const raw = await prisma.scheduleChangeRequest.findMany({
    where: { status: 'pending' },
    include: { user: true, originalSlot: true },
    orderBy: { createdAt: 'asc' },
  });

  const fmt = (d) => moment(d).format('DD/MM à HH[h]mm');
  const requests = raw.map((r) => ({
    ...r,
    originalSlot: {
      date: moment(r.originalSlot.date).format('DD/MM/YYYY'),
      startTime: fmt(r.originalSlot.startTime),
      endTime: fmt(r.originalSlot.endTime),
    },
    newDate: moment(r.newDate).format('DD/MM/YYYY'),
    newStartTime: fmt(r.newStartTime),
    newEndTime: fmt(r.newEndTime),
    createdAt: moment(r.createdAt).format('DD/MM à HH[h]mm'),
  }));

  res.render('admin/change-requests', { requests, user: req.session.user });
});

router.post('/change-requests/:id/approve', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const request = await prisma.scheduleChangeRequest.update({
    where: { idRequest: id },
    data: { status: 'approved' },
  });
  await prisma.scheduleSlot.update({
    where: { idSlot: request.originalSlotId },
    data: { date: request.newDate, startTime: request.newStartTime, endTime: request.newEndTime },
  });
  res.redirect('/admin/change-requests');
});

router.post('/change-requests/:id/reject', requireAdmin, async (req, res) => {
  await prisma.scheduleChangeRequest.update({
    where: { idRequest: parseInt(req.params.id) },
    data: { status: 'rejected' },
  });
  res.redirect('/admin/change-requests');
});

module.exports = router;
