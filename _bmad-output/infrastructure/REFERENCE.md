# Smeraldo Hotel — Master Reference
> Last updated: 2026-02-15. Read this file first after any context loss.

---

## 1. Repository Structure (CRITICAL)

```
/Users/khoatran/Downloads/Smeraldo Hotel/   ← GIT ROOT (this is the actual repo)
  .github/
    workflows/
      deploy.yml                             ← THE REAL CI/CD WORKFLOW (edit this one)
  smeraldo-hotel/                            ← SvelteKit app code lives here
    .github/
      workflows/
        deploy.yml                           ← ⚠ GHOST FILE — not used by GitHub CI, ignore it
    src/
    package.json
    svelte.config.js
    ...
  _bmad-output/                              ← Planning docs, stories, infrastructure
  _bmad/                                     ← BMAD framework
```

**The #1 trap:** There are TWO `deploy.yml` files. GitHub only reads
`.github/workflows/deploy.yml` at the repo root. All CI edits must go there.

### Git commands
```bash
# Always commit/push from the REPO ROOT, not from smeraldo-hotel/
cd "/Users/khoatran/Downloads/Smeraldo Hotel"
git add .github/workflows/deploy.yml   # correct
git add smeraldo-hotel/...             # also correct — app code

# The remote
git remote -v  # → https://github.com/NighttoDev/Smeraldo-Hotel.git
```

---

## 2. VPS Access

| Key | Value |
|-----|-------|
| IP | `103.47.225.24` |
| SSH | `ssh root@103.47.225.24` |
| Domain | `https://manage.smeraldohotel.online` (apex `smeraldohotel.online` → 301 redirect) |
| OS | Ubuntu 25.04 |
| App dir | `/var/www/smeraldo-hotel/smeraldo-hotel` |
| Supabase dir | `/opt/supabase` |

> ⚠ The local `~/.ssh/id_ed25519` key is **NOT** authorized on the VPS.
> The VPS uses `/root/.ssh/github_actions` (stored in GitHub secret `SSH_PRIVATE_KEY`).
> To SSH in manually, you need the password or to copy a new public key to the VPS first.

**Get Supabase keys from VPS:**
```bash
ssh root@103.47.225.24 "grep -E 'ANON_KEY|SERVICE_ROLE_KEY' /opt/supabase/.env"
```

---

## 3. Supabase (Self-Hosted)

| Item | Value |
|------|-------|
| Studio URL | `https://manage.smeraldohotel.online:8088` |
| Studio login | `supabase` / `8LYW0PkyjjLSZNxjQTL7Nw` |
| DB user | `supabase_admin` |
| DB password | `4dkhU4n7oyPBODf7VH2lYdf1f-DemJKW6gAPI3WQ37I` |
| DB port | `5432` |
| ANON_KEY | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE5NTY1ODUyMDB9.odbgX9N1pmbSeGoFoypd_gzJKqiTuLP-QCgiFQeSM7k` |
| SERVICE_ROLE_KEY | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTk1NjU4NTIwMH0.VNFtm7FSEaO9Sb5GdqXOzaFxNsoyjs87TpqpWHRl96g` |

**Supabase services:**
```
Kong gateway  → https://manage.smeraldohotel.online/rest/v1/ (via Nginx)
Auth          → https://manage.smeraldohotel.online/auth/v1/
Realtime      → https://manage.smeraldohotel.online/realtime/v1/
Storage       → https://manage.smeraldohotel.online/storage/v1/
Studio        → https://manage.smeraldohotel.online:8088
```

**Restart Supabase:**
```bash
ssh root@103.47.225.24 "cd /opt/supabase && docker compose restart"
```

---

## 4. GitHub Secrets (all set as of 2026-02-15)

| Secret | Value |
|--------|-------|
| `VPS_HOST` | `103.47.225.24` |
| `VPS_USER` | `root` |
| `SSH_PRIVATE_KEY` | contents of `/root/.ssh/github_actions` on VPS |
| `PUBLIC_SUPABASE_URL` | `https://manage.smeraldohotel.online` |
| `PUBLIC_SUPABASE_ANON_KEY` | ANON_KEY above |
| `SUPABASE_SERVICE_ROLE_KEY` | SERVICE_ROLE_KEY above |

**Verify / re-set secrets:**
```bash
gh secret list --repo NighttoDev/Smeraldo-Hotel
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "eyJ..." --repo NighttoDev/Smeraldo-Hotel
```

---

## 5. CI/CD Pipeline

File: `.github/workflows/deploy.yml` (repo root — the only one that matters)

Steps: `install → lint → type-check → unit tests → build → SSH deploy`

**Job-level env block (required for svelte-check to generate types):**
```yaml
env:
  PUBLIC_SUPABASE_URL: ${{ secrets.PUBLIC_SUPABASE_URL }}
  PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PUBLIC_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

**Deploy script on VPS:**
```bash
cd /var/www/smeraldo-hotel && git pull origin main
cd smeraldo-hotel && npm ci && npm run build
npm prune --omit=dev && pm2 reload smeraldo-hotel
```

---

## 6. Local Development

```bash
cd "/Users/khoatran/Downloads/Smeraldo Hotel/smeraldo-hotel"

# Env file (local dev — uses Supabase local or remote)
cp .env.example .env   # then fill in values

# Run dev server
npm run dev

# Validate before committing
npm run lint       # 0 errors required
npm run check      # 0 errors required (2 known Svelte 5 warnings are OK)
npm test           # all tests must pass
npm run build      # must succeed
```

**Local `.env` for production remote:**
```
PUBLIC_SUPABASE_URL=https://manage.smeraldohotel.online
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjQxNzY5MjAwLCJleHAiOjE5NTY1ODUyMDB9.odbgX9N1pmbSeGoFoypd_gzJKqiTuLP-QCgiFQeSM7k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTk1NjU4NTIwMH0.VNFtm7FSEaO9Sb5GdqXOzaFxNsoyjs87TpqpWHRl96g
DATABASE_URL=postgresql://supabase_admin:4dkhU4n7oyPBODf7VH2lYdf1f-DemJKW6gAPI3WQ37I@103.47.225.24:5432/postgres
```

---

## 7. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | SvelteKit 2.x + Svelte 5 (runes: `$props`, `$state`, `$derived`) |
| Styling | Tailwind CSS v3 |
| Forms | sveltekit-superforms 2.29.1 + Zod v4 (`zod4` adapter) |
| Auth | Supabase Auth (session via `@supabase/ssr`) |
| DB | Supabase Postgres (self-hosted) + RLS |
| Runtime | Node.js 22, adapter-node, PM2 |
| Tests | Vitest |
| CI/CD | GitHub Actions → SSH deploy to VPS |

**Key coding rules (from project-context.md):**
- Never use `any` — define narrow interfaces
- Always pair Form Actions with `superValidate` + Zod on both server and client
- Svelte 5 runes only — no legacy `export let`, `$:`, `onMount`
- Zod v4 API: `z.enum([...], { error: '...' })`, not `.describe()`

---

## 8. Project Status (as of 2026-02-15)

| Story | Status |
|-------|--------|
| 1.1 — Project scaffold + CI/CD | ✅ done |
| 1.2 — DB schema, RLS, migrations | ✅ done |
| 1.3 — Staff login / session / logout | ✅ done |
| 1.4 — RBAC + Staff account management | ✅ done |
| Epic 2+ | backlog |

**Test count:** 52/52 passing across 8 test files.

---

## 9. Adding Future DB Migrations

```bash
# 1. Create migration file
# smeraldo-hotel/supabase/migrations/00005_add_something.sql

# 2. Apply to VPS
scp smeraldo-hotel/supabase/migrations/00005_add_something.sql root@103.47.225.24:/tmp/
ssh root@103.47.225.24 \
  "docker exec supabase-db psql -U postgres -v ON_ERROR_STOP=1 -f /tmp/00005_add_something.sql"

# 3. Regenerate TypeScript types
cd smeraldo-hotel
npx supabase gen types typescript \
  --db-url "postgresql://supabase_admin:4dkhU4n7oyPBODf7VH2lYdf1f-DemJKW6gAPI3WQ37I@103.47.225.24:5432/postgres" \
  > src/lib/db/types.ts

# 4. Commit from REPO ROOT
cd "/Users/khoatran/Downloads/Smeraldo Hotel"
git add smeraldo-hotel/supabase/migrations/00005_add_something.sql smeraldo-hotel/src/lib/db/types.ts
git commit -m "db: add <description>"
git push origin main
```

---

## 10. Common VPS Operations

```bash
# View app logs
ssh root@103.47.225.24 "pm2 logs smeraldo-hotel --lines 50"

# Restart app
ssh root@103.47.225.24 "pm2 reload smeraldo-hotel"

# View Supabase logs
ssh root@103.47.225.24 "cd /opt/supabase && docker compose logs -f --tail=50"

# Manual redeploy
ssh root@103.47.225.24 "cd /var/www/smeraldo-hotel && git pull origin main && cd smeraldo-hotel && npm ci && npm run build && npm prune --omit=dev && pm2 reload smeraldo-hotel"

# Check running processes
ssh root@103.47.225.24 "pm2 list && docker ps --format 'table {{.Names}}\t{{.Status}}'"
```
