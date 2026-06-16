const prisma = require('../db/prisma');

let adminExists = false;

async function requireSetupComplete(req, res, next) {
  if (adminExists) return next();

  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (admin) {
    adminExists = true;
    return next();
  }

  if (req.path === '/setup') return next();
  return res.redirect('/setup');
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Accès refusé');
  }
  next();
}

module.exports = {
  requireSetupComplete,
  requireAuth,
  requireAdmin,
};
