# Story 3.3: Guest Check-Out Flow

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a reception staff member,
I want to check out a guest and trigger the room cleaning workflow,
so that the room is immediately flagged for housekeeping and available for the next guest as quickly as possible.

## Acceptance Criteria

1. **Given** a room is in `occupied` status with a checked-in guest **When** reception clicks the room tile on the diagram **Then** a `CheckOutDialog` opens showing guest name, check-in/out dates, nights count, and booking source — all read-only from the booking record (FR19)

2. **Given** the `CheckOutDialog` is open **When** reception clicks "Xác nhận trả phòng" **Then** a confirmation step appears: "Trả phòng [Guest Name] khỏi phòng [Room Number]?" with an explicit "Có, trả phòng" button — not a generic "OK" (FR19, UX)

3. **Given** reception confirms the check-out **When** Form Action `?/checkOut` processes **Then** the booking's `status` is set to `'checked_out'`, the room's `status` transitions to `'being_cleaned'` and `current_guest_name` is cleared to `null`, and a `room_status_logs` audit entry is written with `changed_by = user.id` (FR19, NFR-S4)

4. **Given** the "Có, trả phòng" button is clicked **When** Form Action `?/checkOut` is processing **Then** the button shows a spinner and is disabled — prevents duplicate submissions; all other form elements are also disabled

5. **Given** check-out is completed **When** Supabase Realtime broadcasts the `rooms` table update **Then** all connected sessions see the room tile flip to `being_cleaned` (violet border) with guest name removed within 3 seconds — the room appears in housekeeping's assigned rooms list immediately (NFR-P5)

6. **Given** a manager is logged in **When** they view any occupied room **Then** they have the authority to initiate check-out for any booking, including overriding a stale booking from a previous date (FR24)

## Tasks / Subtasks

- [x] **Task 1: Add `checkOutBooking()` and `getOccupiedBookings()` to `bookings.ts`** (AC: #1, #3)
  - [x] Add `getOccupiedBookings(supabase): Promise<BookingWithGuest[]>` — queries `bookings` joined with `guests` where `status = 'checked_in'`; returns all currently checked-in bookings with guest data
  - [x] Add `checkOutBooking(supabase, bookingId): Promise<void>` — updates booking `status = 'checked_out'`

- [x] **Task 2: Add `CheckOutSchema` to `schema.ts`** (AC: #2, #3)
  - [x] Add form schema for Superforms validation: `CheckOutSchema` with `booking_id` and `room_id` UUID fields
  - [x] Add `CheckOut` type export

- [x] **Task 3: Extend `rooms/+page.server.ts` with `?/checkOut` action and occupied bookings** (AC: #1, #2, #3, #4, #6)
  - [x] In `load`: added `getOccupiedBookings()` and `superValidate(zod4(CheckOutSchema))` to `Promise.all`; returns `occupiedBookings` and `checkOutForm`
  - [x] Added `?/checkOut` Form Action with full validation: booking existence, room ownership, booking status (`checked_in`), room status (`occupied`) idempotency guard, then checkout → being_cleaned transition + audit trail

- [x] **Task 4: Create `CheckOutDialog.svelte` component** (AC: #1, #2, #4)
  - [x] Created `src/lib/components/bookings/CheckOutDialog.svelte` with two-step confirmation pattern
  - [x] Step 1: read-only booking details + "Xác nhận trả phòng" button
  - [x] Step 2: destructive confirmation "Có, trả phòng" with red button + spinner
  - [x] Superforms integration with `onUpdated` dialog close, `$effect` reset on booking change

- [x] **Task 5: Wire `CheckOutDialog` into `rooms/+page.svelte`** (AC: #1, #5, #6)
  - [x] Import `CheckOutDialog`, added `checkOutBooking` and `checkOutRoomNumber` state
  - [x] Updated `handleRoomClick` with 3-priority routing: check-in → check-out → status override
  - [x] Rendered `<CheckOutDialog>` alongside existing dialogs

- [x] **Task 6: Unit tests** (AC: all)
  - [x] `bookings.test.ts`: 5 new tests for `getOccupiedBookings()` (success, empty, error) and `checkOutBooking()` (success, error)
  - [x] `schema.test.ts`: 5 new tests for `CheckOutSchema` (valid, missing fields, invalid UUIDs)

## Dev Notes

### Critical Architecture Constraints

- **Room status after check-out is `'being_cleaned'`** (NOT `'available'`): The housekeeping workflow handles `being_cleaned → ready → available`. Check-out ONLY transitions to `being_cleaned`.

- **`current_guest_name` must be cleared**: Call `updateRoomStatus(supabase, room_id, 'being_cleaned', null)` — pass explicit `null` as `guestName`. The function only auto-clears for `available`/`ready` transitions. For `being_cleaned`, you must explicitly pass `null` to clear the guest name from the tile.

- **`bookings.status` is TEXT, not ENUM**: Valid values: `'confirmed'`, `'checked_in'`, `'checked_out'`, `'cancelled'`. No DB enum constraint.

- **Two-step destructive confirmation**: The UX spec requires explicit labelled confirmation for destructive actions. "Xác nhận trả phòng" → "Có, trả phòng" (red button). Do NOT use a single-click check-out.

- **No redirect after check-out**: Same pattern as check-in — dialog closes via `onUpdated` when `message.type === 'success'`. Realtime handles tile update. Do NOT call `redirect()`.

- **Manager can check-out any booking**: No role check in the `?/checkOut` action beyond the standard `(reception)/+layout.server.ts` gate (both reception and manager can access). No date restriction for check-out — managers can check out stale bookings from previous dates (FR24).

- **Booking-room ownership check** (same pattern as `?/checkIn`): Verify `booking.room_id === form.data.room_id` before processing. Prevents tampering with hidden form fields.

- **Idempotency guard**: Check `room.status === 'occupied'` before proceeding. If room is already `being_cleaned` or another status, return error. Same pattern as the occupied guard in `?/checkIn`.

- **Supabase does not support multi-table transactions**: Do the booking update first (less visible), then room update. If room update fails after booking update, the data is inconsistent — wrap both in `try/catch` and return Superforms `message` error.

### Existing Code to Reuse (do NOT reinvent)

| Function/Component | Location | Usage |
|--------------------|----------|-------|
| `updateRoomStatus()` | `server/db/rooms.ts:82` | Updates `rooms.status` + clears `current_guest_name` |
| `insertRoomStatusLog()` | `server/db/rooms.ts:137` | Audit trail entry |
| `getRoomById()` | `server/db/rooms.ts:117` | Get room for validation + `previousStatus` |
| `getBookingById()` | `server/db/bookings.ts` | Verify booking exists and belongs to room |
| `CheckInDialog.svelte` | `components/bookings/` | Copy dialog layout, form pattern, accessibility |
| `StatusOverrideDialog.svelte` | `components/rooms/` | Dialog accessibility pattern reference |
| `superValidate` / `message` / `fail` | `sveltekit-superforms` | Form handling pattern |
| `formatDateVN()` | `$lib/utils/formatDate` | Vietnamese date display |
| `BookingWithGuest` interface | `$lib/db/schema` | Shared type for booking + guest join |
| `rooms/+page.server.ts` | `routes/(reception)/rooms/` | Extend with `?/checkOut` action + `occupiedBookings` in `load` |
| `rooms/+page.svelte` | `routes/(reception)/rooms/` | Extend `handleRoomClick` routing logic |

### Superforms Pattern (sveltekit-superforms 2.29.1 + zod4 adapter)

```typescript
// server
import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

// client
import { superForm } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
```

### Two-Step Confirmation Pattern (Svelte 5)

```svelte
<script lang="ts">
  let step = $state<1 | 2>(1);

  // Reset step when booking changes
  $effect(() => {
    if (booking) {
      step = 1;
      reset({ data: { booking_id: booking.id, room_id: booking.room_id }, keepMessage: false });
    }
  });
</script>

{#if step === 1}
  <!-- Show booking details + "Xác nhận trả phòng" button -->
  <button type="button" onclick={() => (step = 2)}>Xác nhận trả phòng</button>
{:else}
  <!-- Destructive confirmation: "Có, trả phòng" submit button -->
  <p>Trả phòng {guestName} khỏi phòng {roomNumber}?</p>
  <button type="submit">Có, trả phòng</button>
  <button type="button" onclick={() => (step = 1)}>Quay lại</button>
{/if}
```

### Realtime — no new subscription needed

The existing `+layout.svelte` already subscribes to `rooms:all` Supabase channel. After `?/checkOut` updates the `rooms` row, Supabase Realtime fires automatically and updates `roomStateStore`. Zero extra Realtime code needed.

### `handleRoomClick` Routing Logic (updated)

```typescript
function handleRoomClick(roomId: string) {
  // Priority 1: Check-in (confirmed booking arriving today)
  const checkIn = data.todaysBookings.find((b) => b.room_id === roomId) ?? null;
  if (checkIn) {
    checkInBooking = checkIn;
    return;
  }
  // Priority 2: Check-out (occupied room with checked_in booking)
  const checkOut = data.occupiedBookings.find((b) => b.room_id === roomId) ?? null;
  if (checkOut) {
    const room = allRooms.find((r) => r.id === roomId);
    checkOutBooking = checkOut;
    checkOutRoomNumber = room?.room_number ?? '';
    return;
  }
  // Priority 3: Status override (fallback)
  const room = allRooms.find((r) => r.id === roomId);
  if (room) selectedRoom = room;
}
```

### Bulk Query for Occupied Bookings

```typescript
// bookings.ts — add alongside getTodaysBookings()
export async function getOccupiedBookings(
  supabase: SupabaseClient
): Promise<BookingWithGuest[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, guest:guests(id, full_name)')
    .eq('status', 'checked_in');

  if (error) {
    throw new Error(`getOccupiedBookings failed: ${error.message}`);
  }

  return (data ?? []) as BookingWithGuest[];
}
```

### Booking Source Display Labels

| DB value | Display label |
|----------|---------------|
| `agoda` | Agoda |
| `booking_com` | Booking.com |
| `trip_com` | Trip.com |
| `facebook` | Facebook |
| `walk_in` | Khách vãng lai |

### File Structure

```
src/
  lib/
    server/db/
      bookings.ts          ← add getOccupiedBookings(), checkOutBooking()
    db/
      schema.ts            ← add CheckOutSchema, CheckOut type
    components/
      bookings/
        CheckOutDialog.svelte  ← NEW
  routes/
    (reception)/
      rooms/
        +page.server.ts    ← extend load (occupiedBookings, checkOutForm) + add ?/checkOut action
        +page.svelte       ← add CheckOutDialog, extend handleRoomClick routing
```

### Previous Story Intelligence (from 3.2)

- `BookingWithGuest` type is already in `$lib/db/schema` — import from there, not from `$lib/server/db/bookings`
- `$effect` is used in `CheckInDialog` to reset form fields when `booking` prop changes — follow same pattern for `CheckOutDialog`
- Room tile click routing uses `data.todaysBookings.find()` — extend with `data.occupiedBookings.find()` check
- `formatDateVN()` imported from `$lib/utils/formatDate` — reuse for date display
- 167 tests passing before this story — run `npx vitest run` to verify no regressions

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3] — Acceptance criteria: check-out confirmation, room → being_cleaned, audit trail
- [Source: _bmad-output/planning-artifacts/architecture.md#Form Actions] — `?/checkOut` named explicitly
- [Source: _bmad-output/planning-artifacts/architecture.md#Database Schema] — bookings.status TEXT, room_status_logs audit trail
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Dialog Patterns] — Destructive confirmation uses explicit labelled button, no generic "OK"
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns] — Check-out: room tile color transition + Toast
- [Source: manage-smeraldo-hotel/src/lib/server/db/rooms.ts] — `updateRoomStatus()` signature, `insertRoomStatusLog()` signature
- [Source: manage-smeraldo-hotel/src/lib/server/db/bookings.ts] — `checkInBooking()` pattern to follow, `getBookingById()` for ownership check
- [Source: manage-smeraldo-hotel/src/lib/components/bookings/CheckInDialog.svelte] — Dialog layout, Superforms `onUpdated` pattern, `$effect` reset pattern
- [Source: manage-smeraldo-hotel/src/routes/(reception)/rooms/+page.server.ts] — Existing `?/checkIn` action pattern, `load` with `Promise.all`
- [Source: manage-smeraldo-hotel/src/routes/(reception)/rooms/+page.svelte] — `handleRoomClick` routing, dialog state management
- [Source: _bmad-output/implementation-artifacts/3-2-guest-check-in-flow.md#Dev Notes] — Completion notes, patterns established

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

- All 6 tasks implemented. 177/177 tests passing (10 new tests: 5 in bookings.test.ts, 5 in schema.test.ts).
- Used bulk `getOccupiedBookings()` instead of per-room `getCheckedInBookingForRoom()` — single query, consistent with `getTodaysBookings()` pattern.
- `CheckOutDialog.svelte` implements two-step destructive confirmation: step 1 shows booking details, step 2 shows explicit "Có, trả phòng" red button.
- `?/checkOut` action validates: booking existence, room ownership, booking status (`checked_in`), room status (`occupied` idempotency guard).
- `handleRoomClick` routing: check-in → check-out → status override (3-priority).
- Passed explicit `null` as `guestName` to `updateRoomStatus()` for `being_cleaned` transition to clear guest name from tile.

### File List

- `manage-smeraldo-hotel/src/lib/server/db/bookings.ts` (modified — added `getOccupiedBookings()`, `checkOutBooking()`)
- `manage-smeraldo-hotel/src/lib/server/db/bookings.test.ts` (modified — added 5 new tests)
- `manage-smeraldo-hotel/src/lib/db/schema.ts` (modified — added `CheckOutSchema`, `CheckOut` type)
- `manage-smeraldo-hotel/src/lib/db/schema.test.ts` (modified — added 5 new tests)
- `manage-smeraldo-hotel/src/routes/(reception)/rooms/+page.server.ts` (modified — extended `load` with `occupiedBookings`/`checkOutForm`, added `?/checkOut` action)
- `manage-smeraldo-hotel/src/routes/(reception)/rooms/+page.svelte` (modified — added `CheckOutDialog`, extended `handleRoomClick` routing)
- `manage-smeraldo-hotel/src/lib/components/bookings/CheckOutDialog.svelte` (new — two-step check-out dialog)
