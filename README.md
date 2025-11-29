# Lakewood 76 Auto Repair - AutoMech

A mobile-first auto-mechanic shop management system built with React, TypeScript, and Tailwind CSS.

## Features

- **Customer Portal**: Manage vehicles, track service tickets, view invoices
- **Employee/Mechanic Portal**: View and manage work orders, track service history
- **Admin Portal**: Complete shop management with tickets, customers, employees, quotes, and invoices

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router v6
- Tailwind CSS
- Mobile-first responsive design

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── cards/        # Card components (Ticket, Vehicle, Invoice)
│   ├── navigation/   # Navigation components (TopAppBar, BottomNav, SideNav)
│   └── ui/           # Base UI components (Button, Input, Modal, etc.)
├── data/             # Mock data for demo
├── layouts/          # Layout components for different user roles
├── pages/            # Page components organized by role
│   ├── customer/
│   ├── employee/
│   └── admin/
├── types/            # TypeScript type definitions
├── App.tsx           # Main app component with routing
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## Design System

### Colors

- Primary: #002F6C (Navy)
- Primary Light: #0F3A8D
- Primary Dark: #001B3D
- Background: #F5F5F7
- Success: #10B981
- Warning: #F59E0B
- Danger: #EF4444

### Typography

- Font: Inter / SF Pro / System UI
- Headers: Semibold
- Buttons/Labels: Medium–Semibold

## Demo Credentials

This is a frontend prototype with no authentication. Any credentials will work to access different portals, but we recommend using the demo accounts for a realistic experience.

**See [DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md) for complete demo account list.**

### Quick Demo Accounts

**Customer:**
- Email: `sarah.johnson@email.com`
- License Plate: `ABC-1234`

**Employee:**
- Employee ID: `EMP001`
- Password: `password` (or any)

**Admin:**
- Admin ID: `ADM001`
- Password: `password` (or any)

The login page also includes a "Show Demo Account" button for easy access!

## Features by Role

### Customer
- Dashboard with KPIs and quick actions
- View and manage service tickets
- Manage multiple vehicles
- View and pay invoices
- Profile management

### Employee/Mechanic
- Work order dashboard
- Manage assigned tickets
- Update service progress
- Add photos and notes
- Activity logs

### Admin
- Complete shop overview
- Manage all tickets, customers, and employees
- Create and manage quotes
- Invoice management
- Shop settings and configuration

## Mobile-First Design

The application is designed mobile-first with responsive breakpoints:

- Mobile: Single column, bottom navigation
- Tablet (768px+): Multi-column grids, sidebar navigation
- Desktop (1200px+): Centered content, persistent sidebar

## License

This is a demo project for Lakewood 76 Auto Repair.

