import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'nutrimind.db');

const db = new Database(DB_PATH);

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_verified INTEGER DEFAULT 0,
    verify_token TEXT,
    verify_token_expires INTEGER,
    reset_token TEXT,
    reset_token_expires INTEGER,
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth TEXT,
    gender TEXT,
    height_cm REAL,
    weight_kg REAL,
    body_fat_pct REAL,
    neck_cm REAL,
    waist_cm REAL,
    hip_cm REAL,
    activity_level TEXT DEFAULT 'moderate',
    health_goal TEXT DEFAULT 'general',
    health_conditions TEXT DEFAULT '[]',
    target_weight_kg REAL,
    updated_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS meal_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein REAL,
    carbs REAL,
    fat REAL,
    meal_type TEXT,
    logged_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS weight_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg REAL NOT NULL,
    notes TEXT,
    logged_at INTEGER DEFAULT (unixepoch())
  );
`);

export default db;
