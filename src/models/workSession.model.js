const prisma = require('../db/prisma');

async function startSession(userId) {
  return prisma.workSession.create({
    data: {
      userId,
      startTime: new Date(),
    },
  });
}

async function getUserSessions(userId) {
  return prisma.workSession.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' },
  });
}

async function endSession(userId) {
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
