# Test Results

Date: 2026-06-30

## Commands run

```bash
npm install
node --check server.js
node --check src/auth.js
node --check src/course-content.js
node --check src/db.js
node --check src/repos.js
node --check src/routes.js
node --check src/seed.js
node --check public/js/app.js
node --check public/js/animations.js
node --check test/api.test.js
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('package-lock.json','utf8')); const c=require('./src/course-content'); if(c.lessons.length!==16) process.exit(2); console.log('package/course ok')"
npm test
```

## Passed

- `npm install` completed successfully.
- `npm audit` result from install: 0 vulnerabilities.
- JavaScript syntax checks passed for 10 JS files.
- `package.json` and `package-lock.json` parse correctly.
- Course content loads with 16 lessons.
- All lessons have extended activity blocks for 60-minute supported sessions.
- Demo credential scan found no public demo credentials, Havilah references, sample learner names, old device routes or old learner PIN login strings.

## Could not fully test

`npm test` could not run the API assertions because no local PostgreSQL service
was available at `127.0.0.1:5432`.

Observed error:

```text
connect ECONNREFUSED 127.0.0.1:5432
```

This blocks automated testing of:

- first database seed
- learner name start
- progress persistence
- admin dashboard API
- consent/capacity API
- CSV export API
- audit log API

## Browser testing

Full browser smoke testing was not completed because the app requires a running
PostgreSQL database to boot successfully.

## Fixed during this pass

- removed old device-unlock learner flow
- removed old learner PIN UI and reset PIN controls
- removed seeded sample learners
- added name-based learner start and progress resume
- added stricter learner/admin name validation
- escaped dynamic UI values in learner/admin rendering
- added pilot privacy/accessibility/safeguarding links
- added required council/client documentation pack
- added production guard against unsafe seed admin defaults
- added generic API error response handler

## Remaining test requirement before launch

Run the app against the actual pilot PostgreSQL database and test:

1. `/healthz`
2. learner starts by name
3. learner completes one activity and lesson
4. refresh continues progress
5. staff/admin signs in
6. admin sees learner progress
7. admin records consent/capacity
8. CSV export downloads
9. audit log records actions
10. mobile/tablet layout on the target device
