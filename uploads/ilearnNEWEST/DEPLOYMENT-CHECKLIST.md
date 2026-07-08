# Deployment Checklist

## Before deploy

- Repository is private.
- `.env` is not committed.
- `.env.production.example` contains placeholders only.
- `JWT_SECRET` is set.
- `DATABASE_URL` points to persistent PostgreSQL.
- `NODE_ENV=production` is set.
- `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are set for first boot.
- Privacy, accessibility and safeguarding docs are reviewed.

## After deploy

- Visit `/healthz` and confirm `{"ok":true}`.
- Test learner name start.
- Complete one lesson.
- Confirm progress updates after refresh.
- Sign in as staff/admin.
- Add a learner from admin.
- Record consent/capacity.
- Export CSV.
- Check audit log.
- Confirm database backups.
- Set `SEED_ON_BOOT=false` after real records exist.

## Go/no-go

Go for controlled pilot only if all above checks pass and the client has signed
off on privacy, safeguarding and retention responsibilities.
