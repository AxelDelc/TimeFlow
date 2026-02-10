const express = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const WorkSession = require('../models/workSession.model');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
    const sessions = await WorkSession.getUserSessions(req.session.user.id);
    res.render('employee/dashboard', { sessions });
});

router.post('/start', requireAuth, async (req, res) => {
    await WorkSession.startSession(req.session.user.id);
    res.redirect('/employee');
});

router.post('/end', requireAuth, async (req, res) => {
    await WorkSession.endSession(req.session.user.id);
    res.redirect('/employee');
});

module.exports = router;

