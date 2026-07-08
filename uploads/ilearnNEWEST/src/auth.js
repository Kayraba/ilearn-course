'use strict';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/* ------------------------------------------------------------------ secret */
// In production a real secret is mandatory — refuse to boot without one.
const IS_PROD = process.env.NODE_ENV === 'production';
let SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  if (IS_PROD) {
    console.error('FATAL: JWT_SECRET is not set. Refusing to start in production.');
    process.exit(1);
  }
  SECRET = 'dev-only-insecure-secret';
  console.warn('[auth] JWT_SECRET not set — using an insecure dev secret. Do NOT use in production.');
}

const USER_TTL = '12h';      // signed-in learner/admin session

/* ------------------------------------------------------------- lockout policy */
const MAX_ATTEMPTS = 5;          // failed logins before lockout
const LOCK_MINUTES = 15;         // how long an account stays locked

/* ----------------------------------------------------------------- hashing */
const hash = (s) => bcrypt.hashSync(String(s), 10);
const verify = (s, h) => !!h && bcrypt.compareSync(String(s), h);

/* ------------------------------------------------------------------ tokens */
function sign(user) {
  return jwt.sign(
    { typ: 'user', uid: user.id, org: user.org_id, role: user.role, name: user.name },
    SECRET, { expiresIn: USER_TTL }
  );
}
function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return (req.cookies && req.cookies.token) || null;
}

/* -------------------------------------------------------------- middleware */
// Require a valid *user* session.
function auth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  try {
    const claims = jwt.verify(token, SECRET);
    if (claims.typ !== 'user') return res.status(401).json({ error: 'Not signed in' });
    req.user = claims;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired' });
  }
}

const role = (r) => (req, res, next) =>
  req.user && req.user.role === r ? next() : res.status(403).json({ error: 'Not allowed' });

/* ------------------------------------------------------------ lockout helpers */
const isLocked = (u) => u && u.locked_until && new Date(u.locked_until).getTime() > Date.now();
function lockRemaining(u) {
  const ms = new Date(u.locked_until).getTime() - Date.now();
  return Math.max(1, Math.ceil(ms / 60000));
}

module.exports = {
  SECRET, USER_TTL, MAX_ATTEMPTS, LOCK_MINUTES,
  hash, verify, sign, auth, role, isLocked, lockRemaining,
};
