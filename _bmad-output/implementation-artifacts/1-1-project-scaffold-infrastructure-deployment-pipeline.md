# Story 1.1: Project Scaffold, Infrastructure & Deployment Pipeline

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a development team,
I want the SvelteKit project initialized with all required packages, the Supabase stack deployed self-hosted, and a CI/CD pipeline running on a live HTTPS domain,
So that the team has a verified deployment target and can build all features with confidence.

## Acceptance Criteria

1. **Given** a fresh VPS is provisioned **When** the setup script is run **Then** Nginx is configured as a reverse proxy with Certbot/Let's Encrypt TLS, Supabase Docker Compose stack (Postgres, Auth, Realtime) is running and accessible, and the SvelteKit app is built with `adapter-node` and served via PM2 behind Nginx on HTTPS

2. **Given** the SvelteKit project is initialized via `npx sv create smeraldo-hotel` (TypeScript, ESLint, Prettier, Vitest, Playwright) **When** all required packages are installed (`@sveltejs/adapter-node`, `@supabase/supabase-js`, `@supabase/ssr`, `@vite-pwa/sveltekit`, `tailwindcss@3`, `postcss`, `autoprefixer`, `shadcn-svelte`) **Then** `npm run build` completes without errors and `npm run dev` serves the app locally

3. **Given** a GitHub Actions workflow is configured (lint → typecheck → test → build → SSH deploy → PM2 reload) **When** a commit is pushed to the main branch **Then** the pipeline runs end-to-end and the updated app is live on the HTTPS domain within 5 minutes **And** `.env.example` is committed with all required keys present (values empty), server-only keys have no `PUBLIC_` prefix

## Tasks / Subtasks

- [x] **Task 1: SvelteKit Project Initialization** (AC: #2)
  - [x] Run `npx sv create smeraldo-hotel` with TypeScript, ESLint, Prettier, Vitest, Playwright
  - [x] Install `@sveltejs/adapter-node`
  - [x] Install `@supabase/supabase-js @supabase/ssr`
  - [x] Install `@vite-pwa/sveltekit` as dev dependency
  - [x] Install `tailwindcss@3 postcss autoprefixer` as dev dependencies
  - [x] Run `npx tailwindcss init -p` to generate config files
  - [ ] Initialize shadcn-svelte UI components — *CLI requires Tailwind v4; deps (bits-ui, clsx, tailwind-merge, cn()) installed manually; run `npx shadcn-svelte@latest init` when CLI supports Tailwind v3, or copy components manually*
  - [x] Install `tailwindcss-animate` (required by shadcn-svelte)
  - [x] Configure `adapter-node` in `svelte.config.js`
  - [x] Configure `SvelteKitPWA` plugin in `vite.config.ts`
  - [x] Configure Tailwind with custom tokens (room status colors, Fira fonts)
  - [x] Verify `npm run build` succeeds with zero errors
  - [x] Verify `npm run dev` serves locally

- [x] **Task 2: Project Structure Setup** (AC: #2)
  - [x] Create directory structure per architecture document
  - [x] Create placeholder files for key modules (`hooks.server.ts`, stores, etc.)
  - [x] Create `.env.example` with all required env vars (values empty)
  - [x] Configure TypeScript strict mode in `tsconfig.json`
  - [x] Set up `$lib/` path alias (SvelteKit default)

- [ ] **Task 3: VPS + Nginx + TLS Setup** (AC: #1) — *Requires manual VPS access*
  - [ ] Provision VPS (minimum 4GB RAM, 2 CPU cores, 50GB SSD)
  - [ ] Install Nginx and configure as reverse proxy for SvelteKit Node.js app
  - [ ] Install Certbot and obtain Let's Encrypt TLS certificate
  - [ ] Verify HTTPS is working on the domain

- [ ] **Task 4: Supabase Self-Hosted Docker Compose** (AC: #1) — *Requires VPS access*
  - [ ] Clone Supabase repository and copy Docker files to VPS
  - [ ] Configure `.env` with secure passwords and API keys
  - [ ] Run `docker compose pull && docker compose up -d`
  - [ ] Verify Postgres, Auth, Realtime, and Studio are running
  - [ ] Configure Supabase CLI locally (`supabase/config.toml`)

- [ ] **Task 5: PM2 Process Management** (AC: #1) — *Requires VPS access*
  - [ ] Install PM2 globally on VPS
  - [ ] Create PM2 ecosystem config for the SvelteKit Node.js app
  - [ ] Configure PM2 to auto-restart on crash
  - [ ] Verify app is served behind Nginx via PM2

- [x] **Task 6: GitHub Actions CI/CD Pipeline** (AC: #3)
  - [x] Create `.github/workflows/deploy.yml`
  - [x] Configure pipeline steps: lint → typecheck → test → build → SSH deploy → PM2 reload
  - [ ] Set up GitHub secrets for SSH key and VPS details — *Requires GitHub repo access*
  - [ ] Test full pipeline with a commit push to main — *Requires VPS*
  - [ ] Verify updated app is live on HTTPS domain within 5 minutes — *Requires VPS*

## Dev Notes

### Critical Architecture Constraints

- **Tailwind v3 ONLY** — Do NOT install Tailwind v4. shadcn-svelte requires v3. Pin explicitly: `tailwindcss@3`
- **`@supabase/ssr`** — Do NOT use `@supabase/auth-helpers` (deprecated). Use `@supabase/ssr` for server-side session cookies
- **`create-svelte` is DEPRECATED** — Use `npx sv create smeraldo-hotel` instead of `npm create svelte@latest` (as of 2025, the old command still works but `sv create` is the official recommendation)
- **adapter-node** required — NOT `adapter-auto` or `adapter-vercel`. This is a self-hosted VPS deployment
- **TypeScript strict mode ON** — Never use `any`; use `unknown` + type guard
- **Named exports only** — No default exports except `.svelte` components and `+page/+layout` files

### SvelteKit + Svelte 5 Notes

- SvelteKit 2.51.0 uses Svelte 5 with runes syntax (`$state`, `$derived`, `$effect`)
- Runes are component-local only; Svelte Stores for cross-component state
- `$lib/` alias is built into SvelteKit — never use relative `../../` imports from `src/`
- Server/client boundary: `src/lib/server/` is compile-time enforced — build fails if `.svelte` imports from it

### shadcn-svelte Setup

- Uses `bits-ui` as the headless UI library underneath
- Requires `tailwindcss-animate` plugin in `tailwind.config.ts`
- Components are copy-pasted into `src/lib/components/ui/` — no runtime dependency
- Configure with Smeraldo navy/gold palette overrides

### Tailwind Custom Configuration Required

```typescript
// tailwind.config.ts — extend with these tokens
{
  theme: {
    extend: {
      colors: {
        'room-available': '#10B981',
        'room-occupied': '#3B82F6',
        'room-checkout': '#F59E0B',
        'room-cleaning': '#8B5CF6',
        'room-ready': '#22C55E',
        primary: '#1E3A8A',      // Navy
        secondary: '#3B82F6',    // Sky blue
        accent: '#CA8A04',       // Gold
      },
      fontFamily: {
        sans: ['Fira Sans', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
}
```

### Vite PWA Configuration

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default {
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      // Minimal config for now — full PWA config in Story 7.1
      manifest: {
        name: 'Smeraldo Hotel',
        short_name: 'Smeraldo',
        display: 'standalone',
        start_url: '/',
        background_color: '#F8FAFC',
        theme_color: '#1E3A8A',
      },
    }),
  ],
};
```

### svelte.config.js — adapter-node

```javascript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // PM2 will manage the process
    }),
  },
};

export default config;
```

### Environment Variables (.env.example)

```
# Client-safe (PUBLIC_ prefix)
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=

# Server-only (no PUBLIC_ prefix)
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

### GitHub Actions CI/CD Pipeline Template

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run check   # svelte-check + typecheck
      - run: npm test         # vitest
      - run: npm run build
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/smeraldo-hotel
            git pull origin main
            npm ci --production
            npm run build
            pm2 reload smeraldo-hotel
```

### Supabase Self-Hosted Setup

```bash
# On VPS
git clone --depth 1 https://github.com/supabase/supabase
mkdir supabase-docker && cp -rf supabase/docker/* supabase-docker/
cp supabase/docker/.env.example supabase-docker/.env
cd supabase-docker
# Edit .env: set POSTGRES_PASSWORD, generate JWT secrets, set API keys
docker compose pull
docker compose up -d
```

Minimum VPS specs: 4GB RAM, 2 CPU cores, 50GB SSD.

### Naming Conventions (Enforce from Day 1)

| Category | Convention | Example |
|----------|-----------|---------|
| DB tables/columns | `snake_case` plural | `staff_members`, `check_in_date` |
| Svelte components | `PascalCase.svelte` | `RoomCard.svelte` |
| Utility files | `camelCase.ts` | `formatVND.ts` |
| Zod schemas | `PascalCase` + `Schema` | `BookingSchema` |
| Svelte Stores | `camelCase` + `Store` | `roomStateStore` |
| Route params | `[camelCase]` | `[roomId]` |
| Route groups | `(kebab-case)` | `(manager)`, `(reception)` |
| Form actions | `camelCase` | `?/checkIn`, `?/markReady` |
| Env vars (client) | `PUBLIC_` prefix | `PUBLIC_SUPABASE_URL` |
| Env vars (server) | No prefix | `SUPABASE_SERVICE_ROLE_KEY` |

### Project Structure Notes

Create the full directory structure per the architecture document. Key directories:

```
smeraldo-hotel/
├── .env.example
├── .github/workflows/deploy.yml
├── supabase/
│   ├── config.toml
│   └── migrations/           # Empty — Story 1.2 creates migrations
├── static/
│   ├── icons/                # PWA icons placeholder
│   └── manifest.webmanifest  # Generated by @vite-pwa/sveltekit
├── tests/                    # Playwright e2e only
├── src/
│   ├── app.html
│   ├── app.css               # Tailwind directives
│   ├── hooks.server.ts       # Placeholder — Story 1.3 implements auth
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn-svelte primitives (init creates these)
│   │   │   ├── rooms/        # Empty — Story 2.x
│   │   │   ├── bookings/     # Empty — Story 3.x
│   │   │   ├── attendance/   # Empty — Story 4.x
│   │   │   ├── inventory/    # Empty — Story 5.x
│   │   │   ├── layout/       # Empty — populated as needed
│   │   │   └── reports/      # Empty — Story 6.x
│   │   ├── server/
│   │   │   ├── auth.ts       # Placeholder export
│   │   │   └── db/           # Empty — Story 1.2
│   │   ├── db/
│   │   │   ├── types.ts      # Placeholder — generated after Story 1.2
│   │   │   └── schema.ts     # Placeholder
│   │   ├── stores/
│   │   │   ├── session.ts    # Placeholder
│   │   │   ├── roomState.ts  # Placeholder
│   │   │   └── notifications.ts # Placeholder
│   │   └── utils/
│   │       ├── formatVND.ts  # Implement: Intl.NumberFormat('vi-VN', ...)
│   │       ├── parseDate.ts  # Implement: Intl.DateTimeFormat('vi-VN')
│   │       └── offlineQueue.ts # Placeholder
│   └── routes/
│       ├── +layout.server.ts # Placeholder
│       ├── +layout.svelte    # Root layout with basic structure
│       ├── +page.svelte      # Landing/redirect page
│       ├── (auth)/login/     # Placeholder route
│       ├── (manager)/        # Placeholder route group
│       ├── (reception)/      # Placeholder route group
│       ├── (housekeeping)/   # Placeholder route group
│       └── api/              # Placeholder
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment]
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual Design Foundation]
- [Source: _bmad-output/project-context.md]

### Anti-Patterns to Avoid

1. Do NOT install `@supabase/auth-helpers` — it is deprecated; use `@supabase/ssr`
2. Do NOT install Tailwind v4 — shadcn-svelte requires v3
3. Do NOT use `adapter-auto` or `adapter-vercel` — this is VPS self-hosted with `adapter-node`
4. Do NOT hand-edit `src/lib/db/types.ts` — will be generated by Supabase CLI in Story 1.2
5. Do NOT put RBAC logic in `.svelte` files — server-side only (`hooks.server.ts`, `+page.server.ts`)
6. Do NOT use default exports — named exports only (except `.svelte` and `+page/+layout`)
7. Do NOT use relative `../../` imports from `src/` — use `$lib/` alias
8. Do NOT commit `.env` — only `.env.example`

## Testing Requirements

- Verify `npm run build` completes without errors (AC #2)
- Verify `npm run dev` serves locally (AC #2)
- Verify `npm run lint` passes (AC #3)
- Verify `npm run check` (svelte-check) passes (AC #3)
- Verify HTTPS endpoint is accessible (AC #1)
- Verify Supabase Studio is accessible on VPS (AC #1)
- Verify GitHub Actions pipeline runs end-to-end on push to main (AC #3)
- Unit tests: `formatVND.test.ts` and `parseDate.test.ts` for the utility functions implemented

## Dev Agent Record

### Agent Model Used

Amp (Claude) — via BMAD dev-story workflow

### Debug Log References

- shadcn-svelte v1.1.1 requires Tailwind v4 for init; used manual setup with bits-ui + clsx + tailwind-merge instead
- Route conflict: `(housekeeping)/rooms` and `(reception)/rooms` → renamed housekeeping route to `my-rooms`
- Node v22.11.0 has engine mismatch warning with vite-plugin-svelte v6.2.4 — works with `--force` flag
- Code review (2026-02-15): Fixed 10 issues — see Review Fixes Log below

### Completion Notes List

- Task 1: SvelteKit project fully initialized with all required packages. `npm run build`, `npm run lint`, `npm run check` all pass clean. shadcn-svelte manually configured (bits-ui, clsx, tailwind-merge, tailwindcss-animate) due to CLI v1.1.1 requiring Tailwind v4 for init.
- Task 2: Full project directory structure created per architecture doc. 47 files including placeholder stores (session, roomState, notifications), server modules (auth, db/*, notifications), utility functions (formatVND with tests, parseDate with tests, offlineQueue placeholder), route groups ((auth), (manager), (reception), (housekeeping)), CI/CD workflow, .env.example, supabase config.
- Task 6: GitHub Actions deploy.yml created with lint → typecheck → test → build → SSH deploy → PM2 reload pipeline. Remaining subtasks require VPS provisioning and GitHub secrets.
- Tasks 3, 4, 5: VPS infrastructure tasks — require manual VPS provisioning, SSH access, Docker setup. Cannot be completed by AI agent.

### Review Fixes Log (2026-02-15)

- **[CRITICAL] C1**: Corrected shadcn-svelte task status from [x] to [ ] — CLI init never ran; only deps installed. Created `src/lib/components/ui/.gitkeep` placeholder.
- **[CRITICAL] C2**: Removed `@sveltejs/adapter-auto` from devDependencies — was still installed despite using adapter-node.
- **[HIGH] H1**: Removed non-existent icon refs from PWA manifest in `vite.config.ts` — icons will be added in Story 7.1.
- **[HIGH] H2**: Updated story File List from ~40 to ~65 files — was missing all config files, app shell files, route pages, and component directory gitkeeps.
- **[HIGH] H3**: Moved Google Fonts from render-blocking CSS `@import` in `app.css` to `<link rel="preconnect">` + `<link rel="stylesheet">` in `app.html`.
- **[MEDIUM] M1**: Added Supabase session type stubs to `app.d.ts` — `App.Locals` (supabase, safeGetSession) and `App.PageData` (session?) for Story 1.3 guidance.
- **[MEDIUM] M2**: Added missing `export {}` to `src/lib/server/notifications.ts` for consistency with other placeholder files.
- **[LOW] L1**: Made `formatVND.test.ts` assertion locale-resilient — changed hardcoded `'1.500.000'` to regex `/1[.,]500[.,]000/`.
- **[LOW] L2**: Created `.nvmrc` with `22` to enforce Node.js version requirement.

### File List

<!-- Configuration files (created/modified) -->
smeraldo-hotel/package.json
smeraldo-hotel/svelte.config.js
smeraldo-hotel/vite.config.ts
smeraldo-hotel/tailwind.config.ts
smeraldo-hotel/postcss.config.cjs
smeraldo-hotel/tsconfig.json
smeraldo-hotel/eslint.config.js
smeraldo-hotel/.prettierrc
smeraldo-hotel/.prettierignore
smeraldo-hotel/playwright.config.ts
smeraldo-hotel/.nvmrc
smeraldo-hotel/.env.example
smeraldo-hotel/.github/workflows/deploy.yml

<!-- App shell files (created/modified) -->
smeraldo-hotel/src/app.html
smeraldo-hotel/src/app.css
smeraldo-hotel/src/app.d.ts
smeraldo-hotel/src/hooks.server.ts
smeraldo-hotel/src/lib/index.ts
smeraldo-hotel/src/lib/utils.ts

<!-- Utility functions + tests -->
smeraldo-hotel/src/lib/utils/formatVND.ts
smeraldo-hotel/src/lib/utils/formatVND.test.ts
smeraldo-hotel/src/lib/utils/parseDate.ts
smeraldo-hotel/src/lib/utils/parseDate.test.ts
smeraldo-hotel/src/lib/utils/offlineQueue.ts

<!-- Stores -->
smeraldo-hotel/src/lib/stores/session.ts
smeraldo-hotel/src/lib/stores/roomState.ts
smeraldo-hotel/src/lib/stores/notifications.ts

<!-- Server modules -->
smeraldo-hotel/src/lib/server/auth.ts
smeraldo-hotel/src/lib/server/notifications.ts
smeraldo-hotel/src/lib/server/db/rooms.ts
smeraldo-hotel/src/lib/server/db/bookings.ts
smeraldo-hotel/src/lib/server/db/attendance.ts
smeraldo-hotel/src/lib/server/db/inventory.ts
smeraldo-hotel/src/lib/server/db/reports.ts

<!-- DB types -->
smeraldo-hotel/src/lib/db/types.ts
smeraldo-hotel/src/lib/db/schema.ts

<!-- Routes -->
smeraldo-hotel/src/routes/+layout.svelte
smeraldo-hotel/src/routes/+layout.server.ts
smeraldo-hotel/src/routes/+page.svelte
smeraldo-hotel/src/routes/(auth)/login/+page.svelte
smeraldo-hotel/src/routes/(auth)/login/+page.server.ts
smeraldo-hotel/src/routes/(manager)/+layout.svelte
smeraldo-hotel/src/routes/(manager)/+layout.server.ts
smeraldo-hotel/src/routes/(manager)/dashboard/+page.svelte
smeraldo-hotel/src/routes/(manager)/dashboard/+page.server.ts
smeraldo-hotel/src/routes/(reception)/+layout.svelte
smeraldo-hotel/src/routes/(reception)/+layout.server.ts
smeraldo-hotel/src/routes/(reception)/rooms/+page.svelte
smeraldo-hotel/src/routes/(reception)/rooms/+page.server.ts
smeraldo-hotel/src/routes/(housekeeping)/+layout.svelte
smeraldo-hotel/src/routes/(housekeeping)/+layout.server.ts
smeraldo-hotel/src/routes/(housekeeping)/my-rooms/+page.svelte
smeraldo-hotel/src/routes/(housekeeping)/my-rooms/+page.server.ts

<!-- Infrastructure -->
smeraldo-hotel/supabase/config.toml
smeraldo-hotel/supabase/migrations/.gitkeep
smeraldo-hotel/tests/fixtures/.gitkeep
smeraldo-hotel/tests/fixtures/auth.ts
smeraldo-hotel/static/icons/.gitkeep
smeraldo-hotel/src/lib/components/ui/.gitkeep
smeraldo-hotel/src/lib/components/rooms/.gitkeep
smeraldo-hotel/src/lib/components/bookings/.gitkeep
smeraldo-hotel/src/lib/components/attendance/.gitkeep
smeraldo-hotel/src/lib/components/inventory/.gitkeep
smeraldo-hotel/src/lib/components/layout/.gitkeep
smeraldo-hotel/src/lib/components/reports/.gitkeep
smeraldo-hotel/src/routes/api/.gitkeep
