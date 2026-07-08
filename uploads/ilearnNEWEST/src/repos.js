'use strict';
/** Repositories — every SQL statement the app uses, grouped by concern. */
const { one, all, query } = require('./db');

const Orgs = {
  all: () => all('SELECT id,name,slug FROM organisations ORDER BY name'),
  first: () => one('SELECT * FROM organisations ORDER BY id LIMIT 1'),
  byId: (id) => one('SELECT * FROM organisations WHERE id=$1', [id]),
  bySlug: (slug) => one('SELECT * FROM organisations WHERE slug=$1', [String(slug).toLowerCase()]),
};

const Users = {
  byEmail: (email) => one('SELECT * FROM users WHERE email=$1', [email]),
  byId: (id) => one('SELECT * FROM users WHERE id=$1', [id]),
  learnerByName: (orgId, name) =>
    one("SELECT * FROM users WHERE org_id=$1 AND role='learner' AND lower(name)=lower($2) ORDER BY id LIMIT 1", [orgId, name]),
  learnersForOrg: (orgId) =>
    all(
      "SELECT id,name,support_note,last_active,created_at FROM users WHERE org_id=$1 AND role='learner' ORDER BY name",
      [orgId]
    ),
  create: ({ org_id, name, email, role, password_hash, support_note }) =>
    one(
      `INSERT INTO users (org_id,name,email,role,password_hash,support_note)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [org_id, name, email || null, role, password_hash || null, support_note || null]
    ),
  update: (id, { name, support_note }) =>
    query(
      `UPDATE users SET
         name = COALESCE($1,name),
         support_note = COALESCE($2,support_note)
       WHERE id=$3`,
      [name ?? null, support_note ?? null, id]
    ),
  remove: (id) => query("DELETE FROM users WHERE id=$1 AND role='learner'", [id]),
  touch: (id) => query('UPDATE users SET last_active=now() WHERE id=$1', [id]),
  // lockout bookkeeping
  registerFailure: (id, lockMinutes, maxAttempts) =>
    one(
      `UPDATE users
         SET failed_attempts = failed_attempts + 1,
             locked_until = CASE WHEN failed_attempts + 1 >= $2
                                 THEN now() + ($3 || ' minutes')::interval ELSE locked_until END
       WHERE id=$1
       RETURNING failed_attempts, locked_until`,
      [id, maxAttempts, String(lockMinutes)]
    ),
  clearLock: (id) =>
    query('UPDATE users SET failed_attempts=0, locked_until=NULL, last_active=now() WHERE id=$1', [id]),
};

const Courses = {
  default: () => one('SELECT * FROM courses ORDER BY id LIMIT 1'),
  lessons: (courseId) =>
    all(
      'SELECT id,idx,title,goal,steps_json,tasks_json,carer_note,video_url FROM lessons WHERE course_id=$1 ORDER BY idx',
      [courseId]
    ),
  lessonCount: async (courseId) =>
    Number((await one('SELECT COUNT(*)::int c FROM lessons WHERE course_id=$1', [courseId])).c),
};

const Progress = {
  forUser: (userId) =>
    all('SELECT lesson_id,prompt_level,completed_at FROM progress WHERE user_id=$1', [userId]),
  countForCourse: async (userId, courseId) =>
    Number((await one('SELECT COUNT(*)::int c FROM progress WHERE user_id=$1 AND course_id=$2', [userId, courseId])).c),
  complete: (userId, lessonId, courseId, level) =>
    query(
      `INSERT INTO progress (user_id,lesson_id,course_id,prompt_level)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id,lesson_id)
       DO UPDATE SET prompt_level=EXCLUDED.prompt_level, completed_at=now()`,
      [userId, lessonId, courseId, level || null]
    ),
  // aggregate completed-count per learner for a whole org, in one query
  byOrg: (orgId, courseId) =>
    all(
      `SELECT u.id user_id, COUNT(p.id)::int done
         FROM users u
         LEFT JOIN progress p ON p.user_id=u.id AND p.course_id=$2
        WHERE u.org_id=$1 AND u.role='learner'
        GROUP BY u.id`,
      [orgId, courseId]
    ),
  latestLevel: (userId) =>
    one(
      `SELECT prompt_level FROM progress
        WHERE user_id=$1 AND prompt_level IS NOT NULL
        ORDER BY completed_at DESC LIMIT 1`,
      [userId]
    ),
};

const Certificates = {
  forUser: (userId, courseId) =>
    one('SELECT * FROM certificates WHERE user_id=$1 AND course_id=$2', [userId, courseId]),
  issue: async (userId, courseId) => {
    const code = 'ILC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    await query(
      'INSERT INTO certificates (user_id,course_id,code) VALUES ($1,$2,$3) ON CONFLICT (user_id,course_id) DO NOTHING',
      [userId, courseId, code]
    );
    return one('SELECT * FROM certificates WHERE user_id=$1 AND course_id=$2', [userId, courseId]);
  },
};

const Consent = {
  forUser: (userId) => one('SELECT * FROM consent WHERE user_id=$1', [userId]),
  upsert: ({ user_id, org_id, given_by, relationship, mental_capacity_assessed, lawful_basis, note, recorded_by }) =>
    query(
      `INSERT INTO consent (user_id,org_id,given_by,relationship,mental_capacity_assessed,lawful_basis,note,recorded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (user_id) DO UPDATE SET
         given_by=EXCLUDED.given_by, relationship=EXCLUDED.relationship,
         mental_capacity_assessed=EXCLUDED.mental_capacity_assessed,
         lawful_basis=EXCLUDED.lawful_basis, note=EXCLUDED.note,
         recorded_by=EXCLUDED.recorded_by, recorded_at=now()`,
      [user_id, org_id, given_by || null, relationship || null,
       !!mental_capacity_assessed, lawful_basis || null, note || null, recorded_by || null]
    ),
};

const Enrolments = {
  add: (userId, courseId) =>
    query('INSERT INTO enrolments (user_id,course_id) VALUES ($1,$2) ON CONFLICT (user_id,course_id) DO NOTHING',
      [userId, courseId]),
};

const Audit = {
  record: ({ org_id, actor_user_id, actor_name, action, target_type, target_id, detail, ip }) =>
    query(
      `INSERT INTO audit_log (org_id,actor_user_id,actor_name,action,target_type,target_id,detail,ip)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [org_id || null, actor_user_id || null, actor_name || null, action,
       target_type || null, target_id || null, detail || null, ip || null]
    ),
  recent: (orgId, limit = 100) =>
    all('SELECT actor_name,action,target_type,detail,created_at FROM audit_log WHERE org_id=$1 ORDER BY created_at DESC LIMIT $2',
      [orgId, limit]),
};

module.exports = { Orgs, Users, Courses, Progress, Certificates, Consent, Enrolments, Audit };
