const db = require('../db/database');

function startSession(userId) {
  const sql = `
    INSERT INTO work_sessions (user_id, start_time)
    VALUES (?, datetime('now'))
  `;

  return db.prepare(sql).run(userId);
}

function getUserSessions(userId) {
  const sql = `
    SELECT * FROM work_sessions
    WHERE user_id = ?
    ORDER BY start_time DESC
  `;

  return db.prepare(sql).all(userId);
}

function endSession(userId) {
  const sql = `
    UPDATE work_sessions
    SET end_time = datetime('now')
    WHERE user_id = ?
      AND end_time IS NULL
  `;

  return db.prepare(sql).run(userId);
}

module.exports = {
  startSession,
  getUserSessions,
  endSession
};