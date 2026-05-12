const defaultPrisma = require('../db/prisma');

async function startSession(userId, prisma = defaultPrisma) {
  const existing = await prisma.workSession.findFirst({
    where: { userId, endTime: null },
  });
  if (existing) return null;

  return prisma.workSession.create({
    data: { userId, startTime: new Date() },
  });
}

async function getUserSessions(userId, prisma = defaultPrisma) {
  return prisma.workSession.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' },
  });
}

async function endSession(userId, prisma = defaultPrisma) {
  const session = await prisma.workSession.findFirst({
    where: { userId, endTime: null },
  });

  if (!session) return null;

  return prisma.workSession.update({
    where: { id: session.id },
    data: { endTime: new Date() },
  });
}

module.exports = {
  startSession,
  getUserSessions,
  endSession,
};
