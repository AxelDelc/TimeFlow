const {
  validateSlotHours,
  validateConsecutiveHours,
  validateWeeklyHours,
} = require('../../src/services/schedule.service');

const mockPrisma = {
  employeeRestrictions: { findUnique: vi.fn() },
  scheduleSlot: { findMany: vi.fn() },
};

beforeEach(() => vi.clearAllMocks());

// validateSlotHours

describe('validateSlotHours', () => {
  it('accepte un créneau dans la plage 7h–20h', () => {
    expect(
      validateSlotHours(new Date('2024-01-01T09:00:00Z'), new Date('2024-01-01T17:00:00Z'))
    ).toBeNull();
  });

  it('accepte exactement les limites 7h et 20h', () => {
    expect(
      validateSlotHours(new Date('2024-01-01T07:00:00Z'), new Date('2024-01-01T20:00:00Z'))
    ).toBeNull();
  });

  it('rejette un début avant 7h', () => {
    expect(
      validateSlotHours(new Date('2024-01-01T06:30:00Z'), new Date('2024-01-01T14:00:00Z'))
    ).toMatch(/07:00/);
  });

  it('rejette une fin après 20h', () => {
    expect(
      validateSlotHours(new Date('2024-01-01T10:00:00Z'), new Date('2024-01-01T20:30:00Z'))
    ).toMatch(/20:00/);
  });
});

// validateConsecutiveHours

describe('validateConsecutiveHours', () => {
  it('accepte une durée inférieure à la limite', () => {
    expect(
      validateConsecutiveHours(
        new Date('2024-01-01T09:00:00Z'),
        new Date('2024-01-01T15:00:00Z'), // 6h
        8
      )
    ).toBeNull();
  });

  it('accepte une durée exactement égale à la limite', () => {
    expect(
      validateConsecutiveHours(
        new Date('2024-01-01T09:00:00Z'),
        new Date('2024-01-01T17:00:00Z'), // 8h = max
        8
      )
    ).toBeNull();
  });

  it('rejette une durée dépassant la limite', () => {
    const result = validateConsecutiveHours(
      new Date('2024-01-01T08:00:00Z'),
      new Date('2024-01-01T18:00:00Z'), // 10h > 8h max
      8
    );
    expect(result).not.toBeNull();
    expect(result).toMatch(/8/);
  });
});

// validateWeeklyHours

describe('validateWeeklyHours', () => {
  const weekStart = new Date('2024-01-01T00:00:00Z');
  const weekEnd = new Date('2024-01-07T23:59:59Z');
  const userId = 1;

  it('accepte si le total hebdo reste sous la cible', async () => {
    mockPrisma.employeeRestrictions.findUnique.mockResolvedValue({ weeklyHoursTarget: 35 });
    mockPrisma.scheduleSlot.findMany.mockResolvedValue([
      { startTime: new Date('2024-01-01T08:00:00Z'), endTime: new Date('2024-01-01T16:00:00Z') }, // 8h
    ]);
    // 8h existant + 6h nouveau = 14h < 35h
    expect(await validateWeeklyHours(userId, weekStart, weekEnd, 6, mockPrisma)).toBeNull();
  });

  it('rejette si le total hebdo dépasse la cible', async () => {
    mockPrisma.employeeRestrictions.findUnique.mockResolvedValue({ weeklyHoursTarget: 35 });
    // 4 × 8h = 32h existant
    mockPrisma.scheduleSlot.findMany.mockResolvedValue(
      Array.from({ length: 4 }, (_, i) => ({
        startTime: new Date(`2024-01-0${i + 1}T08:00:00Z`),
        endTime: new Date(`2024-01-0${i + 1}T16:00:00Z`),
      }))
    );
    // 32h + 5h = 37h > 35h
    const result = await validateWeeklyHours(userId, weekStart, weekEnd, 5, mockPrisma);
    expect(result).not.toBeNull();
    expect(result).toMatch(/35/);
  });

  it("utilise 35h par défaut si aucune restriction n'est définie", async () => {
    mockPrisma.employeeRestrictions.findUnique.mockResolvedValue(null);
    mockPrisma.scheduleSlot.findMany.mockResolvedValue([]);
    // 0h + 34h = 34h < 35h (défaut)
    expect(await validateWeeklyHours(userId, weekStart, weekEnd, 34, mockPrisma)).toBeNull();
  });

  it('rejette même sans restriction si 35h par défaut est dépassé', async () => {
    mockPrisma.employeeRestrictions.findUnique.mockResolvedValue(null);
    mockPrisma.scheduleSlot.findMany.mockResolvedValue([]);
    // 0h + 36h > 35h
    expect(await validateWeeklyHours(userId, weekStart, weekEnd, 36, mockPrisma)).not.toBeNull();
  });
});
