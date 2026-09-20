import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

// ─── Turso / libSQL client ────────────────────────────────────────────────────
// Production: set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN env vars (Turso cloud)
// Local dev:  uses a local SQLite file automatically (no env vars needed)
const remoteUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const schemaSql = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_verified INTEGER DEFAULT 1,
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
`;

let localFallbackClient = null;
function getLocalFallback() {
  if (!localFallbackClient) {
    localFallbackClient = createClient({ url: 'file:./server/nutrimind.db' });
  }
  return localFallbackClient;
}

async function safeExecute(query) {
  try {
    return await libsql.execute(query);
  } catch (err) {
    const local = getLocalFallback();
    if (libsql !== local) {
      console.warn('⚠️ Turso connection error, seamlessly switching to local SQLite:', err.message);
      try {
        await local.executeMultiple(schemaSql);
      } catch {}
      libsql = local;
      return await libsql.execute(query);
    }
    throw err;
  }
}

async function setupClient() {
  if (remoteUrl) {
    try {
      const client = createClient({ url: remoteUrl, authToken });
      await client.executeMultiple(schemaSql);
      return client;
    } catch (err) {
      console.warn('⚠️ Remote Turso database connection issue, using local SQLite:', err.message);
    }
  }
  const localClient = getLocalFallback();
  await localClient.executeMultiple(schemaSql);
  return localClient;
}

let libsql = await setupClient();

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
        return safeExecute({ sql, args: args.flat() }).then(r => r.rows[0] ?? undefined);
      },
      // Returns all rows as an array
      all(...args) {
        return safeExecute({ sql, args: args.flat() }).then(r => r.rows);
      },
      // Returns { lastInsertRowid, changes }
      run(...args) {
        return safeExecute({ sql, args: args.flat() }).then(r => ({
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

  // no-op - libSQL handles WAL & foreign keys at the server level
  pragma() {},
};

// Ensure all existing accounts are verified and demo user is available
try {
  await safeExecute(`UPDATE users SET is_verified = 1 WHERE is_verified = 0`);
} catch {}

try {
  const existing = await safeExecute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: ['demo@nutrimind.ai']
  });

  if (!existing.rows || existing.rows.length === 0) {
    const hash = await bcrypt.hash('demo123', 10);
    const userRes = await safeExecute({
      sql: `INSERT INTO users (name, email, password_hash, is_verified) VALUES (?, ?, ?, 1)`,
      args: ['Demo User', 'demo@nutrimind.ai', hash]
    });
    const demoId = Number(userRes.lastInsertRowid);

    await safeExecute({
      sql: `INSERT INTO profiles (
        user_id, date_of_birth, gender, height_cm, weight_kg, body_fat_pct,
        activity_level, health_goal, health_conditions, target_weight_kg
      ) VALUES (?, '1998-05-15', 'female', 168, 62, 21, 'moderate', 'gym', '[]', 60)`,
      args: [demoId]
    });

    await safeExecute({
      sql: `INSERT INTO meal_logs (user_id, food_name, calories, protein, carbs, fat, meal_type)
            VALUES (?, 'Oatmeal with berries & almond butter', 380, 14, 52, 12, 'breakfast'),
                   (?, 'Grilled chicken quinoa bowl with avocado', 550, 42, 48, 18, 'lunch')`,
      args: [demoId, demoId]
    });

    await safeExecute({
      sql: `INSERT INTO water_logs (user_id, glasses, logged_date) VALUES (?, 5, date('now'))`,
      args: [demoId]
    });
    console.log('✅ Demo account ready: demo@nutrimind.ai / demo123');
  }
} catch (err) {
  console.warn('Demo user setup note:', err.message);
}

export default db;
