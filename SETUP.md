# Quick Setup Guide

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000`

3. **Build for Production**
   ```bash
   npm run build
   ```

## Application Structure

### Routes

- `/` - Landing page with role selection
- `/login/:role` - Login page (customer, employee, admin)
- `/customer/*` - Customer portal
- `/employee/*` - Employee/Mechanic portal
- `/admin/*` - Admin portal

### Demo Access

This is a frontend-only prototype. Use any credentials to access:

1. **Customer Portal**
   - Navigate to "I'm a Customer"
   - Enter any email and license plate
   - View: Dashboard, Tickets, Vehicles, Invoices, Profile

2. **Employee Portal**
   - Navigate to "I'm an Employee / Mechanic"
   - Enter any employee ID and password
   - View: Dashboard, Work Orders, Vehicles, Activity Logs, Profile

3. **Admin Portal**
   - Navigate to "I'm an Admin"
   - Enter any admin ID and password
   - View: Dashboard, Tickets, Customers, Employees, Quotes, Invoices, Settings

## Features Implemented

### Customer Features
✅ Dashboard with KPIs (Open Tickets, Vehicles, Invoices Due)
✅ Quick Actions (Raise Ticket, Add Vehicle)
✅ Ticket Management (List, Detail, Filter by status)
✅ Vehicle Management (List, Detail with tabs)
✅ Invoice Management (List, Detail with breakdown)
✅ Profile with account stats

### Employee Features
✅ Dashboard with date filters and KPIs
✅ Work Order Management (List, Detail)
✅ Service tracking with status updates
✅ Photo upload placeholders
✅ Notes and comments
✅ Vehicle search
✅ Activity logs
✅ Profile with performance stats

### Admin Features
✅ Dashboard with KPI grid
✅ Ticket Inbox
✅ Live Shop View (Kanban board)
✅ Complete Ticket Management
✅ Mechanic Assignment Modal
✅ Customer Management with search
✅ Customer Detail (Vehicles, Tickets, Invoices tabs)
✅ Employee Management
✅ Quote Management with filters
✅ Invoice Management with revenue tracking
✅ Settings (Shop Info, Service Library, Status Config)

## Design System

### Branding
- **Primary Color**: #002F6C (Navy)
- **Logo**: Bold "76" with Lakewood Auto Repair
- **Style**: Clean, modern, iOS-friendly

### Responsive Behavior
- **Mobile (< 768px)**: Single column, bottom navigation
- **Tablet (768px - 1200px)**: 2-3 column grids, collapsible sidebar
- **Desktop (> 1200px)**: Centered content, persistent sidebar

### UI Components
- Rounded cards (12-16px border radius)
- Soft shadows
- Navy monoline icons
- White cards on soft gray background (#F5F5F7)
- Status badges with color coding
- Filter chips
- KPI cards
- Modal dialogs

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Bundler**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Heroicons (via inline SVG)

## File Structure

```
lakewood-76-auto-repair/
├── docs/
│   └── 76_lakewood_SDD.md
├── src/
│   ├── components/
│   │   ├── cards/
│   │   │   ├── InvoiceCard.tsx
│   │   │   ├── TicketCard.tsx
│   │   │   └── VehicleCard.tsx
│   │   ├── navigation/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── SideNav.tsx
│   │   │   └── TopAppBar.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── FilterChips.tsx
│   │       ├── FloatingActionButton.tsx
│   │       ├── Input.tsx
│   │       ├── KpiCard.tsx
│   │       ├── Modal.tsx
│   │       ├── SectionHeader.tsx
│   │       └── StatusBadge.tsx
│   ├── data/
│   │   ├── customers.ts
│   │   ├── employees.ts
│   │   ├── invoices.ts
│   │   ├── quotes.ts
│   │   ├── tickets.ts
│   │   └── vehicles.ts
│   ├── layouts/
│   │   ├── AdminLayout.tsx
│   │   ├── CustomerLayout.tsx
│   │   └── EmployeeLayout.tsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminCustomerDetail.tsx
│   │   │   ├── AdminCustomers.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminEmployees.tsx
│   │   │   ├── AdminInvoices.tsx
│   │   │   ├── AdminQuotes.tsx
│   │   │   ├── AdminSettings.tsx
│   │   │   └── AdminTickets.tsx
│   │   ├── customer/
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── CustomerInvoiceDetail.tsx
│   │   │   ├── CustomerInvoices.tsx
│   │   │   ├── CustomerProfile.tsx
│   │   │   ├── CustomerTicketDetail.tsx
│   │   │   ├── CustomerTickets.tsx
│   │   │   ├── CustomerVehicleDetail.tsx
│   │   │   └── CustomerVehicles.tsx
│   │   ├── employee/
│   │   │   ├── EmployeeDashboard.tsx
│   │   │   ├── EmployeeLogs.tsx
│   │   │   ├── EmployeeProfile.tsx
│   │   │   ├── EmployeeVehicles.tsx
│   │   │   ├── EmployeeWorkOrderDetail.tsx
│   │   │   └── EmployeeWorkOrders.tsx
│   │   ├── Landing.tsx
│   │   └── Login.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── SETUP.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Next Steps

1. Run `npm install` to install all dependencies
2. Run `npm run dev` to start the development server
3. Open `http://localhost:3000` in your browser
4. Click "Get Started" and choose a role to explore

## Notes

- This is a frontend-only prototype with no backend
- All data is mock data stored in `src/data/`
- No actual authentication is implemented
- All actions are UI-only (no data persistence)
- Designed to demonstrate the complete user experience

Enjoy exploring the Lakewood 76 Auto Repair management system! 🚗

