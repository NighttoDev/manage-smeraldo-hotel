# Smeraldo Hotel Management App - Brainstorming Input

## Overview

This document analyzes the current Excel-based hotel management system at Smeraldo Hotel to identify functional requirements for building a modern hotel management application.

---

## Current System Analysis

The hotel currently operates using **4 Excel files** for daily operations:

| File | Purpose | Data Span |
|------|---------|-----------|
| Bảng chấm công 2024.xlsx | Employee Attendance Tracking | May 2024 → Jan 2026 |
| Quản lý số lượng nước uống.xlsx | Beverage Inventory Management | 31 inventory snapshots |
| SƠ ĐỒ PHÒNG.xlsx | Room Occupancy Calendar | Sep 2022 → Apr 2026 |
| Xuất hóa đơn - hóa đơn đầu vào 2024.xlsx | Invoice Management (In/Out) | Jan 2024 → Jan 2026 |

---

## Module 1: Employee Attendance Management

### Current State
- **Structure**: Monthly sheets with employee rows × daily columns (1-31)
- **Employees**: Kiều, Cô Hoàng, Thuần, Bình, Quý, Tú
- **Values Used**: `x`, `1`, `0.5`, `1.5` representing full day, half day, overtime

### Required Functions

| Function | Description | Priority |
|----------|-------------|----------|
| `viewMonthlyAttendance(month, year)` | Display attendance grid for selected period | High |
| `recordAttendance(employeeId, date, value)` | Mark attendance (0=absent, 0.5=half, 1=full, 1.5=overtime) | High |
| `calculateMonthlyTotal(employeeId, month)` | Sum total work days for payroll calculation | High |
| `manageEmployees()` | Add, edit, remove employees from roster | Medium |
| `generatePayrollReport(month)` | Export attendance summary for salary processing | Medium |
| `viewAttendanceHistory(employeeId)` | Historical attendance for individual employee | Low |

### Data Model
```
Employee {
  id, name, position, startDate, status
}

AttendanceRecord {
  employeeId, date, value (0, 0.5, 1, 1.5), notes
}
```

---

## Module 2: Beverage Inventory Management

### Current State
- **Structure**: Dated snapshot sheets tracking stock levels
- **Items Tracked**: Aqua water, Coca, Pepsi, 7up, Sting, Rockstar, Tiger beer
- **Columns**: Item Type, Current Stock, Stock In, Stock Out, Expiry/Notes

### Required Functions

| Function | Description | Priority |
|----------|-------------|----------|
| `viewCurrentStock()` | Display all beverages with current quantities | High |
| `recordStockIn(itemId, quantity, date, expiryDate)` | Log incoming inventory | High |
| `recordStockOut(itemId, quantity, date, reason)` | Log consumption with reason/room | High |
| `getStockHistory(itemId, dateRange)` | View transaction history for item | Medium |
| `alertLowStock(threshold)` | Notify when stock falls below minimum | Medium |
| `trackExpiryDates()` | Monitor and alert expiring products | Medium |
| `generateInventoryReport(date)` | Create dated inventory snapshot | Low |

### Data Model
```
BeverageItem {
  id, name, category, unit, minStockLevel
}

InventoryTransaction {
  id, itemId, type (IN/OUT), quantity, date, notes, expiryDate
}
```

---

## Module 3: Room Occupancy Management

### Current State
- **Structure**: Monthly sheets with room rows × daily columns
- **Rooms**: 201, 301-304, 401-404, 501-504, 601-604, 701-704, 801-802, 901
- **Room Types**: ONE BEDROOM APARTMENT, DELUXE TWIN, DELUXE DOUBLE, ONE BEDROOM APARTMENT 2 BEDS
- **Data**: Guest names filled in occupied date cells

### Required Functions

| Function | Description | Priority |
|----------|-------------|----------|
| `viewRoomCalendar(month, year)` | Visual booking grid (room × date) | High |
| `createBooking(roomId, guestName, checkIn, checkOut)` | Reserve room for date range | High |
| `checkAvailability(roomId, dateRange)` | Query if room is available | High |
| `updateBooking(bookingId, changes)` | Modify existing reservation | High |
| `cancelBooking(bookingId)` | Cancel reservation | High |
| `checkIn(bookingId)` | Mark guest as checked in | Medium |
| `checkOut(bookingId)` | Mark guest as checked out | Medium |
| `searchBookings(query)` | Find by guest name, room, date | Medium |
| `viewOccupancyRate(period)` | Calculate occupancy statistics | Low |
| `getRoomTypes()` | List room categories with pricing | Low |

### Data Model
```
Room {
  id, number, floor, type, capacity, amenities, pricePerNight
}

RoomType {
  id, name, description, basePrice
}

Booking {
  id, roomId, guestName, guestPhone, checkIn, checkOut, status, totalAmount, notes
}
```

---

## Module 4: Invoice Management

### Current State
- **Structure**: Monthly sheets with dual sections (Output/Input invoices)
- **Output Invoices**: Room revenue with 8% VAT
- **Input Invoices**: Expenses (electricity, water, wifi, supplies, maintenance)
- **Formula**: `=SUM(Amount + Tax)` for total calculation

### Required Functions

| Function | Description | Priority |
|----------|-------------|----------|
| `createOutputInvoice(date, description, amount, taxRate)` | Generate revenue invoice | High |
| `createInputInvoice(date, vendor, description, amount, taxRate)` | Record expense invoice | High |
| `calculateTax(amount, rate)` | Auto-compute VAT (default 8%) | High |
| `viewInvoices(type, period)` | List invoices filtered by type and date | High |
| `viewMonthlyRevenue(month, year)` | Sum all output invoices | Medium |
| `viewMonthlyExpenses(month, year)` | Sum all input invoices | Medium |
| `categorizeExpenses(category)` | Group by: electricity, water, wifi, supplies | Medium |
| `generateFinancialReport(period)` | Revenue vs expenses summary | Medium |
| `linkInvoiceToBooking(invoiceId, bookingId)` | Connect room invoice to reservation | Low |
| `exportInvoice(invoiceId, format)` | Export to PDF/Excel | Low |

### Expense Categories
- Electricity (tiền điện)
- Water (tiền nước)
- WiFi/Internet (viễn thông CMC)
- Garbage collection (tiền rác)
- Beverages/Supplies (Dasani, nước giặt)
- Maintenance (sửa chữa)
- Entertainment/Hospitality (tiếp khách)

### Data Model
```
Invoice {
  id, type (OUTPUT/INPUT), date, description, amount, taxRate, taxAmount, totalAmount, category, bookingId
}

ExpenseCategory {
  id, name, description
}
```

---

## Cross-Module Integration

### Dashboard Overview
| Widget | Data Source | Description |
|--------|-------------|-------------|
| Today's Occupancy | Room Module | Rooms occupied / total rooms |
| Low Stock Alerts | Inventory Module | Items below minimum threshold |
| Today's Check-ins/outs | Room Module | Arrivals and departures |
| Monthly Revenue | Invoice Module | Current month earnings |
| Staff on Duty | Attendance Module | Who's working today |

### Module Connections
- **Booking → Invoice**: Auto-generate invoice when guest checks out
- **Inventory → Invoice**: Link beverage consumption to room charges
- **Attendance → Payroll**: Calculate salary from monthly attendance

---

## Technical Considerations

### Data Migration
- Import existing Excel data preserving historical records
- Maintain Excel export capability for backup/compatibility

### User Roles
- **Admin**: Full access to all modules
- **Front Desk**: Room bookings, check-in/out, invoices
- **Housekeeping**: Room status updates
- **Inventory Staff**: Stock management

### Platform Options
- Web application (responsive for tablet use at front desk)
- Mobile app for quick access
- Offline capability for network issues

---

## Brainstorming Questions

1. What additional features would improve daily hotel operations?
2. How should the app handle room pricing (fixed vs dynamic)?
3. What reports would be most valuable for management?
4. Should the app integrate with external booking platforms (Booking.com, Agoda)?
5. What notification/alert system would be most useful?
6. How to handle multi-language support for international guests?
7. What payment methods should be supported?
8. Should there be a guest-facing component (self check-in, room service)?

---

## Summary

| Module | Core Functions | Entities |
|--------|----------------|----------|
| Attendance | Record, Calculate, Report | Employee, AttendanceRecord |
| Inventory | Stock In/Out, Alerts, Track | BeverageItem, InventoryTransaction |
| Room | Book, Check-in/out, Calendar | Room, RoomType, Booking |
| Invoice | Create, Calculate Tax, Report | Invoice, ExpenseCategory |
