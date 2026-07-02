const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const employeeRoutes = require('./routes/employee.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const setupRoutes = require('./routes/setup.routes');
const { requireSetupComplete, requireAuth } = require('./middlewares/auth.middleware');

const app = express();

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middlewares globaux
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-later',
    resave: false,
    saveUninitialized: false,
  })
);

// Garde : redirige vers /setup si aucun admin n'existe
app.use(requireSetupComplete);

// Routes setup
app.use(setupRoutes);

// Route auth
app.use(authRoutes);

//Routes admin
app.use('/admin', adminRoutes);

//Routes employées
app.use('/employee', employeeRoutes);

// Routes planning (admin)
app.use('/admin', scheduleRoutes);

app.get('/', (req, res) => {
  res.render('home', { user: req.session?.user ?? null });
});

app.get('/privacy', requireAuth, (req, res) => {
  res.render('privacy', { user: req.session.user, pageTitle: 'Confidentialité', currentPage: 'privacy' });
});

module.exports = app;
