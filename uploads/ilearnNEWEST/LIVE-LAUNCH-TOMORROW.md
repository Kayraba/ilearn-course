# Live Launch Tomorrow - Controlled Pilot Steps

1. Unzip the package.
2. Push to a private GitHub repository.
3. Connect the repository to Render or the chosen hosting provider.
4. Create or attach a persistent PostgreSQL database.
5. Add environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `SEED_ORG_NAME`
   - `SEED_ORG_SLUG`
   - `SEED_ADMIN_NAME`
   - `SEED_ADMIN_EMAIL`
   - `SEED_ADMIN_PASSWORD`
6. Deploy the web service.
7. Visit `/healthz` and confirm `{"ok":true}`.
8. Sign in as staff/admin.
9. Ask one learner/test user to start by name.
10. Open lesson 1.
11. Replay the animation.
12. Complete at least one activity card.
13. Mark the lesson complete with a support level.
14. Refresh and confirm progress remains.
15. Open admin dashboard and confirm learner progress.
16. Record consent/capacity for the learner.
17. Export CSV.
18. Check activity log.
19. Confirm privacy/accessibility/safeguarding documents are reviewed.
20. Confirm database backup plan.
21. Set `SEED_ON_BOOT=false` after real learner data is created.

Go-live verdict should be controlled pilot only, not full production.
