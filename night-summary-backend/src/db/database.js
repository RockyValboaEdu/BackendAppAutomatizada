const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
});

// Crea las tablas si no existen
async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      platform    TEXT NOT NULL,
      sender_id   TEXT NOT NULL,
      sender_name TEXT,
      content     TEXT NOT NULL,
      received_at TEXT NOT NULL,
      is_night    INTEGER DEFAULT 0,
      summarized  INTEGER DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS summaries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      date       TEXT NOT NULL,
      content    TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  console.log('✅ Base de datos Turso conectada');
}

initDB().catch(console.error);

module.exports = db;