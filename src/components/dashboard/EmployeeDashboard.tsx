import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerRegistration } from '@/components/customers/CustomerRegistration';
import { EnhancedVehicleRegistration } from '@/components/customers/EnhancedVehicleRegistration';
import { EmployeeWorkManagement } from '@/components/employee/EmployeeWorkManagement';
import { EmployeeProfileEditor } from '@/components/employee/EmployeeProfileEditor';
import { EmployeeWorkLog } from '@/components/employee/EmployeeWorkLog';
import { EmployeeAttendance } from '@/components/employee/EmployeeAttendance';
import { EmployeeSettings } from '@/components/employee/EmployeeSettings';
import { CreateTicketDialog } from '@/components/tickets/CreateTicketDialog';
import { EmployeeCustomerList } from '@/components/employee/EmployeeCustomerList';
import DashboardBackground from '@/components/layout/DashboardBackground';

interface EmployeeDashboardProps {
  activeTab?: string;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ activeTab = 'assignments' }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [selectedWorkLog, setSelectedWorkLog] = useState<any>(null);
  const [showWorkLogDialog, setShowWorkLogDialog] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  const renderPage = () => {
    switch (activeTab) {
      case 'assignments':
        return renderAssignmentsPage();
      case 'worklog':
        return renderWorkLogPage();
      case 'attendance':
        return renderAttendancePage();
      case 'profile':
        return renderProfilePage();
      case 'register':
        return renderRegisterCustomerPage();
      case 'customers':
        return renderCustomersPage();
      case 'settings':
        return renderSettingsPage();
      default:
        return renderAssignmentsPage();
    }
  };

  const renderAssignmentsPage = () => (
    <div className="space-y-4 sm:space-y-6">
              <div>
        <h2 className="text-xl sm:text-2xl font-bold">My Assignments</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your work assignments and tasks</p>
              </div>
            <EmployeeWorkManagement />
              </div>
  );

  const renderWorkLogPage = () => (
    <div className="space-y-4 sm:space-y-6">
      <EmployeeWorkLog />
                    </div>
  );

  const renderAttendancePage = () => (
    <div className="space-y-4 sm:space-y-6">
      <EmployeeAttendance />
              </div>
  );

  const renderProfilePage = () => (
    <div className="space-y-4 sm:space-y-6">
      <EmployeeProfileEditor />
    </div>
  );

  const renderRegisterCustomerPage = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Customer Management</h2>
          <p className="text-muted-foreground text-sm sm:text-base">View and register customers</p>
        </div>
        <CustomerRegistration />
      </div>
      <EmployeeCustomerList />
    </div>
  );

  const renderCustomersPage = () => (
    <div className="space-y-4 sm:space-y-6">
      <EmployeeCustomerList />
    </div>
  );

  const renderSettingsPage = () => (
    <div className="space-y-4 sm:space-y-6">
      <EmployeeSettings />
    </div>
  );

  const handleTicketCreated = () => {
    setShowCreateTicket(false);
    // Handle ticket creation success
  };

  return (
    <DashboardBackground>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {renderPage()}

      {/* Create Ticket Dialog */}
      <CreateTicketDialog 
        open={showCreateTicket}
        onOpenChange={setShowCreateTicket}
        onTicketCreated={handleTicketCreated}
      />
      </div>
    </DashboardBackground>
  );
};