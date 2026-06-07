// src/db/database.js
const Database = require('better-sqlite3');
const path = require('path');

// Crea el archivo SQLite en la raíz del proyecto
const db = new Database(path.join(__dirname, '../../messages.db'));

// Crea las tablas si no existen todavía
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    platform    TEXT NOT NULL,        -- 'whatsapp', 'facebook', 'instagram'
    sender_id   TEXT NOT NULL,        -- ID del remitente en esa red
    sender_name TEXT,                 -- Nombre si está disponible
    content     TEXT NOT NULL,        -- Texto del mensaje
    received_at TEXT NOT NULL,        -- Fecha/hora en ISO 8601
    is_night    INTEGER DEFAULT 0,    -- 1 si llegó entre 10pm y 7am
    summarized  INTEGER DEFAULT 0     -- 1 si ya fue incluido en un resumen
  );

  CREATE TABLE IF NOT EXISTS summaries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT NOT NULL,         -- Fecha del resumen (ej: '2025-06-06')
    content    TEXT NOT NULL,         -- Texto generado por la IA
    created_at TEXT NOT NULL
  );
`);

module.exports = db;