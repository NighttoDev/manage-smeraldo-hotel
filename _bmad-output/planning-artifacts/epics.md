---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# Smeraldo Hotel - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Smeraldo Hotel, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Staff can log in to the system using personal credentials
FR2: System enforces role-based access — Manager (full authority), Reception (full ops), Housekeeping (room status only)
FR3: Manager can create, edit, and deactivate staff accounts
FR4: Staff sessions persist across browser tabs and page refreshes
FR5: Staff can log out from the system
FR6: Reception can view a visual room diagram of all 23 sellable rooms with current status
FR7: Each room displays one of: Available, Occupied, Checking Out Today, Being Cleaned, Ready
FR8: Reception can view the guest name assigned to each occupied room on the diagram
FR9: Reception can filter the room diagram by floor (floors 3–9)
FR10: Reception can view the room diagram in a monthly calendar view showing occupancy by date
FR11: Reception can manually override a room's status
FR12: System maintains an audit trail of all room status changes with timestamp and actor
FR13: Housekeeping can view rooms assigned to them that require cleaning
FR14: Housekeeping can update a room's status to "Cleaned / Ready"
FR15: All connected users see room status changes in real-time without refreshing
FR16: Manager can view and override any room status
FR17: Reception can create a booking with guest name, room, check-in/out dates, and booking source (Agoda, Booking.com, Trip.com, Facebook, Walk-in)
FR18: Reception can check in a guest, transitioning the room to Occupied
FR19: Reception can check out a guest, transitioning the room to Checking Out / Being Cleaned
FR20: System automatically calculates number of nights stayed for each booking
FR21: Reception can edit an existing booking's details
FR22: Reception can cancel a booking
FR23: System supports long-stay bookings (30+ days) for apartment-type rooms
FR24: Manager can view, edit, and cancel any booking
FR25: Reception can create a guest record with name and associated booking details
FR26: System pre-populates guest details from OTA booking data when available
FR27: Reception can manually enter guest details for Facebook or walk-in bookings
FR28: Guest name is displayed on the room diagram tile for each occupied room
FR29: Reception can log daily attendance for any staff member: full shift = 1, half shift = 0.5, absent = 0, overtime = 1.5
FR30: System automatically calculates total days worked per staff member per month
FR31: Manager can view and edit attendance records for any staff member
FR32: System generates a monthly attendance summary report per staff member
FR33: Reception can log attendance for multiple staff members in a single session
FR34: Reception can view current stock level for each product (beverages and supplies)
FR35: Reception can log a stock-in event with product, quantity, and date
FR36: Reception can log a stock-out event with product, quantity, date, and recipient name
FR37: System automatically recalculates stock levels after each in/out event
FR38: System triggers a low-stock alert when a product falls below its defined threshold
FR39: Manager can view inventory levels and full stock movement history
FR40: Manager can set and update the low-stock threshold per product
FR41: System generates a periodic inventory in/out summary report
FR42: Manager can view a dashboard showing today's room occupancy (occupied vs. total available)
FR43: Manager can view today's staff attendance status at a glance on the dashboard
FR44: Manager can view a monthly occupancy summary report
FR45: Manager can view a monthly attendance report for all staff members
FR46: Manager can view a monthly inventory usage summary report
FR47: System delivers a low-stock alert to reception when inventory falls below threshold
FR48: System delivers a room-ready notification to reception when housekeeping marks a room as Cleaned/Ready
FR49: Notifications are delivered via PWA push notifications on staff devices
FR50: Application is installable as a PWA on desktop (shortcut) and mobile (home screen icon)
FR51: Application displays last-known room diagram, attendance, and inventory data when offline
FR52: Application queues data changes made while offline and syncs automatically on reconnection
FR53: System displays all dates in Vietnamese format (DD/MM/YYYY) and currency in VND with no decimal places
FR54: System supports concurrent access by multiple users without data conflicts

### NonFunctional Requirements

NFR-P1: Initial page load completes in < 3 seconds on desktop broadband (first visit, uncached)
NFR-P2: Subsequent page loads complete in < 1 second (Service Worker cache hit)
NFR-P3: Room diagram for all 23 rooms renders in < 1 second
NFR-P4: SPA module navigation completes in < 500ms
NFR-P5: Real-time room status updates propagate to all connected sessions within < 3 seconds
NFR-S1: All data transmitted over HTTPS — no plain HTTP connections permitted
NFR-S2: Staff sessions expire after 8 hours of inactivity
NFR-S3: Role-based access control enforced server-side — client-side role checks are display-only
NFR-S4: All room status changes, check-ins, and check-outs are logged to an immutable audit trail with user identity and timestamp
NFR-S5: Housekeeping staff cannot access financial data, attendance records for other staff, or inventory management
NFR-R1: System maintains 99%+ availability during hotel operational hours (6:00 AM – midnight daily)
NFR-R2: No data loss when offline — Service Worker queue preserves all entries until connection restored
NFR-R3: Database backups run daily; recovery point objective (RPO) ≤ 24 hours
NFR-R4: Concurrent updates from multiple users do not produce data conflicts — server-side conflict resolution applied to room status
NFR-A1: All room status indicators meet WCAG 2.1 Level AA color contrast requirements
NFR-A2: Room status communicated with both color and text label — never color-only
NFR-I1: Push notifications use the Web Push API standard — no proprietary push service dependencies
NFR-I2: PWA Service Worker complies with the W3C Service Worker specification for offline caching and background sync

### Additional Requirements

**From Architecture:**

- **⭐ STARTER TEMPLATE (must be Epic 1, Story 1):** `npm create svelte@latest smeraldo-hotel` (TypeScript, ESLint, Prettier, Vitest, Playwright) + `@sveltejs/adapter-node` + `@supabase/supabase-js @supabase/ssr` + `@vite-pwa/sveltekit` + `tailwindcss@3 postcss autoprefixer` — Architecture explicitly marks this as the first implementation story
- **Infrastructure first:** VPS provisioning + Nginx + Certbot (Let's Encrypt) + Supabase self-hosted Docker Compose (Postgres + Auth + Realtime) required before feature development
- **Database migrations:** Supabase CLI migrations — `00001_initial_schema.sql`, `00002_rls_policies.sql`, `00003_audit_trail.sql`, `00004_seed_rooms.sql`
- **RBAC middleware prerequisite:** `hooks.server.ts` auth gate + role-gated `+layout.server.ts` per route group must be implemented before any feature module
- **Realtime prerequisite:** Supabase Realtime channel setup (`rooms:all`, `room:{roomId}`, `notifications:{staffId}`) must precede room diagram live-update feature
- **Offline sync architecture:** Service Worker (Workbox) + `offlineQueue.ts` (IndexedDB) + `api/sync/+server.ts` flush endpoint
- **CI/CD pipeline:** GitHub Actions → SSH deploy (lint → typecheck → test → build → PM2 reload)
- **Daily backups cron:** `supabase db dump` — satisfies NFR-R3
- **Tailwind v3 pin:** shadcn-svelte requires Tailwind v3 (not v4); upgrade post-MVP
- **Naming conventions enforced:** DB `snake_case` plural tables; API plural nouns; Svelte components `PascalCase`; Stores `camelCase + Store`; Zod schemas `PascalCase + Schema`
- **API response envelope:** `{ data: T, error: null }` / `{ data: null, error: { message, code } }` from every `+server.ts`
- **10 mandatory AI agent consistency rules** in Architecture must be followed throughout

**From UX Design:**

- **Two distinct layout modes:** Desktop (1024px+): top navbar `h-12` fixed + dense room grid; Mobile (< 768px): bottom tab bar (3 tabs max) + single-column task cards; Tablet (768px–1023px): compact grid + condensed topbar
- **WCAG 2.1 Level AA** accessibility target (4.5:1 body text contrast, 3:1 for UI components)
- **Minimum 48×48px touch targets** on all mobile tappable elements
- **Custom room status Tailwind tokens:** `room-available` (#10B981), `room-occupied` (#3B82F6), `room-checkout` (#F59E0B), `room-cleaning` (#8B5CF6), `room-ready` (#22C55E)
- **Typography:** Fira Sans (UI labels/body) + Fira Code (room numbers, timestamps, VND amounts)
- **`prefers-reduced-motion`** must suppress tile transitions and pulse animations
- **Skip link** as first focusable element on every page; `<button>` for all interactive tiles (never `<div onClick>`)
- **Button hierarchy:** Never two primary buttons on same view; only destructive actions get confirmation dialogs; ghost buttons for dismissal only
- **Skeleton screens** (`animate-pulse`) for initial data loads; spinners only for triggered async > 300ms
- **LiveStatusIndicator** component always visible in navbar: "Live · Updated just now" / "Offline — X changes queued"
- **Form validation:** on `blur` per field; full re-validate on submit; error messages below each field
- **No breadcrumbs** — app is max 2 levels deep (module → detail)

### FR Coverage Map

FR1: Epic 1 — Staff login with personal credentials
FR2: Epic 1 — Role-based access enforcement (Manager/Reception/Housekeeping)
FR3: Epic 1 — Manager creates/edits/deactivates staff accounts
FR4: Epic 1 — Session persistence across tabs/refreshes
FR5: Epic 1 — Staff logout
FR6: Epic 2 — Visual room diagram, all 23 rooms with current status
FR7: Epic 2 — Room status display (Available, Occupied, Checking Out Today, Being Cleaned, Ready)
FR8: Epic 2 — Guest name on occupied room diagram tile
FR9: Epic 2 — Floor filter (floors 3–9)
FR10: Epic 2 — Monthly calendar view showing occupancy by date
FR11: Epic 2 — Manual room status override by reception
FR12: Epic 2 — Immutable audit trail for all room status changes
FR13: Epic 2 — Housekeeping view of assigned rooms requiring cleaning
FR14: Epic 2 — Housekeeping updates room to Cleaned/Ready
FR15: Epic 2 — Real-time room status updates across all connected sessions
FR16: Epic 2 — Manager view and override any room status
FR17: Epic 3 — Create booking (guest name, room, dates, booking source)
FR18: Epic 3 — Check-in guest → room transitions to Occupied
FR19: Epic 3 — Check-out guest → room transitions to Checking Out/Being Cleaned
FR20: Epic 3 — Auto-calculate nights stayed per booking
FR21: Epic 3 — Edit existing booking details
FR22: Epic 3 — Cancel a booking
FR23: Epic 3 — Long-stay bookings (30+ days) for apartment-type rooms
FR24: Epic 3 — Manager view, edit, and cancel any booking
FR25: Epic 3 — Create guest record with name and booking details
FR26: Epic 3 — OTA pre-populate guest details from booking data
FR27: Epic 3 — Manual guest entry (Facebook/walk-in bookings)
FR28: Epic 3 — Guest name displayed live on room diagram tile
FR29: Epic 4 — Log daily attendance: full shift=1, half=0.5, absent=0, overtime=1.5
FR30: Epic 4 — Auto-calculate total days worked per staff member per month
FR31: Epic 4 — Manager view and edit attendance records for any staff
FR32: Epic 4 — Monthly attendance summary report per staff member
FR33: Epic 4 — Log attendance for multiple staff in a single session
FR34: Epic 5 — View current stock level per product (beverages and supplies)
FR35: Epic 5 — Log stock-in event (product, quantity, date)
FR36: Epic 5 — Log stock-out event (product, quantity, date, recipient)
FR37: Epic 5 — Auto-recalculate stock levels after each in/out event
FR38: Epic 5 — Trigger low-stock alert when product falls below threshold
FR39: Epic 5 — Manager view inventory levels and full stock movement history
FR40: Epic 5 — Manager set/update low-stock threshold per product
FR41: Epic 5 — Periodic inventory in/out summary report
FR42: Epic 6 — Dashboard: today's room occupancy (occupied vs. total available)
FR43: Epic 6 — Dashboard: today's staff attendance status at a glance
FR44: Epic 6 — Monthly occupancy summary report
FR45: Epic 6 — Monthly attendance report for all staff members
FR46: Epic 6 — Monthly inventory usage summary report
FR47: Epic 7 — Low-stock alert delivered to reception
FR48: Epic 7 — Room-ready notification delivered to reception
FR49: Epic 7 — Notifications delivered via PWA push on staff devices
FR50: Epic 7 — PWA installable on desktop (shortcut) and mobile (home screen icon)
FR51: Epic 7 — Offline: display last-known room diagram, attendance, inventory data
FR52: Epic 7 — Offline: queue writes locally, auto-sync on reconnection
FR53: Epic 7 — Vietnamese date format (DD/MM/YYYY) and VND currency (no decimals) throughout
FR54: Epic 7 — Concurrent access by multiple users without data conflicts

## Epic List

### Epic 1: Secure Staff Access & Project Foundation
Staff can securely log in on any device, access their role-specific workspace (Manager / Reception / Housekeeping), and the app runs live on a secure HTTPS domain. This epic establishes the project scaffold, database schema, RLS policies, RBAC middleware, and CI/CD pipeline that all future epics build upon.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 2: Live Room Diagram & Real-Time Hotel Floor Operations
Reception staff can see the live state of all 23 rooms at a glance, filter by floor, view a monthly calendar view, and manage room statuses. Housekeeping staff can independently update room status from their phones, and all changes propagate to every connected session within 3 seconds — no phone calls needed.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16

### Epic 3: Guest Booking, Check-In & Check-Out Flow
Reception can create bookings from any source (OTA or walk-in/Facebook), check guests in and out, manage the complete guest lifecycle including long-stay apartment bookings, and guest names appear live on the room diagram. Managers can oversee and override all bookings.
**FRs covered:** FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28

### Epic 4: Staff Attendance Tracking & Monthly Reports
Reception staff can log daily attendance for all team members across all shifts (full/half/overtime/absent) in a single session, and managers can view, edit, and review the complete monthly attendance record for every staff member.
**FRs covered:** FR29, FR30, FR31, FR32, FR33

### Epic 5: Inventory Management & Low-Stock Control
Reception can track all product stock levels (beverages and supplies), log stock in/out movements, and receive automatic low-stock alerts. Managers can configure thresholds per product and view full movement history and periodic summary reports.
**FRs covered:** FR34, FR35, FR36, FR37, FR38, FR39, FR40, FR41

### Epic 6: Management Dashboard & Reporting Suite
Khoa can open the app and see today's occupancy and attendance in under 10 seconds — no navigation required. He can then drill into monthly reports for occupancy, attendance, and inventory usage, giving him everything needed for the monthly staff review without any spreadsheet preparation.
**FRs covered:** FR42, FR43, FR44, FR45, FR46

### Epic 7: PWA Reliability, Offline Support & Push Notifications
The app is installable on all staff devices, works reliably when internet drops with zero data loss, and staff receive push notifications for critical events (low stock, room ready). Vietnamese date/currency formatting is consistent throughout, and the system handles concurrent writes without conflicts.
**FRs covered:** FR47, FR48, FR49, FR50, FR51, FR52, FR53, FR54

---

## Epic 1: Secure Staff Access & Project Foundation

Staff can securely log in on any device, access their role-specific workspace (Manager / Reception / Housekeeping), and the app runs live on a secure HTTPS domain. This epic establishes the project scaffold, database schema, RLS policies, RBAC middleware, and CI/CD pipeline that all future epics build upon.

### Story 1.1: Project Scaffold, Infrastructure & Deployment Pipeline

As a development team,
I want the SvelteKit project initialized with all required packages, the Supabase stack deployed self-hosted, and a CI/CD pipeline running on a live HTTPS domain,
So that the team has a verified deployment target and can build all features with confidence.

**Acceptance Criteria:**

**Given** a fresh VPS is provisioned
**When** the setup script is run
**Then** Nginx is configured as a reverse proxy with Certbot/Let's Encrypt TLS, Supabase Docker Compose stack (Postgres, Auth, Realtime) is running and accessible, and the SvelteKit app is built with `adapter-node` and served via PM2 behind Nginx on HTTPS

**Given** the SvelteKit project is initialized via `npm create svelte@latest smeraldo-hotel` (TypeScript, ESLint, Prettier, Vitest, Playwright)
**When** all required packages are installed (`@sveltejs/adapter-node`, `@supabase/supabase-js`, `@supabase/ssr`, `@vite-pwa/sveltekit`, `tailwindcss@3`, `postcss`, `autoprefixer`, `shadcn-svelte`)
**Then** `npm run build` completes without errors and `npm run dev` serves the app locally

**Given** a GitHub Actions workflow is configured (lint → typecheck → test → build → SSH deploy → PM2 reload)
**When** a commit is pushed to the main branch
**Then** the pipeline runs end-to-end and the updated app is live on the HTTPS domain within 5 minutes
**And** `.env.example` is committed with all required keys present (values empty), server-only keys have no `PUBLIC_` prefix

### Story 1.2: Database Schema, RLS Policies, Audit Trail & Seed Data

As a development team,
I want the complete database schema migrated with Row Level Security policies, an immutable audit trail table, and initial room seed data loaded,
So that all feature modules have the correct data foundation and security policies in place before any feature is built.

**Acceptance Criteria:**

**Given** Supabase CLI is configured (`supabase/config.toml`)
**When** `supabase db push` is run
**Then** migration `00001_initial_schema.sql` creates all core tables in `snake_case` plural: `staff_members`, `rooms`, `bookings`, `guests`, `attendance_logs`, `inventory_items`, `stock_movements`
**And** migration `00002_rls_policies.sql` applies RLS policies matching the RBAC role matrix (Manager/Reception/Housekeeping access per table)
**And** migration `00003_audit_trail.sql` creates `room_status_logs` with insert-only RLS policy (immutable)
**And** migration `00004_seed_rooms.sql` seeds all 23 sellable rooms across floors 3–9 with correct room numbers and types

**Given** the schema is live
**When** `supabase gen types typescript` is run
**Then** `src/lib/db/types.ts` is generated and reflects all table structures — this file is never hand-edited

**Given** RLS is enabled on all tables
**When** a Housekeeping-role user attempts to query `attendance_logs` or `stock_movements`
**Then** the query returns zero rows (policy blocks access), enforcing NFR-S5

### Story 1.3: Staff Login, Session Persistence & Logout

As a staff member,
I want to log in using my personal credentials and have my session persist across browser tabs and page refreshes,
So that I can securely access the system throughout my shift without being interrupted by repeated login prompts.

**Acceptance Criteria:**

**Given** the login page at `(auth)/login` is open
**When** a staff member enters valid credentials and submits
**Then** Supabase Auth creates an SSR session cookie via `@supabase/ssr`, the user is redirected to their role-appropriate home page, and `src/lib/stores/session.ts` is populated with user + role

**Given** a staff member is logged in
**When** they open a new browser tab or refresh the page
**Then** the session is still valid, no redirect to login occurs, and the user sees their role-specific workspace (FR4)

**Given** a staff member is logged in
**When** they click "Log Out"
**Then** the Supabase session is terminated, the session cookie is cleared, and the user is redirected to the login page (FR5)

**Given** a staff member's session has been inactive for 8 hours
**When** they attempt to access any protected page
**Then** they are redirected to the login page with a session-expired message (NFR-S2)

**Given** any protected route is accessed without a valid session
**When** `hooks.server.ts` evaluates the request
**Then** it throws a redirect to `/login` — all data endpoints return 401 (NFR-S1, NFR-S3)

### Story 1.4: Role-Based Access Control & Staff Account Management

As a manager,
I want to create, edit, and deactivate staff accounts with specific roles, and have each staff member automatically see only their role-appropriate workspace,
So that sensitive data is protected and each staff member has a focused, relevant experience.

**Acceptance Criteria:**

**Given** a manager is logged in
**When** they navigate to staff account management
**Then** they can create a new staff account with name, credentials, and role (Manager / Reception / Housekeeping), and edit or deactivate any existing account (FR3)

**Given** a Reception-role staff member is logged in
**When** they attempt to access a manager-only route (e.g., `(manager)/dashboard`)
**Then** `+layout.server.ts` for the `(manager)` route group throws a 403 Forbidden — they cannot access manager pages (FR2, NFR-S3)

**Given** a Housekeeping-role staff member is logged in
**When** they attempt to access any route outside `(housekeeping)/`
**Then** they are denied access — they cannot see financial data, inventory, attendance records, or booking details (FR2, NFR-S5)

**Given** any `+server.ts` REST endpoint is called
**When** the requesting user's role does not have permission for that operation
**Then** the endpoint returns `{ data: null, error: { message: "Forbidden", code: "403" } }` — RBAC is always enforced server-side (NFR-S3)

**Given** Supabase RLS policies are active on all tables
**When** any database query is made regardless of application-layer checks
**Then** RLS policies enforce the role matrix as a security net, ensuring data access is restricted even if application-level checks are bypassed

---

## Epic 2: Live Room Diagram & Real-Time Hotel Floor Operations

Reception staff can see the live state of all 23 rooms at a glance, filter by floor, view a monthly calendar view, and manage room statuses. Housekeeping staff can independently update room status from their phones, and all changes propagate to every connected session within 3 seconds — no phone calls needed.

### Story 2.1: Room Diagram — Static View with Status Display

As a reception staff member,
I want to see a visual diagram of all 23 hotel rooms grouped by floor, each showing its current status and any assigned guest name,
So that I can immediately understand the state of the entire hotel at the start of every shift.

**Acceptance Criteria:**

**Given** a reception or manager user is logged in and navigates to the Rooms page
**When** the room diagram loads
**Then** all 23 sellable rooms are displayed in a grid grouped by floor (floors 3–9), each as a `RoomTile` component showing room number (Fira Code) and status badge (FR6, FR7)
**And** the diagram renders fully in < 1 second (NFR-P3)

**Given** a room is in Occupied status
**When** reception views the room diagram
**Then** the guest name assigned to that room is displayed on the tile (FR8)

**Given** room status tiles are rendered
**When** any status is displayed
**Then** each tile uses both a color token (`room-available`, `room-occupied`, `room-checkout`, `room-cleaning`, `room-ready`) AND a text label — never color-only (NFR-A1, NFR-A2)

**Given** the page loads on desktop (1024px+)
**When** the layout renders
**Then** the top navbar is fixed (`h-12`, navy), all floors are visible without scrolling, and the stat strip shows inline counts (Occupied · Available · Checkout · Cleaning)

**Given** the page loads on mobile (< 768px)
**When** the layout renders
**Then** the top navbar collapses to a bottom tab bar and the room grid becomes a vertically scrollable single-column list

### Story 2.2: Floor Filter & Monthly Calendar View

As a reception staff member,
I want to filter the room diagram by floor and switch to a monthly calendar view,
So that I can quickly isolate a specific floor's status or see a full month's occupancy at a glance.

**Acceptance Criteria:**

**Given** the room diagram is displayed
**When** a reception user clicks a floor chip filter (All / F3 / F4 / F5 / F6 / F7 / F8 / F9)
**Then** only rooms on the selected floor are shown — the filter change is instant, no page reload (FR9)

**Given** the room diagram is displayed
**When** a user switches to "Calendar View"
**Then** a monthly calendar grid appears showing room occupancy by date — each date cell reflects which rooms are occupied, available, or checking out (FR10)

**Given** the calendar view is active
**When** the current month is displayed
**Then** today's date is highlighted and the view defaults to the current month with one-tap navigation to adjacent months

### Story 2.3: Room Status Override & Audit Trail

As a reception staff member,
I want to manually override any room's status and have every change logged with my identity and timestamp,
So that I can correct stale or incorrect statuses and maintain a complete history for accountability.

**Acceptance Criteria:**

**Given** a reception user clicks on any room tile
**When** the room detail opens
**Then** an "Override Status" option is visible, allowing selection of any valid status (Available, Occupied, Checking Out Today, Being Cleaned, Ready) (FR11)

**Given** a manager is logged in
**When** they view any room
**Then** they have the same override capability as reception, with full override authority over any room status (FR16)

**Given** any room status change occurs (override, check-in, check-out, housekeeping update)
**When** the change is committed to the database
**Then** an entry is written to `room_status_logs` with: `room_id`, `old_status`, `new_status`, `changed_by` (staff ID), `changed_at` (ISO 8601 timestamp) — this table is insert-only, entries cannot be edited or deleted (FR12, NFR-S4)

**Given** the override action is destructive
**When** a user attempts the override
**Then** a confirmation dialog appears ("Override to [status]?") before the change is committed

### Story 2.4: Housekeeping Mobile View & Room Status Updates

As a housekeeping staff member,
I want to see only the rooms assigned to me that need cleaning and update their status with a single tap from my phone,
So that I can work independently without making phone calls to reception.

**Acceptance Criteria:**

**Given** a housekeeping staff member is logged in on their phone
**When** they open the app
**Then** they see only rooms assigned to them with status "Checking Out Today" or "Being Cleaned" — no financial data, inventory, attendance, or booking details are visible (FR13, NFR-S5)

**Given** a housekeeping staff member is viewing their assigned rooms
**When** they tap "Mark Ready" on a completed room
**Then** the room status updates to "Ready" immediately, saved via `?/markReady` Form Action, and the `room_status_logs` audit entry is written (FR14)

**Given** a housekeeping staff member is on mobile (< 768px)
**When** they view their assigned rooms
**Then** each room is displayed as a `HousekeepingRoomCard` with room number, room type, status label, and a prominent "Mark Ready" button with minimum 48×48px touch target

**Given** a room is marked priority by reception
**When** housekeeping views their task list
**Then** that room is visually flagged as "Priority" at the top of their list

### Story 2.5: Real-Time Room Status Sync Across All Sessions

As a hotel staff member,
I want to see room status changes made by any staff member reflected on my screen within 3 seconds without refreshing,
So that I always have an accurate live view of the hotel floor and can act on the latest information.

**Acceptance Criteria:**

**Given** two staff members have the room diagram open simultaneously
**When** housekeeping marks a room as "Ready"
**Then** reception sees the room tile update to green "Ready" within 3 seconds — no page refresh required (FR15, NFR-P5)

**Given** the root `+layout.svelte` initializes the Supabase Realtime subscription on the `rooms:all` channel
**When** any room status changes via any path (Form Action, REST endpoint, override)
**Then** the `roomStateStore` (Svelte Store) is updated and all components re-render reactively — no direct Realtime calls inside individual components

**Given** the `LiveStatusIndicator` is mounted in the top navbar
**When** the Realtime connection is live
**Then** it shows a green animated pulse dot + "Live · Updated just now"
**And** when the connection drops it shows grey + "Offline — X changes queued"

**Given** two staff members submit a room status change simultaneously
**When** the server processes both writes
**Then** server-side conflict resolution (last-write-wins via Postgres transaction) is applied — no data is silently lost (NFR-R4)

---

## Epic 3: Guest Booking, Check-In & Check-Out Flow

Reception can create bookings from any source (OTA or walk-in/Facebook), check guests in and out, manage the complete guest lifecycle including long-stay apartment bookings, and guest names appear live on the room diagram. Managers can oversee and override all bookings.

### Story 3.1: Create a New Booking

As a reception staff member,
I want to create a new booking with guest name, room, check-in/out dates, and booking source,
So that every arrival is recorded in the system before the guest shows up, replacing manual Excel entry.

**Acceptance Criteria:**

**Given** a reception user navigates to Bookings → New Booking
**When** the booking form (`BookingForm.svelte`) loads
**Then** it presents fields for: guest name, room selection, check-in date (defaults to today), check-out date (defaults to tomorrow), and booking source (Select: Agoda / Booking.com / Trip.com / Facebook / Walk-in) (FR17)

**Given** a reception user fills in the booking form and submits
**When** `?/submit` Form Action processes the request
**Then** the booking is saved to the `bookings` table with a `created_by` staff ID, and number of nights is auto-calculated and stored (FR20)
**And** the assigned room's status updates to reflect an upcoming booking

**Given** the booking source is OTA (Agoda, Booking.com, Trip.com)
**When** OTA booking data is available
**Then** the guest name field is pre-populated from the booking data — reception confirms rather than types (FR26)

**Given** the booking source is Facebook or Walk-in
**When** the form is displayed
**Then** reception manually enters the guest name — the field is editable with a required validation (FR27)

**Given** a form field fails validation (e.g., check-out before check-in, guest name empty)
**When** the field loses focus
**Then** a specific error message appears below that field — full re-validation runs on submit

**Given** the booking is for an apartment-type room
**When** the long-stay toggle is enabled ("Long stay — 30+ days")
**Then** a duration field appears inline and accepts stays of 30 days or more (FR23)

### Story 3.2: Guest Check-In Flow

As a reception staff member,
I want to check in a guest from the room diagram with their details pre-filled and confirm with a single tap,
So that I can complete check-in in under 90 seconds without opening a spreadsheet.

**Acceptance Criteria:**

**Given** a guest has an existing booking and is arriving today
**When** reception clicks their room tile on the diagram
**Then** the `CheckInDialog` opens with guest name, check-in/out dates, booking source badge, and nights auto-calculated — all pre-filled from the booking (FR18, FR26)

**Given** the `CheckInDialog` is open with correct details
**When** reception clicks "Confirm Check-In"
**Then** the room status transitions to "Occupied", the guest name appears on the room diagram tile (FR28), a `room_status_logs` audit entry is written (NFR-S4), and the dialog closes — no page reload

**Given** the check-in details need correction
**When** reception edits the guest name or dates within the dialog
**Then** the changes are saved to the booking record before check-in is confirmed (FR21)

**Given** the "Confirm Check-In" button is clicked
**When** Form Action `?/checkIn` is processing
**Then** the button shows a spinner and is disabled until the response is received — prevents duplicate submissions

**Given** check-in is completed
**When** the room diagram updates
**Then** all other connected sessions see the room tile flip to "Occupied" with the guest name within 3 seconds (NFR-P5)

### Story 3.3: Guest Check-Out Flow

As a reception staff member,
I want to check out a guest and trigger the room cleaning workflow,
So that the room is immediately flagged for housekeeping and available for the next guest as quickly as possible.

**Acceptance Criteria:**

**Given** a room is in "Occupied" status and the guest is departing
**When** reception opens the room tile and clicks "Check Out"
**Then** a confirmation dialog appears: "Check out [Guest Name] from Room [X]?" with an explicit "Yes, check out" button — not a generic "OK" (FR19)

**Given** reception confirms the check-out
**When** Form Action `?/checkOut` processes
**Then** the booking's check-out is recorded with timestamp, the room status transitions to "Being Cleaned", and a `room_status_logs` audit entry is written (FR19, NFR-S4)

**Given** a check-out is processed
**When** the room status updates to "Being Cleaned"
**Then** the room appears in the housekeeping staff's assigned rooms list immediately

**Given** a manager is logged in
**When** they view any occupied room
**Then** they have the authority to initiate check-out for any booking, including overriding a stale booking from a previous date (FR24)

### Story 3.4: Booking Management — Edit & Cancel

As a reception staff member,
I want to edit the details of an existing booking or cancel it when needed,
So that I can correct errors and handle cancellations without creating data inconsistencies.

**Acceptance Criteria:**

**Given** a booking exists in the system
**When** reception navigates to the booking detail at `(reception)/bookings/[bookingId]`
**Then** they can edit guest name, check-in/out dates, booking source, and room assignment — all fields are pre-populated (FR21)

**Given** reception submits an edited booking
**When** Form Action `?/submit` processes the update
**Then** the `bookings` table is updated, nights are recalculated automatically, and the room diagram reflects any status changes

**Given** reception or manager clicks "Cancel Booking"
**When** the cancellation confirmation dialog appears ("Cancel this booking for [Guest]?")
**Then** the booking is marked cancelled in the database, the room status returns to "Available", and the cancellation is logged (FR22)

**Given** a manager is logged in
**When** they access any booking
**Then** they can view, edit, and cancel any booking regardless of which staff member created it (FR24)

### Story 3.5: Guest Record Creation & Display

As a reception staff member,
I want guest records to be automatically created or manually entered when a booking is made, with guest names always visible on the room diagram,
So that I can identify every occupied room's guest at a glance without opening individual booking records.

**Acceptance Criteria:**

**Given** a new booking is created
**When** the booking is saved
**Then** a `guests` record is created linked to the booking containing at minimum the guest name (FR25)

**Given** OTA booking data contains a guest name
**When** the booking is imported or entered
**Then** the `guests` record is pre-populated from that data — reception only confirms, no manual typing required (FR26)

**Given** booking source is Facebook or Walk-in
**When** reception completes the booking form
**Then** they manually enter the guest name via `GuestInput.svelte` — name is required before the booking can be saved (FR27)

**Given** a booking is in "Occupied" status
**When** the room diagram renders
**Then** the guest name from the associated `guests` record is displayed on the room tile (FR28)
**And** the name updates live when the booking is edited, visible to all connected sessions within 3 seconds

---

## Epic 4: Staff Attendance Tracking & Monthly Reports

Reception staff can log daily attendance for all team members across all shifts (full/half/overtime/absent) in a single session, and managers can view, edit, and review the complete monthly attendance record for every staff member.

### Story 4.1: Log Daily Attendance for All Staff

As a reception staff member,
I want to log the daily attendance value for each staff member in a single session using a simple grid,
So that attendance is recorded accurately every day without maintaining separate spreadsheets.

**Acceptance Criteria:**

**Given** a reception user navigates to the Attendance page
**When** the attendance table (`AttendanceTable.svelte`) loads
**Then** it displays all active staff members as rows, with the current date's column highlighted and `ShiftInput` selectors for each staff/date cell (FR29, FR33)

**Given** a reception user opens the attendance table for today
**When** they tap/click a `ShiftInput` cell for any staff member
**Then** they can select one of four values: `0` (absent), `0.5` (half shift), `1` (full shift), `1.5` (overtime — max 18 hours) — the value is saved immediately via Form Action `?/logAttendance` (FR29)

**Given** multiple staff members need attendance logged in one session
**When** reception enters values across multiple rows
**Then** each cell auto-saves on selection — no "Save All" button required; reception moves across the grid without losing entries (FR33)

**Given** a `ShiftInput` value is submitted
**When** Form Action `?/logAttendance` processes
**Then** the entry is saved to `attendance_logs` with `staff_id`, `date`, `shift_value`, `logged_by` (staff ID), and `created_at` timestamp

**Given** the attendance table loads on mobile (< 768px)
**When** the table renders
**Then** it supports horizontal scroll — all staff columns remain accessible, rows are full-width

### Story 4.2: Monthly Attendance Calculation & Summary Report

As a manager,
I want to view the automatically calculated total days worked per staff member for any month,
So that I have accurate attendance data for payroll and performance review without any manual calculation.

**Acceptance Criteria:**

**Given** attendance values have been logged for the current month
**When** a manager navigates to the Attendance page and selects a month via `MonthPicker`
**Then** the table displays all days in that month as columns, all active staff as rows, and each cell shows the logged shift value (FR31, FR32)

**Given** a month's attendance data is displayed
**When** the table renders the summary row
**Then** each staff member's total days worked is auto-calculated as the sum of all shift values for that month (e.g., 21 × 1 + 2 × 0.5 = 22.0 days) (FR30)

**Given** a manager selects any past month
**When** the `MonthPicker` changes the selected month
**Then** the table reloads with that month's data — the switch completes in < 500ms (NFR-P4)

**Given** a manager views any staff member's attendance row
**When** the monthly summary is displayed
**Then** the total days worked is shown prominently at the end of each row as the monthly summary (FR32)

### Story 4.3: Manager Attendance Edit

As a manager,
I want to edit any staff member's attendance record for any date,
So that I can correct errors made by reception without data inconsistencies.

**Acceptance Criteria:**

**Given** a manager is viewing the attendance table
**When** they click any `ShiftInput` cell (including past dates)
**Then** the cell becomes editable and they can change the value to any of the four valid options: `0`, `0.5`, `1`, `1.5` (FR31)

**Given** a manager updates an attendance value
**When** the change is submitted via Form Action `?/logAttendance`
**Then** the `attendance_logs` record is updated with the new value and the `updated_by` manager's staff ID is recorded

**Given** a reception-role user views the attendance table
**When** they attempt to edit a past date's attendance value
**Then** past date cells are read-only for reception — only managers can edit historical attendance (FR31)

**Given** any attendance edit request reaches the server
**When** the `+page.server.ts` validates the request
**Then** RBAC is enforced — reception can only write today's date; managers can write any date (NFR-S3)

---

## Epic 5: Inventory Management & Low-Stock Control

Reception can track all product stock levels (beverages and supplies), log stock in/out movements, and receive automatic low-stock alerts. Managers can configure thresholds per product and view full movement history and periodic summary reports.

### Story 5.1: View Current Stock Levels

As a reception staff member,
I want to see the current stock level for every product at a glance,
So that I know what's available for restocking and can identify items running low before they run out.

**Acceptance Criteria:**

**Given** a reception or manager user navigates to the Inventory page
**When** `InventoryList.svelte` loads
**Then** all tracked products (beverages and supplies) are displayed with their current stock level, unit, and low-stock threshold (FR34)

**Given** a product's current stock is at or below its defined threshold
**When** the inventory list renders
**Then** that product row is visually highlighted with an amber "Low Stock" badge — color + text label, never color-only (FR38, NFR-A2)

**Given** a housekeeping-role user attempts to access the Inventory page
**When** the `(reception)/inventory/+layout.server.ts` evaluates the request
**Then** they receive a 403 Forbidden — housekeeping staff cannot access inventory data (NFR-S5)

**Given** the inventory list is displayed on mobile
**When** the page renders at < 768px
**Then** the list is a single-column card layout with large readable text for stock levels

### Story 5.2: Log Stock-In & Stock-Out Events

As a reception staff member,
I want to log stock movements (in and out) for any product,
So that the system always reflects the true current stock level and I have a full record of all movements.

**Acceptance Criteria:**

**Given** a reception user clicks "Stock In" for a product
**When** `StockInForm.svelte` opens
**Then** it presents fields for: product (pre-selected), quantity (positive integer), and date (defaults to today) — submitted via Form Action `?/stockIn` (FR35)

**Given** a reception user clicks "Stock Out" for a product
**When** `StockOutForm.svelte` opens
**Then** it presents fields for: product (pre-selected), quantity, date (defaults to today), and recipient name — submitted via Form Action `?/stockOut` (FR36)

**Given** a stock-in or stock-out form is submitted
**When** Form Action processes the entry
**Then** the movement is saved to `stock_movements` with `product_id`, `movement_type` (`in`/`out`), `quantity`, `date`, `recipient_name` (for out), and `logged_by` (staff ID)
**And** the product's `current_stock` in `inventory_items` is recalculated immediately (FR37)

**Given** a stock-out quantity would result in negative stock
**When** the form is submitted
**Then** a validation error appears below the quantity field: "Quantity exceeds current stock of [X] units" — the submission is blocked

**Given** a stock movement is saved
**When** the inventory list re-renders
**Then** the updated stock level is visible immediately — no page reload required

### Story 5.3: Low-Stock Threshold Configuration

As a manager,
I want to set and update the low-stock threshold for each product,
So that the system automatically alerts reception when restocking is needed, without me having to check manually.

**Acceptance Criteria:**

**Given** a manager navigates to the Inventory page
**When** they click "Edit Threshold" for any product
**Then** an inline editable field appears showing the current threshold — they can update it and save (FR40)

**Given** a manager submits a new threshold value
**When** the update is saved to `inventory_items.low_stock_threshold`
**Then** the system immediately re-evaluates all products and shows/hides low-stock alerts accordingly (FR38, FR40)

**Given** a reception-role user views a product's threshold
**When** they attempt to edit it
**Then** the threshold field is read-only for reception — the edit control is not rendered for non-manager roles (NFR-S3)

### Story 5.4: Stock Movement History & Inventory Summary Report

As a manager,
I want to view the full movement history for any product and a periodic inventory summary,
So that I can audit stock usage, identify patterns, and prepare for supplier orders.

**Acceptance Criteria:**

**Given** a manager clicks on any product in the inventory list
**When** the product detail view opens
**Then** the full `stock_movements` history is displayed in reverse-chronological order: date, type (in/out), quantity, recipient (for out), logged by (FR39)

**Given** a manager navigates to Inventory → Summary Report
**When** the report loads for the selected period (defaults to current month)
**Then** a summary table shows each product with: opening stock, total in, total out, closing stock, and net change for the period (FR41)

**Given** a manager selects a different month for the summary report
**When** the period changes
**Then** the report recalculates and reloads in < 500ms (NFR-P4)

**Given** a reception user views the inventory page
**When** they access the movement history
**Then** they can view the full history (read access) but cannot edit or delete any movement records (FR39)

---

## Epic 6: Management Dashboard & Reporting Suite

Khoa can open the app and see today's occupancy and attendance in under 10 seconds — no navigation required. He can then drill into monthly reports for occupancy, attendance, and inventory usage, giving him everything needed for the monthly staff review without any spreadsheet preparation.

### Story 6.1: Today's Occupancy & Attendance Dashboard

As a manager,
I want to open the app and immediately see today's room occupancy and staff attendance status at a glance,
So that I have a real-time overview of hotel operations without navigating to any sub-page or asking staff.

**Acceptance Criteria:**

**Given** a manager is logged in and navigates to `(manager)/dashboard`
**When** the dashboard page loads
**Then** the `OccupancyWidget` displays today's occupancy: "X / 23 rooms occupied" with a visual ratio indicator (FR42)
**And** the page loads fully in < 3 seconds on first visit and < 1 second on cached load (NFR-P1, NFR-P2)

**Given** the dashboard loads
**When** today's attendance data is available
**Then** an attendance summary section shows each active staff member with their shift value logged for today — absent staff shown with "0" (FR43)

**Given** any room status changes while the manager has the dashboard open
**When** Supabase Realtime broadcasts the update via `roomStateStore`
**Then** the `OccupancyWidget` count updates in real time — no refresh required (NFR-P5)

**Given** a reception or housekeeping user attempts to access `(manager)/dashboard`
**When** `(manager)/+layout.server.ts` evaluates the request
**Then** they receive a 403 Forbidden — the dashboard is manager-only (NFR-S3)

**Given** Khoa opens the dashboard on his phone
**When** the page renders at < 768px
**Then** the KPI widgets stack vertically in a single-column layout, all key numbers visible without scrolling

### Story 6.2: Monthly Occupancy Report

As a manager,
I want to view a monthly occupancy summary showing how many rooms were occupied across the month,
So that I can assess hotel performance and identify peak and quiet periods for planning.

**Acceptance Criteria:**

**Given** a manager navigates to `(manager)/reports`
**When** the occupancy report tab is selected (defaults to current month)
**Then** a summary is displayed showing: total room-nights occupied, average daily occupancy, and a breakdown by date showing occupied room count per day (FR44)

**Given** the monthly occupancy report is displayed
**When** the manager selects a different month via `MonthPicker`
**Then** the report recalculates and renders in < 500ms (NFR-P4)

**Given** the occupancy report renders
**When** any date row is displayed
**Then** the occupied count and percentage (e.g., "19 / 23 — 82.6%") are shown — dates in `DD/MM/YYYY` Vietnamese format throughout (FR53)

### Story 6.3: Monthly Attendance Report for All Staff

As a manager,
I want to view a complete monthly attendance report for all staff members from the reports section,
So that I have everything I need for the monthly staff review in one place, without asking reception to compile data.

**Acceptance Criteria:**

**Given** a manager navigates to `(manager)/reports` → Attendance tab
**When** the monthly attendance report loads
**Then** `AttendanceSummary.svelte` displays all staff members with their daily shift values and calculated total days worked for the selected month (FR45)

**Given** a staff member's row is viewed
**When** the monthly summary renders
**Then** total days worked is shown as the sum of all shift values, formatted to one decimal place (e.g., "22.5 days") (FR30)

**Given** the manager selects a different month
**When** the `MonthPicker` updates the period
**Then** the report reloads in < 500ms (NFR-P4)

**Given** a month has no attendance entries for a staff member
**When** that staff member's row renders
**Then** all days show "—" and total shows "0.0 days" — the row is always present, never missing

### Story 6.4: Monthly Inventory Usage Summary Report

As a manager,
I want to view a monthly inventory usage summary from the reports section,
So that I can see total consumption per product across the month and plan restocking accordingly.

**Acceptance Criteria:**

**Given** a manager navigates to `(manager)/reports` → Inventory tab
**When** the inventory summary report loads
**Then** `InventorySummary.svelte` displays each product with: total stock in, total stock out, and net change for the selected month (FR46)

**Given** the inventory summary is displayed
**When** a product has low current stock
**Then** a "Low Stock" indicator is shown alongside the product — consistent with the inventory page indicator

**Given** a manager selects a different month
**When** the `MonthPicker` updates the period
**Then** the report recalculates and renders in < 500ms (NFR-P4)

**Given** all three report tabs are available (Occupancy, Attendance, Inventory)
**When** a manager switches between tabs
**Then** the active tab is highlighted in gold underline (desktop) or filled (mobile) and the tab switch completes in < 500ms — no full page reload (NFR-P4)

---

## Epic 7: PWA Reliability, Offline Support & Push Notifications

The app is installable on all staff devices, works reliably when internet drops with zero data loss, and staff receive push notifications for critical events (low stock, room ready). Vietnamese date/currency formatting is consistent throughout, and the system handles concurrent writes without conflicts.

### Story 7.1: PWA Installability — Desktop Shortcut & Mobile Home Screen

As a hotel staff member,
I want to install the Smeraldo app on my desktop as a shortcut and on my phone as a home screen icon,
So that I can open it instantly at the start of every shift without navigating to a URL.

**Acceptance Criteria:**

**Given** `@vite-pwa/sveltekit` is configured with a `manifest.webmanifest`
**When** a staff member visits the app URL in Chrome on desktop
**Then** the browser shows an "Install app" prompt and after installation, a Smeraldo Hotel shortcut appears on the desktop with the branded icon (FR50)

**Given** a housekeeping staff member visits the app URL in Chrome on Android or Safari on iPhone
**When** they follow the "Add to Home Screen" prompt
**Then** the Smeraldo Hotel icon appears on their phone home screen and launches the app in standalone mode — no browser chrome (FR50)

**Given** the Web App Manifest is configured
**When** it is validated
**Then** it includes: `name`, `short_name`, `icons` (192×192 and 512×512 branded Smeraldo icons), `start_url`, `display: standalone`, `background_color`, `theme_color`

**Given** the app is installed on any device
**When** a staff member opens it from the shortcut/icon
**Then** the app loads in < 1 second (Service Worker cache hit) and lands on the role-appropriate home page (NFR-P2)

### Story 7.2: Offline Read — Last-Known Data Display

As a hotel staff member,
I want the app to show me the last-known room diagram, attendance data, and inventory levels when the internet drops,
So that I'm never left with a blank screen and can continue referencing the data I need during a connection outage.

**Acceptance Criteria:**

**Given** the Workbox Service Worker is registered and the app has been used at least once
**When** the device loses internet connection
**Then** the `LiveStatusIndicator` immediately switches to grey "Offline — X changes queued" state (FR51)

**Given** the device is offline
**When** a staff member navigates to the Room Diagram page
**Then** the last-known room status data is displayed from the Service Worker cache — tiles show the most recently synced state with a visual "Offline" muted overlay (FR51)

**Given** the device is offline
**When** a staff member navigates to the Attendance or Inventory page
**Then** the last-known data is displayed from cache — no blank screen, no error page (FR51)

**Given** the Service Worker cache strategy is configured (Workbox)
**When** the app loads on a repeat visit with internet
**Then** the page renders from cache in < 1 second while fresh data loads in the background (NFR-P2)

### Story 7.3: Offline Write Queue & Auto-Sync on Reconnection

As a hotel staff member,
I want any changes I make while offline to be queued locally and automatically synced when the internet reconnects,
So that I never lose data during a WiFi drop and don't have to redo my work.

**Acceptance Criteria:**

**Given** a staff member is offline and submits a write action (room status update, attendance log, stock movement)
**When** the Service Worker intercepts the request
**Then** the action is stored in `offlineQueue.ts` (IndexedDB) as a `QueueItem` with: `id` (UUID), `action`, `payload`, `timestamp` (ISO 8601), `retries: 0` (FR52)
**And** the UI shows an optimistic update — the change appears locally as if it succeeded

**Given** the device reconnects to the internet
**When** the Service Worker detects the reconnection
**Then** all queued `QueueItem` entries are flushed to `api/sync/+server.ts` in timestamp order — oldest first (FR52)
**And** the `LiveStatusIndicator` transitions to "Live · Updated just now"

**Given** a queued item fails to sync after 3 retries
**When** the retry limit is reached
**Then** the user sees a persistent red Toast: "Sync failed for [action] — tap to retry" with a manual retry action (NFR-R2)

**Given** concurrent offline writes from multiple staff are synced simultaneously
**When** `api/sync/+server.ts` processes the queue
**Then** server-side timestamp-based conflict resolution is applied — no silent data loss (NFR-R4, FR54)

### Story 7.4: Push Notifications — Low-Stock & Room-Ready Alerts

As a reception staff member,
I want to receive push notifications when inventory falls below threshold and when housekeeping marks a room as ready,
So that I'm immediately aware of critical events without having to check the app manually.

**Acceptance Criteria:**

**Given** Web Push is configured with VAPID keys on the VPS
**When** a reception staff member grants notification permission in their browser
**Then** their push subscription is saved to the database linked to their `staff_id` (FR49)

**Given** a product's stock level drops to or below its low-stock threshold
**When** the stock-out is processed server-side
**Then** `api/notifications/+server.ts` dispatches a Web Push notification to all reception staff: "Low stock: [Product] — [X] units remaining" (FR47, FR49, NFR-I1)

**Given** a housekeeping staff member marks a room as "Ready"
**When** Form Action `?/markReady` completes
**Then** a Web Push notification is dispatched to all reception staff: "Room [X] is ready for check-in" — visible on desktop even when the app tab is not in focus (FR48, FR49)

**Given** a staff member's device does not support Web Push (e.g., older iOS Safari)
**When** the notification would be sent
**Then** the app falls back gracefully — `NotificationToast.svelte` displays the alert when the app is open, no crash or error (NFR-I1)

**Given** notifications are delivered
**When** they appear
**Then** they use the Web Push API standard with VAPID keys — no third-party push service dependency (NFR-I1, NFR-I2)

### Story 7.5: Vietnamese Locale, Currency Formatting & Production Reliability

As a hotel staff member,
I want all dates displayed in Vietnamese format and all currency in VND, and the system to stay up reliably during all operational hours,
So that the app feels native to the Vietnamese hotel context and I never lose work due to server downtime.

**Acceptance Criteria:**

**Given** any date is displayed anywhere in the app
**When** the date renders
**Then** it uses `Intl.DateTimeFormat('vi-VN')` → outputs `DD/MM/YYYY` — no hardcoded format strings anywhere (FR53)

**Given** any currency amount is displayed
**When** it renders
**Then** it uses `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })` → outputs `1.500.000 ₫` — stored as integer VND in DB/API, never floats (FR53)

**Given** PM2 is managing the SvelteKit Node.js process
**When** the process crashes unexpectedly
**Then** PM2 auto-restarts within seconds — achieving 99%+ uptime during operational hours 06:00–midnight (NFR-R1)

**Given** a daily cron job runs `supabase db dump`
**When** the backup completes
**Then** the dump is stored securely, satisfying the RPO ≤ 24 hours requirement (NFR-R3)

**Given** `prefers-reduced-motion` is set on a staff member's device
**When** the app renders
**Then** all tile transition animations and the `LiveStatusIndicator` pulse animation are suppressed — app remains fully functional (UX accessibility requirement)

**Given** the app runs `npm run build` through CI/CD
**When** any `.svelte` file attempts to import from `src/lib/server/`
**Then** the SvelteKit build fails at compile time — server/client boundary is compile-time enforced (Architecture enforcement rule)
