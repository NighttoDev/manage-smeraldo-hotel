---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - "_bmad-output/business-requirements.md"
date: 2026-02-12
author: Khoa
---

# Product Brief: Smeraldo Hotel

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

Smeraldo Hotel is a 24-room boutique hotel operating across 9 floors in Vietnam. All hotel operations — room management, staff attendance, inventory, and invoicing — are currently managed manually through Excel spreadsheets. This creates daily friction: manual entry errors in room booking updates, 30–60 minutes of staff time lost each day to spreadsheet maintenance, and no single view of occupancy or operations.

The goal of this project is to build an **internal hotel management web application** that automates and digitizes these existing workflows — not to replace how the team operates, but to make those same operations faster, more accurate, and more intuitive. The system is designed exclusively for internal staff (reception, management, housekeeping) with no guest-facing features.

---

## Core Vision

### Problem Statement

Smeraldo Hotel's daily operations depend on multiple Excel spreadsheets that are slow to update, error-prone, and disconnected from each other. Reception staff spend up to an hour per day manually updating room status, inventory, and attendance records. Booking channels (Agoda, Booking.com, Trip.com, Facebook ads) are managed independently with no unified view, creating risk of double bookings and missed updates. There is no automated calculation for attendance, invoicing, or stock levels.

### Problem Impact

- **Time loss:** 30–60 minutes/day per staff member on manual spreadsheet updates
- **Error risk:** Manual entry across disconnected files leads to booking mistakes and attendance discrepancies
- **Operational blind spots:** No real-time visibility into room occupancy, inventory levels, or monthly financials
- **Scalability ceiling:** As booking volume grows across OTA channels and Facebook, Excel becomes increasingly unmanageable

### Why Existing Solutions Fall Short

No off-the-shelf hotel PMS has been evaluated — and intentionally so. Generic systems (Cloudbeds, Little Hotelier, etc.) impose new workflows that staff must learn from scratch, often in English, with features and complexity far beyond what a 24-room boutique hotel needs. The team has an established operational flow that works; what's needed is a system that **mirrors and automates that flow**, not one that replaces it.

### Proposed Solution

A Vietnamese-language internal hotel management web application built specifically around Smeraldo Hotel's existing operational patterns. The system will provide:

- A visual **room diagram calendar** showing real-time occupancy, guest names, check-in/check-out dates, and booking source
- **Automated attendance tracking** with daily punch-in, half-day support, and monthly summary export
- **Inventory management** for beverages and supplies with stock alerts and in/out logging
- **Invoice management** for both sales (room charges, VAT 8%) and purchase invoices
- **Financial and operational reports** replacing manual monthly Excel summaries
- Support for **long-stay apartment guests** alongside standard nightly bookings

### Key Differentiators

- **Workflow-preserving design:** Built to match how Smeraldo already operates — familiar flow, automated execution
- **Vietnamese-first:** Designed for Vietnamese-speaking staff with VND currency and 8% VAT built in
- **Boutique-scale precision:** Tailored for a 24-room property with apartment-style rooms and mixed booking channels including Facebook ads
- **Internal-only focus:** No guest-facing complexity — pure operational efficiency for staff and management
- **Unified operations hub:** Single system replacing 4+ separate Excel files across rooms, attendance, inventory, and invoices

---

## Target Users

### Primary Users

#### 🧑‍💼 Linh — Front Desk Reception Staff

**Context & Background:**
Linh is the sole receptionist on duty at Smeraldo Hotel, managing the front desk single-handedly during each shift. She is comfortable with smartphones and apps and picks up new digital tools quickly. Her day is fast-paced — guests arrive, OTA bookings come in, room statuses change — and she is the nerve center of all hotel operations.

**Current Problem Experience:**
Linh currently juggles 4+ Excel spreadsheets to do her job. When a check-in rush hits, she must manually update the room diagram Excel, cross-check the OTA booking, log attendance for the day, and answer guest inquiries — all at once. Manual data entry errors creep in during busy periods: a room marked as occupied when it's vacant, or a check-out date entered incorrectly. Updating inventory and invoices adds another 30–60 minutes to her daily workload after the rush subsides.

**Goals & Motivations:**
- Get through the check-in rush without making errors
- Know at a glance which rooms are available, occupied, or due for check-out today
- Spend less time on spreadsheet maintenance and more time on guest service
- Have one single place to check and update everything

**Success Vision:**
*"I open the app, see the room diagram, check guests in with two clicks, and the attendance marks itself. I don't need to touch Excel anymore."*

---

### Secondary Users

#### 👔 Khoa — Hotel Manager

**Context & Background:**
Khoa is the hotel owner and manager. He monitors operations but does not do hands-on data entry — that's Linh's domain. He needs high-level visibility into how the hotel is running, primarily checking in remotely or at the start/end of day.

**Goals & Motivations:**
- See today's occupancy at a glance (which rooms are filled, which are empty)
- Monitor staff attendance without asking anyone
- Spot financial trends in monthly revenue and expenses
- Trust that the data is accurate without having to verify Excel manually

**Success Vision:**
*"I open the dashboard, see occupancy and attendance for today in under 10 seconds, and move on with my day."*

---

#### 🧹 Housekeeping Staff

**Context & Background:**
Housekeeping staff currently receive room cleaning assignments verbally or via paper notes from reception. They have basic smartphone comfort but no system interaction today. The goal is to give them the ability to update room status themselves (e.g., mark a room as "Cleaned / Ready") so reception doesn't have to do it on their behalf.

**Goals & Motivations:**
- Know which rooms need cleaning and in what order
- Mark rooms as clean/ready without hunting down the receptionist
- Simple, minimal interface — just the task at hand

**Success Vision:**
*"I finish cleaning room 401, tap 'Ready' in the app, and reception immediately sees it's available. No phone calls, no paperwork."*

---

### User Journey

#### Linh's Daily Journey (Primary)

| Stage | Current (Excel) | With Smeraldo App |
|-------|----------------|-------------------|
| **Morning start** | Opens 3-4 Excel files, checks yesterday's status | Opens app dashboard — room diagram loads instantly |
| **Check-in rush** | Manually finds booking in spreadsheet, updates room status, notes guest name | Finds booking in calendar view, checks guest in, room auto-updates to "Occupied" |
| **During the day** | Updates inventory manually, logs any new OTA bookings | Inventory updates as items are used; OTA bookings appear automatically |
| **Attendance** | Opens attendance Excel, marks her shift | App auto-logs shift; half-day marked with one tap |
| **End of shift** | Updates room status, checks outstanding invoices | Confirms room statuses, flags any pending invoices — 5 minutes max |
| **"Aha!" moment** | — | First week: *"I didn't touch Excel once today."* |

#### Khoa's Daily Journey (Secondary)

| Stage | Current | With Smeraldo App |
|-------|---------|-------------------|
| **Morning check** | Asks Linh for verbal update or checks Excel | Opens dashboard: today's occupancy + attendance in one view |
| **Monthly review** | Manually compiles revenue/expense from multiple files | Pulls monthly financial report — already calculated |
| **"Aha!" moment** | — | *"I can see everything without calling anyone."* |

#### Housekeeping Journey (Secondary)

| Stage | Current | With Smeraldo App |
|-------|---------|-------------------|
| **Get assignment** | Verbal instruction or paper list | Checks assigned rooms in app |
| **After cleaning** | Tells reception verbally | Taps "Room Ready" — reception sees it instantly |
| **"Aha!" moment** | — | *"No more running to the front desk."* |

---

## Success Metrics

### User Success Metrics

| Metric | Current State | Target |
|--------|--------------|--------|
| Daily time spent on manual spreadsheet updates | 30–60 min/day | **< 10 min/day** |
| Room status update speed | Manual, slow (multiple Excel files) | **Real-time, single tap** |
| Booking assignment errors (wrong room/missing info) | Occurs regularly | **0 errors/month after go-live** |
| Staff adoption | 0% (Excel-based) | **100% of 5 staff by launch** |

**Key User Outcomes:**
- Linh completes check-in and room status update in under 2 minutes per guest
- Housekeeping staff mark rooms ready directly in the app — no verbal communication needed
- Khoa sees today's occupancy and attendance in under 10 seconds without asking anyone

---

### Business Objectives

| Objective | Description |
|-----------|-------------|
| **Eliminate Excel dependency** | All 5 staff fully off Excel by app launch |
| **Reduce OTA commission errors** | Zero missed or miscalculated OTA commissions (Agoda, Booking.com, Trip.com) |
| **Improve invoice accuracy** | 100% of room charges captured and invoiced — no unbilled stays |
| **Reduce revenue leakage** | Eliminate lost revenue from charges not logged in time |
| **Operational efficiency** | Reception time saved on admin tasks redirected to guest service |

---

### Key Performance Indicators

**Operational KPIs (tracked from day 1):**
- ⏱️ Average time to complete check-in flow: target **< 2 min**
- 📋 Daily spreadsheet time per staff: target **< 10 min/day**
- 🏨 Room status accuracy: target **100%** (no mismatches between actual and system state)
- 👥 System daily active users: target **5/5 staff** within first month

**Financial KPIs (tracked monthly):**
- 💰 Unbilled room charges: target **0 per month**
- 📄 Invoice discrepancy rate: target **< 1%** of total invoices
- 🔗 OTA commission errors logged: target **0 per month**

**Adoption KPI:**
- ✅ Full staff migration from Excel: **100% at app launch**
- ✅ Zero Excel files used for daily operations after go-live

---

## MVP Scope

### Core Features (MVP — Phase 1)

#### 🏨 1. Room Management *(High Priority)*
- Visual room diagram calendar with monthly view
- Real-time room status: Available / Occupied / Checking Out / Being Cleaned
- Guest name displayed per room on the diagram
- Check-in / check-out flow with date tracking
- Booking entry from OTA channels (Agoda, Booking.com, Trip.com, Facebook ads)
- Support for long-stay apartment guests alongside standard nightly bookings
- Automatic room rate calculation by nights stayed

#### 👔 2. Staff Attendance *(High Priority)*
- Daily attendance logging per staff member (full day `1`, half day `0.5`, absent `0`)
- Overtime support (`1 + 0.5`)
- Monthly attendance summary with total days worked
- 5-person roster: 2 night shift, 1 day shift, 1 housekeeping, 1 manager

#### 📦 3. Inventory Management *(High Priority)*
- Stock tracking per product (beverages: Aqua, Coca, Tiger, etc. + supplies)
- Stock-in logging (date + quantity)
- Stock-out logging (date + quantity + recipient)
- Low-stock alert notification
- Periodic in/out report

#### 📊 4. Core Reports *(High Priority)*
- Today's occupancy dashboard (Khoa's at-a-glance view)
- Monthly attendance report per staff
- Monthly inventory in/out summary

#### 👥 5. Guest Management — Lightweight *(Included in MVP, simplified)*
- Guest name and details auto-extracted from OTA booking when available
- Manual entry fallback when booking comes from Facebook or walk-in
- Guest name displayed in room diagram and booking record

#### 🔐 6. Role-Based Access
- **Manager:** Read-only dashboard, full reports, attendance overview
- **Reception (day/night shift):** Full room management, booking entry, attendance logging, inventory
- **Housekeeping:** View assigned rooms, update room status to "Cleaned / Ready"

---

### Out of Scope for MVP (Phase 2)

| Feature | Reason Deferred |
|---------|----------------|
| **Invoice Management** | Specific business rules not yet finalized; added later |
| **Full Guest Profiles** | Nationality tracking, history, preferences — not needed at launch |
| **Financial Reports** | Revenue/expense/profit — deferred until invoicing is ready |
| **OTA API Integration** | Automatic sync with Agoda/Booking.com APIs — manual entry covers MVP |
| **Guest-facing features** | Online check-in, booking portal — confirmed out of scope entirely |
| **Digital Signature / CMC** | Third-party service integrations deferred |

---

### MVP Success Criteria

The MVP is considered successful when:
- ✅ All 5 staff are using the system daily with zero reliance on Excel
- ✅ Reception completes check-in in under 2 minutes
- ✅ Daily spreadsheet admin time drops below 10 minutes
- ✅ Zero room booking errors in first month of live operation
- ✅ Khoa can view occupancy and attendance in under 10 seconds
- ✅ Housekeeping updates room status independently via app

---

### Future Vision

| Phase | Features |
|-------|----------|
| **Phase 2** | Invoice management (sales + purchase), VAT 8% auto-calc, Excel export, financial reports |
| **Phase 2** | Full guest profiles with nationality tracking and stay history |
| **Phase 3** | OTA API auto-sync (Agoda, Booking.com), automated commission tracking |
| **Phase 3** | Advanced analytics: RevPAR, occupancy rate trends, seasonal reporting |
| **Future** | Multi-property support if Smeraldo expands |
