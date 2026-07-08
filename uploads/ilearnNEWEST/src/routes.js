'use strict';
const express = require('express');
const {
  verify, sign, auth, role,
  isLocked, lockRemaining, MAX_ATTEMPTS, LOCK_MINUTES,
} = require('./auth');
const { Orgs, Users, Courses, Progress, Certificates, Consent, Enrolments, Audit } = require('./repos');

const router = express.Router();

/* ------------------------------------------------------------------ helpers */
const ipOf = (req) => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip;

function lessonView(l) {
  return {
    id: l.id, idx: l.idx, title: l.title, goal: l.goal,
    steps: JSON.parse(l.steps_json || '[]'), tasks: JSON.parse(l.tasks_json || '[]'),
    carerNote: l.carer_note, videoUrl: l.video_url,
  };
}
function levelLabel(lv) {
  return ({
    independent: 'Independent on most tasks',
    verbal: 'Reducing prompts - growing independence',
    gesture: 'Gesture prompts, gaining confidence',
    physical: 'Early stage - hands-on support',
  }[lv]) || 'Not yet started';
}
const audit = (req, fields) =>
  Audit.record({ ip: ipOf(req), ...fields }).catch((e) => console.error('[audit]', e.message));
function cleanName(value) {
  const name = String(value || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 80) return null;
  if (!/^[A-Za-z0-9][A-Za-z0-9 .,'-]*$/.test(name)) return null;
  return name;
}

// Shared lockout check used by both logins. Returns a response-ending boolean.
async function failLogin(req, res, u, what) {
  const r = await Users.registerFailure(u.id, LOCK_MINUTES, MAX_ATTEMPTS);
  audit(req, { org_id: u.org_id, actor_user_id: u.id, actor_name: u.name, action: 'login_failed', detail: what });
  if (r && isLocked(r)) {
    return res.status(423).json({ error: `Too many tries. Locked for ${lockRemaining(r)} minute(s).` });
  }
  return res.status(401).json({ error: what });
}

/* ---------------------------------------------------------------------- auth */
router.post('/auth/start-learning', async (req, res) => {
  const raw = cleanName(req.body?.name);
  if (!raw) return res.status(400).json({ error: 'Please enter a valid name' });

  const org = await Orgs.first();
  if (!org) return res.status(500).json({ error: 'Learning service is not set up yet' });

  const course = await Courses.default();
  let u = await Users.learnerByName(org.id, raw);
  if (!u) {
    const r = await Users.create({ org_id: org.id, name: raw, role: 'learner' });
    await Enrolments.add(r.id, course.id);
    u = await Users.byId(r.id);
    audit(req, { org_id: org.id, actor_user_id: u.id, actor_name: u.name, action: 'learner_started', target_type: 'learner', target_id: u.id });
  } else {
    await Enrolments.add(u.id, course.id);
  }
  await Users.touch(u.id);
  res.json({ token: sign(u), user: { id: u.id, name: u.name, role: u.role, org: u.org_id } });
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const u = email && (await Users.byEmail(String(email).toLowerCase().trim()));
  if (!u || u.role !== 'admin') return res.status(401).json({ error: 'Wrong email or password' });
  if (isLocked(u)) return res.status(423).json({ error: `Account locked. Try in ${lockRemaining(u)} minute(s).` });
  if (!verify(password || '', u.password_hash)) return failLogin(req, res, u, 'Wrong email or password');
  await Users.clearLock(u.id);
  audit(req, { org_id: u.org_id, actor_user_id: u.id, actor_name: u.name, action: 'login' });
  res.json({ token: sign(u), user: { id: u.id, name: u.name, role: u.role, org: u.org_id } });
});

router.get('/auth/me', auth, async (req, res) => {
  const u = await Users.byId(req.user.uid);
  if (!u) return res.status(404).json({ error: 'Gone' });
  const org = await Orgs.byId(u.org_id);
  res.json({ id: u.id, name: u.name, role: u.role, org: { id: org.id, name: org.name } });
});

/* ------------------------------------------------------------------- learner */
router.get('/me/course', auth, role('learner'), async (req, res) => {
  const course = await Courses.default();
  const lessons = (await Courses.lessons(course.id)).map(lessonView);
  const done = new Map((await Progress.forUser(req.user.uid)).map((p) => [p.lesson_id, p]));
  const completed = lessons.filter((l) => done.has(l.id)).length;
  const cert = await Certificates.forUser(req.user.uid, course.id);
  res.json({
    course: { id: course.id, title: course.title, description: course.description },
    total: lessons.length, completed,
    lessons: lessons.map((l) => ({ ...l, complete: done.has(l.id), promptLevel: done.get(l.id)?.prompt_level || null })),
    certificate: cert ? { code: cert.code, issuedAt: cert.issued_at } : null,
  });
});

router.post('/me/lessons/:id/complete', auth, role('learner'), async (req, res) => {
  const course = await Courses.default();
  const lesson = (await Courses.lessons(course.id)).find((l) => l.id === Number(req.params.id));
  if (!lesson) return res.status(404).json({ error: 'No such lesson' });
  const allowed = ['independent', 'verbal', 'gesture', 'physical'];
  const level = allowed.includes(req.body?.promptLevel) ? req.body.promptLevel : null;
  await Progress.complete(req.user.uid, lesson.id, course.id, level);
  await Users.touch(req.user.uid);

  // auto-issue certificate when every lesson of THIS course is done
  let certificate = await Certificates.forUser(req.user.uid, course.id);
  if (!certificate) {
    const [done, total] = await Promise.all([
      Progress.countForCourse(req.user.uid, course.id),
      Courses.lessonCount(course.id),
    ]);
    if (done >= total) certificate = await Certificates.issue(req.user.uid, course.id);
  }
  res.json({ ok: true, certificate: certificate ? { code: certificate.code, issuedAt: certificate.issued_at } : null });
});

/* --------------------------------------------------------------------- admin */
async function orgStats(orgId, courseId) {
  const counts = await Progress.byOrg(orgId, courseId);
  const total = await Courses.lessonCount(courseId);
  const learners = counts.length;
  const certs = counts.filter((c) => c.done >= total).length;
  const avg = learners ? Math.round(counts.reduce((a, c) => a + (c.done / total) * 100, 0) / learners) : 0;
  return { learners, total, certs, avg };
}

router.get('/admin/overview', auth, role('admin'), async (req, res) => {
  const course = await Courses.default();
  const s = await orgStats(req.user.org, course.id);
  const learners = await Users.learnersForOrg(req.user.org);
  const active = learners.filter(
    (u) => u.last_active && Date.now() - new Date(u.last_active).getTime() < 7 * 864e5
  ).length;
  res.json({ ...s, active });
});

router.get('/admin/learners', auth, role('admin'), async (req, res) => {
  const course = await Courses.default();
  const total = await Courses.lessonCount(course.id);
  const doneByUser = new Map((await Progress.byOrg(req.user.org, course.id)).map((c) => [c.user_id, c.done]));
  const list = (await Users.learnersForOrg(req.user.org)).map((u) => {
    const done = doneByUser.get(u.id) || 0;
    return {
      id: u.id, name: u.name, done, total, pct: Math.round((done / total) * 100),
      lastActive: u.last_active, status: done >= total ? 'completed' : done === 0 ? 'new' : 'in_progress',
    };
  });
  res.json(list);
});

router.get('/admin/learners/:id', auth, role('admin'), async (req, res) => {
  const u = await Users.byId(req.params.id);
  if (!u || u.org_id !== req.user.org || u.role !== 'learner') return res.status(404).json({ error: 'Not found' });
  const course = await Courses.default();
  const lessons = await Courses.lessons(course.id);
  const prog = new Map((await Progress.forUser(u.id)).map((p) => [p.lesson_id, p]));
  const level = (await Progress.latestLevel(u.id))?.prompt_level || null;
  const cert = await Certificates.forUser(u.id, course.id);
  const consent = await Consent.forUser(u.id);
  res.json({
    id: u.id, name: u.name, supportNote: u.support_note, lastActive: u.last_active,
    done: prog.size, total: lessons.length, independence: levelLabel(level), promptLevel: level,
    certificate: cert ? { code: cert.code, issuedAt: cert.issued_at } : null,
    consent: consent
      ? { givenBy: consent.given_by, relationship: consent.relationship,
          capacityAssessed: consent.mental_capacity_assessed, lawfulBasis: consent.lawful_basis,
          note: consent.note, recordedAt: consent.recorded_at }
      : null,
    lessons: lessons.map((l) => ({
      idx: l.idx, title: l.title, complete: prog.has(l.id),
      completedAt: prog.get(l.id)?.completed_at || null, promptLevel: prog.get(l.id)?.prompt_level || null,
    })),
  });
});

router.post('/admin/learners', auth, role('admin'), async (req, res) => {
  const { name, supportNote } = req.body || {};
  const learnerName = cleanName(name);
  if (!learnerName) return res.status(400).json({ error: 'Enter a valid learner name' });
  const existing = await Users.learnerByName(req.user.org, learnerName);
  if (existing) return res.status(409).json({ error: 'A learner with this name already exists' });
  const course = await Courses.default();
  const r = await Users.create({
    org_id: req.user.org, name: learnerName, role: 'learner',
    support_note: supportNote || null,
  });
  await Enrolments.add(r.id, course.id);
  audit(req, { org_id: req.user.org, actor_user_id: req.user.uid, actor_name: req.user.name,
    action: 'learner_created', target_type: 'learner', target_id: r.id, detail: learnerName });
  res.status(201).json({ id: r.id });
});

router.patch('/admin/learners/:id', auth, role('admin'), async (req, res) => {
  const u = await Users.byId(req.params.id);
  if (!u || u.org_id !== req.user.org || u.role !== 'learner') return res.status(404).json({ error: 'Not found' });
  const { name, supportNote } = req.body || {};
  const learnerName = name == null ? null : cleanName(name);
  if (name != null && !learnerName) return res.status(400).json({ error: 'Enter a valid learner name' });
  await Users.update(u.id, { name: learnerName, support_note: supportNote ?? null });
  audit(req, { org_id: req.user.org, actor_user_id: req.user.uid, actor_name: req.user.name,
    action: 'learner_updated', target_type: 'learner', target_id: u.id });
  res.json({ ok: true });
});

router.delete('/admin/learners/:id', auth, role('admin'), async (req, res) => {
  const u = await Users.byId(req.params.id);
  if (!u || u.org_id !== req.user.org || u.role !== 'learner') return res.status(404).json({ error: 'Not found' });
  await Users.remove(u.id);
  audit(req, { org_id: req.user.org, actor_user_id: req.user.uid, actor_name: req.user.name,
    action: 'learner_removed', target_type: 'learner', target_id: u.id, detail: u.name });
  res.json({ ok: true });
});

// Record / update the consent & mental-capacity note for a learner.
router.put('/admin/learners/:id/consent', auth, role('admin'), async (req, res) => {
  const u = await Users.byId(req.params.id);
  if (!u || u.org_id !== req.user.org || u.role !== 'learner') return res.status(404).json({ error: 'Not found' });
  const { givenBy, relationship, capacityAssessed, lawfulBasis, note } = req.body || {};
  await Consent.upsert({
    user_id: u.id, org_id: req.user.org, given_by: givenBy, relationship,
    mental_capacity_assessed: capacityAssessed, lawful_basis: lawfulBasis, note, recorded_by: req.user.uid,
  });
  audit(req, { org_id: req.user.org, actor_user_id: req.user.uid, actor_name: req.user.name,
    action: 'consent_recorded', target_type: 'learner', target_id: u.id });
  res.json({ ok: true });
});

router.get('/admin/audit', auth, role('admin'), async (req, res) =>
  res.json(await Audit.recent(req.user.org, 100)));

router.get('/admin/export.csv', auth, role('admin'), async (req, res) => {
  const course = await Courses.default();
  const total = await Courses.lessonCount(course.id);
  const doneByUser = new Map((await Progress.byOrg(req.user.org, course.id)).map((c) => [c.user_id, c.done]));
  const learners = await Users.learnersForOrg(req.user.org);
  const rows = [['Learner', 'Course', 'Lessons', 'Progress', 'Independence', 'Last active', 'Status', 'Certificate']];
  for (const u of learners) {
    const done = doneByUser.get(u.id) || 0;
    const level = (await Progress.latestLevel(u.id))?.prompt_level || '';
    rows.push([
      u.name, course.title, `${done}/${total}`, `${Math.round((done / total) * 100)}%`, level,
      u.last_active ? new Date(u.last_active).toISOString().slice(0, 10) : 'Never',
      done >= total ? 'Completed' : done === 0 ? 'Not started' : 'In progress',
      done >= total ? 'Earned' : 'No',
    ]);
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="ilearn-report.csv"');
  res.send(csv);
});

module.exports = router;
