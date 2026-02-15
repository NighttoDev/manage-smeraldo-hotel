---
stepsCompleted: [step-01-init, step-02-discovery, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-Smeraldo-Hotel-2026-02-12.md"
  - "_bmad-output/business-requirements.md"
workflowType: 'prd'
date: 2026-02-12
author: Khoa
classification:
  projectType: web_app
  domain: general
  subdomain: hospitality
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - Smeraldo Hotel

**Author:** Khoa
**Date:** 2026-02-12

---

## Success Criteria

### User Success

- Reception staff complete full check-in flow (find booking → assign room → confirm) in **< 2 minutes**
- Daily manual admin time reduced from 30–60 min to **< 10 minutes per staff member**
- Room status is always accurate — **zero mismatches** between physical state and system state
- Housekeeping marks rooms ready independently, with **zero phone calls to reception** needed for status updates
- All 5 staff use the system daily within **first month of launch** — no prompting required
- Khoa views daily occupancy + staff attendance summary in **< 10 seconds**

### Business Success

| Objective | Target | Timeline |
|-----------|--------|----------|
| Full Excel replacement | 0 Excel files used for daily ops | At launch |
| Zero unbilled room charges | 0 missed charges/month | Month 1 |
| Invoice discrepancy rate | < 1% of total invoices | Month 1 |
| OTA commission errors | 0 per month | Month 1 |
| Booking entry errors | 0 wrong room assignments/month | Month 1 |
| Staff adoption | 5/5 daily active users | Month 1 |

### Technical Success

- **Availability:** System accessible 99%+ of operational hours (hotel operates ~18 hrs/day)
- **Performance:** All pages load in < 2 seconds on standard hotel WiFi
- **Desktop-first:** Full functionality on desktop browsers (reception and manager work full shifts at desktop); mobile support for housekeeping staff on smartphones
- **Data integrity:** No data loss on concurrent updates (e.g., two staff updating room status simultaneously)
- **Offline awareness:** Graceful handling when internet drops — no silent data loss
- **Role security:** Housekeeping staff cannot access financial or invoice data; manager has full management authority (can view, edit, and override all data)

### Measurable Outcomes

- **6-month target:** Zero Excel files in active use across all 5 operational roles
- **6-month target:** Reception time saved on admin ≥ 20 min/day vs current state
- **6-month target:** Zero revenue lost from unbilled room charges or missed OTA commissions

---

## Product Scope

### MVP — Minimum Viable Product

1. **Room Management** — diagram calendar, real-time status, check-in/out, booking entry (OTA + manual)
2. **Staff Attendance** — daily logging (full shift=1, half shift=0.5, absent=0, overtime max 18h=1.5), monthly summary
3. **Inventory Management** — stock in/out, low-stock alerts, per-product tracking
4. **Core Reports** — today's occupancy dashboard, monthly attendance, inventory summary
5. **Guest Management (Lightweight)** — name auto-extract from OTA booking + manual fallback
6. **Role-Based Access** — Manager (full authority), Reception (full ops), Housekeeping (room status only)

### Growth Features (Post-MVP)

- **Invoice Management** — sales/purchase invoices, VAT 8% auto-calc, Excel export
- **Full Guest Profiles** — nationality, stay history, preferences
- **Financial Reports** — monthly revenue/expense, profit calculation, VAT report

### Vision (Future)

- OTA API auto-sync (Agoda, Booking.com) — eliminate manual booking entry entirely
- Advanced analytics — RevPAR, occupancy rate trends, seasonal patterns
- Multi-channel notification — staff alerts via app push or Zalo
- Potential multi-property support if Smeraldo expands

---

## User Journeys

### Journey 1: Linh — Morning Rush Check-In (Primary Success Path)

**Opening Scene:**
It's 8:45 AM. Linh arrives at the front desk and opens the Smeraldo app on the reception tablet. Two guests are already waiting — a Booking.com reservation and a Facebook direct booking from last night that the night shift logged. She doesn't open a single Excel file.

**Rising Action:**
She taps the **Room Diagram** — a visual calendar grid of all 23 sellable rooms. Floor 3 shows rooms 301 and 303 as "Available", 304 as "Occupied – checking out today." She finds the Booking.com guest's name already pre-filled from the booking entry. One tap on room 302, selects check-in dates, confirms. The room turns green → Occupied. Guest name appears on the diagram tile.

**Climax:**
The second guest — a Facebook booking entered manually by the night shift — needs room 403. She opens it, sees the guest name and dates already logged. Confirms check-in. Done in 90 seconds, both guests checked in, no spreadsheet touched.

**Resolution:**
By 9:30 AM, 4 guests have checked in. The room diagram shows live, accurate status. Khoa, watching from his phone in the office, sees the occupancy update in real time. Linh moves on to restocking the minibar — a task that used to wait until she had "spreadsheet time."

**Requirements Revealed:** Room diagram view, check-in flow, booking pre-population, real-time status update, mobile/tablet responsiveness.

---

### Journey 2: Linh — Booking Error Recovery (Primary Edge Case)

**Opening Scene:**
A guest arrives saying she booked room 501 for 3 nights via Agoda. But Linh sees 501 is already marked Occupied — the night shift forgot to log a check-out from two days ago.

**Rising Action:**
Linh opens room 501's booking detail. She sees the previous guest's check-out date was yesterday — but the room was never marked as checked out. She taps "Check Out" for the old booking, room flips to "Being Cleaned." She then reassigns the arriving guest to 501, sets check-in for today.

**Climax:**
She messages housekeeping through the app to prioritize room 501 cleaning. The housekeeping staff member sees the notification, cleans the room, taps "Ready." Room 501 status flips to "Available." Linh completes the guest's check-in.

**Resolution:**
What used to require a phone call chain and manual spreadsheet corrections is handled in the app in under 5 minutes, with a full audit trail.

**Requirements Revealed:** Check-out flow, room status override, housekeeping notification/task trigger, status audit trail.

---

### Journey 3: Khoa — End-of-Month Management Review (Manager Path)

**Opening Scene:**
It's the last day of the month. Khoa sits down with his phone to review February's performance before the staff meeting. In the past, this meant asking Linh to compile 3 spreadsheets the day before.

**Rising Action:**
He opens the Manager Dashboard. He sees February occupancy: 19/23 rooms filled on average. He taps into the Attendance Report — Linh: 22 days, night shift staff: 20 and 21 days, housekeeping: 19 days. No discrepancies, no guessing.

**Climax:**
He checks the inventory summary — 4 cans of Rockstar and 2 Larue beers remain. Low stock alert was already triggered yesterday; Linh already placed a restock order. The system flagged it automatically.

**Resolution:**
Khoa walks into the staff meeting with accurate numbers, zero prep time. The monthly review that used to take 2 hours of spreadsheet compilation takes 8 minutes on his phone.

**Requirements Revealed:** Manager dashboard (read-only), occupancy summary, monthly attendance report per staff, inventory low-stock alerts, report access by role.

---

### Journey 4: Housekeeping Staff — Room Turnover Flow (Secondary Path)

**Opening Scene:**
It's 11:30 AM checkout time. Three rooms on floor 5 need cleaning: 501, 502, 503. The housekeeping staff member opens the app on her phone and sees her assigned rooms listed with status "Checking Out – Needs Cleaning."

**Rising Action:**
She starts with 501. After 20 minutes of cleaning, she taps the room tile and selects "Cleaned – Ready." The status updates instantly. Reception sees 501 flip to green on the room diagram without any phone call.

**Climax:**
A new guest is waiting for 501 downstairs. Linh sees the "Ready" status, immediately proceeds with check-in. The guest doesn't wait.

**Resolution:**
The housekeeping staff completes all 3 rooms by 1:00 PM, each marked ready as she finishes. No miscommunications, no "is it ready yet?" calls.

**Requirements Revealed:** Housekeeping role view (assigned rooms only), room status update (Cleaned/Ready), real-time sync with reception view, restricted access (no financial data visible).

---

### Journey 5: Night Shift Reception — Logging a Late Arrival (Night Shift Edge Case)

**Opening Scene:**
It's 11:45 PM. A long-stay apartment guest arrives with a direct Facebook booking. The day shift logged their reservation this morning, but the guest's actual arrival is now.

**Rising Action:**
The night shift receptionist opens the app, navigates to the booking for room 704 (One Bedroom Apartment). The reservation shows: Guest "Minh Tuan", check-in today, check-out date in 30 days. She taps Check In, confirms the long-stay duration. The room updates to Occupied.

**Climax:**
She also logs the attendance for tonight's shift — herself and her partner are on split duty, so she logs `1` for herself and `0.5` for the second staff member who left at midnight.

**Resolution:**
By 12:30 AM everything is logged. When Khoa checks the dashboard the next morning, the room occupancy and attendance are already accurate — no morning reconciliation needed.

**Requirements Revealed:** Long-stay booking support (30+ day stays), attendance logging per shift (including night shift), multiple concurrent staff on same shift, attendance half-day entry.

---

### Journey Requirements Summary

| Capability Area | Driven By |
|-----------------|-----------|
| Room diagram with real-time status | Journey 1, 2, 4 |
| Check-in / check-out flow | Journey 1, 2, 5 |
| Booking entry (OTA pre-fill + manual) | Journey 1, 5 |
| Room status override + audit trail | Journey 2 |
| Housekeeping task view + status update | Journey 2, 4 |
| Manager dashboard (full authority) | Journey 3 |
| Monthly reports: occupancy, attendance | Journey 3 |
| Inventory low-stock alert | Journey 3 |
| Role-based access control | Journey 3, 4 |
| Long-stay booking support | Journey 5 |
| Attendance logging (full/half/overtime) | Journey 5 |
| Real-time cross-role sync | Journey 2, 4 |

---

## Web App Specific Requirements

### Project-Type Overview

Smeraldo Hotel Management is a **Progressive Web App (SPA architecture)** — installable on staff computers and smartphones. Reception and management work full shifts at a desktop browser; housekeeping staff use their phones. Delivered via URL, no App Store distribution required.

### Technical Architecture Considerations

**Application Model: SPA + PWA**
- Single Page Application — no full page reloads when navigating between modules
- Service Worker for offline caching and background sync
- Web App Manifest for installability (desktop shortcut + phone home screen icon)
- Vietnamese locale configured as default (`vi-VN`), VND currency formatting

**Real-Time Sync Strategy**
- Room status changes must reflect across all connected sessions within < 3 seconds
- WebSocket or Server-Sent Events for live room diagram updates
- Reception and housekeeping see the same room state simultaneously — no refresh required

### Browser Matrix

| Platform | Browser | Users | Priority |
|----------|---------|-------|----------|
| Desktop | Chrome | Reception (day/night), Manager | **Primary** |
| Desktop | Firefox, Edge | Reception (day/night), Manager | **Primary** |
| Android mobile | Chrome | Housekeeping | Secondary |
| iPhone/iPad | Safari | Housekeeping | Secondary |

### Responsive Design

- **Desktop-first** layout — reception and manager work full shifts at a desktop browser
- Room diagram: full grid optimized for desktop; scrollable on mobile for housekeeping
- Attendance table: full table on desktop; horizontal scroll on mobile
- Sidebar navigation on desktop; bottom navigation bar on mobile (housekeeping role)
- All interactive elements remain functional on mobile for housekeeping role

### PWA Capabilities

| Capability | Implementation |
|------------|---------------|
| **Installable** | Web App Manifest — desktop shortcut + phone home screen install |
| **Offline read** | Service Worker caches last-known room diagram, attendance, inventory |
| **Offline write** | Queue updates locally when offline, sync on reconnect |
| **Push notifications** | Low-stock alerts, room-ready notifications to reception desktop |
| **Background sync** | Attendance entries and room status updates sync when connection restored |
| **App icon + splash** | Branded Smeraldo Hotel icon and launch screen |

### SEO Strategy

Not applicable — internal application. `robots.txt` set to disallow all crawlers.

### Accessibility Level

Standard web defaults — WCAG 2.1 Level A minimum:
- Sufficient color contrast for room status indicators (green/red/yellow)
- Text labels alongside color coding (not color-only status)
- No specialized accessibility requirements beyond baseline

### Implementation Considerations

- **Authentication:** Session-based login per role — Manager (full authority), Reception (full ops), Housekeeping (room status only)
- **Manager role:** Full management authority — can view, edit, override all data
- **No app store deployment** — PWA distributed via URL, installed from browser
- **Vietnamese date/time formatting** — `DD/MM/YYYY`, 24-hour clock
- **VND currency formatting** — no decimals (e.g., `1.500.000 ₫`)
- **Landscape + portrait** — room diagram usable in both orientations

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP — deliver the minimum that fully replaces all Excel files for daily hotel operations. Success = staff never need to open a spreadsheet again.

**Guiding principle:** Feature-complete for core daily operations, not feature-rich. Every module in the MVP must work reliably before Phase 2 begins.

**Resource Requirements:** Small development team (1–2 developers); modular architecture allows parallel development of independent modules (rooms, attendance, inventory).

---

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- ✅ Journey 1: Morning rush check-in (Linh, day shift)
- ✅ Journey 2: Booking error recovery (Linh, error handling)
- ✅ Journey 3: End-of-month management review (Khoa)
- ✅ Journey 4: Room turnover flow (Housekeeping)
- ✅ Journey 5: Late arrival + attendance logging (Night shift)

**Must-Have Capabilities:**

| Module | Justification |
|--------|---------------|
| Room Management + Diagram | Core of all 5 journeys — product fails without this |
| Check-in / Check-out flow | Daily operation — cannot be manual |
| Attendance logging | Daily use — 5 staff, all shifts |
| Inventory management | Daily restocking + manager oversight |
| Core dashboard (occupancy + attendance) | Manager's primary need |
| Lightweight guest management | Required for check-in flow |
| Role-based access (3 roles) | Security baseline — non-negotiable |
| PWA installability + offline caching | Staff need reliability even during WiFi drops |

---

### Post-MVP Features

**Phase 2 (Growth — after 1–3 months stable operation):**
- Invoice Management (sales + purchase, VAT 8%, Excel export)
- Full Guest Profiles (nationality, stay history)
- Financial Reports (monthly revenue, expenses, profit, VAT summary)
- Enhanced low-stock management (reorder history, supplier notes)

**Phase 3 (Expansion — 6+ months):**
- OTA API auto-sync (Agoda, Booking.com) — eliminate manual booking entry
- Advanced analytics (RevPAR, occupancy trends, seasonal patterns)
- Staff notifications via Zalo or push alerts
- Multi-property support (if Smeraldo expands)

---

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Real-time sync complexity (WebSocket) | Medium | Use well-established libraries (Socket.io or SSE); test early |
| PWA offline conflict resolution | Medium | Simple last-write-wins for room status; queue attendance locally |
| Room diagram performance | Low | 23 rooms is small — no pagination needed |
| Data migration from Excel | Medium | Seed script to import initial room list and staff roster once |

**Market Risks:**

| Risk | Mitigation |
|------|------------|
| Staff resistance to new system | Workflow mirrors existing Excel patterns — low change friction |
| Night shift adoption lag | Same UI as day shift; brief onboarding session needed |
| Manager override confusion | Clear role labels and permissions in onboarding |

**Resource Risks:**

| Risk | Mitigation |
|------|------------|
| Small dev team | Modular architecture — rooms, attendance, inventory developed independently |
| Scope creep | Phase gates: Phase 2 only starts after all Phase 1 KPIs are met for 30 days |
| No timeline pressure | Build until right — quality over speed |

---

## Functional Requirements

### Authentication & User Management

- **FR1:** Staff can log in to the system using personal credentials
- **FR2:** System enforces role-based access — Manager (full authority), Reception (full ops), Housekeeping (room status only)
- **FR3:** Manager can create, edit, and deactivate staff accounts
- **FR4:** Staff sessions persist across browser tabs and page refreshes
- **FR5:** Staff can log out from the system

### Room Management

- **FR6:** Reception can view a visual room diagram of all 23 sellable rooms with current status
- **FR7:** Each room displays one of the following statuses: Available, Occupied, Checking Out Today, Being Cleaned, Ready
- **FR8:** Reception can view the guest name assigned to each occupied room on the diagram
- **FR9:** Reception can filter the room diagram by floor (floors 3–9)
- **FR10:** Reception can view the room diagram in a monthly calendar view showing occupancy by date
- **FR11:** Reception can manually override a room's status
- **FR12:** System maintains an audit trail of all room status changes with timestamp and actor
- **FR13:** Housekeeping can view rooms assigned to them that require cleaning
- **FR14:** Housekeeping can update a room's status to "Cleaned / Ready"
- **FR15:** All connected users see room status changes in real-time without refreshing
- **FR16:** Manager can view and override any room status

### Booking Management

- **FR17:** Reception can create a booking with guest name, room, check-in date, check-out date, and booking source (Agoda, Booking.com, Trip.com, Facebook, Walk-in)
- **FR18:** Reception can check in a guest, transitioning the room to Occupied
- **FR19:** Reception can check out a guest, transitioning the room to Checking Out / Being Cleaned
- **FR20:** System automatically calculates number of nights stayed for each booking
- **FR21:** Reception can edit an existing booking's details
- **FR22:** Reception can cancel a booking
- **FR23:** System supports long-stay bookings (30+ days) for apartment-type rooms
- **FR24:** Manager can view, edit, and cancel any booking

### Guest Management

- **FR25:** Reception can create a guest record with name and associated booking details
- **FR26:** System pre-populates guest details from OTA booking data when available
- **FR27:** Reception can manually enter guest details for Facebook or walk-in bookings
- **FR28:** Guest name is displayed on the room diagram tile for each occupied room

### Staff Attendance

- **FR29:** Reception can log daily attendance for any staff member using the following values: full shift = `1`, half shift = `0.5`, absent = `0`, overtime (max 18 hours) = `1.5`
- **FR30:** System automatically calculates total days worked per staff member per month
- **FR31:** Manager can view and edit attendance records for any staff member
- **FR32:** System generates a monthly attendance summary report per staff member
- **FR33:** Reception can log attendance for multiple staff members in a single session

### Inventory Management

- **FR34:** Reception can view current stock level for each product (beverages and supplies)
- **FR35:** Reception can log a stock-in event with product, quantity, and date
- **FR36:** Reception can log a stock-out event with product, quantity, date, and recipient name
- **FR37:** System automatically recalculates stock levels after each in/out event
- **FR38:** System triggers a low-stock alert when a product falls below its defined threshold
- **FR39:** Manager can view inventory levels and full stock movement history
- **FR40:** Manager can set and update the low-stock threshold per product
- **FR41:** System generates a periodic inventory in/out summary report

### Reporting & Dashboard

- **FR42:** Manager can view a dashboard showing today's room occupancy (occupied vs. total available)
- **FR43:** Manager can view today's staff attendance status at a glance on the dashboard
- **FR44:** Manager can view a monthly occupancy summary report
- **FR45:** Manager can view a monthly attendance report for all staff members
- **FR46:** Manager can view a monthly inventory usage summary report

### Notifications & Alerts

- **FR47:** System delivers a low-stock alert to reception when inventory falls below threshold
- **FR48:** System delivers a room-ready notification to reception when housekeeping marks a room as Cleaned/Ready
- **FR49:** Notifications are delivered via PWA push notifications on staff devices

### System & Offline Behavior

- **FR50:** Application is installable as a PWA on desktop (shortcut) and mobile (home screen icon)
- **FR51:** Application displays last-known room diagram, attendance, and inventory data when offline
- **FR52:** Application queues data changes made while offline and syncs automatically on reconnection
- **FR53:** System displays all dates in Vietnamese format (DD/MM/YYYY) and currency in VND with no decimal places
- **FR54:** System supports concurrent access by multiple users without data conflicts

---

## Non-Functional Requirements

### Performance

- **NFR-P1:** Initial page load completes in < 3 seconds on desktop broadband (first visit, uncached)
- **NFR-P2:** Subsequent page loads complete in < 1 second (Service Worker cache hit)
- **NFR-P3:** Room diagram for all 23 rooms renders in < 1 second
- **NFR-P4:** SPA module navigation completes in < 500ms
- **NFR-P5:** Real-time room status updates propagate to all connected sessions within < 3 seconds

### Security

- **NFR-S1:** All data transmitted over HTTPS — no plain HTTP connections permitted
- **NFR-S2:** Staff sessions expire after 8 hours of inactivity
- **NFR-S3:** Role-based access control enforced server-side — client-side role checks are display-only
- **NFR-S4:** All room status changes, check-ins, and check-outs are logged to an immutable audit trail with user identity and timestamp
- **NFR-S5:** Housekeeping staff cannot access financial data, attendance records for other staff, or inventory management

### Reliability

- **NFR-R1:** System maintains 99%+ availability during hotel operational hours (6:00 AM – midnight daily)
- **NFR-R2:** No data loss when offline — Service Worker queue preserves all entries until connection restored
- **NFR-R3:** Database backups run daily; recovery point objective (RPO) ≤ 24 hours
- **NFR-R4:** Concurrent updates from multiple users do not produce data conflicts — server-side conflict resolution applied to room status

### Accessibility

- **NFR-A1:** All room status indicators meet WCAG 2.1 Level A color contrast requirements
- **NFR-A2:** Room status communicated with both color and text label — never color-only

### Integration & Standards

- **NFR-I1:** Push notifications use the Web Push API standard — no proprietary push service dependencies
- **NFR-I2:** PWA Service Worker complies with the W3C Service Worker specification for offline caching and background sync
