# Security Checklist

## Implemented or verified

- `JWT_SECRET` is required in production.
- Staff passwords are bcrypt-hashed.
- Express Helmet security headers are enabled.
- Auth routes are rate-limited.
- Admin routes require admin role.
- Learner routes require a learner session.
- User-provided names are validated server-side.
- Dynamic UI rendering escapes learner/admin text where practical.
- No public demo credentials are shown in the UI.
- No API keys are committed.
- Database connection is read from `DATABASE_URL`.
- Production seed refuses placeholder admin email/password values.

## Required before live pilot

- Use a strong `JWT_SECRET`.
- Use a persistent PostgreSQL database.
- Set a strong `SEED_ADMIN_PASSWORD` before first boot.
- Change the initial admin password after first sign-in if possible.
- Keep the GitHub repository private.
- Enable database backups.
- Confirm who can access Render/hosting logs.

## Remaining production hardening

- add staff password reset flow
- add staff account management UI
- add stronger accessible learner identity control
- add formal penetration/security review
- add automated dependency scanning in CI
