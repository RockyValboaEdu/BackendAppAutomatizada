// src/services/messageService.js
const db = require('../db/database');

// Determina si una hora es "nocturna" (10pm - 7am)
function isNightTime(dateString) {
  const hour = new Date(dateString).getHours();
  return hour >= 22 || hour < 7;
}

// Guarda un men    saje entrante
function saveMessage({ platform, sender_id, sender_name, content }) {
  const received_at = new Date().toISOString();
  const is_night = isNightTime(received_at) ? 1 : 0;

  const stmt = db.prepare(`
    INSERT INTO messages (platform, sender_id, sender_name, content, received_at, is_night)
    VALUES (@platform, @sender_id, @sender_name, @content, @received_at, @is_night)
  `);

  stmt.run({ platform, sender_id, sender_name, content, received_at, is_night });
  console.log(`[${platform}] Mensaje guardado de ${sender_name || sender_id}`);
}

// Trae todos los mensajes nocturnos aún no resumidos
function getPendingNightMessages() {
  return db.prepare(`
    SELECT * FROM messages
    WHERE is_night = 1 AND summarized = 0
    ORDER BY platform, received_at ASC
  `).all();
}

// Marca mensajes como ya resumidos
function markAsSummarized(ids) {
  const stmt = db.prepare(`UPDATE messages SET summarized = 1 WHERE id = ?`);
  ids.forEach(id => stmt.run(id));
}

// Guarda el resumen generado por IA
function saveSummary(content) {
  db.prepare(`
    INSERT INTO summaries (date, content, created_at)
    VALUES (?, ?, ?)
  `).run(
    new Date().toISOString().split('T')[0],
    content,
    new Date().toISOString()
  );
}

// Trae el resumen más reciente (lo que verá la app)
function getLatestSummary() {
  return db.prepare(`
    SELECT * FROM summaries ORDER BY created_at DESC LIMIT 1
  `).get();
}

// Asigna un alias amigable a remitentes nuevos
function getFriendlySenderName(platform, sender_id) {
  const existing = db.prepare(`
    SELECT sender_name FROM messages
    WHERE platform = ? AND sender_id = ? AND sender_name NOT LIKE '%-alias'
    LIMIT 1
  `).get(platform, sender_id);

  if (existing && !existing.sender_name?.match(/^\d+$/)) {
    return existing.sender_name;
  }

  // Contar cuántos remitentes únicos hay en esa plataforma
  const count = db.prepare(`
    SELECT COUNT(DISTINCT sender_id) as total FROM messages
    WHERE platform = ?
  `).get(platform);

  return `${platform.charAt(0).toUpperCase() + platform.slice(1)} Usuario ${count.total}`;
}

module.exports = {
  saveMessage,
  getPendingNightMessages,
  markAsSummarized,
  saveSummary,
  getLatestSummary,
  getFriendlySenderName
};