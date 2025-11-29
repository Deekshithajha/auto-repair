# Complete Application Flow Analysis
## Lakewood 76 Auto Repair - AutoMech System

**Generated:** 2024-12-19  
**Purpose:** Comprehensive analysis of all application flows, user journeys, and system architecture

---

## 📋 Table of Contents

1. [Application Architecture](#application-architecture)
2. [Entry Points & Authentication](#entry-points--authentication)
3. [Customer User Flows](#customer-user-flows)
4. [Employee/Mechanic User Flows](#employeemechanic-user-flows)
5. [Admin User Flows](#admin-user-flows)
6. [Ticket Workflow System](#ticket-workflow-system)
7. [Data Models & Storage](#data-models--storage)
8. [Component Architecture](#component-architecture)
9. [Navigation & Routing](#navigation--routing)
10. [Key Features & Capabilities](#key-features--capabilities)

---

## 🏗️ Application Architecture

### Tech Stack
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5.0
- **Routing:** React Router v6
- **Styling:** Tailwind CSS 3.3
- **State Management:** React Hooks + localStorage
- **Data Persistence:** localStorage (in-memory service layer)

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── cards/          # Card components (Ticket, Vehicle, Invoice, WorkOrder)
│   ├── navigation/     # Navigation (TopAppBar, BottomNav, SideNav)
│   ├── tickets/        # Ticket-specific components (Intake, Reschedule, Findings)
│   └── ui/             # Base UI (Button, Input, Modal, StatusBadge, etc.)
├── data/               # Mock data (customers, employees, tickets, vehicles, services)
├── layouts/            # Layout wrappers (CustomerLayout, EmployeeLayout, AdminLayout)
├── pages/              # Page components organized by role
│   ├── customer/       # Customer portal pages
│   ├── employee/       # Employee/mechanic portal pages
│   └── admin/          # Admin portal pages
├── services/           # Business logic services (ticketService)
├── types/              # TypeScript type definitions
├── App.tsx             # Main routing configuration
└── main.tsx            # Application entry point
```

### Key Design Patterns
- **Service Layer Pattern:** `ticketService` abstracts data operations
- **Layout Pattern:** Role-based layouts with responsive navigation
- **Component Composition:** Reusable UI components with consistent styling
- **Mobile-First Design:** Responsive layouts with mobile/desktop breakpoints

---

## 🚪 Entry Points & Authentication

### Landing Page (`/`)
**File:** `src/pages/Landing.tsx`

**Flow:**
1. User lands on animated landing page with logo and hero text
2. Background shows scrolling car service images
3. "Get Started" button navigates to `/mobile-login`

**Features:**
- Animated background with 3 columns of scrolling images
- Logo display
- Call-to-action button

---

### Mobile Login Screen (`/mobile-login`)
**File:** `src/components/MobileLoginScreen.tsx`

**Flow:**
1. User sees login form with username/password fields
2. Optional: Click "Show Demo Credentials" to see demo accounts
3. User can:
   - Enter credentials manually
   - Use demo account buttons (Customer/Employee/Admin)
4. On submit, navigates to appropriate dashboard based on credentials

**Demo Credentials:**
- **Customer:** `customer@demo.com` / `demo123` → `/customer`
- **Employee:** `employee@demo.com` / `demo123` → `/employee`
- **Admin:** `admin@demo.com` / `demo123` → `/admin`

**Note:** No real authentication - any credentials work (demo/prototype)

---

### Alternative Login (`/login/:role?`)
**File:** `src/pages/Login.tsx`

**Flow:**
1. Role-specific login form (customer/employee/admin)
2. Different fields based on role:
   - **Customer:** Email + License Plate
   - **Employee:** Employee ID + Password
   - **Admin:** Admin ID + Password
3. Shows demo credentials for each role
4. Navigates to role-specific dashboard

---

## 👤 Customer User Flows

### Customer Layout
**File:** `src/layouts/CustomerLayout.tsx`

**Navigation:**
- **Mobile:** Bottom navigation bar (Home, Tickets, Vehicles, Invoices, Profile)
- **Desktop:** Side navigation with same items
- Responsive breakpoint: 768px

---

### Customer Dashboard (`/customer`)
**File:** `src/pages/customer/CustomerDashboard.tsx`

**Flow:**
1. **KPI Cards Display:**
   - Open Tickets count
   - Vehicles count
   - Invoices Due count

2. **Quick Actions:**
   - "Raise Ticket" → `/customer/tickets/new`
   - "Add Vehicle" → `/customer/vehicles/new`

3. **Recent Tickets:**
   - Shows last 3 tickets
   - Click ticket → `/customer/tickets/:id`

**Data Source:** Filters mock data by customer ID (`c1`)

---

### New Ticket Flow (`/customer/tickets/new`)
**File:** `src/pages/customer/tickets/new/NewTicketFlow.tsx`

**Multi-Step Process:**

#### Step 1: Customer Info (`CustomerInfoStep`)
- Pre-filled with demo data
- Fields: Name, Email, Phone, Address, Notification Preference
- Next → Step 2

#### Step 2: Vehicle Selection (`VehicleStep`)
- Select existing vehicle OR add new vehicle
- New vehicle: Plate, Make, Model, Year, Color, VIN, Photos
- Next → Step 3

#### Step 3: Service Selection (`ServiceSelectionStep`)
- Browse available services
- Select services with sub-options (e.g., Oil Change → Synthetic/Blend/Conventional)
- Add symptoms per service
- Upload photos per service
- Next → Step 4

#### Step 4: Review & Submit (`ReviewStep`)
- Review all information
- Set vehicle status: "In Shop" or "Need to Drop Off"
- If "Need to Drop Off": Set drop-off date
- Set preferred pickup time
- Submit → Creates ticket via `ticketService.createTicketFromCustomerFlow()`

**Ticket Creation:**
- Status: `'pending-admin-review'`
- Source: `'customer'`
- Saved to localStorage
- Navigates to `/customer/tickets/submitted` with ticket ID

---

### Ticket Submitted (`/customer/tickets/submitted`)
**File:** `src/pages/customer/tickets/TicketSubmitted.tsx`

**Flow:**
1. Shows success message with ticket number
2. Displays summary of submitted ticket
3. Options:
   - View ticket details
   - Return to dashboard
   - Create another ticket

---

### Customer Tickets List (`/customer/tickets`)
**File:** `src/pages/customer/CustomerTickets.tsx`

**Flow:**
1. Lists all tickets for logged-in customer
2. Filter by status (All, Open, In Progress, Completed)
3. Each ticket shows:
   - Ticket ID
   - Vehicle info
   - Status badge
   - Created date
4. Click ticket → `/customer/tickets/:id`

---

### Customer Ticket Detail (`/customer/tickets/:id`)
**File:** `src/pages/customer/CustomerTicketDetail.tsx`

**Flow:**
1. **Vehicle Summary Card:**
   - License plate, make/model, year
   - Status badge

2. **Customer Information:**
   - Name, email, phone, address

3. **Description:**
   - Symptoms/description
   - Additional notes

4. **Services:**
   - List of requested services with status

5. **Photos:**
   - Grid of uploaded photos

6. **Timeline:**
   - Created date
   - Status changes
   - Updates

7. **Actions:**
   - View invoice (if available)
   - Contact shop

---

### Customer Vehicles (`/customer/vehicles`)
**File:** `src/pages/customer/CustomerVehicles.tsx`

**Flow:**
1. Lists all vehicles for customer
2. Each vehicle card shows:
   - Make, model, year
   - License plate
   - Photo
   - Service history count
3. Click vehicle → `/customer/vehicles/:id`
4. "Add Vehicle" button → `/customer/vehicles/new`

---

### New Vehicle (`/customer/vehicles/new`)
**File:** `src/pages/customer/CustomerNewVehicle.tsx`

**Flow:**
1. Form fields:
   - License Plate (required)
   - Make, Model, Year
   - Color, VIN
   - Nickname (optional)
   - Photos (categorized: damage, dashboard-warning, vin-sticker, etc.)
2. Submit → Creates vehicle, navigates to vehicle detail

---

### Customer Invoices (`/customer/invoices`)
**File:** `src/pages/customer/CustomerInvoices.tsx`

**Flow:**
1. Lists all invoices for customer
2. Filter by status (All, Pending, Paid, Overdue)
3. Each invoice shows:
   - Invoice number
   - Ticket reference
   - Amount
   - Status badge
   - Due date
4. Click invoice → `/customer/invoices/:id`

---

### Customer Profile (`/customer/profile`)
**File:** `src/pages/customer/CustomerProfile.tsx`

**Flow:**
1. Display customer information
2. Edit profile fields
3. Change notification preferences
4. View account settings

---

## 🔧 Employee/Mechanic User Flows

### Employee Layout
**File:** `src/layouts/EmployeeLayout.tsx`

**Navigation:**
- **Mobile:** Bottom navigation (Home, Work Orders, Vehicles, Logs, Profile)
- **Desktop:** Side navigation with same items

---

### Employee Dashboard (`/employee`)
**File:** `src/pages/employee/EmployeeDashboard.tsx`

**Flow:**
1. **Date Filters:**
   - Today, Tomorrow, Week

2. **KPI Cards:**
   - Assigned tickets count
   - In Progress count
   - Completed Today count

3. **My Work Orders:**
   - Shows assigned tickets (from `ticketService.getTickets({ assignedTo: employeeId })`)
   - Each work order card shows:
     - Ticket ID
     - Vehicle info
     - Status
     - "Accept" button (if status = 'assigned')
     - "Complete" button (if status = 'in-progress')
   - Click work order → `/employee/work-orders/:id`

4. **Auto-refresh:** Polls ticket service every 5 seconds

**Data Source:** `ticketService.getTickets()` filtered by assigned mechanic ID

---

### Work Order Detail (`/employee/work-orders/:id`)
**File:** `src/pages/employee/EmployeeWorkOrderDetail.tsx`

**Flow:**

1. **Vehicle Summary Card:**
   - License plate, make/model, year, color
   - Status badge

2. **Assigned Team:**
   - Shows all assigned mechanics (supports multiple mechanics per ticket)

3. **Description:**
   - Symptoms/description from ticket

4. **Pre-Service Intake Form** (if not completed):
   - **Trigger:** Status is 'assigned' or 'in-progress' AND intake not completed
   - **Required Fields:**
     - Current Mileage
     - VIN
     - Engine Type
     - Transmission Type (Automatic/Manual/CVT/Other)
     - Drivetrain (FWD/RWD/AWD/4x4/Other)
     - Fuel Type (Gasoline/Diesel/Hybrid/EV/Other)
     - Check Engine Light (On/Off)
     - Tire Condition Notes
     - Brake Condition Notes
     - Fluid Check Notes
     - Battery Health Notes
     - Exterior Damage Notes
   - **On Submit:**
     - Calls `ticketService.setMechanicIntake()`
     - Status changes: 'assigned' → 'in-progress' (if not already)
     - Form disappears, shows intake summary

5. **Intake Summary** (if completed):
   - Displays all intake data in grid format
   - Highlights check engine light if ON

6. **Additional Findings:**
   - Add new findings (title, description, severity, requires approval)
   - List existing findings with status (proposed/approved/declined)
   - Add photos to findings

7. **Assigned Services:**
   - List of services with checkboxes
   - Shows completion status

8. **Parts & Labor:**
   - Displays parts list with quantities and prices
   - Displays labor items with hours and rates

9. **Photos:**
   - Grid of ticket photos
   - Add new photos

10. **Notes:**
    - Textarea for work notes
    - "Save Notes" button → `ticketService.updateTicketNotes()`

11. **Footer Actions** (context-dependent):
    - **Status = 'assigned' + No Intake:** "Start Pre-Service Intake"
    - **Status = 'assigned' + Intake Complete:** "Mark as In Progress"
    - **Status = 'in-progress':**
      - "Mark Work as Completed" → Status: 'work-completed'
      - "Request Return Visit" → Opens reschedule modal
    - **Status = 'work-completed':** "Create Follow-up Quote"

12. **Reschedule Request Modal:**
    - Reason (required)
    - Notes (optional)
    - Upload photos
    - Submit → `ticketService.setRescheduleInfo()`
    - Status changes: 'in-progress' → 'return-visit-required'

---

### Employee Work Orders List (`/employee/work-orders`)
**File:** `src/pages/employee/EmployeeWorkOrders.tsx`

**Flow:**
1. Lists all assigned work orders
2. Filter by status
3. Shows work order cards with vehicle info and status
4. Click → `/employee/work-orders/:id`

---

### Employee New Ticket (`/employee/tickets/new`)
**File:** `src/pages/employee/tickets/EmployeeNewTicket.tsx`

**Flow:**
1. **Customer Lookup:**
   - Search by name, email, phone, or license plate
   - OR create new customer

2. **Vehicle Selection:**
   - Select existing vehicle OR add new
   - Add categorized photos

3. **Issue Description:**
   - Symptoms
   - Notes
   - Upload photos

4. **Service Selection:**
   - Optional service pre-selection

5. **Review & Submit:**
   - Review all info
   - Submit → `ticketService.createTicketFromEmployeeFlow()`
   - Status: 'pending-admin-review'
   - Source: 'employee'

---

### Employee Vehicles (`/employee/vehicles`)
**File:** `src/pages/employee/EmployeeVehicles.tsx`

**Flow:**
1. Browse/search all vehicles in system
2. View vehicle details
3. See service history per vehicle

---

### Employee Logs (`/employee/logs`)
**File:** `src/pages/employee/EmployeeLogs.tsx`

**Flow:**
1. Activity log of work performed
2. Time tracking
3. Service history

---

### Employee Profile (`/employee/profile`)
**File:** `src/pages/employee/EmployeeProfile.tsx`

**Flow:**
1. View/edit employee information
2. Update contact details
3. View assigned tickets count

---

## 👨‍💼 Admin User Flows

### Admin Layout
**File:** `src/layouts/AdminLayout.tsx`

**Navigation:**
- **Mobile:** Bottom navigation (Home, Tickets, Customers, More)
- **Desktop:** Side navigation (Dashboard, Tickets, Customers, Employees, Quotes, Invoices, Settings)

---

### Admin Dashboard (`/admin`)
**File:** `src/pages/admin/AdminDashboard.tsx`

**Flow:**
1. **KPI Grid:**
   - Open Tickets
   - Cars In Shop
   - Completed Today
   - Revenue This Month

2. **Ticket Inbox:**
   - Recent tickets requiring attention
   - Click ticket → `/admin/tickets/:id`
   - "View All" → `/admin/tickets/inbox`

3. **Live Shop View (Kanban):**
   - 4 columns: Open, In Progress, Waiting Pickup, Closed
   - Drag-and-drop style visualization
   - Click ticket → `/admin/tickets/:id`

**Data Source:** All tickets from mock data

---

### Admin Ticket Inbox (`/admin/tickets/inbox`)
**File:** `src/pages/admin/AdminTicketInbox.tsx`

**Flow:**
1. **Status Filters:**
   - All, Pending Admin Review, Assigned, In Progress, Return Visit Required, Rescheduled Awaiting Vehicle, Work Completed

2. **Ticket List:**
   - Each ticket card shows:
     - Ticket ID and status badge
     - Customer info (name, email, phone)
     - Vehicle info (make/model, plate)
     - Description
     - Requested services
     - **Assigned Mechanics** (prominent display, shows count)
     - Reschedule info (if applicable)

3. **Actions per Ticket:**
   - **"Assign Mechanic"** or **"Manage (N)"** button:
     - Opens modal with mechanic selection
     - **Multiple selection allowed** (checkboxes)
     - Shows currently assigned mechanics
     - Submit → `ticketService.assignMechanics()`
     - Status changes: 'pending-admin-review' → 'assigned'
   
   - **"Set Return Date"** (if status = 'return-visit-required'):
     - Opens reschedule management modal
     - Set scheduled date and time
     - Submit → `ticketService.setRescheduleInfo()`
     - Status changes: 'return-visit-required' → 'rescheduled-awaiting-vehicle'
   
   - **"View Details"** → `/admin/tickets/:id`

4. **Auto-refresh:** Polls ticket service every 5 seconds

---

### Admin Ticket Detail (`/admin/tickets/:id`)
**File:** `src/pages/admin/AdminTicketDetail.tsx`

**Flow:**
1. **Vehicle Summary Card:**
   - License plate, make/model, year
   - Status badge

2. **Assigned Mechanics Card** (PROMINENT):
   - Shows count of assigned mechanics
   - Lists all assigned mechanics with remove buttons
   - "Assign" or "Manage" button → Opens assignment modal
   - Supports multiple mechanics

3. **Customer Information:**
   - Name, email, phone, address

4. **Description:**
   - Symptoms/description
   - Additional notes

5. **Services:**
   - List with completion status

6. **Pre-Service Intake** (if completed):
   - Displays all intake data

7. **Additional Findings:**
   - Lists all findings with status and severity

8. **Photos:**
   - Grid of all photos

9. **Reschedule Info:**
   - Shows reason, notes, scheduled date/time

10. **Timeline:**
    - Created date
    - Assigned date
    - In progress date
    - Completed date

11. **Assignment Modal:**
    - Select multiple mechanics (checkboxes)
    - Shows currently assigned
    - Submit → `ticketService.assignMechanics()`

---

### Admin Tickets List (`/admin/tickets`)
**File:** `src/pages/admin/AdminTickets.tsx`

**Flow:**
1. All tickets with filters
2. Search and sort capabilities
3. Bulk actions

---

### Admin Customers (`/admin/customers`)
**File:** `src/pages/admin/AdminCustomers.tsx`

**Flow:**
1. List all customers
2. Search by name, email, phone
3. View customer details
4. Click customer → `/admin/customers/:id`

---

### Admin Customer Detail (`/admin/customers/:id`)
**File:** `src/pages/admin/AdminCustomerDetail.tsx`

**Flow:**
1. Customer information
2. Vehicle list
3. Ticket history
4. Invoice history
5. Edit customer info

---

### Admin Employees (`/admin/employees`)
**File:** `src/pages/admin/AdminEmployees.tsx`

**Flow:**
1. List all employees
2. Filter by role (mechanic/admin/manager)
3. View employee details
4. Assign tickets
5. Manage employee accounts

---

### Admin Quotes (`/admin/quotes`)
**File:** `src/pages/admin/AdminQuotes.tsx`

**Flow:**
1. List all quotes
2. Filter by status (draft/sent/approved/rejected)
3. Create new quote
4. Send quote to customer
5. Track approval status

---

### Admin Invoices (`/admin/invoices`)
**File:** `src/pages/admin/AdminInvoices.tsx`

**Flow:**
1. List all invoices
2. Filter by status (paid/pending/overdue)
3. Generate invoice from ticket
4. Track payments
5. Click invoice → `/admin/invoices/:id`

---

### Admin Settings (`/admin/settings`)
**File:** `src/pages/admin/AdminSettings.tsx`

**Flow:**
1. Shop information
2. Service pricing
3. Employee management
4. System configuration

---

## 🎫 Ticket Workflow System

### Ticket Service
**File:** `src/services/ticketService.ts`

**Storage:** localStorage key `'automotive_tickets'`

**Key Methods:**
- `createTicketFromCustomerFlow(payload)` - Creates ticket from customer flow
- `createTicketFromEmployeeFlow(payload)` - Creates ticket from employee flow
- `getTickets(filter?)` - Get tickets with optional filters
- `getTicketById(id)` - Get single ticket
- `assignMechanic(ticketId, mechanicId)` - Legacy single assignment
- `assignMechanics(ticketId, mechanicIds[])` - **NEW: Multiple assignment**
- `removeMechanic(ticketId, mechanicId)` - Remove mechanic from ticket
- `updateTicketStatus(ticketId, status)` - Update ticket status
- `updateTicketNotes(ticketId, notes)` - Update notes
- `setRescheduleInfo(ticketId, info)` - Set reschedule information
- `setMechanicIntake(ticketId, intake)` - Set pre-service intake
- `addAdditionalFinding(ticketId, finding)` - Add additional finding

---

### Ticket Status Flow

```
┌─────────────────────────┐
│ pending-admin-review    │ ← Initial status (customer/employee creates ticket)
└───────────┬─────────────┘
            │
            │ Admin assigns mechanic(s)
            ↓
┌─────────────────────────┐
│ assigned                │ ← Ticket assigned to mechanic(s)
└───────────┬─────────────┘
            │
            │ Mechanic accepts (or intake completed)
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

### Status Definitions

| Status | When | Who Sees It | Next Action |
|--------|------|-------------|-------------|
| `pending-admin-review` | Ticket just created | Admin only | Admin assigns to mechanic |
| `assigned` | Admin assigned ticket | Assigned mechanic(s) | Mechanic accepts/starts intake |
| `in-progress` | Mechanic working | Assigned mechanic(s) | Add findings, request return, or complete |
| `return-visit-required` | Mechanic requested return | Admin | Admin sets reschedule date |
| `rescheduled-awaiting-vehicle` | Admin set reschedule date | Admin, mechanic, customer | Customer brings vehicle back |
| `work-completed` | Mechanic finished work | Admin, customer | Generate invoice |
| `invoice-generated` | Invoice created | Admin, customer | Payment |
| `closed-paid` | Payment received | All | Ticket closed |

---

### Multiple Mechanic Assignment

**Feature:** Tickets can be assigned to **multiple mechanics** simultaneously.

**Implementation:**
- Ticket has `assignedMechanicIds: string[]` array
- Legacy field `assignedMechanicId` maintained for backward compatibility
- Admin can select multiple mechanics in assignment modal
- All assigned mechanics see the ticket in their dashboard
- Any assigned mechanic can work on the ticket

**Use Cases:**
- Team work on complex repairs
- Specialized mechanics for different services
- Backup mechanic assignment

---

### Pre-Service Intake Flow

**Trigger:** When ticket status is 'assigned' or 'in-progress' AND intake not completed

**Required Information:**
1. Current Mileage
2. VIN
3. Engine Type
4. Transmission Type
5. Drivetrain
6. Fuel Type
7. Check Engine Light Status
8. Condition Notes (tires, brakes, fluids, battery, exterior)

**On Completion:**
- Status automatically changes: 'assigned' → 'in-progress' (if not already)
- Intake data saved to ticket
- Form disappears, summary displayed

---

### Reschedule Flow

**Trigger:** Mechanic requests return visit during work

**Mechanic Actions:**
1. Click "Request Return Visit" button
2. Enter reason (required)
3. Add notes (optional)
4. Upload photos (optional)
5. Submit → Status: 'in-progress' → 'return-visit-required'

**Admin Actions:**
1. See ticket in inbox with reschedule request
2. Click "Set Return Date"
3. Select scheduled date
4. Select scheduled time
5. Add instructions (optional)
6. Submit → Status: 'return-visit-required' → 'rescheduled-awaiting-vehicle'

**When Vehicle Returns:**
- Admin or mechanic updates status back to 'in-progress'
- Work continues

---

## 💾 Data Models & Storage

### Core Types

**Ticket:**
```typescript
{
  id: string;
  source: 'customer' | 'employee';
  customer: Customer;
  vehicle: Vehicle;
  services: Service[];
  symptoms?: string;
  notes?: string;
  photos: Photo[];
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedMechanicIds?: string[];  // NEW: Multiple mechanics
  assignedMechanicId?: string;     // Legacy: Single mechanic
  mechanicIntake?: MechanicIntake;
  additionalFindings?: AdditionalFinding[];
  rescheduleInfo?: RescheduleInfo;
  schedulingPreferences?: {...};
}
```

**Customer:**
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  preferredNotification?: 'text' | 'call' | 'email';
  vehicles: string[];
  tickets: string[];
  invoices: string[];
}
```

**Vehicle:**
```typescript
{
  id: string;
  customerId: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  nickname?: string;
  photos?: VehiclePhoto[];
}
```

**Employee:**
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'mechanic' | 'admin' | 'manager';
  employeeId: string;
  assignedTickets: string[];
  isOnline?: boolean;
}
```

### Storage Strategy

**Tickets:**
- Stored in localStorage under key `'automotive_tickets'`
- Persisted across page refreshes
- Auto-loaded on service initialization
- Auto-saved on every mutation

**Other Data:**
- Customers, employees, vehicles, services: Static mock data in `src/data/`
- In production, would be fetched from API

---

## 🧩 Component Architecture

### Layout Components

**CustomerLayout:**
- Responsive navigation (mobile: bottom nav, desktop: side nav)
- 5 navigation items: Home, Tickets, Vehicles, Invoices, Profile

**EmployeeLayout:**
- Responsive navigation
- 5 navigation items: Home, Work Orders, Vehicles, Logs, Profile

**AdminLayout:**
- Responsive navigation
- Mobile: 4 items (Home, Tickets, Customers, More)
- Desktop: 7 items (Dashboard, Tickets, Customers, Employees, Quotes, Invoices, Settings)

### Card Components

**TicketCard:**
- Displays ticket summary
- Shows vehicle info, status, dates
- Clickable to navigate to detail

**WorkOrderCard:**
- Similar to TicketCard but for employee view
- Includes Accept/Complete buttons
- Shows assigned mechanics

**VehicleCard:**
- Displays vehicle info with photo
- Shows service count

**InvoiceCard:**
- Displays invoice summary
- Shows amount, status, due date

### Ticket Components

**MechanicIntakeForm:**
- Comprehensive intake form
- Validates required fields
- Saves to ticket service

**RescheduleRequest:**
- Mechanic-side reschedule form
- Reason, notes, photos

**RescheduleManagement:**
- Admin-side reschedule form
- Date/time selection
- Instructions

**AdditionalFindings:**
- Add/manage additional findings
- Severity levels
- Approval workflow

### UI Components

**Button:** Primary, secondary, full-width variants
**Input:** Text, email, password, date, time inputs
**Modal:** Reusable modal with backdrop
**StatusBadge:** Color-coded status indicators
**FilterChips:** Filter selection UI
**KpiCard:** Dashboard metric cards
**SectionHeader:** Section titles with actions
**PhotoUpload:** Photo upload with categorization

---

## 🧭 Navigation & Routing

### Route Structure

```
/                           → Landing page
/mobile-login              → Mobile login screen
/login/:role?              → Role-specific login

/customer                  → Customer dashboard
  /tickets                 → Customer tickets list
  /tickets/new             → New ticket flow (4 steps)
  /tickets/submitted       → Ticket submitted confirmation
  /tickets/:id             → Ticket detail
  /vehicles                → Vehicles list
  /vehicles/new            → New vehicle
  /vehicles/:id            → Vehicle detail
  /invoices                → Invoices list
  /invoices/:id            → Invoice detail
  /profile                 → Customer profile

/employee                  → Employee dashboard
  /work-orders             → Work orders list
  /work-orders/:id         → Work order detail
  /tickets/new             → Employee new ticket
  /vehicles                → Vehicles list
  /logs                    → Activity logs
  /profile                 → Employee profile

/admin                     → Admin dashboard
  /tickets                 → All tickets
  /tickets/inbox           → Ticket inbox (assignment)
  /tickets/:id             → Ticket detail
  /customers               → Customers list
  /customers/:id           → Customer detail
  /employees               → Employees list
  /quotes                  → Quotes list
  /invoices                → Invoices list
  /invoices/:id            → Invoice detail
  /settings                → Admin settings
```

### Navigation Patterns

**Mobile (< 768px):**
- Bottom navigation bar (fixed)
- Top app bar with title and actions
- Full-screen modals for forms

**Desktop (≥ 768px):**
- Side navigation (persistent)
- Top app bar (optional)
- Modal dialogs for actions

---

## ✨ Key Features & Capabilities

### 1. Multi-Mechanic Assignment
- Tickets can be assigned to multiple mechanics
- All assigned mechanics see the ticket
- Supports team collaboration

### 2. Pre-Service Intake
- Mandatory intake form before work starts
- Captures vehicle condition and specifications
- Auto-transitions ticket to 'in-progress'

### 3. Additional Findings
- Mechanics can add findings during work
- Severity levels (low/medium/high)
- Customer approval workflow

### 4. Reschedule Management
- Mechanic can request return visit
- Admin sets reschedule date/time
- Tracks reschedule reason and photos

### 5. Photo Management
- Categorized photos (damage, dashboard-warning, vin-sticker, etc.)
- Photos per service
- Photos per finding
- Photos per reschedule request

### 6. Real-time Updates
- Employee dashboard auto-refreshes every 5 seconds
- Admin inbox auto-refreshes every 5 seconds
- Ticket status changes reflected immediately

### 7. Responsive Design
- Mobile-first approach
- Breakpoint at 768px
- Adaptive navigation (bottom nav vs side nav)
- Touch-friendly interactions

### 8. Status History
- Tracks all status changes
- Timestamps and updated-by information
- Audit trail for tickets

### 9. Service Selection
- Hierarchical service options
- Sub-options (e.g., Oil Change → Synthetic/Blend/Conventional)
- Fixed and variable pricing
- Symptoms per service

### 10. Scheduling Preferences
- Customer sets preferred pickup time
- Vehicle status (in-shop vs need to drop off)
- Drop-off date selection
- Notification preferences

---

## 🔄 Complete User Journey Examples

### Example 1: Customer Creates Ticket

1. **Landing** → Click "Get Started"
2. **Login** → Use customer credentials
3. **Dashboard** → Click "Raise Ticket"
4. **Step 1:** Confirm customer info
5. **Step 2:** Select vehicle (or add new)
6. **Step 3:** Select services, add symptoms/photos
7. **Step 4:** Review, set scheduling, submit
8. **Submitted:** See confirmation with ticket number
9. **Ticket Detail:** View ticket status and updates

### Example 2: Admin Assigns & Mechanic Works

1. **Admin Dashboard** → See new ticket in inbox
2. **Ticket Inbox** → Click "Assign Mechanic"
3. **Assignment Modal** → Select mechanic(s), submit
4. **Mechanic Dashboard** → Sees assigned ticket
5. **Work Order Detail** → Clicks "Accept & Start"
6. **Intake Form** → Completes pre-service intake
7. **Work** → Adds notes, findings, photos
8. **Complete** → Clicks "Mark Work as Completed"
9. **Admin** → Sees completed ticket, generates invoice

### Example 3: Reschedule Flow

1. **Mechanic** → Working on ticket, needs return visit
2. **Reschedule Request** → Clicks "Request Return Visit"
3. **Form** → Enters reason, notes, photos
4. **Status** → Changes to 'return-visit-required'
5. **Admin Inbox** → Sees reschedule request
6. **Set Date** → Clicks "Set Return Date"
7. **Schedule** → Selects date and time
8. **Status** → Changes to 'rescheduled-awaiting-vehicle'
9. **Customer** → Notified of return date
10. **Vehicle Returns** → Status back to 'in-progress'

---

## 📊 Data Flow Summary

### Ticket Creation Flow
```
Customer/Employee Input
    ↓
Form Validation
    ↓
ticketService.createTicketFromCustomerFlow() / createTicketFromEmployeeFlow()
    ↓
Create Ticket Object
    ↓
Save to localStorage
    ↓
Status: 'pending-admin-review'
    ↓
Appears in Admin Inbox
```

### Ticket Assignment Flow
```
Admin Views Ticket
    ↓
Clicks "Assign Mechanic"
    ↓
Selects Mechanic(s)
    ↓
ticketService.assignMechanics()
    ↓
Update Ticket (assignedMechanicIds array)
    ↓
Status: 'assigned'
    ↓
Save to localStorage
    ↓
Appears in Mechanic Dashboard
```

### Ticket Work Flow
```
Mechanic Views Ticket
    ↓
Clicks "Accept" or Completes Intake
    ↓
ticketService.updateTicketStatus('in-progress')
    ↓
Mechanic Adds Notes/Findings
    ↓
ticketService.updateTicketNotes() / addAdditionalFinding()
    ↓
Mechanic Completes Work
    ↓
ticketService.updateTicketStatus('work-completed')
    ↓
Admin Generates Invoice
```

---

## 🎯 Key Takeaways

1. **Three-Portal System:** Customer, Employee, and Admin portals with distinct features
2. **Multi-Mechanic Support:** Tickets can be assigned to multiple mechanics
3. **Comprehensive Intake:** Mandatory pre-service intake captures vehicle details
4. **Flexible Rescheduling:** Mechanic can request return visits, admin schedules them
5. **Photo Management:** Categorized photos throughout the workflow
6. **Real-time Updates:** Auto-refresh on dashboards for live data
7. **Status-Driven Workflow:** Clear status progression from creation to completion
8. **Responsive Design:** Mobile-first with adaptive navigation
9. **Service Layer:** Centralized ticket service manages all ticket operations
10. **localStorage Persistence:** Tickets persist across sessions

---

## 🔍 Areas for Future Enhancement

1. **Backend Integration:** Replace localStorage with API calls
2. **Real Authentication:** Implement proper auth system
3. **Real-time Notifications:** Push notifications for status changes
4. **Invoice Generation:** Complete invoice workflow
5. **Payment Processing:** Payment integration
6. **Email/SMS Notifications:** Automated customer notifications
7. **Advanced Search:** Full-text search across tickets
8. **Reporting:** Analytics and reporting dashboard
9. **Mobile App:** Native mobile applications
10. **Multi-shop Support:** Support for multiple shop locations

---

**End of Analysis**

