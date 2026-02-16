# Story 6.1: Today's Occupancy & Attendance Dashboard

Status: done

## Story

As a manager,
I want to open the app and immediately see today's room occupancy and staff attendance status at a glance,
So that I have a real-time overview of hotel operations without navigating to any sub-page or asking staff.

## Acceptance Criteria

1. **Given** a manager is logged in and navigates to `(manager)/dashboard`
   **When** the dashboard page loads
   **Then** the `OccupancyWidget` displays today's occupancy: "X / 23 rooms occupied" with a visual ratio indicator (FR42)
   **And** the page loads fully in < 3 seconds on first visit and < 1 second on cached load (NFR-P1, NFR-P2)

2. **Given** the dashboard loads
   **When** today's attendance data is available
   **Then** an attendance summary section shows each active staff member with their shift value logged for today — absent staff (no log entry) shown with "0" (FR43)

3. **Given** any room status changes while the manager has the dashboard open
   **When** Supabase Realtime broadcasts the update via `roomStateStore`
   **Then** the `OccupancyWidget` count updates in real time — no refresh required (NFR-P5)

4. **Given** a reception or housekeeping user attempts to access `(manager)/dashboard`
   **When** `(manager)/+layout.server.ts` evaluates the request
   **Then** they receive a 403 Forbidden — the dashboard is manager-only (NFR-S3)
   *(Note: this is already handled by the existing `(manager)/+layout.server.ts`)*

5. **Given** Khoa opens the dashboard on his phone
   **When** the page renders at < 768px
   **Then** the KPI widgets stack vertically in a single-column layout, all key numbers visible without scrolling

## Tasks / Subtasks

- [x] Task 1: Implement server-side data loading (AC: #1, #2)
  - [x] 1.1 Add `getDashboardData(supabase, today)` to `src/lib/server/db/reports.ts` — returns rooms + today's attendance logs joined with staff names
  - [x] 1.2 Implement `(manager)/dashboard/+page.server.ts` — call `getAllRooms()` from rooms.ts and `getActiveStaff()` + `getAttendanceByMonth()` from attendance.ts (or the new reports function); return `{ rooms, statusCounts, staffAttendance, today }`
  - [x] 1.3 Write unit tests for the new reports.ts function in `src/lib/server/db/reports.test.ts` (co-located)

- [x] Task 2: Create `OccupancyWidget.svelte` component (AC: #1, #3)
  - [x] 2.1 Create `src/lib/components/reports/OccupancyWidget.svelte`
  - [x] 2.2 Accept prop `serverCounts: RoomStatusCounts` and derive live counts from `roomStatusCountsStore` for reactivity
  - [x] 2.3 Display "X / 23 rooms occupied" headline + a horizontal progress bar showing ratio
  - [x] 2.4 Add a breakdown row: Occupied · Checkout Today · Cleaning · Ready · Available (use `roomStatusCountsStore` counts when connected, fallback to server-loaded data)
  - [x] 2.5 Write unit test: `OccupancyWidget.test.ts` co-located (tests `occupancyUtils.ts` pure functions)

- [x] Task 3: Implement the dashboard page (AC: #1, #2, #5)
  - [x] 3.1 Replace stub in `(manager)/dashboard/+page.svelte` — import `OccupancyWidget` and render
  - [x] 3.2 Build attendance summary table: rows = active staff; column = today's shift value (0/0.5/1/1.5); absent staff get "0" (Vắng label)
  - [x] 3.3 Mobile responsive: single-column stacked layout at < 768px via `grid-cols-1 md:grid-cols-2`

- [x] Task 4: Wire Realtime reactivity for occupancy (AC: #3)
  - [x] 4.1 `OccupancyWidget.svelte` subscribes to `roomStatusCountsStore` (derived from `roomStateStore`, initialized in root `+layout.svelte`)
  - [x] 4.2 Derive live counts from `$roomStatusCountsStore`; use server-loaded `serverCounts` as fallback when store sum is 0
  - [x] 4.3 `occupiedCount` and all breakdown chips update reactively from the derived store

- [x] Task 5: Validate and finalize (AC: #1–#5)
  - [x] 5.1 403 for non-manager: handled by existing `(manager)/+layout.server.ts` `requireRole(['manager'])` — confirmed in place
  - [x] 5.2 `npm run check`: 0 errors, 6 pre-existing warnings (not from new code). `npm run test:unit`: 167/167 passing
  - [x] 5.3 Mobile layout: `grid-cols-1` at mobile, `md:grid-cols-2` at tablet+, `lg:col-span-1` for each widget

## Dev Notes

### What Already Exists — Do NOT Re-create

- **`(manager)/+layout.server.ts`**: already calls `requireRole(locals, ['manager'])` — 403 enforcement is in place. AC#4 is FREE.
- **`(manager)/+layout.svelte`**: renders `<TopNavbar>` + `<BottomTabBar>` + `{@render children()}` — the dashboard page just needs to return data and render its widgets.
- **`(manager)/dashboard/+page.server.ts`**: stub — `export const load: PageServerLoad = async () => { return {}; }`. Replace entirely.
- **`(manager)/dashboard/+page.svelte`**: stub — `<h1>Manager Dashboard</h1>`. Replace entirely.
- **`src/lib/server/db/reports.ts`**: empty stub — `// Reports database queries — Story 6.x`. Add functions here.
- **`src/lib/server/db/rooms.ts`**: `getAllRooms()` and `calculateStatusCounts()` are ready to use.
- **`src/lib/server/db/attendance.ts`**: `getAttendanceByMonth()` and `getActiveStaff()` are ready to use.
- **`roomStateStore`** in `src/lib/stores/roomState.ts`: live room map already maintained by root `+layout.svelte`; subscribes to Supabase Realtime `rooms:all` channel. Subscribe with `$roomStateStore` in page components.
- **`src/lib/types/attendance.ts`**: `AttendanceLogRow`, `AttendanceWithStaff`, `ActiveStaffMember` interfaces already defined.

### Server-Side Data Loading Strategy

The `+page.server.ts` should:
1. Call `getAllRooms(locals.supabase)` from `$lib/server/db/rooms.ts`
2. Call `calculateStatusCounts(rooms)` from `$lib/server/db/rooms.ts`
3. Get today's date as `YYYY-MM-DD`: `new Date().toISOString().slice(0, 10)` — use this consistently
4. Call `getActiveStaff(locals.supabase)` and `getAttendanceByMonth(locals.supabase, year, month)` from `$lib/server/db/attendance.ts`
5. Build a lookup map: `staffId → shift_value` from attendance logs for today only (`log_date === today`)
6. Return: `{ rooms, statusCounts, activeStaff, attendanceToday: Map<staffId, shiftValue>, today }`

Alternatively, add a single `getDashboardData(supabase, today)` function to `reports.ts` to keep the server load function clean.

### Real-Time Occupancy Pattern

`roomStateStore` is a `Map<roomId, RoomRow>` (or similar record) maintained by root `+layout.svelte`. Check the actual type in `src/lib/stores/roomState.ts` before assuming. The pattern to derive occupancy:

```svelte
<script lang="ts">
  import { roomStateStore } from '$lib/stores/roomState';

  // Server-loaded fallback
  let { data } = $props();
  let serverOccupied = $derived(data.statusCounts.occupied);

  // Live count from Realtime store
  let liveRooms = $derived([...$roomStateStore.values()]);
  let occupiedCount = $derived(
    liveRooms.length > 0
      ? liveRooms.filter(r => r.status === 'occupied').length
      : serverOccupied
  );
</script>
```

Use the store count when available; fall back to server-loaded count when store is empty (before first Realtime event). Total rooms is **always 23** (constant, from seeded data).

### Attendance Summary Logic

Attendance for today:
- `getAttendanceByMonth(supabase, year, month)` returns all logs for the month
- Filter client-side (or server-side before returning) for `log_date === today`
- Build a `Map<staff_id, shift_value>` from filtered logs
- For display: iterate `activeStaff` array (from `getActiveStaff()`), look up each staff's `shift_value` from the map; default to `0` if not found

Display format per staff row:
- Staff name | Shift value (0 / 0.5 / 1 / 1.5) | Visual indicator (absent = grey, present = green)
- Use `Intl.DateTimeFormat('vi-VN')` to display today's date in the section header

### OccupancyWidget Component Spec

```
┌─────────────────────────────────────┐
│  🏨 Hôm nay: 15 / 23 phòng có khách │
│  [████████████░░░░░░░░░] 65.2%       │
│                                      │
│  Có khách: 15 · Check-out: 2         │
│  Đang dọn: 3 · Sẵn sàng: 1 · Trống: 2│
└─────────────────────────────────────┘
```

Props: `statusCounts` (from server or derived from `roomStateStore`).
- Headline count reads from `statusCounts.occupied`
- Progress bar width = `(occupied / 23) * 100`%
- Breakdown uses Tailwind room status color tokens from the UX spec

### Room Status Color Tokens (from UX spec — already in tailwind.config.ts)
- `room-available` = #10B981
- `room-occupied` = #3B82F6
- `room-checkout` = #F59E0B
- `room-cleaning` = #8B5CF6
- `room-ready` = #22C55E

Verify these are in `tailwind.config.ts` before using — they were specified in UX design.

### File Structure for this Story

```
src/
  lib/
    components/
      reports/
        OccupancyWidget.svelte          ← NEW (Task 2)
        OccupancyWidget.test.ts         ← NEW (Task 2.5)
    server/
      db/
        reports.ts                      ← MODIFY — add getDashboardData()
        reports.test.ts                 ← NEW (Task 1.3)
  routes/
    (manager)/
      dashboard/
        +page.server.ts                 ← MODIFY — replace stub
        +page.svelte                    ← MODIFY — replace stub
```

Do NOT create:
- A new reports route — that's Story 6.2–6.4
- A separate `AttendanceSummary.svelte` for the dashboard — inline HTML is fine for Story 6.1; the shared component is spec'd for the reports page (Stories 6.3)
- New stores — use existing `roomStateStore`
- New layout files — `(manager)/+layout.server.ts` and `+layout.svelte` are complete

### Testing Standards

- **Unit tests**: co-located `*.test.ts` beside source (e.g., `reports.test.ts` beside `reports.ts`)
- **No Playwright e2e** for this story (complex to set up Realtime in e2e; manual verification suffices)
- Mock Supabase client in unit tests — never hit real DB
- Test `getDashboardData()` or equivalent: correct date filtering, correct absent-staff handling (staff with no log → shift_value 0)
- Test `OccupancyWidget.svelte`: renders correct count, progress bar width, breakdown chips

### Architecture Compliance Checklist

- [ ] All DB access through `$lib/server/db/*.ts` — never call Supabase directly in `.svelte`
- [ ] `roomStateStore` consumed in component via `$roomStateStore` reactive syntax
- [ ] No RBAC checks in `.svelte` — RBAC is in `(manager)/+layout.server.ts` (already done)
- [ ] Loading states: use `$navigating` from SvelteKit for page-level; `$state(false)` pattern if needed
- [ ] Date display: `Intl.DateTimeFormat('vi-VN')` — never hardcode date strings
- [ ] Imports: always `$lib/` alias, never `../../` relative from `src/`
- [ ] Named exports only (except `.svelte` components and `+page/+layout` files)
- [ ] Never use `any` — use specific types from `$lib/types/attendance.ts` and `$lib/server/db/rooms.ts`

### Project Structure Notes

- App code root: `manage-smeraldo-hotel/src/`
- Git root (run git commands from): `/Users/khoatran/Downloads/Smeraldo Hotel/`
- All imports use `$lib/` alias resolving to `manage-smeraldo-hotel/src/lib/`
- `src/lib/server/` is server-only — SvelteKit build fails if `.svelte` imports from it

### References

- Epic 6 story requirements: [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 6, Story 6.1]
- FR42, FR43 coverage: [Source: `_bmad-output/planning-artifacts/epics.md` — FR Coverage Map]
- OccupancyWidget, AttendanceSummary components spec: [Source: `_bmad-output/planning-artifacts/architecture.md` — Requirements to Structure Mapping]
- Room status color tokens: [Source: `_bmad-output/planning-artifacts/epics.md` — From UX Design section]
- Realtime pattern: [Source: `_bmad-output/planning-artifacts/architecture.md` — Real-time boundary]
- RBAC pattern: [Source: `_bmad-output/project-context.md` — Critical Implementation Rules]
- `getAllRooms()`, `calculateStatusCounts()`: [Source: `manage-smeraldo-hotel/src/lib/server/db/rooms.ts`]
- `getAttendanceByMonth()`, `getActiveStaff()`: [Source: `manage-smeraldo-hotel/src/lib/server/db/attendance.ts`]
- `AttendanceLogRow`, `AttendanceWithStaff`, `ActiveStaffMember` types: [Source: `manage-smeraldo-hotel/src/lib/types/attendance.ts`]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Senior Developer Code Review — Findings & Fixes

**Review Result: APPROVED (all issues fixed)**

| Severity | Issue | File | Fix Applied |
|----------|-------|------|-------------|
| HIGH | UTC timezone bug: `new Date().toISOString()` returns UTC — Vietnam (UTC+7) sees wrong date midnight–07:00, causing all attendance to show as absent | `+page.server.ts` | Applied `VN_OFFSET_MS = 7 * 60 * 60 * 1000` offset + `try/catch` error boundary |
| MEDIUM | Architecture violation: `OccupancyWidget.svelte` imported `RoomStatusCounts` from `$lib/server/db/reports` (server-only module) | `OccupancyWidget.svelte:4` | Changed to `import type { RoomStatusCounts } from '$lib/stores/roomState'` |
| MEDIUM | Contradictory JSDoc: `DashboardData.attendanceToday` said "0 if absent" but absent staff have no key in the map | `reports.ts:14` | Fixed to "absent staff have no key (use ?? 0 when reading)" |
| MEDIUM | Missing error boundary in `+page.server.ts` — uncaught errors would leak DB error messages to client | `+page.server.ts` | Added try/catch wrapping `getDashboardData`, throws 500 with safe message |
| LOW | Progress bar % label below bar — visually disconnected | `OccupancyWidget.svelte` | Accepted as-is (minor UX, acceptable for MVP) |
| LOW | Empty-state message for attendance only when `activeStaff.length === 0` — doesn't show if store is empty | `+page.svelte` | Accepted as-is (activeStaff is always populated for a live hotel) |

**Post-fix validation:** 167/167 unit tests pass · 0 typecheck errors · 6 pre-existing warnings (not from new code)

### Completion Notes List

- Implemented `getDashboardData()` in `reports.ts` — fetches rooms, active staff, and monthly attendance in parallel via `Promise.all`; filters to today's logs client-side for `attendanceToday` map.
- Extracted pure utility functions `getOccupancyPercent()` and `getOccupancyLabel()` into `occupancyUtils.ts` to enable unit testing without `@testing-library/svelte`.
- `OccupancyWidget.svelte` uses `roomStatusCountsStore` (derived from `roomStateStore`) for live reactivity; falls back to server-loaded `serverCounts` when store sum is 0 (before first Realtime event). This handles the initial page load before WebSocket connects.
- Dashboard `+page.svelte` uses `$derived` for `todayDisplay` (fixes Svelte 5 reactivity warning); attendance table defaults absent staff to `0` (Vắng) via nullish coalescing `?? 0`.
- 403 protection: handled entirely by pre-existing `(manager)/+layout.server.ts` — no additional code needed.
- All 167 unit tests pass; 0 typecheck errors; 0 new lint errors.

### File List

- `manage-smeraldo-hotel/src/lib/server/db/reports.ts` — modified (added `getDashboardData`, `DashboardData` interface)
- `manage-smeraldo-hotel/src/lib/server/db/reports.test.ts` — new (6 unit tests for `getDashboardData`)
- `manage-smeraldo-hotel/src/lib/components/reports/occupancyUtils.ts` — new (pure functions: `getOccupancyPercent`, `getOccupancyLabel`, `TOTAL_ROOMS`)
- `manage-smeraldo-hotel/src/lib/components/reports/OccupancyWidget.svelte` — new (live occupancy widget with Realtime reactivity)
- `manage-smeraldo-hotel/src/lib/components/reports/OccupancyWidget.test.ts` — new (9 unit tests for pure utils)
- `manage-smeraldo-hotel/src/routes/(manager)/dashboard/+page.server.ts` — modified (replaced stub with `getDashboardData` call)
- `manage-smeraldo-hotel/src/routes/(manager)/dashboard/+page.svelte` — modified (replaced stub with full dashboard UI)
