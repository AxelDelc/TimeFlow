const db = require('../db/database');

function startSession(userId) {
    const sql = `
    INSERT INTO work_sessions (user_id, start_time)
    VALUES (?, datetime('now'))
  `;
    return db.run(sql, [userId]);
}

function endSession(userId) {
    const sql = `
    UPDATE work_sessions
    SET 
      end_time = datetime('now'),
      duration = CAST(
        (julianday(datetime('now')) - julianday(start_time)) * 24 * 60
      AS INTEGER)
    WHERE user_id = ?
      AND end_time IS NULL
  `;
    return db.run(sql, [userId]);
}

function getUserSessions(userId) {
    const sql = `
    SELECT * FROM work_sessions
    WHERE user_id = ?
    ORDER BY start_time DESC
  `;
    return db.all(sql, [userId]);
}

module.exports = {
    startSession,
    endSession,
    getUserSessions
};
