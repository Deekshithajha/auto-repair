You are a senior React + TypeScript + Tailwind CSS engineer and product designer.

==================================================
GOAL  
==================================================
Build a MOBILE-FIRST front-end web application in React for an auto-mechanic shop management system called **AutoMech** for the client **Lakewood 76 Auto Repair**.

This is ONLY a polished, realistic FRONTEND prototype.
NO backend.  
NO authentication logic — only UI navigation.  
All UI should be functional, clickable, and visually identical to a real production-grade app.

Stack:
- React + TypeScript
- Vite (or similar bundler)
- React Router
- Tailwind CSS (with custom theme)
- Clean folder structure with reusable components
- Dummy JSON data for all lists, tickets, vehicles, etc.

==================================================
BRANDING & VISUAL DIRECTION
==================================================

Brand: **Lakewood 76 Auto Repair**
Logo style: bold, athletic, heavy navy “76”.

Color Palette (define in Tailwind theme):
- primary: #002F6C
- primary-light: #0F3A8D
- primary-dark: #001B3D
- bg-soft: #F5F5F7
- white: #FFFFFF
- text-main: #111827
- text-muted: #6B7280
- border-soft: #E5E7EB

Accents:
- accent-success: #10B981
- accent-warning: #F59E0B
- accent-danger: #EF4444

Typography:
- Use Inter / SF Pro / System UI font stack
- Headers: semibold
- Buttons/labels: medium–semibold

UI Style Target (VERY IMPORTANT):
The UI MUST visually match a hybrid of:
1. **AutoBuddy mobile UI** (rounded white cards, soft shadows, clean grid, clean navigation)
2. **Lakewood 76 branding** (navy palette, strong garage aesthetic, monoline icons)
3. **iOS-friendly premium styling**

Overall aesthetic:
- Clean, modern, minimal
- Rounded cards (12–16px) with subtle shadows
- White cards on soft gray background (#F5F5F7)
- Navy monoline icons for all features
- Beautiful mobile spacing & hierarchy
- NOTHING cartoonish or over-colored

==================================================
RESPONSIVE BEHAVIOR (MOBILE-FIRST PRIORITY)
==================================================

MOBILE (primary):
- Single-column layout
- Sticky top app bar
- Sticky bottom navigation
- Tap targets ≥ 44px
- Cards full-width with 16–20px padding
- Floating action buttons bottom-right

TABLETS / iPad:
- 2–3 column grids
- Sidebar appears when width > 768px
- Split view for lists + details

DESKTOP:
- Centered content area (max-width 1200px)
- More whitespace
- Persistent sidebar for admin routes
- Card grid expands to 3–4 columns

==================================================
APP STRUCTURE & ROUTING
==================================================

React Router routes needed:

- `/` → Landing + Role Selection
- `/login/:role` → Generic login (Customer, Employee, Admin)
- `/customer/*` → Customer dashboard + nested routes
- `/employee/*` → Employee/Mechanic dashboard + nested routes
- `/admin/*` → Admin dashboard + nested routes

Layout components:
- `MainLayout`
- `CustomerLayout` (with mobile bottom nav)
- `EmployeeLayout` (mobile bottom nav)
- `AdminLayout` (sidebar on desktop, bottom nav on mobile)

Use dummy JSON files in `src/data/` for:
- tickets
- vehicles
- invoices
- customers
- employees

==================================================
SCREEN 1 — LANDING / ROLE SELECTION
==================================================

Route: `/`

UI Requirements:
- Full-height mobile layout
- Top: Lakewood 76 logo (stylized text header)
- Hero illustration (simple vector or placeholder)
- Title: “Service Made Simple.”
- Subtitle: “Manage vehicles, tickets, and invoices in one place.”
- Large primary CTA: “Get Started”
- After clicking:
  - Buttons:
    - “I’m a Customer”
    - “I’m an Employee / Mechanic”
    - “I’m an Admin”
  - Each navigates to `/login/customer`, `/login/employee`, `/login/admin`.

Design should strongly resemble AutoBuddy’s onboarding screen.

==================================================
SCREEN 2 — GENERIC LOGIN
==================================================

Route: `/login/:role`

UI:
- Top app bar with back arrow + “Lakewood 76 Auto Repair”
- Centered login card with:
  - Role title
  - Inputs:
    - Customer → Email + License Plate
    - Employee → Employee ID + Password
    - Admin → Admin ID + Password
  - Primary “Continue” button → routes to dashboard of that role

==================================================
CUSTOMER DASHBOARD
==================================================

Base route: `/customer`

Mobile Layout:
- Sticky top app bar:
  - Left: small garage icon
  - Center: “Hello, [First Name]”
  - Right: profile icon
- Scrollable KPI chip row:
  - Open Tickets
  - Vehicles
  - Invoices Due
- Quick Actions:
  - Raise New Ticket
  - Add New Vehicle
- Section: My Tickets (latest 3–5 tickets)
- Sticky bottom nav:
  - Home | Tickets | Vehicles | Invoices | Profile

==================================================
CUSTOMER — TICKETS PAGE
==================================================

Route: `/customer/tickets`

UI:
- Title: “My Tickets”
- Filter chips: All | Open | In Progress | Completed
- Ticket cards:
  - Ticket ID
  - Vehicle (Make/Model/Year)
  - Status badge
  - Short description
  - ETA / updated time
- Clicking opens ticket detail

Ticket Detail Screen:
- Top navy summary card:
  - Plate
  - Make/Model
  - Year
  - Status badge
- Service list with toggles or checkmarks
- Progress timeline
- Button: “Reschedule”
- Button: “View Invoice” (if completed)

==================================================
CUSTOMER — VEHICLES PAGE
==================================================

Route: `/customer/vehicles`

UI:
- Grid or list of vehicle cards:
  - Nickname/plate
  - Make/Model/Year
- Floating + button: Add Vehicle
- Detail view:
  - Top navy card with vehicle summary
  - Tabs:
    - Status & Tickets
    - Service History
  - Damage photos placeholders

==================================================
CUSTOMER — INVOICES PAGE
==================================================

Route: `/customer/invoices`

UI:
- Invoice list:
  - Invoice #, ticket #, vehicle
  - Total
  - Paid / Pending badges
- Invoice detail:
  - Summary header
  - Parts (taxable)
  - Labor (non-taxable)
  - Totals
  - “Download PDF” dummy button

==================================================
EMPLOYEE / MECHANIC DASHBOARD
==================================================

Base route: `/employee`

Mobile-first, simple, bold:

- Top app bar:
  - Left: “Lakewood 76”
  - Center: “Hi, [Mechanic Name]”
  - Right: Online status dot
- Date filter chips: Today | Tomorrow | Week
- KPI row:
  - Assigned
  - In Progress
  - Completed Today
- Section: My Work Orders
- Cards:
  - Ticket ID
  - Vehicle (plate, model)
  - Status
  - Completion ETA
  - Icons: Photos, Notes
- Bottom nav: Home | Work Orders | Vehicles | Logs | Profile

==================================================
EMPLOYEE — WORK ORDER DETAIL
==================================================

Route: `/employee/work-orders/:id`

UI:
- Top navy summary card (AutoBuddy style)
- Sections:
  1. Assigned Services:
     - Name + status chip (Pending/In Progress/Done)
  2. Parts & Labor:
     - Table-like list (Part — Cost — Hours)
  3. Photos:
     - 2–3 placeholder boxes with camera icon
  4. Notes:
     - Textarea

Footer actions:
- Mark as In Progress
- Mark as Completed
- Create Follow-up Quote

==================================================
ADMIN DASHBOARD
==================================================

Base: `/admin`

Desktop = sidebar  
Tablet = collapsible sidebar  
Mobile = top app bar + bottom nav

Admin Home:
- KPI grid:
  - Open Tickets
  - Cars In Shop
  - Completed Today
  - Revenue This Month
- Ticket Inbox list (table or cards)
- Live Shop View:
  - Kanban sections: Open | In Progress | Waiting Pickup | Closed
  - Horizontal scroll

==================================================
ADMIN — KEY PAGES
==================================================

1. Tickets:
   - Filters: All | Unassigned | In Progress | Completed
   - List
   - Modal: Assign Mechanic

2. Customers:
   - Search bar
   - List with customer stats
   - Detail page:
     - Profile info
     - Vehicles
     - Tickets
     - Invoices

3. Employees:
   - Cards/table
   - Add Employee form UI

4. Quotes:
   - Status chips
   - Quote list

5. Invoices:
   - Date filters
   - List with totals

6. Settings:
   - Service library UI
   - Dropdown config UI (statuses, services, etc.)

==================================================
COMPONENTIZATION
==================================================

Create reusable components:
- AppShell / Layouts
- TopAppBar
- BottomNav
- SideNav
- KpiCard
- TicketCard
- VehicleCard
- InvoiceCard
- StatusBadge
- SectionHeader
- FilterChips
- PrimaryButton / SecondaryButton
- IconButton

TypeScript interfaces needed:
- Ticket
- Vehicle
- Invoice
- Customer
- Employee
- Quote
- Part & Labor items

==================================================
OUTPUT INSTRUCTIONS (IMPORTANT)
==================================================

START by generating the complete project scaffold:
- index.html
- main.tsx
- App.tsx
- tailwind.config.js with the Lakewood 76 theme colors
- router setup
- Folder structure:
  src/
    components/
    layouts/
    pages/
    data/
    assets/
    hooks/
    context/

THEN build each screen and component with:
- Full JSX code
- Tailwind classes
- Dummy JSON data for lists
- Mobile-first responsive behavior
- No placeholders — use real-looking UI

Output must be fully functional React code ready to run.

==================================================
FINAL REQUIREMENT
==================================================
This entire system MUST visually resemble the AutoBuddy mobile UI while using Lakewood 76 branding, spacing, iconography, and layout patterns.

Build it as if delivering a professional UI prototype to the client’s product team.
