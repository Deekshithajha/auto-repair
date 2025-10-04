import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardBackground from '@/components/layout/DashboardBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerRegistration } from '@/components/customers/CustomerRegistration';
import { AdminTicketManagement } from '@/components/admin/AdminTicketManagement';
import { CustomerList } from '@/components/admin/CustomerList';
import RaiseTicketWizard from '@/components/tickets/RaiseTicketWizard';

interface AdminDashboardProps {
  activeTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab = 'tickets' }) => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Dummy data for demonstration
  const dummyEmployees = [
    {
      id: '1',
      name: 'John Smith',
      role: 'Senior Mechanic',
      employee_id: 'EMP001',
      phone: '(555) 123-4567',
      email: 'john.smith@autorepair.com',
      status: 'active',
      hire_date: '2022-03-15',
      department: 'Mechanical'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Diagnostic Specialist',
      employee_id: 'EMP002',
      phone: '(555) 234-5678',
      email: 'sarah.johnson@autorepair.com',
      status: 'active',
      hire_date: '2021-08-20',
      department: 'Diagnostics'
    },
    {
      id: '3',
      name: 'Mike Davis',
      role: 'Junior Mechanic',
      employee_id: 'EMP003',
      phone: '(555) 345-6789',
      email: 'mike.davis@autorepair.com',
      status: 'active',
      hire_date: '2023-01-10',
      department: 'Mechanical'
    }
  ];

  const dummyActiveWork = [
    {
      id: '1',
      employee: 'John Smith',
      vehicle: '2020 Toyota Camry',
      task: 'Engine Diagnostic',
      status: 'in_progress',
      start_time: '2024-01-16T08:00:00Z',
      estimated_completion: '2024-01-16T12:00:00Z'
    },
    {
      id: '2',
      employee: 'Sarah Johnson',
      vehicle: '2019 Honda Civic',
      task: 'AC System Repair',
      status: 'in_progress',
      start_time: '2024-01-16T09:30:00Z',
      estimated_completion: '2024-01-16T15:30:00Z'
    },
    {
      id: '3',
      employee: 'Mike Davis',
      vehicle: '2021 Ford Focus',
      task: 'Oil Change',
      status: 'completed',
      start_time: '2024-01-16T10:00:00Z',
      estimated_completion: '2024-01-16T11:00:00Z'
    }
  ];

  const dummyReports = [
    {
      id: '1',
      title: 'Monthly Revenue Report',
      period: 'January 2024',
      revenue: 15420.50,
      tickets_completed: 45,
      average_repair_time: '2.5 hours',
      top_service: 'Oil Change'
    },
    {
      id: '2',
      title: 'Employee Performance',
      period: 'January 2024',
      revenue: 0,
      tickets_completed: 0,
      average_repair_time: '0 hours',
      top_service: 'N/A'
    },
    {
      id: '3',
      title: 'Customer Satisfaction',
      period: 'January 2024',
      revenue: 0,
      tickets_completed: 0,
      average_repair_time: '0 hours',
      top_service: 'N/A'
    }
  ];

  const dummySystemSettings = {
    business: {
      name: 'AUTO REPAIR INC',
      address: '123 Main Street, City, State 12345',
      phone: '(555) 123-4567',
      email: 'info@76autorepair.com',
      hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM'
    },
    notifications: {
      email_enabled: true,
      sms_enabled: true,
      push_enabled: true,
      auto_assign: true,
      customer_notifications: true
    },
    security: {
      session_timeout: 30,
      password_policy: 'strong',
      two_factor_auth: false,
      audit_logging: true
    },
    maintenance: {
      auto_backup: true,
      backup_frequency: 'daily',
      system_updates: 'automatic',
      last_backup: '2024-01-16T02:00:00Z'
    }
  };

  const dummyAuditLogs = [
    {
      id: '1',
      timestamp: '2024-01-16T14:30:00Z',
      user: 'John Smith',
      action: 'Completed work on ticket TICKET-003',
      details: 'Oil change and brake pad replacement completed',
      ip_address: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: '2024-01-16T13:45:00Z',
      user: 'Sarah Johnson',
      action: 'Started work on ticket TICKET-002',
      details: 'AC system repair work initiated',
      ip_address: '192.168.1.101'
    },
    {
      id: '3',
      timestamp: '2024-01-16T12:15:00Z',
      user: 'Admin User',
      action: 'Approved ticket TICKET-001',
      details: 'Engine diagnostic ticket approved and assigned',
      ip_address: '192.168.1.102'
    },
    {
      id: '4',
      timestamp: '2024-01-16T11:30:00Z',
      user: 'Mike Davis',
      action: 'Added parts to ticket TICKET-003',
      details: 'Added Motor Oil 5W-30, Oil Filter, Brake Pads',
      ip_address: '192.168.1.103'
    },
    {
      id: '5',
      timestamp: '2024-01-16T10:00:00Z',
      user: 'Admin User',
      action: 'System backup completed',
      details: 'Daily automated backup completed successfully',
      ip_address: '192.168.1.102'
    }
  ];

  return (
    <DashboardBackground>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={(val) => navigate(`/admin/${val}`)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 lg:w-auto text-xs sm:text-sm">
            <TabsTrigger value="tickets" className="flex items-center space-x-1 sm:space-x-2">
              <span>📧</span>
              <span className="hidden sm:inline">Approve</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center space-x-1 sm:space-x-2">
              <span>👥</span>
              <span className="hidden sm:inline">Customers</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center space-x-1 sm:space-x-2">
              <span>🔧</span>
              <span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center space-x-1 sm:space-x-2">
              <span>➕</span>
              <span className="hidden sm:inline">Register</span>
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center space-x-1 sm:space-x-2">
              <span>📊</span>
              <span className="hidden sm:inline">Monitor</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-1 sm:space-x-2">
              <span>📈</span>
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-1 sm:space-x-2">
              <span>🛡️</span>
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-1 sm:space-x-2">
              <span>⚙️</span>
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Ticket Approval & Assignment</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Approve, decline, and assign repair tickets</p>
              </div>
            </div>

            <AdminTicketManagement />
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4 sm:space-y-6">
            <CustomerList />
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Employee Management</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Manage employees, attendance, and assignments</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dummyEmployees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-elegant transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center text-xs">
                      <span className="mr-1">🆔</span>
                      {employee.employee_id}
                    </CardDescription>
              </CardHeader>
              <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Role:</span>
                        <span className="text-sm text-muted-foreground">{employee.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Department:</span>
                        <span className="text-sm text-muted-foreground">{employee.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Phone:</span>
                        <span className="text-sm text-muted-foreground">{employee.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Hired:</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(employee.hire_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="pt-2 flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                      </div>
                    </div>
              </CardContent>
            </Card>
              ))}
            </div>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Customer Registration</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Register new customers in the system</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>New Customer</CardTitle>
                <CardDescription>Add a new customer to AUTO REPAIR INC</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerRegistration />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Monitor Tab */}
          <TabsContent value="monitor">
            <div>
              <h2 className="text-2xl font-bold">Real-time Monitor</h2>
              <p className="text-muted-foreground">See who's working on what in real-time</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dummyActiveWork.map((work) => (
                <Card key={work.id} className="hover:shadow-elegant transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{work.employee}</CardTitle>
                      <Badge variant={work.status === 'completed' ? 'default' : work.status === 'in_progress' ? 'secondary' : 'outline'}>
                        {work.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center text-xs">
                      <span className="mr-1">🚗</span>
                      {work.vehicle}
                    </CardDescription>
              </CardHeader>
              <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Task:</span>
                        <span className="text-sm text-muted-foreground">{work.task}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Started:</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(work.start_time).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">ETA:</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(work.estimated_completion).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" size="sm" className="w-full">
                          View Progress
                        </Button>
                      </div>
                </div>
              </CardContent>
            </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Reports & Analytics</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Business insights and performance metrics</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dummyReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-elegant transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="flex items-center text-xs">
                        <span className="mr-1">📅</span>
                        {report.period}
                      </CardDescription>
              </CardHeader>
              <CardContent>
                      <div className="space-y-3">
                        {report.revenue > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Revenue:</span>
                            <span className="text-lg font-bold text-green-600">
                              ${report.revenue.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {report.tickets_completed > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Tickets Completed:</span>
                            <span className="text-sm text-muted-foreground">{report.tickets_completed}</span>
                          </div>
                        )}
                        {report.average_repair_time !== '0 hours' && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Avg Repair Time:</span>
                            <span className="text-sm text-muted-foreground">{report.average_repair_time}</span>
                          </div>
                        )}
                        {report.top_service !== 'N/A' && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Top Service:</span>
                            <span className="text-sm text-muted-foreground">{report.top_service}</span>
                          </div>
                        )}
                        <div className="pt-2">
                          <Button variant="outline" size="sm" className="w-full">
                            View Full Report
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Audit Logs</h2>
                <p className="text-muted-foreground text-sm sm:text-base">System activity and security logs</p>
              </div>
              <div className="space-y-4">
                {dummyAuditLogs.map((log) => (
                  <Card key={log.id} className="hover:shadow-elegant transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">📝</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-foreground">
                              {log.action}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.details}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">
                              User: {log.user}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              IP: {log.ip_address}
                            </span>
                          </div>
                        </div>
                </div>
              </CardContent>
            </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">System Settings</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Configure application settings and preferences</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Business Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Configure your business details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Business Name:</span>
                      <span className="text-sm text-muted-foreground">{dummySystemSettings.business.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Address:</span>
                      <span className="text-sm text-muted-foreground">{dummySystemSettings.business.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Phone:</span>
                      <span className="text-sm text-muted-foreground">{dummySystemSettings.business.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm text-muted-foreground">{dummySystemSettings.business.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Hours:</span>
                      <span className="text-sm text-muted-foreground">{dummySystemSettings.business.hours}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Business Info
                    </Button>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure system notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">Send email alerts</p>
                      </div>
                      <Badge variant={dummySystemSettings.notifications.email_enabled ? 'default' : 'secondary'}>
                        {dummySystemSettings.notifications.email_enabled ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">SMS Notifications</p>
                        <p className="text-xs text-muted-foreground">Send SMS alerts</p>
                      </div>
                      <Badge variant={dummySystemSettings.notifications.sms_enabled ? 'default' : 'secondary'}>
                        {dummySystemSettings.notifications.sms_enabled ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Auto Assignment</p>
                        <p className="text-xs text-muted-foreground">Automatically assign tickets</p>
                      </div>
                      <Badge variant={dummySystemSettings.notifications.auto_assign ? 'default' : 'secondary'}>
                        {dummySystemSettings.notifications.auto_assign ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Notifications
                    </Button>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Configure security policies</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Session Timeout:</span>
                      <span className="text-sm text-muted-foreground">{dummySystemSettings.security.session_timeout} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Password Policy:</span>
                      <span className="text-sm text-muted-foreground capitalize">{dummySystemSettings.security.password_policy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Two-Factor Auth</p>
                        <p className="text-xs text-muted-foreground">Require 2FA for admin</p>
                      </div>
                      <Badge variant={dummySystemSettings.security.two_factor_auth ? 'default' : 'secondary'}>
                        {dummySystemSettings.security.two_factor_auth ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Audit Logging</p>
                        <p className="text-xs text-muted-foreground">Log all system activities</p>
                      </div>
                      <Badge variant={dummySystemSettings.security.audit_logging ? 'default' : 'secondary'}>
                        {dummySystemSettings.security.audit_logging ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Security
                    </Button>
                  </CardContent>
                </Card>

                {/* Maintenance Settings */}
            <Card>
              <CardHeader>
                    <CardTitle>Maintenance Settings</CardTitle>
                    <CardDescription>System maintenance and backups</CardDescription>
              </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Auto Backup</p>
                        <p className="text-xs text-muted-foreground">Automatically backup data</p>
                      </div>
                      <Badge variant={dummySystemSettings.maintenance.auto_backup ? 'default' : 'secondary'}>
                        {dummySystemSettings.maintenance.auto_backup ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Backup Frequency:</span>
                      <span className="text-sm text-muted-foreground capitalize">{dummySystemSettings.maintenance.backup_frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">System Updates:</span>
                      <span className="text-sm text-muted-foreground capitalize">{dummySystemSettings.maintenance.system_updates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Last Backup:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(dummySystemSettings.maintenance.last_backup).toLocaleString()}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Maintenance
                    </Button>
              </CardContent>
            </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardBackground>
  );
};