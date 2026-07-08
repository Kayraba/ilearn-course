'use strict';
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { init, close } = require('./src/db');
const { seedDatabase } = require('./src/seed');
const api = require('./src/routes');

async function main() {
  await init();
  if (process.env.SEED_ON_BOOT !== 'false') {
    await seedDatabase({ quiet: true }); // first-boot pilot seed only if the database is empty
  }

  const app = express();
  app.set('trust proxy', 1); // behind Render's proxy; needed for correct client IPs
  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());

  // Security headers. CSP allows Google Fonts + same-origin assets only.
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        mediaSrc: ["'self'", 'https:', 'blob:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Throttle auth endpoints to blunt brute-force on top of per-account lockout.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false,
    message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
  });
  app.use('/api/auth', authLimiter);

  app.get('/healthz', (req, res) => res.json({ ok: true }));
  app.use('/api', api);

  app.use('/api', (err, req, res, next) => {
    console.error('[api]', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Something went wrong' });
  });

  // Static front-end (cache assets, never the HTML shell).
  app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html'],
    setHeaders: (res, p) => {
      if (/\.(css|js|png|svg|woff2?)$/.test(p)) res.setHeader('Cache-Control', 'public, max-age=86400');
    },
  }));

  // SPA fallback (non-API GET routes return the app shell).
  app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

  // JSON 404 for unknown API routes.
  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => console.log(`iLearn running on http://localhost:${PORT}`));

  const shutdown = () => server.close(() => close().finally(() => process.exit(0)));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((e) => { console.error('Failed to start:', e); process.exit(1); });
