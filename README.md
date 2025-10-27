# AUTO REPAIR INC

Professional Auto Repair Service Management System

## Project Overview

This is a comprehensive auto repair service management system built with modern web technologies.

## Features

- **Customer Dashboard**: Create and track repair tickets, view invoices and notifications
- **Employee Dashboard**: Manage work assignments, track time, and log work activities
- **Admin Dashboard**: Monitor employees, manage tickets, generate reports, and system settings
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Live notifications and status updates
- **Professional UI**: Clean, modern interface with consistent branding

## Technologies Used

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite
- **State Management**: React Hooks
- **Routing**: React Router
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd auto-repair

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── employee/       # Employee-specific components
│   ├── admin/          # Admin-specific components
│   ├── layout/         # Layout components
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
└── main.tsx           # Application entry point
```

## 🎯 Demo Accounts & Dummy Data

The application includes comprehensive dummy data and demo accounts for testing:

### **Demo Accounts**
- **Customer**: john.smith@autorepair.com (Password: customer123)
- **Employee**: alex.rodriguez@autorepair.com (Password: employee123)  
- **Admin**: admin@autorepair.com (Password: admin123)

### **Dummy Data Included**
- **5 Customer Profiles** with vehicles and repair history
- **4 Employee Profiles** with different roles and rates
- **5 Work Orders** in various stages (pending, in-progress, completed)
- **Standard & Non-Standard Services** with realistic pricing
- **Complete Financial Data** including invoices and parts costs
- **Work Logs & Attendance** records for employees
- **Notifications & Audit Logs** for system tracking

### **Quick Start with Dummy Data**
```bash
# Start the development server (dummy data is built-in)
npm run dev
```

📖 **For detailed dummy data guide, see [DUMMY_DATA_GUIDE.md](./DUMMY_DATA_GUIDE.md)**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software of AUTO REPAIR INC.

# Apparently you don't matter