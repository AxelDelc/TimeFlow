const express = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const WorkSession = require('../models/workSession.model');
const prisma =require('../db/prisma');

const router = express.Router();

// Dashboard de l'employé
router.get('/', requireAuth, async (req, res) => {
    const sessions = await WorkSession.getUserSessions(req.session.user.id);
    res.render('employee/dashboard', { sessions, user: req.session.user });
});

// Démarrer une session de travail
router.post('/start', requireAuth, async (req, res) => {
    await WorkSession.startSession(req.session.user.id);
    res.redirect('/employee');
});

// Terminer une session de travail
router.post('/end', requireAuth, async (req, res) => {
    await WorkSession.endSession(req.session.user.id);
    res.redirect('/employee');
});

// Consulter le planning de la semaine
router.get('/schedule', requireAuth, async (req, res) => {
    const userId = req.session.user.id;
    const timeSchedule = await prisma.scheduleSlot.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
    });
    res.render('employee/schedule', { timeSchedule, user: req.session.user });
})

// Déclarer ses heures supplémentaires
router.post('/overtime', requireAuth, async (req, res) => {
    const userId = req.session.user.id;
    const { date, startTime, endTime, reason, comment } = req.body;
    try {
        await prisma.overtimeDeclaration.create({
            data: {
                userId,
                date: new Date(date),
                startTime: new Date(`${date}T${startTime}`),
                endTime: new Date(`${date}T${endTime}`),
                reason,
                comment,
            }
        });
        res.redirect('/employee');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la déclaration des heures supplémentaires');
    }
});

// Demande de changement de planning 
router.post('/schedule/change-request', requireAuth, async (req, res) => {
    const userId = req.session.user.id;
    const { originalSlotId, newDate, newStartTime, newEndTime, employeeMessage } = req.body;
    try {
        await prisma.scheduleChangeRequest.create({
            data: {
                userId,
                originalSlotId: parseInt(originalSlotId),
                newDate: new Date(newDate),
                newStartTime: new Date(`${newDate}T${newStartTime}`),
                newEndTime: new Date(`${newDate}T${newEndTime}`),
                employeeMessage,
            }
        });
        res.redirect('/employee');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la demande de changement de planning');
    }
});

module.exports = router;

