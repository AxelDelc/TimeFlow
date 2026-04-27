const prisma = require('../db/prisma');

function validateSlotHours(startTime, endTime) {
  const startHour = startTime.getHours() + startTime.getMinutes() / 60;
  const endHour = endTime.getHours() + endTime.getMinutes() / 60;

  if (startHour < 7) {
    return "Le créneau ne peut pas commencer avant 07:00.";
  }

  if (endHour > 20) {
    return "Le créneau ne peut pas se terminer après 20:00.";
  }

  return null;
}

function validateConsecutiveHours(startTime, endTime, maxHours) {
  const durationInHours = (endTime - startTime) / 1000 / 60 / 60;

  if (durationInHours > maxHours) {
    return `Le créneau ne peut pas durer plus de ${maxHours} heures consécutives.`;
  }

  return null;
}

async function validateWeeklyHours(userId, weekStart, weekEnd, newSlotDuration) {
    const restrictions = await prisma.employeeRestrictions.findUnique({
        where: { userId },
    });
    const weeklyTarget = restrictions ? restrictions.weeklyHoursTarget : 35;

    const slots = await prisma.scheduleSlot.findMany({
        where: {
            userId,
            type: 'work',
            date: { gte: weekStart, lte: weekEnd },
        },
    });

    const existingHours = slots.reduce((sum, slot) => {
        return sum + (slot.endTime - slot.startTime) / 1000 / 60 / 60;
    }, 0);

    if (existingHours + newSlotDuration > weeklyTarget) {
        return `L'employé ne peut pas dépasser ${weeklyTarget}h de travail par semaine.`;
    }

    return null;
}

module.exports = {
  validateSlotHours,
  validateConsecutiveHours,
  validateWeeklyHours,
};
