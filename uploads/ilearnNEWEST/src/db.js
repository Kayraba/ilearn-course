'use strict';
/**
 * Database layer — PostgreSQL via `pg`.
 *
 * A single pool is shared across the app. Connection comes from DATABASE_URL
 * (set automatically by Render Postgres). SSL is enabled in production.
 * The schema is created on first boot and is safe to run repeatedly.
 */
const { Pool } = require('pg');

// In production a real database URL is mandatory — never fall back to localhost.
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is not set. Refusing to start in production.');
  process.exit(1);
}
const connectionString =
  process.env.DATABASE_URL || 'postgresql://ilearn:ilearn@127.0.0.1:5432/ilearn';

// Render's managed Postgres requires SSL; local dev does not.
const isManaged = /\brender\.com\b|\bamazonaws\b/.test(connectionString) || process.env.PGSSL === 'true';

const pool = new Pool({
  connectionString,
  ssl: isManaged ? { rejectUnauthorized: false } : false,
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => console.error('[db] idle client error:', err.message));

/** Run a query. Returns the full pg result. */
const query = (text, params) => pool.query(text, params);
/** First row or undefined. */
const one = async (text, params) => (await pool.query(text, params)).rows[0];
/** All rows. */
const all = async (text, params) => (await pool.query(text, params)).rows;

/** Create the schema if it does not yet exist. Idempotent. */
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS organisations (
      id               SERIAL PRIMARY KEY,
      name             TEXT NOT NULL,
      slug             TEXT NOT NULL UNIQUE,
      access_code_hash TEXT,                      -- retained for older deployments
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS users (
      id              SERIAL PRIMARY KEY,
      org_id          INTEGER NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
      name            TEXT NOT NULL,
      email           TEXT UNIQUE,
      role            TEXT NOT NULL CHECK (role IN ('admin','learner')),
      password_hash   TEXT,                       -- admins
      pin_hash        TEXT,                       -- retained for older learner records
      support_note    TEXT,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until    TIMESTAMPTZ,
      last_active     TIMESTAMPTZ,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);

    CREATE TABLE IF NOT EXISTS courses (
      id          SERIAL PRIMARY KEY,
      slug        TEXT NOT NULL UNIQUE,
      title       TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id          SERIAL PRIMARY KEY,
      course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      idx         INTEGER NOT NULL,
      title       TEXT NOT NULL,
      goal        TEXT NOT NULL,
      steps_json  TEXT NOT NULL DEFAULT '[]',
      tasks_json  TEXT NOT NULL DEFAULT '[]',
      carer_note  TEXT,
      video_url   TEXT,
      UNIQUE (course_id, idx)
    );
    CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
    -- add tasks_json to pre-existing lesson tables (no-op if already there)
    ALTER TABLE lessons ADD COLUMN IF NOT EXISTS tasks_json TEXT NOT NULL DEFAULT '[]';

    CREATE TABLE IF NOT EXISTS enrolments (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS progress (
      id            SERIAL PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id     INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      course_id     INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      status        TEXT NOT NULL DEFAULT 'complete',
      prompt_level  TEXT,                         -- independent | verbal | gesture | physical
      completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (user_id, lesson_id)
    );
    CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_user_course ON progress(user_id, course_id);

    CREATE TABLE IF NOT EXISTS certificates (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      code        TEXT NOT NULL UNIQUE,
      issued_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (user_id, course_id)
    );

    -- Consent & Mental Capacity record (DPIA / safeguarding evidence).
    CREATE TABLE IF NOT EXISTS consent (
      id                       SERIAL PRIMARY KEY,
      user_id                  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      org_id                   INTEGER NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
      given_by                 TEXT,              -- who gave consent (self / relative / LPA)
      relationship             TEXT,
      mental_capacity_assessed BOOLEAN NOT NULL DEFAULT false,
      lawful_basis             TEXT,              -- UK GDPR basis
      note                     TEXT,
      recorded_by              INTEGER REFERENCES users(id) ON DELETE SET NULL,
      recorded_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (user_id)
    );

    -- Audit trail of meaningful actions (CQC / accountability).
    CREATE TABLE IF NOT EXISTS audit_log (
      id             SERIAL PRIMARY KEY,
      org_id         INTEGER REFERENCES organisations(id) ON DELETE CASCADE,
      actor_user_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
      actor_name     TEXT,
      action         TEXT NOT NULL,
      target_type    TEXT,
      target_id      INTEGER,
      detail         TEXT,
      ip             TEXT,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_log(org_id, created_at DESC);
  `);
}

/** Close the pool (used by tests and graceful shutdown). */
const close = () => pool.end();

module.exports = { pool, query, one, all, init, close };
