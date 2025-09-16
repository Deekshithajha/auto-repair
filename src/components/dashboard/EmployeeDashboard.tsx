import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerRegistration } from '@/components/customers/CustomerRegistration';
import { EmployeeWorkManagement } from '@/components/employee/EmployeeWorkManagement';
import DashboardBackground from '@/components/layout/DashboardBackground';

interface EmployeeDashboardProps {
  activeTab?: string;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ activeTab = 'assignments' }) => {
  const { profile } = useAuth();
  const [selectedWorkLog, setSelectedWorkLog] = useState<any>(null);
  const [showWorkLogDialog, setShowWorkLogDialog] = useState(false);

  // Dummy data for demonstration with detailed information
  const dummyWorkLog = [
    {
      id: 'wl-1',
      date: '2024-01-16T14:45:00Z',
      vehicle: '2019 Honda Civic',
      reg_no: 'XYZ-5678',
      task: 'AC System Repair',
      duration_hours: 6,
      status: 'completed',
      notes: 'Replaced AC compressor, recharged refrigerant, and verified cold air output.',
      // Detailed ticket information
      ticket_details: {
        id: 'TICKET-001',
        customer_name: 'Sarah Johnson',
        customer_phone: '(555) 987-6543',
        customer_email: 'sarah.johnson@email.com',
        problem_description: 'AC not blowing cold air. Car has been making strange noises when AC is turned on. The air coming out is warm even when set to maximum cold.',
        preferred_pickup_time: '2024-01-17T16:00:00Z',
        created_at: '2024-01-15T09:30:00Z',
        vehicle_details: {
          make: 'Honda',
          model: 'Civic',
          year: 2019,
          mileage: 45000,
          color: 'Silver',
          vin: '1HGCV1F3XKA123456'
        },
        photos: [
          'ac_compressor_damage.jpg',
          'refrigerant_leak.jpg',
          'dashboard_ac_controls.jpg'
        ],
        parts_used: [
          { name: 'AC Compressor', part_number: 'HON-AC-COMP-2019', cost: 285.50, quantity: 1 },
          { name: 'Refrigerant R134a', part_number: 'REF-R134A-12OZ', cost: 45.00, quantity: 2 },
          { name: 'AC O-Ring Kit', part_number: 'HON-ORING-AC', cost: 12.75, quantity: 1 }
        ],
        labor_cost: 180.00,
        total_cost: 524.25,
        work_started: '2024-01-16T08:30:00Z',
        work_completed: '2024-01-16T14:45:00Z',
        quality_check: 'Passed - AC blowing at 38°F, no leaks detected',
        customer_notes: 'Customer requested eco-friendly refrigerant if possible'
      }
    },
    {
      id: 'wl-2',
      date: '2024-01-15T14:30:00Z',
      vehicle: '2021 Ford Focus',
      reg_no: 'DEF-9012',
      task: 'Oil Change + Brake Pads',
      duration_hours: 5.5,
      status: 'completed',
      notes: 'Changed oil and filter; replaced front brake pads; road-tested successfully.',
      // Detailed ticket information
      ticket_details: {
        id: 'TICKET-002',
        customer_name: 'Michael Chen',
        customer_phone: '(555) 234-5678',
        customer_email: 'michael.chen@email.com',
        problem_description: 'Squeaking noise when braking, especially in the morning. Oil change is also due according to the maintenance schedule.',
        preferred_pickup_time: '2024-01-15T17:30:00Z',
        created_at: '2024-01-14T14:20:00Z',
        vehicle_details: {
          make: 'Ford',
          model: 'Focus',
          year: 2021,
          mileage: 32000,
          color: 'Blue',
          vin: '1FADP3F21ML123456'
        },
        photos: [
          'brake_pad_wear.jpg',
          'oil_dipstick.jpg',
          'brake_rotor_condition.jpg'
        ],
        parts_used: [
          { name: 'Front Brake Pads', part_number: 'FOR-BRAKE-PAD-FRONT', cost: 89.99, quantity: 1 },
          { name: 'Motor Oil 5W-30', part_number: 'OIL-5W30-5QT', cost: 32.50, quantity: 1 },
          { name: 'Oil Filter', part_number: 'FOR-OIL-FILTER-2021', cost: 8.99, quantity: 1 }
        ],
        labor_cost: 120.00,
        total_cost: 251.48,
        work_started: '2024-01-15T09:00:00Z',
        work_completed: '2024-01-15T14:30:00Z',
        quality_check: 'Passed - Brake test at 30mph shows smooth stopping, oil level optimal',
        customer_notes: 'Customer prefers synthetic oil for better engine protection'
      }
    },
    {
      id: 'wl-3',
      date: '2024-01-14T12:10:00Z',
      vehicle: '2020 Toyota Camry',
      reg_no: 'ABC-1234',
      task: 'Engine Diagnostic',
      duration_hours: 2.25,
      status: 'in_progress',
      notes: 'Preliminary checks done; likely ignition coil issue; awaiting parts.',
      // Detailed ticket information
      ticket_details: {
        id: 'TICKET-003',
        customer_name: 'Emily Rodriguez',
        customer_phone: '(555) 345-6789',
        customer_email: 'emily.rodriguez@email.com',
        problem_description: 'Engine misfiring and rough idle. Check engine light is on. Car feels like it\'s struggling to accelerate, especially uphill.',
        preferred_pickup_time: '2024-01-16T15:00:00Z',
        created_at: '2024-01-13T11:45:00Z',
        vehicle_details: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          mileage: 52000,
          color: 'White',
          vin: '4T1C11AK5LU123456'
        },
        photos: [
          'check_engine_light.jpg',
          'spark_plug_condition.jpg',
          'ignition_coil_test.jpg'
        ],
        parts_used: [
          { name: 'Ignition Coil', part_number: 'TOY-IGN-COIL-2020', cost: 156.00, quantity: 1 },
          { name: 'Spark Plugs (Set of 4)', part_number: 'TOY-SPARK-PLUG-4PK', cost: 45.00, quantity: 1 }
        ],
        labor_cost: 90.00,
        total_cost: 291.00,
        work_started: '2024-01-14T10:00:00Z',
        work_completed: null,
        quality_check: 'In Progress - Parts ordered, expected delivery tomorrow',
        customer_notes: 'Customer mentioned this started after last fuel fill-up'
      }
    }
  ];

  const handleViewDetails = (workLogEntry: any) => {
    setSelectedWorkLog(workLogEntry);
    setShowWorkLogDialog(true);
  };
  
  const dummyAttendance = [
    {
      id: '1',
      date: '2024-01-16',
      clock_in: '08:00:00',
      clock_out: '17:00:00',
      hours_worked: 9,
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-01-15',
      clock_in: '08:15:00',
      clock_out: '16:45:00',
      hours_worked: 8.5,
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-01-14',
      clock_in: '07:45:00',
      clock_out: '17:30:00',
      hours_worked: 9.75,
      status: 'completed'
    },
    {
      id: '4',
      date: '2024-01-13',
      clock_in: '08:00:00',
      clock_out: null,
      hours_worked: 0,
      status: 'in_progress'
    }
  ];

  const dummySettings = {
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    work_preferences: {
      auto_clock_in: false,
      break_reminders: true,
      task_notifications: true
    },
    display: {
      theme: 'light',
      language: 'en',
      timezone: 'EST'
    }
  };

  return (
    <DashboardBackground>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 lg:w-auto text-xs sm:text-sm">
            <TabsTrigger value="assignments" className="flex items-center space-x-1 sm:space-x-2">
              <span>📋</span>
              <span className="hidden sm:inline">My Work</span>
            </TabsTrigger>
            <TabsTrigger value="worklog" className="flex items-center space-x-1 sm:space-x-2">
              <span>📄</span>
              <span className="hidden sm:inline">Work Log</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center space-x-1 sm:space-x-2">
              <span>➕</span>
              <span className="hidden sm:inline">Register</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center space-x-1 sm:space-x-2">
              <span>⏰</span>
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-1 sm:space-x-2">
              <span>👤</span>
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-1 sm:space-x-2">
              <span>⚙️</span>
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">My Work Assignments</h2>
                <p className="text-muted-foreground text-sm sm:text-base">View assigned vehicles, start work, and track repairs</p>
              </div>
              <div>
                <Button onClick={() => setRaiseOpen(true)}>
                  Raise New Ticket
                </Button>
              </div>
            </div>

            <EmployeeWorkManagement />
          </TabsContent>

          {/* Work Log Tab */}
          <TabsContent value="worklog" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Work Log</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Your recent jobs and time spent</p>
              </div>
            </div>

            <div className="grid gap-4">
              {dummyWorkLog.map((entry) => (
                <Card key={entry.id} className="hover:shadow-elegant transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{entry.vehicle}</CardTitle>
                      <Badge variant={entry.status === 'completed' ? 'default' : 'secondary'}>
                        {entry.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center text-xs">
                      <span className="mr-1">📅</span>
                      {new Date(entry.date).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Task:</span>
                        <span className="text-muted-foreground">{entry.task}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Reg No.:</span>
                        <span className="text-muted-foreground">{entry.reg_no}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Duration:</span>
                        <span className="text-muted-foreground">{entry.duration_hours}h</span>
                      </div>
                      <div>
                        <span className="font-medium">Notes:</span>
                        <p className="text-muted-foreground mt-1">{entry.notes}</p>
                      </div>
                      <div className="pt-2 flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewDetails(entry)}
                        >
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">Export</Button>
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

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Attendance</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">Clock in/out and view your attendance history</p>
                </div>
                <div className="flex space-x-2">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <span className="mr-2">🟢</span>
                    Clock In
                  </Button>
                  <Button variant="outline">
                    <span className="mr-2">🔴</span>
                    Clock Out
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {dummyAttendance.map((record) => (
                  <Card key={record.id} className="hover:shadow-elegant transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {record.status === 'completed' ? (
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">✅</div>
                            ) : (
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">⏰</div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">
                              {new Date(record.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Clock In: {record.clock_in} {record.clock_out && `• Clock Out: ${record.clock_out}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {record.hours_worked > 0 ? `${record.hours_worked}h` : 'In Progress'}
                          </div>
                          <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </div>
                </div>
              </CardContent>
            </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Employee Profile</CardTitle>
                <CardDescription>Manage your employee information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Name:</span> {profile?.name}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {profile?.role}
                  </div>
                  {profile?.employee_id && (
                    <div>
                      <span className="font-medium">Employee ID:</span> {profile.employee_id}
                    </div>
                  )}
                  {profile?.phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {profile.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Settings</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Employee preferences and settings</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Notifications Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage your notification preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Badge variant={dummySettings.notifications.email ? 'default' : 'secondary'}>
                        {dummySettings.notifications.email ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">SMS Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive updates via SMS</p>
                      </div>
                      <Badge variant={dummySettings.notifications.sms ? 'default' : 'secondary'}>
                        {dummySettings.notifications.sms ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Push Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive push notifications</p>
                      </div>
                      <Badge variant={dummySettings.notifications.push ? 'default' : 'secondary'}>
                        {dummySettings.notifications.push ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Notifications
                    </Button>
                  </CardContent>
                </Card>

                {/* Work Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Work Preferences</CardTitle>
                    <CardDescription>Configure your work environment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Auto Clock In</p>
                        <p className="text-xs text-muted-foreground">Automatically clock in when arriving</p>
                      </div>
                      <Badge variant={dummySettings.work_preferences.auto_clock_in ? 'default' : 'secondary'}>
                        {dummySettings.work_preferences.auto_clock_in ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Break Reminders</p>
                        <p className="text-xs text-muted-foreground">Remind me to take breaks</p>
                      </div>
                      <Badge variant={dummySettings.work_preferences.break_reminders ? 'default' : 'secondary'}>
                        {dummySettings.work_preferences.break_reminders ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Task Notifications</p>
                        <p className="text-xs text-muted-foreground">Get notified about new tasks</p>
                      </div>
                      <Badge variant={dummySettings.work_preferences.task_notifications ? 'default' : 'secondary'}>
                        {dummySettings.work_preferences.task_notifications ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Preferences
                    </Button>
                  </CardContent>
                </Card>

                {/* Display Settings */}
            <Card>
              <CardHeader>
                    <CardTitle>Display Settings</CardTitle>
                    <CardDescription>Customize your interface</CardDescription>
              </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Theme</p>
                        <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {dummySettings.display.theme}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Language</p>
                        <p className="text-xs text-muted-foreground">Interface language</p>
                      </div>
                      <Badge variant="outline">
                        {dummySettings.display.language.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Timezone</p>
                        <p className="text-xs text-muted-foreground">Your local timezone</p>
                      </div>
                      <Badge variant="outline">
                        {dummySettings.display.timezone}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Display
                    </Button>
              </CardContent>
            </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Work Log Details Dialog */}
      <Dialog open={showWorkLogDialog} onOpenChange={setShowWorkLogDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Work Log Details</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Complete ticket information and work details
            </DialogDescription>
          </DialogHeader>

          {selectedWorkLog && (
            <div className="space-y-6">
              {/* Work Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Work Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-sm">Vehicle:</span>
                      <p className="text-sm text-muted-foreground">{selectedWorkLog.vehicle}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Registration:</span>
                      <p className="text-sm text-muted-foreground">{selectedWorkLog.reg_no}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Task:</span>
                      <p className="text-sm text-muted-foreground">{selectedWorkLog.task}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Duration:</span>
                      <p className="text-sm text-muted-foreground">{selectedWorkLog.duration_hours} hours</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Status:</span>
                      <Badge variant={selectedWorkLog.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {selectedWorkLog.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Date:</span>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedWorkLog.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-sm">Work Notes:</span>
                    <p className="text-sm text-muted-foreground mt-1">{selectedWorkLog.notes}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-sm">Name:</span>
                      <p className="text-sm text-muted-foreground">{selectedWorkLog.ticket_details.customer_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Phone:</span>
                      <p className="text-sm text-muted-foreground">{selectedWorkLog.ticket_details.customer_phone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Email:</span>
                      <p className="text-sm text-muted-foreground">{selectedWorkLog.ticket_details.customer_email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Ticket ID:</span>
                      <p className="text-sm text-muted-foreground font-mono">{selectedWorkLog.ticket_details.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-sm">Make/Model:</span>
                      <p className="text-sm text-muted-foreground">
                        {selectedWorkLog.ticket_details.vehicle_details.make} {selectedWorkLog.ticket_details.vehicle_details.model}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Year:</span>
                      <p className="text-sm text-muted-foreground">{selectedWorkLog.ticket_details.vehicle_details.year}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Mileage:</span>
                      <p className="text-sm text-muted-foreground">{selectedWorkLog.ticket_details.vehicle_details.mileage.toLocaleString()} miles</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Color:</span>
                      <p className="text-sm text-muted-foreground">{selectedWorkLog.ticket_details.vehicle_details.color}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-medium text-sm">VIN:</span>
                      <p className="text-sm text-muted-foreground font-mono">{selectedWorkLog.ticket_details.vehicle_details.vin}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Problem Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Problem Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{selectedWorkLog.ticket_details.problem_description}</p>
                </CardContent>
              </Card>

              {/* Parts Used */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Parts Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedWorkLog.ticket_details.parts_used.map((part: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{part.name}</p>
                          <p className="text-xs text-muted-foreground">Part #: {part.part_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${part.cost.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Qty: {part.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Parts Cost:</span>
                    <span className="text-sm font-medium">
                      ${selectedWorkLog.ticket_details.parts_used.reduce((sum: number, part: any) => sum + (part.cost * part.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Labor Cost:</span>
                    <span className="text-sm font-medium">${selectedWorkLog.ticket_details.labor_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Cost:</span>
                    <span className="font-bold text-lg">${selectedWorkLog.ticket_details.total_cost.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Work Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Work Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-sm">Ticket Created:</span>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedWorkLog.ticket_details.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Work Started:</span>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedWorkLog.ticket_details.work_started).toLocaleString()}
                      </p>
                    </div>
                    {selectedWorkLog.ticket_details.work_completed && (
                      <div>
                        <span className="font-medium text-sm">Work Completed:</span>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedWorkLog.ticket_details.work_completed).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-sm">Preferred Pickup:</span>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedWorkLog.ticket_details.preferred_pickup_time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Check & Customer Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Quality Check</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedWorkLog.ticket_details.quality_check}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base sm:text-lg">Customer Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedWorkLog.ticket_details.customer_notes}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Photos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Damage Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedWorkLog.ticket_details.photos.map((photo: string, index: number) => (
                      <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">📸 {photo}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
    </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardBackground>
  );
};