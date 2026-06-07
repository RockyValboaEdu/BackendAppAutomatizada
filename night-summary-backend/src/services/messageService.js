const db = require('../db/database');

function isNightTime(dateString) {
  const hour = new Date(dateString).getHours();
  return hour >= 22 || hour < 7;
}

async function saveMessage({ platform, sender_id, sender_name, content }) {
  const received_at = new Date().toISOString();
  const is_night = isNightTime(received_at) ? 1 : 0;

  await db.execute({
    sql: `INSERT INTO messages (platform, sender_id, sender_name, content, received_at, is_night)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [platform, sender_id, sender_name, content, received_at, is_night]
  });

  console.log(`[${platform}] Mensaje guardado de ${sender_name || sender_id}`);
}

async function getPendingNightMessages() {
  const result = await db.execute(`
    SELECT * FROM messages WHERE is_night = 1 AND summarized = 0
    ORDER BY platform, received_at ASC
  `);
  return result.rows;
}

async function markAsSummarized(ids) {
  for (const id of ids) {
    await db.execute({
      sql: `UPDATE messages SET summarized = 1 WHERE id = ?`,
      args: [id]
    });
  }
}

async function saveSummary(content) {
  await db.execute({
    sql: `INSERT INTO summaries (date, content, created_at) VALUES (?, ?, ?)`,
    args: [
      new Date().toISOString().split('T')[0],
      content,
      new Date().toISOString()
    ]
  });
}

async function getLatestSummary() {
  const result = await db.execute(`
    SELECT * FROM summaries ORDER BY created_at DESC LIMIT 1
  `);
  return result.rows[0] || null;
}

function getFriendlySenderName(platform, sender_id) {
  return `${platform.charAt(0).toUpperCase() + platform.slice(1)} Usuario`;
}

async function getPendingAllMessages() {
  const result = await db.execute(`
    SELECT * FROM messages WHERE summarized = 0
    ORDER BY platform, received_at ASC
  `);
  return result.rows;
}

module.exports = {
  saveMessage,
  getPendingNightMessages,
  getPendingAllMessages,
  markAsSummarized,
  saveSummary,
  getLatestSummary,
  getFriendlySenderName
};