const express = require("express");
const { requireAdmin } = require("../middlewares/auth.middleware");
const {
  validateSlotHours,
  validateConsecutiveHours,
  validateWeeklyHours,
} = require("../services/schedule.service");
const prisma = require("../db/prisma");

const router = express.Router();

// Récupérer les créneaux d'une semaine pour un employé
router.get("/schedule/:userId/week", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const weekStart = new Date(req.query.weekStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const slots = await prisma.scheduleSlot.findMany({
    where: {
      userId,
      date: { gte: weekStart, lte: weekEnd },
    },
    orderBy: { date: "asc" },
  });
  return res.json(slots);
});

// Ajouter un créneau pour un employé
router.post("/schedule/:userId/slot", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { date, startTime, endTime, type } = req.body;

  const [y, m, d] = date.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const weekStart = new Date(Date.UTC(y, m - 1, d + mondayOffset));
  const weekEnd = new Date(Date.UTC(y, m - 1, d + mondayOffset + 6, 23, 59, 59, 999));

  const startDate = new Date(`${date}T${startTime}:00Z`);
  const endDate = new Date(`${date}T${endTime}:00Z`);
  const newSlotInHours = (endDate - startDate) / 1000 / 60 / 60;

  const slotError = validateSlotHours(startDate, endDate);
  if (slotError != null) {
    return res.status(400).json({ error: slotError });
  }

  const maxHours = await prisma.employeeRestrictions
    .findUnique({
      where: { userId },
    })
    .then((restrictions) =>
      restrictions ? restrictions.maxConsecutiveHours : 8,
    );

  try {
    if (type === "work") {
      const consecutiveError = validateConsecutiveHours(
        startDate,
        endDate,
        maxHours,
      );
      if (consecutiveError != null) {
        return res.status(400).json({ error: consecutiveError });
      }
      const weeklyError = await validateWeeklyHours(
        userId,
        weekStart,
        weekEnd,
        newSlotInHours,
      );
      if (weeklyError != null) {
        return res.status(400).json({ error: weeklyError });
      }
    }
    const newSlot = await prisma.scheduleSlot.create({
      data: {
        userId,
        date: new Date(date),
        startTime: startDate,
        endTime: endDate,
        type,
      },
    });
    return res.json(newSlot);
  } catch (error) {
    console.error("Erreur lors de la création du créneau:", error);
    return res.status(500).json({ error: "Erreur lors de la création du créneau" });
  }
});

// Récupérer les restrictions d'un employé
router.get("/schedule/:userId/restrictions", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const restrictions = await prisma.employeeRestrictions.findUnique({
    where: { userId },
  });
  return res.json(restrictions);
});

// Mettre à jour les restrictions d'un employé
router.put("/schedule/:userId/restrictions", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { weeklyHoursTarget, maxConsecutiveHours, notes } = req.body;

  try {
    const updatedRestrictions = await prisma.employeeRestrictions.upsert({
      where: { userId },
      update: { weeklyHoursTarget, maxConsecutiveHours, notes },
      create: { userId, weeklyHoursTarget, maxConsecutiveHours, notes },
    });
    return res.json(updatedRestrictions);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des restrictions de l'employé:", error);
    return res.status(500).json({ error: "Erreur lors de la mise à jour des restrictions de l'employé" });
  }
});

// Supprimer un créneau
router.delete("/schedule/slot/:slotId", requireAdmin, async (req, res) => {
  const slotId = parseInt(req.params.slotId);
  const slot = await prisma.scheduleSlot.findUnique({ where: { id: slotId } });

  if (!slot) {
    return res.status(404).json({ error: "Créneau non trouvé" });
  }
  try {
    await prisma.scheduleSlot.delete({ where: { id: slotId } });
    return res.json({ message: "Créneau supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du créneau:", error);
    return res.status(500).json({ error: "Erreur lors de la suppression du créneau" });
  }
});

//Lister les heures supplémentaires d'un employé
router.get("/schedule/:userId/overtime", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const overtimeEntrys = await prisma.overtimeDeclaration.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
  return res.json(overtimeEntrys);
});

//Déclarer une heure supplémentaire
router.post("/schedule/:userId/overtime", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  const { date, startTime, endTime, reason, comment } = req.body;
  try {
    const overtimeEntry = await prisma.overtimeDeclaration.create({
      data: {
        userId,
        date: new Date(date),
        startTime: new Date(`${date}T${startTime}`),
        endTime: new Date(`${date}T${endTime}`),
        reason,
        comment,
      },
    });
    return res.json(overtimeEntry);
  } catch (error) {
    console.error("Erreur lors de la création de la déclaration d'heure supplémentaire:", error);
    return res.status(500).json({ error: "Erreur lors de la création de la déclaration d'heure supplémentaire" });
  }
});


// Supprimer une déclaration d'heure supplémentaire
router.delete("/schedule/overtime/:overtimeId", requireAdmin, async (req, res) => {
    const overtimeId = parseInt(req.params.overtimeId);
    const overtimeEntry = await prisma.overtimeDeclaration.findUnique({
      where: { id: overtimeId },
    });
    if (!overtimeEntry) {
      return res.status(404).json({ error: "Déclaration d'heure supplémentaire non trouvée" });
    }
    try {
      await prisma.overtimeDeclaration.delete({ where: { id: overtimeId } });
      return res.json({ message: "Déclaration d'heure supplémentaire supprimée avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression de la déclaration d'heure supplémentaire:", error);
      return res.status(500).json({ error: "Erreur lors de la suppression de la déclaration d'heure supplémentaire" });
    }
});


// Récupérer les demandes de changement de planning
router.get("/schedule/:userId/change-requests", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const requests = await prisma.scheduleChangeRequest.findMany({
      where: { userId },
        orderBy: { createdAt: "desc" },
    });
    return res.json(requests);
});


//Accepter ou refuser une demande de changement de planning
router.put("/schedule/:requestId/change-requests", requireAdmin, async (req, res) => {
    const requestId = parseInt(req.params.requestId);
    const { status, adminMessage } = req.body;
    try {      
        const updatedRequest = await prisma.scheduleChangeRequest.update({
        where: { id: requestId },
        data: {
          status,
          adminMessage,
        },
      });
        if (status === "approved") {
            const originalSlot = await prisma.scheduleSlot.findUnique({ where: { id: updatedRequest.originalSlotId } });
            if (originalSlot) {
                await prisma.scheduleSlot.update({
                    where: { id: updatedRequest.originalSlotId },
                    data: {
                        date: updatedRequest.newDate,
                        startTime: updatedRequest.newStartTime,
                        endTime: updatedRequest.newEndTime,
                    },
                });
            }
        }
      return res.json(updatedRequest);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la demande de changement de planning:", error);
      return res.status(500).json({ error: "Erreur lors de la mise à jour de la demande de changement de planning" });
    }
});

module.exports = router;
