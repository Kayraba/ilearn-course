# Deploying iLearn on Render

This repo includes `render.yaml` for a Render Blueprint: one Node web service and
one managed PostgreSQL database. Render wires `DATABASE_URL` and generates
`JWT_SECRET` automatically.

## 1. Prepare the repository

1. Unzip the package.
2. Create a private GitHub repository for the client build.
3. Commit the files:

```bash
git init
git add .
git commit -m "iLearn client pilot"
git branch -M main
git remote add origin https://github.com/<you>/ilearn.git
git push -u origin main
```

## 2. Set seed variables before first live boot

The first deploy can create the pilot organisation and sample learners. Configure
these values in Render before using the system with a client:

| Variable | Purpose |
|---|---|
| `SEED_ORG_NAME` | Client/service name shown in the app |
| `SEED_ORG_SLUG` | Short lowercase service slug, for example `pilot` |
| `SEED_ADMIN_NAME` | First admin display name |
| `SEED_ADMIN_EMAIL` | First admin email address |
| `SEED_ADMIN_PASSWORD` | Strong temporary admin password |
Learners are not preloaded. They are created when they enter their name on the
start screen.

## 3. Deploy on Render

1. Go to Render, then New, then Blueprint.
2. Connect GitHub and choose the `ilearn` repository.
3. Apply the blueprint.
4. Wait for the first deploy to finish.
5. Check `/healthz`; it should return `{"ok":true}`.

## 4. Handover checklist

- Confirm the organisation name is correct.
- Change the initial admin password after first sign-in.
- Ask each learner to use the same name each time so their progress continues.
- Record consent and capacity status before learners begin.
- Run a tablet test: setup, learner sign-in, one lesson complete, staff report view.
- Export a CSV and print/save one certificate to confirm reporting works.
- Set `SEED_ON_BOOT=false` after real learner data has been created.
- Enable PostgreSQL backups for the Render database.

## Environment variables

| Variable | Required | Notes |
|---|---:|---|
| `DATABASE_URL` | Yes | Set automatically by Render Blueprint |
| `JWT_SECRET` | Yes | Generated automatically by Render Blueprint |
| `NODE_ENV=production` | Yes | Set in `render.yaml` |
| `SEED_ORG_NAME` | First boot | Service name |
| `SEED_ORG_SLUG` | First boot | Lowercase service slug |
| `SEED_ADMIN_NAME` | First boot | First admin name |
| `SEED_ADMIN_EMAIL` | First boot | First admin email |
| `SEED_ADMIN_PASSWORD` | First boot | Strong temporary password |
| `SEED_ON_BOOT=false` | After setup | Prevents reseeding once live |
| `PGSSL=true` | Optional | Use if your Postgres provider requires SSL |

## Docker alternative

```bash
docker build -t ilearn .
docker run -e DATABASE_URL=... -e JWT_SECRET=... -p 3000:3000 ilearn
```
