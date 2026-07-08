# iLearn by KWBA Agency

iLearn is an accessible digital-skills learning platform for supported adults.
It delivers a 16-lesson Confident Computing course, learner-friendly sign-in,
staff progress tracking, consent records, audit history and printable reports.

This package is prepared as a client pilot build. It is not affiliated with or
endorsed by Up Learn; "UpLearn standards" here means a polished, structured,
evidence-led learning experience suitable for professional review.

## What is included

- Accessible learner flow: enter your name, continue progress, text-size control.
- 16 step-by-step lessons covering computer basics, files, Word and Excel.
- Silent animated lesson walkthroughs so your own narration can be added in video editing.
- Extended "Guided practice" activity blocks for 60-minute supported lessons.
- Staff dashboard with progress, prompt level, consent/capacity record and audit log.
- Exportable CSV reports and printable completion certificates.
- Node/Express/PostgreSQL backend with staff authentication, learner progress records and tenant isolation.

## Quick start

Requires Node 18+ and PostgreSQL.

```bash
createdb ilearn
cp .env.example .env
npm install
npm run reset
npm start
```

Open `http://localhost:3000`.

Seed access is controlled by the `SEED_*` variables in `.env`. Do not put access
codes or staff passwords on public pages, screenshots or videos.

## How learner sign-in works

Learners are not expected to manage email/password accounts. They type their
name on the first screen. If that name already exists, iLearn reloads the same
learner profile and progress. If it is new, iLearn creates the learner and
starts tracking their course progress from lesson 1.

Staff sign in separately to view progress, learner records, consent/capacity and
reports.

## Architecture

```text
server.js              Express app, security headers, static SPA, health check
src/db.js              PostgreSQL pool and idempotent schema setup
src/repos.js           Parameterised SQL repositories
src/auth.js            JWTs, bcrypt and session/role guards
src/routes.js          REST API for learner name start, learner course and admin flows
src/course-content.js  16-lesson Confident Computing curriculum
src/seed.js            Configurable pilot seed data
public/                Accessible vanilla JS single-page app
test/api.test.js       End-to-end API tests
```

## Security and safeguarding

- Staff passwords are bcrypt-hashed.
- `JWT_SECRET` is mandatory in production.
- Helmet content security policy and rate limiting are enabled.
- Admin routes re-check organisation scope for every learner operation.
- Consent/capacity records are stored per learner.
- Audit log records staff logins, learner starts, learner changes and consent updates.

## Tests

```bash
DATABASE_URL=postgresql://... JWT_SECRET=... npm test
```

The tests cover learner name start, learner completion, admin overview, tenant
isolation, consent and role guards.

## Lesson Length

Each recorded video can stay short, around 5-8 minutes. The full lesson is
designed to last about 60 minutes through staff-led demonstration, repeated real
computer practice, iLearn activity cards, an independent attempt and progress
recording.

## Deployment

Use `DEPLOY.md` for the Render deployment flow. Before real learner use, set real
`SEED_*` values, confirm consent wording with the service lead, and disable
seeding after setup with `SEED_ON_BOOT=false`.
