const { startSession, endSession, getUserSessions } = require('../../src/models/workSession.model');

const mockPrisma = {
  workSession: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
};

beforeEach(() => vi.clearAllMocks());

// startSession

describe('startSession', () => {
  it("crée une session si aucune n'est active", async () => {
    mockPrisma.workSession.findFirst.mockResolvedValue(null);
    mockPrisma.workSession.create.mockResolvedValue({
      id: 1,
      userId: 42,
      startTime: new Date(),
      endTime: null,
    });

    const result = await startSession(42, mockPrisma);

    expect(mockPrisma.workSession.findFirst).toHaveBeenCalledWith({
      where: { userId: 42, endTime: null },
    });
    expect(mockPrisma.workSession.create).toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it("retourne null et n'appelle pas create si une session est déjà active", async () => {
    mockPrisma.workSession.findFirst.mockResolvedValue({
      id: 1,
      userId: 42,
      startTime: new Date(),
      endTime: null,
    });

    const result = await startSession(42, mockPrisma);

    expect(mockPrisma.workSession.create).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

// endSession

describe('endSession', () => {
  it('met à jour la session active avec une endTime', async () => {
    const activeSession = { idSession: 5, userId: 42, startTime: new Date(), endTime: null };
    mockPrisma.workSession.findFirst.mockResolvedValue(activeSession);
    mockPrisma.workSession.update.mockResolvedValue({ ...activeSession, endTime: new Date() });

    const result = await endSession(42, mockPrisma);

    expect(mockPrisma.workSession.update).toHaveBeenCalledWith({
      where: { idSession: 5 },
      data: expect.objectContaining({ endTime: expect.any(Date) }),
    });
    expect(result.endTime).toBeInstanceOf(Date);
  });

  it("retourne null et n'appelle pas update si aucune session n'est active", async () => {
    mockPrisma.workSession.findFirst.mockResolvedValue(null);

    const result = await endSession(42, mockPrisma);

    expect(mockPrisma.workSession.update).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

// getUserSessions

describe('getUserSessions', () => {
  it('retourne les sessions triées par date décroissante', async () => {
    const sessions = [
      { id: 2, userId: 42, startTime: new Date('2024-01-02'), endTime: null },
      { id: 1, userId: 42, startTime: new Date('2024-01-01'), endTime: new Date('2024-01-01') },
    ];
    mockPrisma.workSession.findMany.mockResolvedValue(sessions);

    const result = await getUserSessions(42, mockPrisma);

    expect(mockPrisma.workSession.findMany).toHaveBeenCalledWith({
      where: { userId: 42 },
      orderBy: { startTime: 'desc' },
    });
    expect(result).toEqual(sessions);
  });

  it("retourne un tableau vide si l'utilisateur n'a aucune session", async () => {
    mockPrisma.workSession.findMany.mockResolvedValue([]);

    const result = await getUserSessions(99, mockPrisma);

    expect(result).toHaveLength(0);
  });
});
