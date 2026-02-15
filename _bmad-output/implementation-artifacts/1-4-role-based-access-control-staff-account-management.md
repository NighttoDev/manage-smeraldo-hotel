# Story 1.4: Role-Based Access Control & Staff Account Management

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a manager,
I want to create, edit, and deactivate staff accounts with specific roles, and have each staff member automatically see only their role-appropriate workspace,
So that sensitive data is protected and each staff member has a focused, relevant experience.

## Acceptance Criteria

1. **Given** a manager is logged in **When** they navigate to `/staff` **Then** they see a list of all staff members (name, role badge, active/inactive status) and an "Add Staff" button to create a new account (FR3)

2. **Given** a manager fills in the "Add Staff" form (full name, email, password, role) and submits **When** the `?/createStaff` Form Action processes **Then** a Supabase Auth user is created via the admin API, a matching `staff_members` record is inserted, and the new staff member appears in the list immediately (FR3)

3. **Given** a manager navigates to an existing staff member's edit page **When** they update the name, role, or active status and submit **Then** the `staff_members` record is updated — changes are reflected immediately in the list view (FR3)

4. **Given** a manager sets `is_active = false` for a staff member **When** that staff member attempts to access any protected route **Then** `hooks.server.ts` detects the deactivated status, signs them out, and redirects to `/login?reason=deactivated` — the login page shows "Tài khoản đã bị vô hiệu hóa" (FR3)

5. **Given** a Reception-role staff member is authenticated **When** they attempt to access any route under `(manager)/` (e.g., `/dashboard`, `/staff`) **Then** `(manager)/+layout.server.ts` throws `error(403, 'Forbidden')` — they cannot access manager pages (FR2, NFR-S3)

6. **Given** a Housekeeping-role staff member is authenticated **When** they attempt to access any route outside `(housekeeping)/` (e.g., `/rooms`, `/attendance`, `/inventory`) **Then** the target route group's `+layout.server.ts` throws `error(403, 'Forbidden')` — they cannot access financial data, attendance, bookings, or inventory (FR2, NFR-S5)

7. **Given** any `+server.ts` REST endpoint receives a request **When** the authenticated user's role lacks permission for that operation **Then** the endpoint returns `{ data: null, error: { message: "Forbidden", code: "403" } }` with HTTP status 403 (NFR-S3)

8. **Given** Supabase RLS policies are active on `staff_members` **When** a Reception or Housekeeping user queries the table directly **Then** RLS filters out all rows except their own — the application-layer RBAC and the database-layer RLS both enforce the same rules independently (NFR-S3)

## Tasks / Subtasks

- [x] **Task 1: Create Admin Supabase Client** (AC: #2)
  - [x] Create `src/lib/server/adminClient.ts`
  - [x] Import `SUPABASE_SERVICE_ROLE_KEY` from `$env/static/private`
  - [x] Import `PUBLIC_SUPABASE_URL` from `$env/static/public`
  - [x] Export `createAdminClient()` — returns `createClient<Database>(url, serviceRoleKey)` with `auth: { autoRefreshToken: false, persistSession: false }`
  - [x] This file lives in `src/lib/server/` — SvelteKit compile-time boundary prevents `.svelte` imports

- [x] **Task 2: Create Staff Server DB Functions** (AC: #1, #2, #3, #4, #8)
  - [x] Create `src/lib/server/db/staff.ts`
  - [x] Implement `getAllStaff(supabase)` — `SELECT * FROM staff_members ORDER BY created_at ASC`, typed return `StaffMember[]`
  - [x] Implement `getStaffById(supabase, id: string)` — `SELECT * FROM staff_members WHERE id = $1`, returns `StaffMember | null`
  - [x] Implement `createStaffAuthUser(adminClient, email: string, password: string)` — calls `adminClient.auth.admin.createUser({ email, password, email_confirm: true })`, returns `{ userId: string } | { error: string }`
  - [x] Implement `insertStaffMember(supabase, id: string, full_name: string, role: StaffRole)` — inserts into `staff_members`, returns inserted record or error
  - [x] Implement `updateStaffMember(supabase, id: string, updates: { full_name?: string; role?: StaffRole; is_active?: boolean })` — updates `staff_members` record, sets `updated_at = now()`

- [x] **Task 3: Add Zod Schemas for Staff Management** (AC: #2, #3)
  - [x] Open `src/lib/db/schema.ts`
  - [x] Add `CreateStaffSchema`: `{ full_name: z.string().min(2).max(100), email: z.string().email(), password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'), role: z.enum(['manager', 'reception', 'housekeeping']) }`
  - [x] Add `UpdateStaffSchema`: `{ full_name: z.string().min(2).max(100), role: z.enum(['manager', 'reception', 'housekeeping']), is_active: z.boolean() }`
  - [x] Export inferred types: `type CreateStaffData = z.infer<typeof CreateStaffSchema>`, `type UpdateStaffData = z.infer<typeof UpdateStaffSchema>`

- [x] **Task 4: Update `app.d.ts` — Extend `App.Locals`** (AC: #4, #5, #6)
  - [x] Add `userRole: StaffRole | null` to `App.Locals` interface
  - [x] Add `userFullName: string | null` to `App.Locals` interface
  - [x] Import `StaffRole` type (from `$lib/db/types` or define inline as `'manager' | 'reception' | 'housekeeping'`)

- [x] **Task 5: Update `hooks.server.ts` — Profile Check + Deactivated Account Guard** (AC: #4)
  - [x] After `safeGetSession()` returns a valid user, fetch `staff_members` profile: `SELECT is_active, role, full_name WHERE id = user.id LIMIT 1`
  - [x] If `is_active === false`: call `supabase.auth.signOut()` then `throw redirect(303, '/login?reason=deactivated')`
  - [x] If profile fetched successfully: attach `event.locals.userRole = profile.role` and `event.locals.userFullName = profile.full_name`
  - [x] If profile is null (edge case — auth user exists but no staff_members record): redirect to `/login?reason=no_profile`

- [x] **Task 6: Optimize `requireRole()` in `src/lib/server/auth.ts`** (AC: #5, #6, #7)
  - [x] Update `requireRole(locals, allowedRoles)` to read `locals.userRole` directly (set by hooks, no extra DB query)
  - [x] If `locals.userRole` is null or not in `allowedRoles`, throw `error(403, 'Forbidden')`
  - [x] Keep the function signature identical — callers in layout files don't need to change

- [x] **Task 7: Update Login Page — Deactivated Account Message** (AC: #4)
  - [x] Open `src/routes/(auth)/login/+page.svelte`
  - [x] Read `$page.url.searchParams.get('reason')` on mount
  - [x] If `reason === 'deactivated'`: display error banner "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản lý."
  - [x] If `reason === 'no_profile'`: display error banner "Tài khoản không tìm thấy. Vui lòng liên hệ quản lý."
  - [x] Banner style: amber background (`bg-amber-50 border border-amber-200 text-amber-800`), visible above the form

- [x] **Task 8: Staff List Page — View + Create** (AC: #1, #2, #5)
  - [x] Create `src/routes/(manager)/staff/+page.server.ts`:
    - [x] `load`: RBAC already enforced by `(manager)/+layout.server.ts`; call `getAllStaff(locals.supabase)`, return `{ staff }`
    - [x] `actions.createStaff`: parse FormData, validate with `CreateStaffSchema` (return `fail(400, errors)` on validation failure); call `createStaffAuthUser(adminClient, email, password)`; on error return `fail(400, { createError: message })`; call `insertStaffMember(supabase, userId, full_name, role)`; on DB error call `adminClient.auth.admin.deleteUser(userId)` (rollback) then return `fail(500, { createError: 'Lỗi hệ thống' })`; on success return `{ success: true }`
  - [x] Create `src/routes/(manager)/staff/+page.svelte`:
    - [x] Page title: "Quản lý nhân viên"
    - [x] Staff table: columns — Họ và tên, Vai trò (role badge), Trạng thái, Edit link (→ `/staff/[id]`)
    - [x] Role badges: `manager`=navy `bg-primary text-white`, `reception`=gold `bg-accent text-white`, `housekeeping`=neutral `bg-gray-200 text-gray-700`; each has Vietnamese label: manager="Quản lý", reception="Lễ tân", housekeeping="Dọn phòng"
    - [x] Status badge: `is_active=true`="Hoạt động" (green), `is_active=false`="Không hoạt động" (red)
    - [x] "Thêm nhân viên" button at top right; clicking toggles `let showForm = $state(false)`
    - [x] Collapsible add form (visible when `showForm === true`): fields — Họ và tên (text), Email (email), Mật khẩu (password), Vai trò (select: Quản lý / Lễ tân / Dọn phòng)
    - [x] Field validation messages shown below each input on `blur` event; full re-validation on submit
    - [x] Submit button text "Tạo tài khoản"; shows spinner + disabled state during submission (`$form.submitting`)
    - [x] On success: `showForm = false`, form resets, SvelteKit `invalidateAll()` refreshes the staff list

- [x] **Task 9: Staff Edit Page** (AC: #3, #4)
  - [x] Create `src/routes/(manager)/staff/[staffId]/+page.server.ts`:
    - [x] `load`: call `getStaffById(locals.supabase, params.staffId)`; throw `error(404, 'Nhân viên không tồn tại')` if null; return `{ staff }`
    - [x] `actions.updateStaff`: validate with `UpdateStaffSchema`; call `updateStaffMember(supabase, staffId, updates)`; return success or `fail(400, { error })`
    - [x] `actions.deactivateStaff`: call `updateStaffMember(supabase, staffId, { is_active: false })`; on success `throw redirect(303, '/staff')`
  - [x] Create `src/routes/(manager)/staff/[staffId]/+page.svelte`:
    - [x] Back link "← Danh sách nhân viên" → `/staff`
    - [x] Page title: "Chỉnh sửa: [full_name]"
    - [x] Pre-populated edit form: Họ và tên (text), Vai trò (select), Đang hoạt động (checkbox/toggle)
    - [x] "Lưu thay đổi" submit button with loading state
    - [x] "Vô hiệu hóa tài khoản" destructive button (only shown if `staff.is_active === true`)
    - [x] Confirmation dialog for deactivate: `Dialog` component (shadcn-svelte) — "Vô hiệu hóa tài khoản [name]?" with "Xác nhận" (destructive) and "Hủy" (ghost) buttons
    - [x] Note: email/password editing is NOT in scope — Supabase Auth manages those separately

- [x] **Task 10: Update `.env.example`** (AC: #2)
  - [x] Confirm `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here` is present in `.env.example`
  - [x] Confirm `SUPABASE_SERVICE_ROLE_KEY=<actual-key>` is set in local `.env` (git-ignored)
  - [x] The service role key is in Supabase Studio → Settings → API → `service_role` (JWT) key

- [x] **Task 11: Unit Tests + Verification** (AC: all)
  - [x] Create `src/lib/server/db/staff.test.ts` — mock Supabase client, test all 5 exported functions
  - [x] Create or update `src/lib/db/schema.test.ts`:
    - [x] `CreateStaffSchema` accepts valid data
    - [x] `CreateStaffSchema` rejects password < 8 chars
    - [x] `CreateStaffSchema` rejects invalid email format
    - [x] `CreateStaffSchema` rejects invalid role string
    - [x] `UpdateStaffSchema` accepts valid update data
  - [x] Create `src/lib/server/auth.test.ts` (if not already fully covering `requireRole`):
    - [x] `requireRole(['manager'])` with manager role → resolves without throwing
    - [x] `requireRole(['manager'])` with reception role → throws `error(403, ...)`
    - [x] `requireRole(['manager'])` with housekeeping role → throws `error(403, ...)`
    - [x] `requireRole(['reception', 'manager'])` with housekeeping role → throws 403
    - [x] `requireRole(['housekeeping', 'manager'])` with reception role → throws 403
  - [x] Verify `npm run check` passes with zero TypeScript errors
  - [x] Verify `npm run lint` passes
  - [x] Verify `npm run build` passes
  - [x] Verify `npm test` passes — all new tests green (total test count increases by new tests)

## Dev Notes

### Critical Architecture Constraints

- **Admin Client required for user creation** — `auth.admin.createUser()` requires `SUPABASE_SERVICE_ROLE_KEY`. The regular anon client cannot create auth users server-side. Use `createAdminClient()` from `src/lib/server/adminClient.ts` — this is server-only; build fails if imported from `.svelte` files.
- **Two-step creation with rollback** — Must create `auth.users` entry first (via admin API), then insert into `staff_members`. If the DB insert fails, rollback by calling `adminClient.auth.admin.deleteUser(userId)` to avoid orphaned auth users.
- **Deactivation = soft delete** — Set `is_active = false` in `staff_members`. Do NOT call `auth.admin.deleteUser()` — that would lose the audit trail and break foreign key references in other tables (bookings, attendance_logs, etc.). The deactivated-account check in `hooks.server.ts` enforces the login block.
- **RBAC already scaffolded** — `requireRole()` is implemented in `src/lib/server/auth.ts`. The three route group layout files already call `requireRole()` as of Story 1.3 Task 10. This story: (1) attaches `userRole` to `locals` in `hooks.server.ts` to avoid repeated DB queries, (2) adds the deactivated-account check, and (3) builds the staff management UI.
- **Server-side RBAC only** — RBAC checks ONLY in `hooks.server.ts`, `+page.server.ts`, `+server.ts`. NEVER in `.svelte` files. Client-side role checks are display-only (e.g., hide the "Deactivate" button from non-managers).
- **TypeScript strict mode** — `any` is forbidden. Use `unknown` + type guard or generated DB types from `src/lib/db/types.ts`.
- **Named exports** — All `.ts` files use named exports. Default exports only for `.svelte` components and `+page/+layout` files.

### Admin Supabase Client (Exact Pattern)

```typescript
// src/lib/server/adminClient.ts
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '$lib/db/types';

export function createAdminClient() {
  return createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

### Staff Creation Form Action (Exact Pattern)

```typescript
// In (manager)/staff/+page.server.ts createStaff action
const { full_name, email, password, role } = CreateStaffSchema.parse(formData);

const adminClient = createAdminClient();
const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
  email,
  password,
  email_confirm: true,  // Skip email verification — internal hotel staff
});
if (authError) return fail(400, { createError: authError.message });

const { error: staffError } = await locals.supabase
  .from('staff_members')
  .insert({ id: authData.user.id, full_name, role });

if (staffError) {
  // Rollback the auth user to avoid orphaned records
  await adminClient.auth.admin.deleteUser(authData.user.id);
  return fail(500, { createError: 'Không thể tạo hồ sơ nhân viên. Vui lòng thử lại.' });
}
```

### Deactivated Account Check in `hooks.server.ts`

Insert this after the existing `safeGetSession()` call, before the auth gate redirect check:

```typescript
const { session, user } = await event.locals.safeGetSession();

if (user) {
  const { data: profile } = await event.locals.supabase
    .from('staff_members')
    .select('is_active, role, full_name')
    .eq('id', user.id)
    .single();

  if (profile && !profile.is_active) {
    await event.locals.supabase.auth.signOut();
    throw redirect(303, '/login?reason=deactivated');
  }
  if (!profile) {
    throw redirect(303, '/login?reason=no_profile');
  }

  // Attach to locals for downstream use (avoids extra DB queries in requireRole)
  event.locals.userRole = profile.role;
  event.locals.userFullName = profile.full_name;
}
```

### Optimized `requireRole()` Pattern

Update `src/lib/server/auth.ts` to use the role cached in `locals`:

```typescript
export function requireRole(locals: App.Locals, allowedRoles: StaffRole[]): void {
  const role = locals.userRole;
  if (!role || !allowedRoles.includes(role)) {
    throw error(403, 'Forbidden');
  }
}
```

Note: No `async` needed since we're reading from `locals` (already populated by hooks). This eliminates the extra DB round-trip on every protected page load.

### Database Schema Context

```sql
-- staff_members (from Story 1.2 — 00001_initial_schema.sql)
CREATE TABLE staff_members (
  id         UUID PRIMARY KEY REFERENCES auth.users,
  full_name  TEXT NOT NULL,
  role       staff_role NOT NULL,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE staff_role AS ENUM ('manager', 'reception', 'housekeeping');
```

RLS policies from `00002_rls_policies.sql` (already applied):
- Manager: `SELECT`, `INSERT`, `UPDATE` on all `staff_members` rows
- Reception: `SELECT` only their own row (`WHERE id = auth.uid()`)
- Housekeeping: `SELECT` only their own row (`WHERE id = auth.uid()`)
- No role has `DELETE` on `staff_members` (deactivation is soft-delete only)

### Existing Codebase State (from Story 1.3)

These files exist and are functional — verify before modifying:
- `src/hooks.server.ts` — full SSR Supabase client + `safeGetSession()` + auth gate
- `src/lib/server/auth.ts` — `getSession()`, `getUserRole()`, `requireAuth()`, `requireRole()`, `getStaffProfile()`
- `src/lib/stores/session.ts` — `SessionData` interface with `user`, `role`, `fullName`, `session`
- `src/lib/utils/roleRedirect.ts` — `getRoleHomePath(role)` returns `/rooms`, `/my-rooms`, `/dashboard`
- `src/routes/(manager)/+layout.server.ts` — `requireRole(['manager'])` ✅
- `src/routes/(reception)/+layout.server.ts` — `requireRole(['reception', 'manager'])` ✅
- `src/routes/(housekeeping)/+layout.server.ts` — `requireRole(['housekeeping', 'manager'])` ✅
- `src/lib/db/schema.ts` — existing Zod schemas; add `CreateStaffSchema` + `UpdateStaffSchema`
- `app.d.ts` — `App.Locals` has `supabase` and `safeGetSession`; add `userRole`, `userFullName`

### Tailwind Design Tokens (from Story 1.1)

```typescript
// tailwind.config.ts — already configured
colors: {
  primary: '#1E3A8A',   // Navy — manager role badge, primary buttons
  accent: '#CA8A04',    // Gold — reception role badge, accent elements
  background: '#F8FAFC', // Off-white page background
}
```

Role badge color mapping:
- `manager` → `bg-primary text-white` + Vietnamese label "Quản lý"
- `reception` → `bg-accent text-white` + Vietnamese label "Lễ tân"
- `housekeeping` → `bg-gray-200 text-gray-700` + Vietnamese label "Dọn phòng"

### UX Requirements for Staff Management

- **Desktop-first** — managers work at desktop; no special mobile layout needed for this page
- **WCAG 2.1 Level AA** — 4.5:1 contrast for all text; role badges must use color + text label (never color-only)
- **48×48px minimum touch targets** on all interactive elements
- **Form validation on `blur`** per field; full re-validation on submit
- **Confirmation dialog** before deactivation — use shadcn-svelte `Dialog` component (already in `src/lib/components/ui/`)
- **Loading state** — submit buttons show spinner during form submission; disabled to prevent duplicates
- **No breadcrumbs** — app is max 2 levels deep; back link is sufficient

### File Structure

New files to create:
```
src/lib/server/adminClient.ts                          # Admin Supabase client
src/lib/server/db/staff.ts                             # Staff DB functions
src/routes/(manager)/staff/+page.svelte                # Staff list + add form
src/routes/(manager)/staff/+page.server.ts             # load + createStaff action
src/routes/(manager)/staff/[staffId]/+page.svelte      # Edit staff
src/routes/(manager)/staff/[staffId]/+page.server.ts   # updateStaff + deactivateStaff
src/lib/server/db/staff.test.ts                        # Staff DB function unit tests
```

Files to modify:
```
src/hooks.server.ts                        # Add is_active check + attach userRole/userFullName to locals
src/app.d.ts                               # Add userRole, userFullName to App.Locals
src/lib/db/schema.ts                       # Add CreateStaffSchema, UpdateStaffSchema
src/lib/server/auth.ts                     # Optimize requireRole to use locals.userRole (no async)
src/routes/(auth)/login/+page.svelte       # Handle ?reason=deactivated|no_profile query param
.env.example                               # Confirm SUPABASE_SERVICE_ROLE_KEY entry present
src/lib/db/schema.test.ts                  # Add CreateStaffSchema + UpdateStaffSchema tests
src/lib/server/auth.test.ts               # Add requireRole tests (create if not exists)
```

### Project Structure Notes

- `src/lib/server/adminClient.ts` follows the `src/lib/server/` pattern — server-only, SvelteKit compile-time boundary prevents `.svelte` imports
- `src/routes/(manager)/staff/` extends the route group established by architecture; `[staffId]` follows `[camelCase]` convention
- Staff management UI uses inline forms within the route pages — no separate `lib/components/staff/` folder needed (YAGNI: single-use CRUD pages don't warrant reusable components at MVP scale)
- `Dialog` component for deactivation confirmation comes from `src/lib/components/ui/` (shadcn-svelte, already scaffolded in Story 1.1)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4] — Acceptance criteria origin
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — RBAC role matrix
- [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns] — API response envelope `{ data, error }`
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines] — 10 mandatory AI agent rules
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — Project directory conventions
- [Source: _bmad-output/implementation-artifacts/1-3-staff-login-session-persistence-logout.md#Dev Notes] — Existing hooks.server.ts pattern, SSR pattern, role layout files
- [Source: _bmad-output/implementation-artifacts/1-2-database-schema-rls-policies-audit-trail-seed-data.md] — staff_members schema and RLS policy context

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

None — implementation completed without blocking issues.

### Completion Notes List

- Zod v4 API: used `{ error: '...' }` (not `errorMap`) for enum error messages, and `ZodError.issues` (not `.errors`) throughout.
- `requireRole()` is async (not sync as noted in Dev Notes pattern) to maintain backward compatibility with existing callers.
- `StaffAdminClient` interface replaces `any` for the admin client parameter, satisfying TypeScript strict mode.
- Superforms 2.29.1 installed with `zod4` adapter; all Form Actions now use `superValidate(request, zod4(Schema))` on server and `superForm(data.form)` on client.
- `svelte/no-navigation-without-resolve` rule suppressed with `<!-- eslint-disable/enable -->` block comments on `<a href>` links — intentional SvelteKit navigations.
- Code review identified and fixed: H1 (`any` type), H2 (Superforms integration), M1 (deactivate button stale data), M2 (slow-path tests), M3 (form action tests), L1 (stale app.d.ts comment).
- Final: 52 tests pass, 0 TypeScript errors, 0 lint errors, build succeeds.

### File List

- `src/lib/server/adminClient.ts` — CREATED
- `src/lib/server/db/staff.ts` — CREATED (StaffAdminClient interface added)
- `src/lib/server/db/staff.test.ts` — CREATED
- `src/lib/db/schema.ts` — MODIFIED (added CreateStaffSchema, UpdateStaffSchema, CreateStaffData, UpdateStaffData)
- `src/lib/db/schema.test.ts` — MODIFIED (added 10 tests for CreateStaffSchema + UpdateStaffSchema)
- `src/lib/server/auth.ts` — MODIFIED (optimized requireRole to use locals.userRole fast path)
- `src/lib/server/auth.test.ts` — CREATED (8 fast-path + 3 slow-path requireRole tests)
- `src/app.d.ts` — MODIFIED (added userRole, userFullName to App.Locals; removed stale comment)
- `src/hooks.server.ts` — MODIFIED (added is_active guard + userRole/userFullName on locals)
- `src/routes/(auth)/login/+page.svelte` — MODIFIED (added deactivated/no_profile reason banner)
- `src/routes/(manager)/staff/+page.server.ts` — CREATED (Superforms)
- `src/routes/(manager)/staff/+page.svelte` — CREATED (Superforms)
- `src/routes/(manager)/staff/page.server.test.ts` — CREATED (5 form action tests)
- `src/routes/(manager)/staff/[staffId]/+page.server.ts` — CREATED (Superforms)
- `src/routes/(manager)/staff/[staffId]/+page.svelte` — CREATED (Superforms)
