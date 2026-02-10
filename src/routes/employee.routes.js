const express = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
    res.send(`Bienvenue ${req.session.user.name} (salarié)`);
});

module.exports = router;
