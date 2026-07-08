'use strict';
/**
 * Seed the database with the Confident Computing course, one pilot
 * organisation and one admin account. Learners are created when they enter
 * their name on the start screen.
 *
 *   npm run seed     (seed only if empty)
 *   npm run reset    (drop seed data and re-seed)
 */
const bcrypt = require('bcryptjs');
const { pool, query, one, init, close } = require('./db');
const course = require('./course-content');

const SEED_ORG_NAME = process.env.SEED_ORG_NAME || 'iLearn Pilot Service';
const SEED_ORG_SLUG = process.env.SEED_ORG_SLUG || 'pilot';
const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'iLearn Service Admin';
const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.org';
const IS_PROD = process.env.NODE_ENV === 'production';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || (IS_PROD ? '' : 'local-dev-only-admin-pass');

function assertSafeSeedConfig() {
  if (!IS_PROD) return;
  const unsafeEmail = !process.env.SEED_ADMIN_EMAIL || SEED_ADMIN_EMAIL === 'admin@example.org';
  const unsafePassword = !process.env.SEED_ADMIN_PASSWORD || /change-this|replace-with|password/i.test(SEED_ADMIN_PASSWORD);
  if (unsafeEmail || unsafePassword) {
    throw new Error('Production seed requires SEED_ADMIN_EMAIL and a strong SEED_ADMIN_PASSWORD.');
  }
}

async function wipe() {
  await query('TRUNCATE certificates, consent, audit_log, progress, enrolments, lessons, courses, users, organisations RESTART IDENTITY CASCADE');
}

async function seedCourse() {
  const r = await one(
    'INSERT INTO courses (slug,title,description) VALUES ($1,$2,$3) RETURNING id',
    [course.slug, course.title, course.description]
  );
  const courseId = r.id;
  for (let i = 0; i < course.lessons.length; i++) {
    const l = course.lessons[i];
    await query(
      'INSERT INTO lessons (course_id,idx,title,goal,steps_json,tasks_json,carer_note,video_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [courseId, i, l.title, l.goal, JSON.stringify(l.steps), JSON.stringify(l.tasks || []), l.carer, null]
    );
  }
  return courseId;
}

async function seedOrg(courseId) {
  const pwd = bcrypt.hashSync(SEED_ADMIN_PASSWORD, 10);

  const org = await one(
    'INSERT INTO organisations (name,slug,access_code_hash) VALUES ($1,$2,$3) RETURNING id',
    [SEED_ORG_NAME, SEED_ORG_SLUG, null]
  );
  const orgId = org.id;

  await query(
    'INSERT INTO users (org_id,name,email,role,password_hash) VALUES ($1,$2,$3,$4,$5)',
    [orgId, SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, 'admin', pwd]
  );
}

async function seedDatabase({ reset = false, quiet = false } = {}) {
  assertSafeSeedConfig();
  await init();
  const { rows } = await pool.query('SELECT COUNT(*)::int c FROM organisations');
  if (rows[0].c > 0 && !reset) {
    if (!quiet) console.log('Database already seeded. Use "npm run reset" to wipe and re-seed.');
    return false;
  }
  if (reset) await wipe();
  const courseId = await seedCourse();
  await seedOrg(courseId);
  if (!quiet) {
    console.log(`Seeded: Confident Computing course + ${SEED_ORG_NAME}.`);
    console.log('Seed credentials are read from SEED_* environment variables. Do not use sample values for live learners.');
  }
  return true;
}

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase({ reset: process.argv.includes('--reset') })
    .then(() => close())
    .catch((e) => { console.error(e); process.exit(1); });
}
