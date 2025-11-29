# Complete User Flows - Customer, Employee & Admin

## 📋 Table of Contents
1. [Customer Flow](#customer-flow)
2. [Employee Flow](#employee-flow)
3. [Admin Flow](#admin-flow)
4. [Cross-Role Interactions](#cross-role-interactions)
5. [Status Transitions](#status-transitions)

---

## 👤 CUSTOMER FLOW

### **1. Customer Dashboard** (`/customer`)
**What Customer Sees:**
- Welcome message: "Hello, [First Name]"
- KPI chips: Open Tickets, Vehicles, Invoices Due
- Quick Actions: "Raise New Ticket", "Add New Vehicle"
- My Tickets section (latest 3-5 tickets)
- Bottom Navigation: Home | Tickets | Vehicles | Invoices | Profile

**Customer Actions:**
- View ticket summary cards
- Navigate to ticket details
- Access vehicles list
- View invoices

---

### **2. Create New Ticket** (`/customer/tickets/new`)

#### **Step 1: Confirm/Update Customer Info**
- Pre-filled fields: Name, Email, Phone, Address
- Editable notification preference (Text/Call/Email)
- **Action:** Click "Continue"

#### **Step 2: Vehicle Selection/Registration**
**Option A: Select Existing Vehicle**
- Shows list of customer's vehicles
- Each card shows: Plate, Make/Model/Year
- **Action:** Click "Select Vehicle"

**Option B: Add New Vehicle**
- Form fields: License Plate, Make, Model, Year, Color (optional)
- Optional: Upload exterior photos, VIN sticker photo
- Optional: Damage description and photos
- **Action:** Click "Continue to Services"

#### **Step 3: Select Services**
**Standard Services (Fixed Price):**
- Brake job (Front/Rear/Both)
- AC service
- Oil change (Synthetic/Blend)
- Brake flush, Coolant flush, Tire rotation
- Diagnostic, Engine wash

**Custom Services (Variable Pricing):**
- Engine replacement
- Transmission service
- Belt replacement
- Battery services
- Rear-end rebuild
- Customer return/defective part diagnostics

**Service Not Listed:**
- Text field to describe custom service
- Optional photo upload per service

**For Each Service:**
- Optional: "Describe the symptoms" textarea
- Optional: Photo upload (up to 5 photos per service)

**Action:** Click "Continue to Review"

#### **Step 4: Review & Submit**
**Shows Summary:**
- Customer info
- Selected vehicle
- Selected services (with photos if any)
- Preferred pickup time
- Car status (In Shop / Not In Shop)
- If "Not In Shop": Expected drop-off date

**Action:** Click "Submit Ticket"
- **Result:** Ticket created with status `pending-admin-review`
- Navigate to confirmation page with ticket number

---

### **3. View Ticket Details** (`/customer/tickets/:id`)

**Customer Sees:**
1. **Ticket & Status Summary**
   - Current status badge
   - Plain-English explanation (e.g., "We're working on your vehicle")
   - Created date
   - Primary issue

2. **Vehicle Information**
   - License plate
   - Make, Model, Year
   - Mileage at intake (if available)

3. **Upcoming Visit / Reschedule Card** (if applicable)
   - **Return Visit Requested:** Amber warning card
   - **Return Visit Scheduled:** Blue card with date, time, location
   - "Add to Calendar" button
   - "Need to change? Call us" link

4. **What We're Working On**
   - List of services with status
   - Additional findings (if any) with severity and approval status

5. **Activity Timeline**
   - Ticket created
   - Assigned to mechanic
   - Work started
   - Return visit requested/scheduled
   - Work completed

6. **Help / Contact**
   - Shop phone (clickable)
   - Shop email (clickable)

---

### **4. View All Tickets** (`/customer/tickets`)
- Filter chips: All | Open | In Progress | Completed
- Ticket cards showing:
  - Ticket ID
  - Vehicle info
  - Status badge
  - Short description
  - Updated time
- Click card to view details

---

### **5. Manage Vehicles** (`/customer/vehicles`)
- List of all customer vehicles
- Each card shows: Plate, Make/Model/Year, Nickname
- "Add Vehicle" floating button
- Click vehicle to view details and service history

---

### **6. View Invoices** (`/customer/invoices`)
- List of invoices
- Shows: Invoice #, Ticket #, Vehicle, Total, Status (Paid/Pending)
- Click to view invoice details
- Download PDF button (placeholder)

---

## 🔧 EMPLOYEE FLOW

### **1. Employee Dashboard** (`/employee`)
**What Employee Sees:**
- Greeting: "Hi, [Mechanic Name]"
- Date filter chips: Today | Tomorrow | Week
- KPI Cards:
  - **Assigned:** Count of tickets with status `assigned`
  - **In Progress:** Count of tickets with status `in-progress`
  - **Done Today:** Count of completed tickets today
- My Work Orders section (latest 5)
- "New Ticket" button (top right)
- Bottom Navigation: Home | Work Orders | Vehicles | Logs | Profile

**Employee Actions:**
- View assigned tickets
- Accept tickets
- Navigate to work order details
- Create new tickets for walk-ins

---

### **2. Create New Ticket** (`/employee/tickets/new`)

#### **Step 1: Customer Lookup**
- Search by: Name, Email, Phone, License Plate
- Shows filtered customer list
- **Option A:** Select existing customer → Go to Vehicle Selection
- **Option B:** Click "Create New Customer" → Fill form → Go to Vehicle Selection

#### **Step 2: Vehicle Selection**
- Shows customer's vehicles
- **Option A:** Select existing vehicle → Go to Issue Description
- **Option B:** Click "Add New Vehicle" → Fill form + upload photos → Go to Issue Description

#### **Step 3: Issue Description**
- Symptoms textarea (required)
- Additional notes (optional)
- Photo upload with categories:
  - Damage, Dashboard Warning, VIN Sticker, Engine Bay, Tires, Interior, Exterior, Other
- **Action:** Click "Continue to Services"

#### **Step 4: Service Selection** (Optional)
- Select services from list
- Pre-select services if known
- **Action:** Click "Review & Submit"

#### **Step 5: Review & Submit**
- Review all information
- **Action:** Click "Submit Ticket"
- **Result:** Ticket created with status `pending-admin-review`
- Navigate back to employee dashboard

---

### **3. View Work Order Details** (`/employee/work-orders/:id`)

**Employee Sees:**

1. **Vehicle Summary Card** (Navy)
   - License plate
   - Make/Model/Year
   - Status badge

2. **Assigned Team** (if multiple mechanics)
   - Shows all assigned mechanics
   - Names and emails

3. **Pre-Service Intake** (MANDATORY if not completed)
   - **When:** Ticket status is `assigned` or `in-progress` AND intake not completed
   - **Warning Banner:** Orange alert prompting to complete intake
   - **Form Fields:**
     - Current Mileage (required)
     - VIN (required, 17 characters)
     - Engine Type (required)
     - Transmission Type (dropdown)
     - Drivetrain (dropdown)
     - Fuel Type (dropdown)
     - Check Engine Light (checkbox)
     - Condition Notes (optional): Tires, Brakes, Fluids, Battery, Exterior Damage
   - **Action:** Click "Save Intake"
   - **Result:** Intake saved, ticket ready for work

4. **Customer's Symptoms**
   - Description from ticket
   - Mechanic's initial notes

5. **Additional Findings**
   - List of existing findings
   - **Action:** Click "+ Add Finding"
   - **Form:**
     - Title (required)
     - Description (required)
     - Severity (Low/Medium/High)
     - Requires Customer Approval (checkbox)
     - Photos (optional, up to 5)
   - **Action:** Click "Add Finding"
   - **Result:** Finding added with status `proposed`

6. **Assigned Services**
   - List of services with checkboxes
   - Status indicators

7. **Photos**
   - Grid of all ticket photos

8. **Reschedule Info** (if applicable)
   - Shows return visit request details

**Footer Actions:**
- **If status = `assigned`:** "Mark as In Progress" (disabled until intake completed)
- **If status = `in-progress`:**
  - "Mark as Completed"
  - "Request Return Visit" button
- **If status = `work-completed`:** "Create Follow-up Quote" (placeholder)

---

### **4. Accept Ticket**
**Location:** Employee Dashboard or Work Orders list
- Click "Accept & Start" button
- **Result:** Status changes from `assigned` → `in-progress`
- Timestamp saved

---

### **5. Request Return Visit**
**Location:** Work Order Detail page
- Click "Request Return Visit" button
- **Form:**
  - Reason (required)
  - Additional Notes (optional)
  - Supporting Photos (optional)
- **Action:** Click "Submit Request"
- **Result:** Status changes to `return-visit-required`
- Ticket appears in Admin Inbox

---

### **6. Mark Work Completed**
**Location:** Work Order Detail page
- Click "Mark Work as Completed"
- **Result:** Status changes to `work-completed`
- Ticket visible to admin and customer

---

### **7. View All Work Orders** (`/employee/work-orders`)
- Filter by status
- List of all assigned tickets
- Click to view details

---

## 👔 ADMIN FLOW

### **1. Admin Dashboard** (`/admin`)
**What Admin Sees:**
- KPI Grid:
  - Open Tickets
  - Cars In Shop
  - Completed Today
  - Revenue This Month
- Ticket Inbox section (latest 5 tickets)
- Live Shop View (Kanban):
  - Open | In Progress | Waiting Pickup | Closed
- Sidebar Navigation (desktop) / Bottom Nav (mobile)

---

### **2. Ticket Inbox** (`/admin/tickets/inbox`)

**What Admin Sees:**
- Filter chips: All | Pending Admin Review | Assigned | In Progress | Return Visit Required | Rescheduled Awaiting Vehicle | Work Completed
- Ticket count
- List of all tickets

**Each Ticket Card Shows:**
- Ticket ID
- Status badge
- Customer info (Name, Email, Phone)
- Vehicle info (Make/Model/Year, Plate)
- Issue description
- Requested services
- **Assigned Mechanics** (with count, e.g., "2 mechanics")
- Reschedule info (if applicable)

**Actions Available:**
- **"Assign Mechanic"** or **"Manage (X)"** button (always visible)
- **"Set Return Date"** button (if return-visit-required without scheduled date)
- **"View Details"** button

---

### **3. Assign Mechanics** (Modal)

**Admin Actions:**
1. Click "Assign Mechanic" or "Manage" on any ticket
2. Modal opens showing:
   - Ticket ID
   - Currently assigned mechanics (if any)
   - List of all mechanics with checkboxes
3. **Select Multiple Mechanics:**
   - Check/uncheck mechanics
   - See count of selected mechanics
4. Click "Assign (X)" button
5. **Result:**
   - Selected mechanics added to ticket
   - Status changes to `assigned` (if was `pending-admin-review`)
   - Ticket visible to assigned mechanics

---

### **4. View Ticket Details** (`/admin/tickets/:id`)

**Admin Sees:**

1. **Vehicle Summary Card** (Navy)
   - License plate, Make/Model/Year
   - Status badge

2. **Assigned Mechanics Card** (Prominent)
   - Shows all assigned mechanics with names, emails, phones
   - "Manage" button to reassign
   - Individual "Remove" buttons for each mechanic

3. **Customer Information**
   - Full customer details

4. **Description**
   - Symptoms and notes

5. **Pre-Service Intake** (if completed)
   - All intake details displayed

6. **Additional Findings**
   - All findings with status

7. **Services**
   - List with status

8. **Photos**
   - All ticket photos

9. **Reschedule Info** (if applicable)

10. **Timeline**
    - Complete activity history

**Actions:**
- Assign/Reassign mechanics
- Set reschedule dates (if return visit requested)

---

### **5. Set Reschedule Date** (Modal)

**When:** Ticket status is `return-visit-required` and no scheduled date

**Admin Actions:**
1. Click "Set Return Date" on ticket card or detail page
2. Modal opens showing:
   - Mechanic's reason for return visit
   - Supporting photos (if any)
3. **Set Schedule:**
   - Select date
   - Select time (Morning/Afternoon or custom)
   - Add instructions for customer (optional)
4. Click "Schedule Return Visit"
5. **Result:**
   - Status changes to `rescheduled-awaiting-vehicle`
   - Customer can see scheduled date in their ticket detail

---

### **6. Manage Customers** (`/admin/customers`)
- Search customers
- View customer list with stats
- Click customer to view:
  - Profile info
  - Vehicles
  - Tickets
  - Invoices

---

### **7. Manage Employees** (`/admin/employees`)
- View all employees
- Add new employee
- View employee details

---

## 🔄 CROSS-ROLE INTERACTIONS

### **Ticket Creation Flow**
```
Customer creates ticket
  ↓
Status: pending-admin-review
  ↓
Admin sees in Ticket Inbox
  ↓
Admin assigns to mechanic(s)
  ↓
Status: assigned
  ↓
Mechanic sees on dashboard
```

### **Work Flow**
```
Mechanic accepts ticket
  ↓
Status: in-progress
  ↓
Mechanic completes intake (mandatory)
  ↓
Mechanic works on vehicle
  ↓
Mechanic can add findings
  ↓
Mechanic marks completed
  ↓
Status: work-completed
```

### **Reschedule Flow**
```
Mechanic requests return visit
  ↓
Status: return-visit-required
  ↓
Admin sees in inbox
  ↓
Admin sets reschedule date
  ↓
Status: rescheduled-awaiting-vehicle
  ↓
Customer sees scheduled date
  ↓
Customer brings vehicle back
  ↓
Status: in-progress (work continues)
```

---

## 📊 STATUS TRANSITIONS

### **Complete Status Flow**
```
1. pending-admin-review
   ↓ (Admin assigns mechanic)
2. assigned
   ↓ (Mechanic accepts)
3. in-progress
   ↓
   ├─→ work-completed
   │     ↓
   │   invoice-generated
   │     ↓
   │   closed-paid
   │
   └─→ return-visit-required
         ↓ (Admin sets date)
       rescheduled-awaiting-vehicle
         ↓ (Vehicle returns)
       in-progress (loop back)
```

### **Status Definitions**

| Status | Who Sees It | Next Action |
|--------|-------------|-------------|
| `pending-admin-review` | Admin only | Admin assigns mechanic |
| `assigned` | Assigned mechanic(s) | Mechanic accepts |
| `in-progress` | Assigned mechanic(s), Admin, Customer | Mechanic works or requests return visit |
| `return-visit-required` | Admin, Mechanic, Customer | Admin sets reschedule date |
| `rescheduled-awaiting-vehicle` | Admin, Mechanic, Customer | Customer brings vehicle back |
| `work-completed` | Admin, Customer | Generate invoice |
| `invoice-generated` | Admin, Customer | Customer pays |
| `closed-paid` | Admin, Customer | Ticket closed |

---

## 🎯 KEY FEATURES BY ROLE

### **Customer Can:**
- ✅ Create tickets (4-step flow)
- ✅ View ticket details with timeline
- ✅ See reschedule information
- ✅ View assigned services and findings
- ✅ Contact shop via phone/email
- ✅ Manage vehicles
- ✅ View invoices

### **Employee Can:**
- ✅ Create tickets for walk-ins (5-step flow)
- ✅ View assigned tickets
- ✅ Accept tickets
- ✅ Complete pre-service intake (mandatory)
- ✅ Add additional findings
- ✅ Request return visits
- ✅ Mark work as completed
- ✅ View all work orders

### **Admin Can:**
- ✅ View all tickets
- ✅ Assign one or multiple mechanics
- ✅ Reassign mechanics
- ✅ Set reschedule dates
- ✅ View complete ticket details
- ✅ Manage customers
- ✅ Manage employees
- ✅ View shop KPIs

---

## 📱 RESPONSIVE BEHAVIOR

### **Mobile (Primary)**
- Single-column layout
- Sticky top app bar
- Sticky bottom navigation
- Full-width cards
- Tap targets ≥ 44px

### **Tablet**
- 2-column grids where appropriate
- Sidebar appears (admin)
- More whitespace

### **Desktop**
- Centered content (max-width 1200px)
- Persistent sidebar (admin)
- 3-4 column grids
- More whitespace and larger cards

---

## 🔐 AUTHENTICATION (Future)
Currently: No authentication (UI navigation only)
Future: Role-based authentication will be added

---

## 💾 DATA PERSISTENCE
- **Current:** localStorage (ticketService)
- **Future:** Backend API (service layer ready for swap)

---

## 🎨 DESIGN PRINCIPLES
- **Mobile-first:** All flows optimized for iPhone
- **Plain English:** Non-technical language for customers
- **Clear Status:** Visual indicators and explanations
- **Progressive Disclosure:** Show only relevant information
- **Consistent Navigation:** Bottom nav (mobile) / Sidebar (desktop)

---

This document represents the complete end-to-end flows for all three user roles in the AutoMech system.

