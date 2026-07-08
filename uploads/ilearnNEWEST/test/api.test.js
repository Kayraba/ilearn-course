'use strict';
/**
 * End-to-end API tests against a real Postgres, booting the app in-process.
 * Run with: DATABASE_URL=... JWT_SECRET=... node --test
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const cookieParser = require('cookie-parser');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.SEED_ORG_NAME = 'iLearn Pilot Service';
process.env.SEED_ORG_SLUG = 'pilot';
process.env.SEED_ADMIN_EMAIL = 'admin@pilot.test';
process.env.SEED_ADMIN_PASSWORD = 'TestPass123!';

const { init, close } = require('../src/db');
const { seedDatabase } = require('../src/seed');
const api = require('../src/routes');

let server, base;
const call = async (path, opts = {}) => {
  const res = await fetch(base + path, opts);
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
};
const json = (b, headers = {}) => ({ headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(b) });

before(async () => {
  await init();
  await seedDatabase({ reset: true, quiet: true });
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api', api);
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { if (server) server.close(); await close(); });

test('fresh seed has no sample learners', async () => {
  const login = await call('/api/auth/login', { method: 'POST', ...json({ email: 'admin@pilot.test', password: 'TestPass123!' }) });
  assert.equal(login.status, 200);
  const learners = await call('/api/admin/learners', { headers: { Authorization: 'Bearer ' + login.body.token } });
  assert.equal(learners.status, 200);
  assert.equal(learners.body.length, 0);
});

test('learner can start by name and resume tracked progress', async () => {
  const first = await call('/api/auth/start-learning', { method: 'POST', ...json({ name: 'Kayra Learner' }) });
  assert.equal(first.status, 200);
  const t1 = first.body.token;

  const course = await call('/api/me/course', { headers: { Authorization: 'Bearer ' + t1 } });
  assert.equal(course.status, 200);
  assert.equal(course.body.total, 16);
  assert.equal(course.body.completed, 0);

  const done = await call(`/api/me/lessons/${course.body.lessons[0].id}/complete`,
    { method: 'POST', ...json({ promptLevel: 'verbal' }, { Authorization: 'Bearer ' + t1 }) });
  assert.equal(done.status, 200);

  const second = await call('/api/auth/start-learning', { method: 'POST', ...json({ name: 'kayra learner' }) });
  assert.equal(second.status, 200);
  const resumed = await call('/api/me/course', { headers: { Authorization: 'Bearer ' + second.body.token } });
  assert.equal(resumed.status, 200);
  assert.equal(resumed.body.completed, 1);
});

test('admin can add a learner by name only and record consent', async () => {
  const login = await call('/api/auth/login', { method: 'POST', ...json({ email: 'admin@pilot.test', password: 'TestPass123!' }) });
  const H = { Authorization: 'Bearer ' + login.body.token };

  const created = await call('/api/admin/learners', { method: 'POST', ...json({ name: 'Admin Added Learner', supportNote: 'Prefers large text' }, H) });
  assert.equal(created.status, 201);

  const learners = await call('/api/admin/learners', { headers: H });
  assert.equal(learners.status, 200);
  assert.ok(learners.body.some((l) => l.name === 'Admin Added Learner'));

  const consent = await call(`/api/admin/learners/${created.body.id}/consent`,
    { method: 'PUT', ...json({ givenBy: 'Self', capacityAssessed: true, lawfulBasis: 'Consent', note: 'ok' }, H) });
  assert.equal(consent.status, 200);
});

test('admin routes reject a learner token', async () => {
  const learner = await call('/api/auth/start-learning', { method: 'POST', ...json({ name: 'Role Guard Learner' }) });
  const guard = await call('/api/admin/learners', { headers: { Authorization: 'Bearer ' + learner.body.token } });
  assert.equal(guard.status, 403);
});

test('learner endpoints reject an admin token', async () => {
  const login = await call('/api/auth/login', { method: 'POST', ...json({ email: 'admin@pilot.test', password: 'TestPass123!' }) });
  const course = await call('/api/me/course', { headers: { Authorization: 'Bearer ' + login.body.token } });
  assert.equal(course.status, 403);
});
