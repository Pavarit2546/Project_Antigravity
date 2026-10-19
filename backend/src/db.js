import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(path.join(dataDir, 'room.db'));

db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA foreign_keys = ON');
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      room_type TEXT NOT NULL,
      capacity INTEGER,
      floor TEXT,
      description TEXT,
      amenities TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  // Migrate databases created before the detail columns existed.
  const detailColumns = [
    ['capacity', 'INTEGER'],
    ['floor', 'TEXT'],
    ['description', 'TEXT'],
    ['amenities', 'TEXT'],
  ];
  db.all("PRAGMA table_info(rooms)", (err, cols) => {
    if (err) return;
    const existing = new Set(cols.map((c) => c.name));
    for (const [col, type] of detailColumns) {
      if (!existing.has(col)) {
        db.run(`ALTER TABLE rooms ADD COLUMN ${col} ${type}`);
      }
    }
    // Fill in details for the demo rooms created before they had detail columns.
    const backfill = [
      ['Meeting Room A', 6, '2', 'Main boardroom with a wall display.', 'projector,whiteboard,wifi'],
      ['Meeting Room B', 4, '2', 'Compact room for quick stand-ups.', 'whiteboard,wifi'],
      ['Lounge 1', 12, '1', 'Relaxation area with couches and a kitchenette.', 'wifi,coffee'],
    ];
    for (const [name, capacity, floor, description, amenities] of backfill) {
      db.run(
        `UPDATE rooms
            SET capacity = ?, floor = ?, description = ?, amenities = ?
          WHERE name = ? AND capacity IS NULL`,
        [capacity, floor, description, amenities, name]
      );
    }
  });
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL UNIQUE REFERENCES rooms(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      booked_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
});

function seed() {
  const demoHash = bcrypt.hashSync('demo123', 10);
  const demoRooms = [
    ['Meeting Room A', 'meeting', 6, '2', 'Main boardroom with a wall display.', 'projector,whiteboard,wifi'],
    ['Meeting Room B', 'meeting', 4, '2', 'Compact room for quick stand-ups.', 'whiteboard,wifi'],
    ['Lounge 1', 'lounge', 12, '1', 'Relaxation area with couches and a kitchenette.', 'wifi,coffee'],
  ];
  db.serialize(() => {
    db.run('BEGIN');
    db.run('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)', ['demo', demoHash]);
    for (const [name, type, capacity, floor, description, amenities] of demoRooms) {
      db.run(
        'INSERT OR IGNORE INTO rooms (name, room_type, capacity, floor, description, amenities) VALUES (?, ?, ?, ?, ?, ?)',
        [name, type, capacity, floor, description, amenities]
      );
    }
    db.run('COMMIT');
  });
}

const check = db.prepare('SELECT COUNT(*) AS n FROM users');
check.get((err, row) => {
  if (err) throw err;
  if (row.n === 0) seed();
});

export default db;
