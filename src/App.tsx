import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { EmployeeLayout } from './layouts/EmployeeLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { Landing } from './pages/Landing';
import { MobileLoginScreen } from './components/MobileLoginScreen';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerTickets } from './pages/customer/CustomerTickets';
import { CustomerTicketDetail } from './pages/customer/CustomerTicketDetail';
import { NewTicketFlow } from './pages/customer/tickets/new/NewTicketFlow';
import { TicketSubmitted } from './pages/customer/tickets/TicketSubmitted';
import { CustomerVehicles } from './pages/customer/CustomerVehicles';
import { CustomerVehicleDetail } from './pages/customer/CustomerVehicleDetail';
import { CustomerNewVehicle } from './pages/customer/CustomerNewVehicle';
import { CustomerInvoices } from './pages/customer/CustomerInvoices';
import { CustomerInvoiceDetail } from './pages/customer/CustomerInvoiceDetail';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { EmployeeWorkOrders } from './pages/employee/EmployeeWorkOrders';
import { EmployeeWorkOrderDetail } from './pages/employee/EmployeeWorkOrderDetail';
import { EmployeeNewTicket } from './pages/employee/tickets/EmployeeNewTicket';
import { EmployeeVehicles } from './pages/employee/EmployeeVehicles';
import { EmployeeLogs } from './pages/employee/EmployeeLogs';
import { EmployeeProfile } from './pages/employee/EmployeeProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTickets } from './pages/admin/AdminTickets';
import { AdminTicketInbox } from './pages/admin/AdminTicketInbox';
import { AdminTicketDetail } from './pages/admin/AdminTicketDetail';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCustomerDetail } from './pages/admin/AdminCustomerDetail';
import { AdminEmployees } from './pages/admin/AdminEmployees';
import { AdminQuotes } from './pages/admin/AdminQuotes';
import { AdminInvoices } from './pages/admin/AdminInvoices';
import { AdminSettings } from './pages/admin/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/mobile-login" element={<MobileLoginScreen />} />
        
        {/* Customer Routes */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="tickets" element={<CustomerTickets />} />
          <Route path="tickets/new" element={<NewTicketFlow />} />
          <Route path="tickets/submitted" element={<TicketSubmitted />} />
          <Route path="tickets/:id" element={<CustomerTicketDetail />} />
          <Route path="vehicles" element={<CustomerVehicles />} />
          <Route path="vehicles/new" element={<CustomerNewVehicle />} />
          <Route path="vehicles/:id" element={<CustomerVehicleDetail />} />
          <Route path="invoices" element={<CustomerInvoices />} />
          <Route path="invoices/:id" element={<CustomerInvoiceDetail />} />
          <Route path="profile" element={<CustomerProfile />} />
        </Route>
        
        {/* Employee Routes */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="work-orders" element={<EmployeeWorkOrders />} />
          <Route path="work-orders/:id" element={<EmployeeWorkOrderDetail />} />
          <Route path="tickets/new" element={<EmployeeNewTicket />} />
          <Route path="vehicles" element={<EmployeeVehicles />} />
          <Route path="logs" element={<EmployeeLogs />} />
          <Route path="profile" element={<EmployeeProfile />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="tickets/inbox" element={<AdminTicketInbox />} />
          <Route path="tickets/:id" element={<AdminTicketDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/:id" element={<AdminCustomerDetail />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="invoices/:id" element={<CustomerInvoiceDetail />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

