const express = require('express');
const { requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', requireAdmin, (req, res) => {
    res.render('admin/dashboard', { user: req.session.user });
});

module.exports = router;