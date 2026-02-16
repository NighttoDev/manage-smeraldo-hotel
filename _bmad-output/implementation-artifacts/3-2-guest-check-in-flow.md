# Story 3.2: Guest Check-In Flow

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a reception staff member,
I want to check in a guest from the room diagram with their details pre-filled and confirm with a single tap,
so that I can complete check-in in under 90 seconds without opening a spreadsheet.

## Acceptance Criteria

1. **Given** a guest has an existing `confirmed` booking with `check_in_date` = today **When** reception clicks their room tile on the diagram **Then** the `CheckInDialog` opens with guest name, check-in/out dates, booking source badge, and `nights_count` — all pre-filled from the booking record (FR18, FR26)

2. **Given** the `CheckInDialog` is open with correct details **When** reception clicks "Xác nhận check-in" **Then** Form Action `?/checkIn` runs: the room's `status` is set to `'occupied'` and `current_guest_name` is set on the `rooms` row, the booking's `status` is set to `'checked_in'`, a `room_status_logs` audit entry is written with `changed_by = user.id`, the dialog closes — no full page reload (FR28, NFR-S4)

3. **Given** the `CheckInDialog` is open **When** reception edits the guest name field **Then** the edited name is sent with the `?/checkIn` action and saved to `guests.full_name` before the room status is updated — so the tile shows the corrected name (FR21)

4. **Given** reception clicks "Xác nhận check-in" **When** Form Action `?/checkIn` is processing **Then** the button shows a spinner and is disabled — prevents duplicate submissions; all other form elements are also disabled

5. **Given** check-in is completed **When** Supabase Realtime broadcasts the `rooms` table update **Then** all connected sessions see the room tile flip to `occupied` (amber border, "Có khách" badge) with the guest name within 3 seconds — using the existing `rooms:all` Realtime subscription in `+layout.svelte` (NFR-P5)

## Tasks / Subtasks

- [ ] **Task 1: Add `checkInBooking()` and `getTodaysBookingForRoom()` to `bookings.ts`** (AC: #2, #3)
  - [ ] Add `getTodaysBookingForRoom(supabase, roomId, todayDate): Promise<BookingWithGuest | null>` — queries `bookings` joined with `guests` where `room_id = roomId AND status = 'confirmed' AND check_in_date = todayDate`; returns `null` if no booking found
  - [ ] Add `checkInBooking(supabase, bookingId, guestName): Promise<void>` — updates booking `status = 'checked_in'`; also updates `guests.full_name = guestName` if guest name was edited
  - [ ] Define `BookingWithGuest` interface extending `BookingRow` with nested `guest: { id: string; full_name: string }` from the join

- [ ] **Task 2: Add `CheckInSchema` to `schema.ts`** (AC: #2, #3)
  - [ ] Add form schema for Superforms validation (keep separate from DB `BookingSchema`):
    ```typescript
    export const CheckInSchema = z.object({
      booking_id: z.string().uuid({ error: 'Booking ID không hợp lệ' }),
      room_id:    z.string().uuid({ error: 'Room ID không hợp lệ' }),
      guest_name: z.string().min(1, { error: 'Tên khách không được để trống' }),
      check_in_date:  DateString,
      check_out_date: DateString,
    });
    export type CheckIn = z.infer<typeof CheckInSchema>;
    ```

- [ ] **Task 3: Extend `rooms/+page.server.ts` with `?/checkIn` action and today's bookings** (AC: #1, #2, #3, #4)
  - [ ] In `load`: add call to fetch today's confirmed bookings per room — `getTodaysBookingForRoom` is called per-room or a bulk query is used; simpler approach: load ALL `confirmed` bookings where `check_in_date = todayVN()`, return as `todaysBookings: BookingWithGuest[]`; `superValidate(zod4(CheckInSchema))` for the new dialog form — store as `checkInForm`
  - [ ] Add `?/checkIn` Form Action in `rooms/+page.server.ts`:
    1. `superValidate(request, zod4(CheckInSchema))` — fail 400 if invalid
    2. `safeGetSession()` — fail 401 if no user
    3. `checkInBooking(supabase, booking_id, guest_name)` — update booking + guest name
    4. `updateRoomStatus(supabase, room_id, 'occupied', guest_name)` — updates `rooms.status` + `rooms.current_guest_name`
    5. `insertRoomStatusLog(supabase, room_id, previousStatus, 'occupied', user.id)` — audit trail
    6. Return `message(form, { type: 'success', text: 'Check-in thành công' })` — no redirect (dialog closes on success, Realtime updates tile)
  - [ ] Use `getRoomById` (already exists) to get `previousStatus` for the log

- [ ] **Task 4: Create `CheckInDialog.svelte` component** (AC: #1, #2, #3, #4)
  - [ ] Create `src/lib/components/bookings/CheckInDialog.svelte`
  - [ ] Props: `booking: BookingWithGuest | null`, `checkInForm: SuperValidated<CheckIn>`, `onclose: () => void`
  - [ ] Pattern: same fixed-position dialog as `StatusOverrideDialog.svelte` — backdrop + modal `role="dialog"` + `aria-modal`
  - [ ] Uses Superforms: `const { form: formData, errors, enhance, submitting, message } = superForm(checkInForm, { validators: zod4(CheckInSchema), onUpdated: ({ form }) => { if (form.message?.type === 'success') onclose(); } })`
  - [ ] Hidden fields: `booking_id` and `room_id` (pre-filled from `booking` prop, not user-editable)
  - [ ] Guest name: editable text input (pre-filled from `booking.guest.full_name`), shows `$errors.guest_name` on blur
  - [ ] Read-only display: check-in date, check-out date (formatted `vi-VN`), nights count, booking source badge
  - [ ] Submit button: disabled + spinner when `$submitting`; label "Xác nhận check-in"
  - [ ] Cancel button: calls `onclose()`, disabled when `$submitting`
  - [ ] Server message: show `$message.text` in red (error) or green (success) banner at top of dialog
  - [ ] Only rendered when `booking !== null` (guard with `{#if booking}`)

- [ ] **Task 5: Wire `CheckInDialog` into `rooms/+page.svelte`** (AC: #1, #2, #5)
  - [ ] Import `CheckInDialog` and add `checkInForm` from `data`
  - [ ] Add `checkInBooking = $state<BookingWithGuest | null>(null)` for the selected booking
  - [ ] On room tile click: lookup `data.todaysBookings.find(b => b.room_id === room.id)` — if a confirmed booking exists for that room, set `checkInBooking = booking` (opens CheckInDialog); else set `selectedRoom = room` (opens existing StatusOverrideDialog)
  - [ ] Render `<CheckInDialog booking={checkInBooking} checkInForm={data.checkInForm} onclose={() => (checkInBooking = null)} />` alongside existing `<StatusOverrideDialog>`
  - [ ] After successful check-in, `checkInBooking = null` is called via `onclose` — `roomStateStore` updates automatically via existing Realtime subscription

- [ ] **Task 6: Unit tests** (AC: all)
  - [ ] `bookings.test.ts` additions — test `checkInBooking()`: success case, booking not found error; test `getTodaysBookingForRoom()`: returns booking with guest, returns null when none, throws on DB error
  - [ ] `schema.test.ts` additions — test `CheckInSchema`: valid data passes, empty guest_name fails, invalid UUIDs fail

## Dev Notes

### Critical Architecture Constraints

- **Two tables updated in one action**: `?/checkIn` must update BOTH `bookings.status → 'checked_in'` AND `rooms.status → 'occupied'` + `rooms.current_guest_name`. If the room update fails after booking update, the data is inconsistent — wrap both in a `try/catch` and return a Superforms `message` error rather than leaving partial state. Supabase does not support multi-table transactions via the client JS SDK, so do the booking update first (less visible to user), then room update.

- **`updateRoomStatus()` already handles `current_guest_name`**: The existing `rooms.ts` function accepts optional `guestName` param and clears it when transitioning to `available`/`ready`. Pass `guest_name` from the validated form when calling it for check-in.

- **`insertRoomStatusLog` requires `changed_by` as UUID**: Use `user.id` from `safeGetSession()`. Never pass staff display name.

- **Room status after check-in is `'occupied'`** (lowercase, exact DB enum value): `'available' | 'occupied' | 'checking_out_today' | 'being_cleaned' | 'ready'` — imported as `RoomStatus` from `$lib/server/db/rooms`.

- **`bookings.status` is TEXT, not ENUM**: The migration has `status TEXT DEFAULT 'confirmed'`. Valid values used by this app: `'confirmed'`, `'checked_in'`, `'checked_out'`, `'cancelled'`. No DB enum constraint — just use exact strings.

- **No redirect after check-in**: The dialog closes via `onUpdated` in `superForm()` when `message.type === 'success'`. Realtime handles tile update. Do NOT call `redirect()` in the `?/checkIn` action.

- **Today's date for booking lookup**: Use the same `dateInVN()` function from `new/+page.server.ts` (or extract to a shared util). Do NOT use UTC `new Date().toISOString().split('T')[0]` — this returns wrong date for VN users before 7am.

- **Join `bookings` + `guests` in one query**: Use Supabase foreign key join syntax:
  ```typescript
  supabase
    .from('bookings')
    .select('*, guest:guests(id, full_name)')
    .eq('room_id', roomId)
    .eq('status', 'confirmed')
    .eq('check_in_date', todayDate)
    .maybeSingle()
  ```
  This returns `{ ...bookingRow, guest: { id, full_name } }`.

- **Superforms `onUpdated` pattern for dialog close**:
  ```typescript
  const { form: formData, errors, enhance, submitting, message } = superForm(checkInForm, {
    validators: zod4(CheckInSchema),
    onUpdated: ({ form }) => {
      if (form.message?.type === 'success') onclose();
    }
  });
  ```

- **Existing `StatusOverrideDialog` pattern to follow** (copy structure, do NOT break it):
  - Fixed backdrop + dialog positioned with `fixed inset-x-4 top-1/2 -translate-y-1/2`
  - `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing to `<h3>`
  - Backdrop is a `<button>` that calls cancel/onclose

### Existing Code to Reuse (do NOT reinvent)

| Function/Component | Location | Usage |
|--------------------|----------|-------|
| `updateRoomStatus()` | `server/db/rooms.ts:82` | Updates `rooms.status` + `current_guest_name` |
| `insertRoomStatusLog()` | `server/db/rooms.ts:137` | Audit trail entry |
| `getRoomById()` | `server/db/rooms.ts:117` | Get `previousStatus` before update |
| `getBookingsByRoom()` | `server/db/bookings.ts` | Reference for query pattern |
| `superValidate` / `message` / `fail` | `sveltekit-superforms` | Form handling pattern |
| `StatusOverrideDialog.svelte` | `components/rooms/` | Dialog layout/accessibility pattern |
| `RoomTile.svelte` | `components/rooms/` | Has `onclick` prop already |
| `rooms/+page.svelte` | `routes/(reception)/rooms/` | Extend `selectedRoom` pattern with `checkInBooking` |
| `rooms/+page.server.ts` | `routes/(reception)/rooms/` | Add `?/checkIn` action here, extend `load` |
| `GuestInput.svelte` | `components/bookings/` | Reuse for editable guest name field |
| `dateInVN()` in `new/+page.server.ts` | booking form | Extract or inline VN-timezone date function |

### Superforms Pattern (sveltekit-superforms 2.29.1 + zod4 adapter)

```typescript
// server
import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

// client
import { superForm } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
```

### Realtime — no new subscription needed

The existing `+layout.svelte` already subscribes to `rooms:all` Supabase channel and calls `updateRoomInStore(payload.new)`. After the `?/checkIn` action updates the `rooms` row, Supabase Realtime fires automatically and updates `roomStateStore`, which `RoomTile.svelte` reads from reactively. Zero extra Realtime code needed in this story.

### Booking Source Display Labels

| DB value | Display label |
|----------|---------------|
| `agoda` | Agoda |
| `booking_com` | Booking.com |
| `trip_com` | Trip.com |
| `facebook` | Facebook |
| `walk_in` | Khách vãng lai |

### Date Display (vi-VN locale)

```typescript
// Always use Intl — never hardcode format strings (project rule)
new Intl.DateTimeFormat('vi-VN').format(new Date(dateString));
// → "01/03/2026"
```

### File Structure

```
src/
  lib/
    server/db/
      bookings.ts          ← add getTodaysBookingForRoom(), checkInBooking(), BookingWithGuest
    db/
      schema.ts            ← add CheckInSchema, CheckIn type
    components/
      bookings/
        CheckInDialog.svelte  ← NEW
  routes/
    (reception)/
      rooms/
        +page.server.ts    ← extend load (todaysBookings, checkInForm) + add ?/checkIn action
        +page.svelte       ← add CheckInDialog, logic to choose dialog based on booking presence
```

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

### File List
