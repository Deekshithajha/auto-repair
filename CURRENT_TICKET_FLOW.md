# Current Ticket Flow - Complete End-to-End

## 🎯 Overview

This document describes the **actual implemented flow** of tickets through the system, from creation to completion.

---

## 📊 Status Flow Diagram

```
┌─────────────────────────┐
│ pending-admin-review    │ ← Initial status when ticket created
└───────────┬─────────────┘
            │
            │ Admin assigns mechanic
            ↓
┌─────────────────────────┐
│ assigned                │ ← Ticket assigned to mechanic
└───────────┬─────────────┘
            │
            │ Mechanic accepts ticket
            │ (via "Accept" button)
            ↓
┌─────────────────────────┐
│ in-progress             │ ← Mechanic working on ticket
└───────────┬─────────────┘
            │
            ├─────────────────────┬─────────────────────┐
            │                     │                     │
            │ Work completed      │ Return visit needed │ Continue work
            ↓                     ↓                     ↓
┌─────────────────────────┐ ┌─────────────────────────┐ (loop back)
│ work-completed          │ │ return-visit-required   │
└───────────┬─────────────┘ └───────────┬─────────────┘
            │                            │
            │ Invoice generated          │ Admin sets reschedule date
            ↓                            ↓
┌─────────────────────────┐ ┌─────────────────────────┐
│ invoice-generated       │ │ rescheduled-awaiting-   │
└───────────┬─────────────┘ │ vehicle                 │
            │                └───────────┬─────────────┘
            │                            │
            │ Payment received           │ Vehicle returns
            ↓                            ↓
┌─────────────────────────┐         (back to in-progress)
│ closed-paid             │
└─────────────────────────┘
```

---

## 🔄 Complete Ticket Lifecycle

### PHASE 1: Ticket Creation

#### Option A: Customer Creates Ticket
**Route:** `/customer/tickets/new`

**Steps:**
1. **Customer Info** → Name, email, phone, address, notification preference
2. **Vehicle Selection** → Select existing or add new (with photos)
3. **Service Selection** → Choose services, add symptoms/photos per service
4. **Review & Submit** → Review all info, set pickup time, car status

**On Submit:**
- ✅ Calls `ticketService.createTicketFromCustomerFlow()`
- ✅ Creates real Ticket object
- ✅ Status: `'pending-admin-review'`
- ✅ Source: `'customer'`
- ✅ Saves to localStorage
- ✅ Navigates to success page with ticket ID

**Result:** Ticket appears in Admin Ticket Inbox

---

#### Option B: Employee Creates Ticket
**Route:** `/employee/tickets/new`

**Steps:**
1. **Customer Lookup** → Search by name/email/phone/license plate OR create new customer
2. **Vehicle Selection** → Select existing or add new (with categorized photos)
3. **Issue Description** → Symptoms, notes, issue photos
4. **Service Selection** → Optional service pre-selection
5. **Review & Submit** → Review all info

**On Submit:**
- ✅ Calls `ticketService.createTicketFromEmployeeFlow()`
- ✅ Creates real Ticket object
- ✅ Status: `'pending-admin-review'`
- ✅ Source: `'employee'`
- ✅ Saves to localStorage
- ✅ Navigates back to employee dashboard

**Result:** Ticket appears in Admin Ticket Inbox

---

### PHASE 2: Admin Review & Assignment

**Route:** `/admin/tickets/inbox`

**Admin Actions:**
1. **View Tickets** → See all tickets with status `'pending-admin-review'`
2. **Filter** → Filter by status (all, pending-admin-review, assigned, in-progress, etc.)
3. **Assign Mechanic** → Click "Assign to Mechanic" button
   - Selects mechanic from dropdown
   - Calls `ticketService.assignMechanic(ticketId, mechanicId)`
   - **Status changes:** `'pending-admin-review'` → `'assigned'`
   - Ticket now visible to assigned mechanic

**Result:** Ticket status becomes `'assigned'`, appears on mechanic's dashboard

---

### PHASE 3: Mechanic Accepts & Starts Work

**Route:** `/employee` (Dashboard) or `/employee/work-orders/:id` (Detail)

**Mechanic Actions:**

#### Step 1: Accept Ticket
- Mechanic sees ticket with status `'assigned'` on dashboard
- Clicks **"Accept & Start"** button
- Calls `ticketService.updateTicketStatus(ticketId, 'in-progress')`
- **Status changes:** `'assigned'` → `'in-progress'`
- Timestamp saved to localStorage

#### Step 2: Pre-Service Intake (MANDATORY)
**Route:** `/employee/work-orders/:id`

**When:** Ticket status is `'assigned'` or `'in-progress'` AND intake not completed

**Form Fields (Required):**
- ✅ Current Mileage
- ✅ VIN (17 characters)
- ✅ Engine Type
- ✅ Transmission Type (automatic/manual/cvt/other)
- ✅ Drivetrain (fwd/rwd/awd/4x4/other)
- ✅ Fuel Type (gasoline/diesel/hybrid/ev/other)
- ✅ Check Engine Light (on/off)

**Form Fields (Optional):**
- Tire Condition Notes
- Brake Condition Notes
- Fluid Check Notes
- Battery Health Notes
- Exterior Damage Notes

**On Submit:**
- Calls `ticketService.setMechanicIntake(ticketId, intake)`
- Intake data saved to ticket
- If status was `'assigned'`, automatically changes to `'in-progress'`
- Intake form disappears, intake summary appears

**Result:** Pre-service intake completed, ticket ready for work

---

### PHASE 4: Work in Progress

**Route:** `/employee/work-orders/:id`

**Mechanic Can:**

#### Add Additional Findings
- Click **"+ Add Finding"** button
- Fill form:
  - Title (required)
  - Description (required)
  - Severity (low/medium/high)
  - Requires Customer Approval (checkbox)
  - Photos (optional, up to 5)
- Calls `ticketService.addAdditionalFinding(ticketId, finding)`
- Finding saved with status `'proposed'`
- Visible to admin and customer

#### Request Return Visit
- Click **"Request Return Visit"** button (when status is `'in-progress'`)
- Fill form:
  - Reason (required)
  - Additional Notes (optional)
  - Supporting Photos (optional)
- Calls `ticketService.setRescheduleInfo(ticketId, rescheduleInfo)`
- **Status changes:** `'in-progress'` → `'return-visit-required'`
- Ticket appears in Admin Inbox with reschedule request

#### Mark Work as Completed
- Click **"Mark Work as Completed"** button
- Calls `ticketService.updateTicketStatus(ticketId, 'work-completed')`
- **Status changes:** `'in-progress'` → `'work-completed'`

---

### PHASE 5: Admin Handles Reschedule (if needed)

**Route:** `/admin/tickets/inbox`

**When:** Ticket status is `'return-visit-required'`

**Admin Actions:**
1. **View Reschedule Request** → See mechanic's reason, notes, photos
2. **Set Return Date** → Click "Set Return Date" button
   - Select date
   - Select time window (Morning/Afternoon or custom time)
   - Add instructions for customer (optional)
3. **Submit** → Calls `ticketService.setRescheduleInfo(ticketId, updatedInfo)`
   - **Status changes:** `'return-visit-required'` → `'rescheduled-awaiting-vehicle'`
   - Customer should be notified (not implemented yet)

**Result:** Customer knows when to bring vehicle back

**When Vehicle Returns:**
- Admin or mechanic updates status back to `'in-progress'`
- Work continues

---

### PHASE 6: Completion & Payment

**Status Progression:**
1. `'work-completed'` → Work finished by mechanic
2. `'invoice-generated'` → Invoice created (not yet implemented)
3. `'closed-paid'` → Payment received (not yet implemented)

---

## 📋 Detailed Status Definitions

### `pending-admin-review`
- **When:** Ticket just created (customer or employee)
- **Who sees it:** Admin only
- **Next action:** Admin assigns to mechanic

### `assigned`
- **When:** Admin assigned ticket to mechanic
- **Who sees it:** Assigned mechanic
- **Next action:** Mechanic accepts ticket
- **Note:** Pre-service intake form appears

### `in-progress`
- **When:** Mechanic accepted ticket (and completed intake if required)
- **Who sees it:** Assigned mechanic
- **Next actions:**
  - Add findings
  - Request return visit
  - Mark work completed

### `return-visit-required`
- **When:** Mechanic requested return visit
- **Who sees it:** Admin
- **Next action:** Admin sets reschedule date

### `rescheduled-awaiting-vehicle`
- **When:** Admin set reschedule date
- **Who sees it:** Admin, mechanic, customer
- **Next action:** Customer brings vehicle back, status changes to `'in-progress'`

### `work-completed`
- **When:** Mechanic marked work as done
- **Who sees it:** Admin, customer
- **Next action:** Generate invoice (not yet implemented)

### `invoice-generated`
- **When:** Invoice created
- **Next action:** Customer pays

### `closed-paid`
- **When:** Payment received
- **Final status:** Ticket closed

---

## 🔄 Key Workflows

### Workflow 1: Standard Ticket (No Reschedule)
```
Customer/Employee creates ticket
  → pending-admin-review
  → Admin assigns mechanic
  → assigned
  → Mechanic accepts
  → in-progress (intake completed)
  → Mechanic completes work
  → work-completed
  → invoice-generated (future)
  → closed-paid (future)
```

### Workflow 2: Ticket with Return Visit
```
Customer/Employee creates ticket
  → pending-admin-review
  → Admin assigns mechanic
  → assigned
  → Mechanic accepts
  → in-progress (intake completed)
  → Mechanic discovers need for return visit
  → return-visit-required
  → Admin sets reschedule date
  → rescheduled-awaiting-vehicle
  → Customer brings vehicle back
  → in-progress (work continues)
  → work-completed
  → invoice-generated (future)
  → closed-paid (future)
```

---

## 🎯 User Actions by Role

### Customer
- ✅ Create ticket (`/customer/tickets/new`)
- ✅ View tickets (`/customer/tickets`)
- ✅ View ticket details (`/customer/tickets/:id`)
- ⏳ Approve additional findings (not yet implemented)
- ⏳ View invoices (UI exists, not wired)

### Employee (Front Desk)
- ✅ Create ticket for walk-ins (`/employee/tickets/new`)
- ✅ Search/create customers
- ✅ Register vehicles
- ✅ Document issues

### Mechanic
- ✅ View assigned tickets (`/employee`)
- ✅ Accept tickets
- ✅ Complete pre-service intake
- ✅ Add additional findings
- ✅ Request return visits
- ✅ Mark work as completed
- ✅ View work order details

### Admin
- ✅ View all tickets (`/admin/tickets/inbox`)
- ✅ Filter tickets by status
- ✅ Assign tickets to mechanics
- ✅ Set reschedule dates
- ✅ View ticket details
- ⏳ Generate invoices (not yet implemented)

---

## 💾 Data Persistence

### Current Implementation
- **Storage:** localStorage (key: `automotive_tickets`)
- **Format:** JSON array of Ticket objects
- **Persistence:** All ticket operations auto-save
- **Loading:** Tickets loaded on app start and service initialization

### Data Flow
```
User Action
  → Component calls ticketService method
  → Service updates in-memory array
  → Service saves to localStorage
  → Component receives updated ticket
  → UI updates
```

### Auto-Refresh
- **Admin Inbox:** Refreshes every 5 seconds
- **Employee Dashboard:** Refreshes every 5 seconds
- **Work Order Detail:** Loads on mount, manual refresh on actions

---

## 🔌 Service Layer Architecture

### TicketService Interface
All ticket operations go through `ticketService`:

```typescript
ticketService.createTicketFromCustomerFlow(payload)
ticketService.createTicketFromEmployeeFlow(payload)
ticketService.getTickets(filter?)
ticketService.getTicketById(id)
ticketService.assignMechanic(ticketId, mechanicId)
ticketService.updateTicketStatus(ticketId, status)
ticketService.setRescheduleInfo(ticketId, info)
ticketService.setMechanicIntake(ticketId, intake)
ticketService.addAdditionalFinding(ticketId, finding)
```

### Current Implementation
- **Type:** In-memory with localStorage
- **File:** `src/services/ticketService.ts`
- **Future:** Can swap to API-backed implementation

---

## 📸 Photo Handling

### Photo Storage
- **Format:** Base64 data URLs
- **Location:** Stored in `ticket.photos[]` array
- **Categories:** 8 categories (damage, dashboard-warning, vin-sticker, engine-bay, tires, interior, exterior, other)
- **Compression:** 1200x1200px max, 80% JPEG quality

### Photo Attachments
- **Customer Flow:** Photos attached to services
- **Employee Flow:** Photos attached to ticket (issue photos) and vehicle (vehicle photos)
- **Intake:** No photos in intake form (but can be added to findings)
- **Findings:** Up to 5 photos per finding
- **Reschedule:** Supporting photos for return visit request

---

## ✅ What's Working

1. ✅ **Ticket Creation** - Both customer and employee flows create real tickets
2. ✅ **Admin Assignment** - Admin can assign tickets to mechanics
3. ✅ **Mechanic Acceptance** - Mechanics can accept tickets
4. ✅ **Pre-Service Intake** - Mandatory intake form with all required fields
5. ✅ **Additional Findings** - Mechanics can add findings to tickets
6. ✅ **Reschedule Flow** - Complete reschedule workflow
7. ✅ **Status Updates** - All status changes persist
8. ✅ **Data Persistence** - Tickets saved to localStorage
9. ✅ **Auto-Refresh** - Dashboards refresh automatically

---

## ⏳ Not Yet Implemented

1. ⏳ **Customer Notifications** - No notification system (even simulated)
2. ⏳ **Invoice Generation** - Invoice creation not wired
3. ⏳ **Payment Processing** - Payment flow not implemented
4. ⏳ **Customer Approval** - Finding approval workflow not complete
5. ⏳ **Backend API** - Still using localStorage (but ready for API swap)

---

## 🎯 Summary

**The flow is now fully functional end-to-end:**

1. ✅ Tickets are created (customer or employee)
2. ✅ Admin assigns to mechanic
3. ✅ Mechanic accepts and completes intake
4. ✅ Mechanic works and can add findings
5. ✅ Mechanic can request return visits
6. ✅ Admin can set reschedule dates
7. ✅ All status changes persist
8. ✅ All data is saved and retrievable

**The system is a complete, working frontend ticket management system** with real data persistence and a proper service layer ready for backend integration.

