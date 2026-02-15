---
title: 'Project Alignment Review & Domain Migration to manage.smeraldohotel.online'
slug: 'project-alignment-domain-migration'
created: '2026-02-15'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - 'Nginx (VPS reverse proxy)'
  - 'Certbot / Let'\''s Encrypt'
  - 'GitHub Actions secrets'
  - 'SvelteKit adapter-node (Node.js env vars)'
  - 'Supabase self-hosted Docker Compose'
files_to_modify:
  - '/etc/nginx/sites-available/smeraldo'                              # VPS — Nginx config
  - '/opt/supabase/.env'                                               # VPS — Supabase env: SUPABASE_PUBLIC_URL, API_EXTERNAL_URL, SITE_URL
  - '/var/www/smeraldo-hotel/smeraldo-hotel/.env'                      # VPS — App env: PUBLIC_SUPABASE_URL
  - 'GitHub Secret: PUBLIC_SUPABASE_URL'                               # GitHub repo secret
  - '_bmad-output/infrastructure/REFERENCE.md'                        # Doc — master reference
  - 'memory/MEMORY.md'                                                 # Doc — project memory
code_patterns:
  - 'Nginx server blocks with proxy_pass to 127.0.0.1:3000 (app) and :8000 (Supabase Kong)'
  - 'Certbot cert at /etc/letsencrypt/live/<domain>/fullchain.pem — separate cert per domain name'
  - 'Supabase .env uses SUPABASE_PUBLIC_URL + API_EXTERNAL_URL + SITE_URL for external domain binding'
  - 'PM2 loads .env via env_file — reload required after .env change'
  - 'docker compose down && up -d required after Supabase .env change (restart does not re-read .env)'
  - 'GitHub Secrets flow: secret → CI job env → npm run build → baked into adapter-node build'
test_patterns:
  - 'No tests for infrastructure — manual smoke test checklist only'
  - 'Verify: curl https://manage.smeraldohotel.online/ returns 200'
  - 'Verify: curl -I https://smeraldohotel.online/ returns 301 Location: manage.smeraldohotel.online'
  - 'Verify: WebSocket Realtime still connects (check LiveStatusIndicator shows Live)'
---

# Tech-Spec: Project Alignment Review & Domain Migration to manage.smeraldohotel.online

**Created:** 2026-02-15

## Overview

### Problem Statement

The hotel management app and Supabase API are currently served from `smeraldohotel.online`. The team needs to (1) verify the current implementation aligns with the planning docs, and (2) migrate the app + Supabase API to a dedicated subdomain `manage.smeraldohotel.online`, with `smeraldohotel.online` 301-redirecting to the new subdomain. DNS A record for the subdomain has not been set yet.

### Solution

Document the implementation alignment status (Epics 1–2 complete, Epics 3–7 pending and in correct state per docs). Add DNS A record for the subdomain, issue a TLS certificate via Certbot, reconfigure Nginx to serve the app + all Supabase API proxy paths from `manage.smeraldohotel.online`, set `smeraldohotel.online` to 301 redirect, and update `PUBLIC_SUPABASE_URL` in GitHub Secrets and VPS environment files.

### Scope

**In Scope:**
- Alignment review: Epic 1–2 verification findings, Epic 3–7 readiness check
- DNS: Add A record `manage.smeraldohotel.online → 103.47.225.24` (manual user action)
- Nginx: New server block for `manage.smeraldohotel.online` (app + Supabase API proxy paths)
- TLS: Certbot certificate issuance for `manage.smeraldohotel.online`
- Update `smeraldohotel.online` Nginx block → 301 redirect to `manage.smeraldohotel.online`
- Update `PUBLIC_SUPABASE_URL` GitHub secret to `https://manage.smeraldohotel.online`
- Update REFERENCE.md and MEMORY.md with new domain references

**Out of Scope:**
- Implementing Epics 3–7 (separate stories)
- Changing Supabase Studio port `:8088` setup
- Modifying any SvelteKit app source code

## Context for Development

### Alignment Review Findings

**Epic 1 (Stories 1.1–1.4): ✅ COMPLETE — matches docs**
- `svelte.config.js` uses `adapter-node` ✅
- Routes: `(auth)/login`, `(manager)/staff/[staffId]`, `(reception)/rooms`, `(housekeeping)/my-rooms` ✅
- Middleware: `hooks.server.ts`, per-group `+layout.server.ts` for RBAC ✅
- Server modules: `src/lib/server/auth.ts`, `adminClient.ts`, `db/staff.ts`, `db/rooms.ts` ✅
- Stores: `session.ts`, `roomState.ts`, `realtimeStatus.ts`, `notifications.ts` ✅
- 52/52 tests passing ✅

**Epic 2 (Stories 2.1–2.5): ✅ COMPLETE — matches docs**
- Components: `RoomTile.svelte`, `RoomGrid.svelte`, `FloorFilter.svelte`, `MonthlyCalendarView.svelte`, `StatusOverrideDialog.svelte`, `HousekeepingRoomCard.svelte`, `StatusBadge.svelte`, `RoomStatusStrip.svelte` ✅
- Layout: `TopNavbar.svelte`, `BottomTabBar.svelte`, `LiveStatusIndicator.svelte` ✅
- Story 2.5 (`real-time-room-status-sync`) marked `done` ✅

**Epics 3–7: 🔜 PENDING — expected, no deviation**
- Server-side DB modules pre-scaffolded: `db/bookings.ts`, `db/attendance.ts`, `db/inventory.ts`, `db/reports.ts` ✅
- `offlineQueue.ts` and `notifications.ts` pre-scaffolded for Epics 7/2 ✅
- No routes yet for bookings, attendance, inventory, reports — correct for current sprint state ✅
- No orphaned code, no deviations from architecture ✅

### Nginx Architecture Patterns

The VPS Nginx config (`/etc/nginx/sites-available/smeraldo`) has 3 server blocks:
1. **HTTPS 443 + app** — `server_name smeraldohotel.online` → proxies `/` to `127.0.0.1:3000` (PM2 SvelteKit), `/rest/v1/`, `/auth/v1/`, `/realtime/v1/`, `/storage/v1/` to `127.0.0.1:8000` (Supabase Kong)
2. **Studio port 8088** — `listen 8088 ssl; server_name smeraldohotel.online` → proxies to `127.0.0.1:3001`
3. **HTTP 80 redirect** — `smeraldohotel.online` → 301 `https://smeraldohotel.online`

**TLS pattern**: Each `server_name` gets its own cert at `/etc/letsencrypt/live/<domain>/`. Certbot runs `certbot --nginx -d <domain>` per domain.

**Supabase .env domain bindings** (in `/opt/supabase/.env`):
- `SUPABASE_PUBLIC_URL` — public URL used in API responses
- `API_EXTERNAL_URL` — external URL for Kong gateway
- `SITE_URL` — app URL for Supabase Auth email redirect links (e.g., confirm email, reset password)

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `/etc/nginx/sites-available/smeraldo` (VPS) | Current Nginx config — template for new subdomain block |
| `/opt/supabase/.env` (VPS) | Supabase env — 3 domain vars to update |
| `/var/www/smeraldo-hotel/smeraldo-hotel/.env` (VPS) | App runtime env — `PUBLIC_SUPABASE_URL` |
| `.github/workflows/deploy.yml` (repo root) | CI/CD — env vars from GitHub Secrets |
| `_bmad-output/infrastructure/vps-setup-guide.md` | Step 4 (Nginx) and Step 5 (Certbot) are the reference |
| `_bmad-output/infrastructure/REFERENCE.md` | Master reference — domain and endpoint table to update |

### Technical Decisions

1. **Separate cert for subdomain** — Issue a new Certbot cert for `manage.smeraldohotel.online` rather than expanding the apex cert. Avoids any risk to the existing apex cert and Studio port 8088.

2. **Studio stays at `smeraldohotel.online:8088`** — The Studio server block and its cert do NOT change. Studio access URL stays `https://smeraldohotel.online:8088`.

3. **HTTP 80 redirect catches both domains** — The HTTP redirect block must include both `smeraldohotel.online` and `manage.smeraldohotel.online` in `server_name` to ensure all HTTP traffic redirects to HTTPS on the new subdomain.

4. **Supabase containers need full recreation** — `docker compose restart` does NOT re-read `.env` (restarts existing containers without recreating). Must use `docker compose down && docker compose up -d` to apply new `SUPABASE_PUBLIC_URL`, `API_EXTERNAL_URL`, and `SITE_URL`.

5. **GitHub Secret update triggers a new CI build** — After updating `PUBLIC_SUPABASE_URL` secret, push an empty commit (or manually trigger workflow) to bake the new URL into the next build.

6. **`ADDITIONAL_REDIRECT_URLS` in Supabase .env** — Should include `https://manage.smeraldohotel.online` if currently pointing to `smeraldohotel.online`, to ensure Supabase Auth accepts the new origin for redirects.

## Implementation Plan

### Tasks

> **Execution order is critical — DNS must propagate before Certbot, Certbot before Nginx reload, env updates before PM2 reload.**

---

#### Part A — Alignment Review (no action, already verified ✅)

- [x] **Task 0: Verify implementation aligns with docs**
  - Finding: Epics 1–2 fully implemented and match planning docs. No deviations detected.
  - Finding: Epics 3–7 correctly pending — server-side DB modules pre-scaffolded (`bookings.ts`, `attendance.ts`, `inventory.ts`, `reports.ts`, `offlineQueue.ts`).
  - Action: None required. Continue to Epic 3 stories after this domain migration.

---

#### Part A.5 — Pre-Migration Baseline Check (VPS, before any changes)

- [ ] **Task 0.5: Verify current state is healthy before touching anything**
  - Where: VPS + local machine
  - Action:
    ```bash
    # Confirm app is responding
    curl -I https://smeraldohotel.online/
    # Expected: HTTP/2 200 or 301

    # Confirm Supabase containers are healthy
    ssh root@103.47.225.24 "cd /opt/supabase && docker compose ps"
    # Expected: all services Up (healthy)

    # Confirm PM2 is running
    ssh root@103.47.225.24 "pm2 list"
    # Expected: smeraldo-hotel status: online
    ```
  - Notes: If anything is already broken before migration starts, stop and fix it first. Without this baseline, you cannot distinguish pre-existing breakage from migration-caused breakage.

---

#### Part B — DNS (manual user action, prerequisite for all VPS tasks)

- [ ] **Task 1: Add DNS A record for `manage.smeraldohotel.online`**
  - Where: Your DNS provider (domain registrar control panel)
  - Action: Create A record: `manage.smeraldohotel.online` → `103.47.225.24`
  - TTL: 300 seconds (5 min) for fast propagation
  - Verify with **public resolver** (not local cache):
    ```bash
    dig @8.8.8.8 manage.smeraldohotel.online +short
    ```
    Must return `103.47.225.24`. Local `dig` without `@8.8.8.8` can give a cached false positive — Certbot's ACME server checks from outside, so always verify via a public resolver.
  - Notes: **HARD GATE** — do not proceed to Task 2 until this returns the correct IP.

---

#### Part C — TLS Certificate (VPS, run after DNS propagates)

- [ ] **Task 2: Issue Certbot TLS certificate for `manage.smeraldohotel.online`**
  - Where: SSH into VPS (`ssh root@103.47.225.24`)
  - Action:
    ```bash
    certbot certonly --nginx -d manage.smeraldohotel.online \
      --non-interactive --agree-tos --email admin@smeraldohotel.online
    ```
  - Expected output: `Successfully received certificate` stored at `/etc/letsencrypt/live/manage.smeraldohotel.online/`
  - Notes: Uses `certonly` — does NOT auto-modify Nginx (we'll write the config manually in Task 3). The existing `smeraldohotel.online` cert is untouched.

---

#### Part D — Nginx Reconfiguration (VPS, run after cert is issued)

- [ ] **Task 3: Replace `/etc/nginx/sites-available/smeraldo` with new 4-block config**
  - File: `/etc/nginx/sites-available/smeraldo` (VPS)
  - **First, backup the existing config:**
    ```bash
    cp /etc/nginx/sites-available/smeraldo /etc/nginx/sites-available/smeraldo.bak.$(date +%Y%m%d)
    ```
  - Action: Replace entire file content with the following:

    ```nginx
    # ─── 1. manage.smeraldohotel.online — App + Supabase API ─────────────────
    server {
        server_name manage.smeraldohotel.online;

        # SvelteKit app
        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Supabase REST API
        location /rest/v1/ {
            proxy_pass http://127.0.0.1:8000/rest/v1/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Supabase Auth
        location /auth/v1/ {
            proxy_pass http://127.0.0.1:8000/auth/v1/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Supabase Realtime (WebSocket — must have Upgrade headers)
        location /realtime/v1/ {
            proxy_pass http://127.0.0.1:8000/realtime/v1/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Supabase Storage
        location /storage/v1/ {
            proxy_pass http://127.0.0.1:8000/storage/v1/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        listen 443 ssl;
        ssl_certificate /etc/letsencrypt/live/manage.smeraldohotel.online/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/manage.smeraldohotel.online/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    }

    # ─── 2. smeraldohotel.online (apex) — 301 redirect ───────────────────────
    server {
        server_name smeraldohotel.online;
        return 301 https://manage.smeraldohotel.online$request_uri;

        listen 443 ssl;
        ssl_certificate /etc/letsencrypt/live/smeraldohotel.online/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/smeraldohotel.online/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    }

    # ─── 3. Supabase Studio — unchanged at smeraldohotel.online:8088 ─────────
    server {
        listen 8088 ssl;
        server_name smeraldohotel.online;

        ssl_certificate /etc/letsencrypt/live/smeraldohotel.online/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/smeraldohotel.online/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf;
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

        location / {
            proxy_pass http://127.0.0.1:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 900;
        }
    }

    # ─── 4. HTTP → HTTPS redirect (both domains) ─────────────────────────────
    # IMPORTANT: acme-challenge location must come BEFORE the redirect so
    # Certbot HTTP-01 renewals (for both certs) can complete via port 80.
    server {
        listen 80;
        server_name smeraldohotel.online manage.smeraldohotel.online;

        location /.well-known/acme-challenge/ {
            root /var/www/html;
        }

        location / {
            return 301 https://manage.smeraldohotel.online$request_uri;
        }
    }
    ```

  - After editing, run:
    ```bash
    nginx -t && systemctl reload nginx
    ```
  - Notes: `nginx -t` must pass before reload. If it fails, do NOT reload — check cert paths first.

---

#### Part E — Supabase Env Update (VPS)

- [ ] **Task 4: Update domain vars in `/opt/supabase/.env`**
  - File: `/opt/supabase/.env` (VPS)
  - **First, backup the existing .env:**
    ```bash
    cp /opt/supabase/.env /opt/supabase/.env.bak.$(date +%Y%m%d)
    ```
  - Action — update with `sed`:
    ```bash
    sed -i 's|SUPABASE_PUBLIC_URL=https://smeraldohotel.online|SUPABASE_PUBLIC_URL=https://manage.smeraldohotel.online|' /opt/supabase/.env
    sed -i 's|API_EXTERNAL_URL=https://smeraldohotel.online|API_EXTERNAL_URL=https://manage.smeraldohotel.online|' /opt/supabase/.env
    sed -i 's|SITE_URL=https://smeraldohotel.online|SITE_URL=https://manage.smeraldohotel.online|' /opt/supabase/.env
    ```
  - Update `ADDITIONAL_REDIRECT_URLS` — replace the old domain with the new one (do not leave both):
    ```bash
    sed -i 's|ADDITIONAL_REDIRECT_URLS=https://smeraldohotel.online|ADDITIONAL_REDIRECT_URLS=https://manage.smeraldohotel.online|' /opt/supabase/.env
    ```
    If `ADDITIONAL_REDIRECT_URLS` was empty, set it to the new domain. Leaving `smeraldohotel.online` in the redirect allowlist is a security risk.
  - Verify the changes:
    ```bash
    grep -E 'SUPABASE_PUBLIC_URL|API_EXTERNAL_URL|SITE_URL|ADDITIONAL_REDIRECT' /opt/supabase/.env
    ```
  - Notes: `SITE_URL` controls where Supabase Auth redirects users after email confirmation. Must match the app's new URL.

- [ ] **Task 5: Recreate Supabase Docker containers to apply new env**
  - Where: VPS
  - **Important:** `docker compose restart` does NOT re-read `.env` — it restarts containers with their existing environment. You must recreate the containers with `down && up -d`.
  - Action:
    ```bash
    cd /opt/supabase
    docker compose down
    docker compose up -d
    sleep 45
    ```
  - Verify containers are healthy **and responding** (not just "Up"):
    ```bash
    docker compose ps
    # All should show (healthy) — not just Up

    # Also verify Supabase Auth is actually responding with new domain
    curl -sf http://localhost:8000/auth/v1/health
    # Expected: {"status":"ok"} or similar (not a connection error)
    ```
  - If any container is not healthy: `docker compose logs auth` to debug.

---

#### Part F — App Env + GitHub Secret Update

- [ ] **Task 6: Update app `.env` on VPS**
  - File: `/var/www/smeraldo-hotel/smeraldo-hotel/.env` (VPS)
  - **First, backup the existing .env:**
    ```bash
    cp /var/www/smeraldo-hotel/smeraldo-hotel/.env /var/www/smeraldo-hotel/smeraldo-hotel/.env.bak.$(date +%Y%m%d)
    ```
  - Action:
    ```bash
    sed -i 's|PUBLIC_SUPABASE_URL=https://smeraldohotel.online|PUBLIC_SUPABASE_URL=https://manage.smeraldohotel.online|' /var/www/smeraldo-hotel/smeraldo-hotel/.env
    ```
  - Notes: PM2 loads `.env` at process start via `env_file`. This will be picked up after the CI deploy reloads PM2.

- [ ] **Task 7: Update GitHub Secret `PUBLIC_SUPABASE_URL`**
  - ⚠ **HARD GATE: Complete this step BEFORE pushing the empty commit in Task 8.** If you push first, CI will build with the old URL.
  - Where: Local machine (with `gh` CLI authenticated)
  - Action:
    ```bash
    gh secret set PUBLIC_SUPABASE_URL \
      --body "https://manage.smeraldohotel.online" \
      --repo NighttoDev/Smeraldo-Hotel
    ```
  - Verify it was set:
    ```bash
    gh secret list --repo NighttoDev/Smeraldo-Hotel | grep PUBLIC_SUPABASE_URL
    ```
  - Notes: `PUBLIC_*` vars in SvelteKit with adapter-node are **baked into the build at compile time**. The GitHub Secret must be updated first so the next CI build uses the new value.

- [ ] **Task 8: Trigger CI deploy, then PM2 reload**
  - ⚠ **Order matters: push the empty commit FIRST to trigger CI, then PM2 reload AFTER CI deploy succeeds.**
  - Action 1 (local — trigger CI build with updated secret):
    ```bash
    cd "/Users/khoatran/Downloads/Smeraldo Hotel"
    git commit --allow-empty -m "chore: trigger deploy after domain migration to manage.smeraldohotel.online"
    git push origin main
    ```
  - Action 2 — **Wait for CI pipeline to complete successfully** (check GitHub Actions tab). CI will rebuild the app with the new `PUBLIC_SUPABASE_URL` and run `pm2 reload smeraldo-hotel` via SSH on the VPS.
  - Action 3 (only if CI deploy does NOT reload PM2, or for the runtime .env to take effect):
    ```bash
    ssh root@103.47.225.24 "pm2 reload smeraldo-hotel"
    ```
  - Notes: PM2 reload without a new build is pointless for `PUBLIC_*` vars — those are baked at compile time, not runtime. The CI rebuild is what matters. PM2 reload is only needed to pick up the `.env` change from Task 6 if CI doesn't trigger it.

---

#### Part G — Documentation Update

- [ ] **Task 9: Update `_bmad-output/infrastructure/REFERENCE.md`**
  - File: `_bmad-output/infrastructure/REFERENCE.md`
  - Action: Update all domain references:
    - Section 2 (VPS Access): Change `Domain` row to `https://manage.smeraldohotel.online`
    - Section 3 (Supabase): Change all endpoint URLs from `smeraldohotel.online` to `manage.smeraldohotel.online` (except Studio which stays at `smeraldohotel.online:8088`)
    - Section 4 (GitHub Secrets): Update `PUBLIC_SUPABASE_URL` value
    - Section 6 (Local Development): Update `PUBLIC_SUPABASE_URL` in the `.env` example block
    - Endpoints table at bottom: Update all app/API URLs to `manage.smeraldohotel.online`

- [ ] **Task 10: Update `memory/MEMORY.md`**
  - File: `memory/MEMORY.md`
  - Action: In the `## Live Server` section, change:
    - `App: https://smeraldohotel.online/` → `App: https://manage.smeraldohotel.online/`
    - Add note: `Old domain (smeraldohotel.online) → 301 redirects to manage.smeraldohotel.online`
    - In `## CI env vars required` section: Update example `PUBLIC_SUPABASE_URL` comment to show new domain

---

### Acceptance Criteria

- [ ] **AC 1:** Given DNS A record `manage.smeraldohotel.online → 103.47.225.24` is set, when `dig manage.smeraldohotel.online +short` is run, then it returns `103.47.225.24`

- [ ] **AC 2:** Given Certbot cert is issued, when `ls /etc/letsencrypt/live/manage.smeraldohotel.online/` is run on VPS, then `fullchain.pem` and `privkey.pem` are present

- [ ] **AC 3:** Given Nginx is reloaded with the new config, when `curl -I https://manage.smeraldohotel.online/` is run, then the response is `HTTP/2 200` and the app login page loads

- [ ] **AC 4:** Given the apex domain redirects, when `curl -I https://smeraldohotel.online/` is run, then the response is `HTTP/2 301` with `location: https://manage.smeraldohotel.online/`

- [ ] **AC 5:** Given Supabase API is now served from the new subdomain, when a browser navigates to `https://manage.smeraldohotel.online/login` and a staff member logs in, then Supabase Auth completes successfully (no CORS or redirect errors)

- [ ] **AC 6:** Given the SvelteKit app is rebuilt with the new `PUBLIC_SUPABASE_URL`, when the Realtime `LiveStatusIndicator` component loads in the app, then it shows the green "Live · Updated just now" state (confirming WebSocket connection to `manage.smeraldohotel.online/realtime/v1/` succeeds)

- [ ] **AC 7:** Given Supabase Studio is unchanged, when a browser navigates to `https://smeraldohotel.online:8088/`, then Supabase Studio loads and accepts login (Studio is NOT affected by the migration)

- [ ] **AC 8:** Given the CI pipeline has rebuilt and deployed the app, when a browser opens DevTools → Network on `https://manage.smeraldohotel.online/login`, then all Supabase API requests go to `manage.smeraldohotel.online/auth/v1/` and `manage.smeraldohotel.online/rest/v1/` — no requests to the old `smeraldohotel.online` domain. (`PUBLIC_*` vars are baked into the build at compile time and are not visible in `pm2 show`.)

## Additional Context

### Dependencies

1. **DNS propagation** — All VPS tasks block on Task 1 (DNS A record). Verify with `dig` before proceeding.
2. **Certbot DNS validation** — Certbot makes an HTTP-01 challenge via Nginx (port 80). Nginx must be running when Certbot runs (it is, already serving `smeraldohotel.online`).
3. **GitHub Secret rebuild** — The `PUBLIC_SUPABASE_URL` is a `PUBLIC_*` env var baked into the SvelteKit build at compile time. The empty commit in Task 8 triggers a clean rebuild. Without this, the old URL remains in the running binary.
4. **Supabase auth redirect** — `SITE_URL` in `/opt/supabase/.env` must be updated (Task 4) before any staff member resets a password or confirms an email — otherwise the redirect in the auth email will point to the old domain.

### Testing Strategy

**Manual smoke tests (run after Task 8 CI deploy completes):**

```bash
# 1. New subdomain serves app
curl -I https://manage.smeraldohotel.online/
# Expected: HTTP/2 200

# 2. Apex redirects
curl -I https://smeraldohotel.online/
# Expected: HTTP/2 301 + Location: https://manage.smeraldohotel.online/

# 3. HTTP also redirects
curl -I http://smeraldohotel.online/
# Expected: 301 + Location: https://manage.smeraldohotel.online/

# 4. Supabase REST API at new domain
curl https://manage.smeraldohotel.online/rest/v1/ \
  -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>"
# Expected: 200 or 404 (no 502/504)

# 5. Studio still works
curl -I https://smeraldohotel.online:8088/
# Expected: 200

# 6. Realtime WebSocket
# Open app in browser → check LiveStatusIndicator shows "Live · Updated just now"
```

**No unit or integration tests required** — this is a pure infrastructure change with no application code modifications.

### Notes

- **Pre-mortem risk: Certbot failure** — Certbot will fail if DNS hasn't propagated yet. Always run `dig manage.smeraldohotel.online +short` and wait for `103.47.225.24` before running Certbot.

- **Pre-mortem risk: Nginx config typo** — Always run `nginx -t` before `systemctl reload nginx`. A typo in the cert path will cause `nginx -t` to fail, keeping the old config live (safe).

- **Pre-mortem risk: Supabase containers stale after restart** — If `docker compose ps` shows any container not healthy after Task 5, run `docker compose logs auth` to check for errors. Most common issue: `LOGFLARE_API_KEY` being empty (must be non-empty).

- **Pre-mortem risk: Old PUBLIC_SUPABASE_URL in built binary** — If the CI deploy runs before Task 7 (GitHub Secret update), the next build will still use the old URL. Sequence matters: update secret first, then push the empty commit.

- **⚠ Operational: All active staff sessions will be invalidated at cutover** — Session cookies are scoped to `smeraldohotel.online` and will NOT be sent to `manage.smeraldohotel.online` (different subdomain, strict cookie domain rules). Every staff member who is logged in at migration time will be silently logged out when they next make an API call. Plan the migration during low-traffic hours (e.g., after midnight) and inform staff to expect a one-time re-login.

- **Pre-mortem risk: Certbot HTTP-01 renewal after migration** — The Nginx HTTP block now correctly carves out `/.well-known/acme-challenge/` before the redirect (see Task 3, Block 4), so future `certbot renew` runs will succeed for both certs. Verify renewals with a dry run: `certbot renew --dry-run` after migration completes.

- **Future: Supabase Studio subdomain** — If you later want Studio at `manage.smeraldohotel.online:8088` (instead of apex), you'd need to add the Studio server block for the new subdomain and expand/add a cert for port 8088. Out of scope for this migration.

- **Future: www subdomain** — `www.smeraldohotel.online` is not handled. If needed, add a CNAME `www → manage.smeraldohotel.online` and an additional server block. Out of scope.

- **Alignment verified**: No code changes needed for Epics 3–7 prerequisites. The pre-scaffolded DB modules are ready. Next step after this migration: run `/create-story` to generate the next Epic 3 story.
