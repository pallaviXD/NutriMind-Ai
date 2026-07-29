import { createClient } from '@libsql/client';

// ─── Turso / libSQL client ────────────────────────────────────────────────────
// Production: set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN env vars (Turso cloud)
// Local dev:  uses a local SQLite file automatically (no env vars needed)
const url  = process.env.TURSO_DATABASE_URL  || 'file:./server/nutrimind.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const libsql = createClient({ url, authToken });

// ─── Bootstrap schema ─────────────────────────────────────────────────────────
// libSQL is async — we run migrations at startup and export a thin sync-style
// wrapper so none of the existing route code needs to change.
await libsql.executeMultiple(`
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

  CREATE TABLE IF NOT EXISTS water_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    glasses INTEGER NOT NULL DEFAULT 0,
    logged_date TEXT NOT NULL DEFAULT (date('now')),
    UNIQUE(user_id, logged_date)
  );

  CREATE TABLE IF NOT EXISTS workout_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_hash TEXT NOT NULL,
    plan_data TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE INDEX IF NOT EXISTS idx_wp_user_hash ON workout_plans(user_id, request_hash);
`);

// ─── Sync-style wrapper ───────────────────────────────────────────────────────
// The existing routes use better-sqlite3's synchronous API:
//   db.prepare('SELECT ...').get(...)   → single row
//   db.prepare('SELECT ...').all(...)   → array of rows
//   db.prepare('INSERT ...').run(...)   → { lastInsertRowid, changes }
//   db.exec('...')                      → schema / pragma (fire and forget)
//   db.pragma(...)                      → no-op (handled at schema level)
//
// We replicate that interface so zero route code changes are needed.

const db = {
  prepare(sql) {
    return {
      // Returns first row or undefined
      get(...args) {
        return libsql.execute({ sql, args: args.flat() }).then(r => r.rows[0] ?? undefined);
.catch(err => console.error(err))
      },
      // Returns all rows as an array
      all(...args) {
        return libsql.execute({ sql, args: args.flat() }).then(r => r.rows);
.catch(err => console.error(err))
      },
      // Returns { lastInsertRowid, changes }
      run(...args) {
        return libsql.execute({ sql, args: args.flat() }).then(r => ({
.catch(err => console.error(err))
          lastInsertRowid: Number(r.lastInsertRowid),
          changes: r.rowsAffected,
        }));
      },
    };
  },

  // Fire-and-forget for multi-statement DDL
  exec(sql) {
    return libsql.executeMultiple(sql);
  },

  // no-op — libSQL handles WAL & foreign keys at the server level
  pragma() {},
};

export default db;
