import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/ui/status-badge';
import { CreateTicketDialog } from '@/components/tickets/CreateTicketDialog';
import { toast } from '@/hooks/use-toast';
import DashboardBackground from '@/components/layout/DashboardBackground';

interface Ticket {
  id: string;
  status: string;
  description: string;
  created_at: string;
  vehicles: {
    make: string;
    model: string;
    year: number;
  };
}

interface VehicleStatus {
  id: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    reg_no: string;
    color: string;
    mileage: number;
  };
  current_ticket: {
    id: string;
    description: string;
    status: string;
    progress_percentage: number;
    estimated_completion: string;
    assigned_mechanic: string;
    work_stages: {
      stage: string;
      status: 'completed' | 'in_progress' | 'pending';
      completed_at?: string;
    }[];
  };
  service_history: {
    date: string;
    service: string;
    cost: number;
    status: string;
  }[];
}

interface UserDashboardProps {
  activeTab?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ activeTab = 'tickets' }) => {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  // Dummy data for demonstration
  const dummyTickets: Ticket[] = [
    {
      id: '1',
      status: 'in_progress',
      description: 'Engine making strange noise, needs diagnostic check. Car has been running rough for the past week.',
      created_at: '2024-01-15T10:30:00Z',
      vehicles: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020
      }
    },
    {
      id: '2',
      status: 'completed',
      description: 'Oil change and brake pad replacement. Regular maintenance service.',
      created_at: '2024-01-10T14:20:00Z',
      vehicles: {
        make: 'Honda',
        model: 'Civic',
        year: 2019
      }
    },
    {
      id: '3',
      status: 'pending',
      description: 'Air conditioning not working properly. Blowing warm air instead of cold.',
      created_at: '2024-01-12T09:15:00Z',
      vehicles: {
        make: 'Ford',
        model: 'Focus',
        year: 2021
      }
    }
  ];

  const dummyInvoices = [
    {
      id: 'INV-001',
      date: '2024-01-10',
      amount: 245.50,
      status: 'paid',
      description: 'Oil change and brake pad replacement',
      vehicle: '2020 Toyota Camry'
    },
    {
      id: 'INV-002',
      date: '2023-12-15',
      amount: 180.00,
      status: 'paid',
      description: 'Tire rotation and alignment',
      vehicle: '2019 Honda Civic'
    },
    {
      id: 'INV-003',
      date: '2023-11-20',
      amount: 320.75,
      status: 'paid',
      description: 'Transmission fluid change and filter replacement',
      vehicle: '2021 Ford Focus'
    }
  ];

  const dummyNotifications = [
    {
      id: '1',
      title: 'Repair Update',
      message: 'Your Toyota Camry diagnostic is complete. Engine issue identified - needs spark plug replacement.',
      date: '2024-01-16T08:30:00Z',
      type: 'info'
    },
    {
      id: '2',
      title: 'Service Reminder',
      message: 'Your Honda Civic is due for its next oil change in 500 miles.',
      date: '2024-01-14T10:00:00Z',
      type: 'reminder'
    },
    {
      id: '3',
      title: 'Payment Confirmation',
      message: 'Payment of $245.50 for invoice INV-001 has been processed successfully.',
      date: '2024-01-10T15:45:00Z',
      type: 'success'
    }
  ];

  const dummyVehicleStatus: VehicleStatus[] = [
    {
      id: 'vs-1',
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        reg_no: 'ABC-1234',
        color: 'Silver',
        mileage: 45000
      },
      current_ticket: {
        id: 'TICKET-001',
        description: 'Engine making strange noise, needs diagnostic check',
        status: 'in_progress',
        progress_percentage: 75,
        estimated_completion: '2024-01-18T16:00:00Z',
        assigned_mechanic: 'Mike Johnson',
        work_stages: [
          { stage: 'Initial Inspection', status: 'completed', completed_at: '2024-01-16T09:00:00Z' },
          { stage: 'Engine Diagnostic', status: 'completed', completed_at: '2024-01-16T11:30:00Z' },
          { stage: 'Parts Ordering', status: 'completed', completed_at: '2024-01-16T14:00:00Z' },
          { stage: 'Spark Plug Replacement', status: 'in_progress' },
          { stage: 'Final Testing', status: 'pending' },
          { stage: 'Quality Check', status: 'pending' }
        ]
      },
      service_history: [
        { date: '2024-01-10', service: 'Oil Change & Filter', cost: 45.00, status: 'completed' },
        { date: '2023-12-15', service: 'Brake Pad Replacement', cost: 120.00, status: 'completed' },
        { date: '2023-11-20', service: 'Tire Rotation', cost: 25.00, status: 'completed' }
      ]
    },
    {
      id: 'vs-2',
      vehicle: {
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        reg_no: 'XYZ-5678',
        color: 'Blue',
        mileage: 52000
      },
      current_ticket: {
        id: 'TICKET-002',
        description: 'AC not blowing cold air properly',
        status: 'completed',
        progress_percentage: 100,
        estimated_completion: '2024-01-15T15:30:00Z',
        assigned_mechanic: 'Sarah Wilson',
        work_stages: [
          { stage: 'AC System Inspection', status: 'completed', completed_at: '2024-01-15T09:00:00Z' },
          { stage: 'Refrigerant Leak Test', status: 'completed', completed_at: '2024-01-15T10:30:00Z' },
          { stage: 'Compressor Replacement', status: 'completed', completed_at: '2024-01-15T13:00:00Z' },
          { stage: 'System Recharge', status: 'completed', completed_at: '2024-01-15T14:30:00Z' },
          { stage: 'Final Testing', status: 'completed', completed_at: '2024-01-15T15:00:00Z' },
          { stage: 'Quality Check', status: 'completed', completed_at: '2024-01-15T15:30:00Z' }
        ]
      },
      service_history: [
        { date: '2024-01-15', service: 'AC System Repair', cost: 285.50, status: 'completed' },
        { date: '2023-12-10', service: 'Transmission Service', cost: 180.00, status: 'completed' },
        { date: '2023-10-25', service: 'Battery Replacement', cost: 95.00, status: 'completed' }
      ]
    },
    {
      id: 'vs-3',
      vehicle: {
        make: 'Ford',
        model: 'Focus',
        year: 2021,
        reg_no: 'DEF-9012',
        color: 'White',
        mileage: 32000
      },
      current_ticket: {
        id: 'TICKET-003',
        description: 'Brake squeaking and oil change needed',
        status: 'pending',
        progress_percentage: 0,
        estimated_completion: '2024-01-20T12:00:00Z',
        assigned_mechanic: 'Pending Assignment',
        work_stages: [
          { stage: 'Initial Inspection', status: 'pending' },
          { stage: 'Brake System Check', status: 'pending' },
          { stage: 'Oil Change Service', status: 'pending' },
          { stage: 'Brake Pad Replacement', status: 'pending' },
          { stage: 'Final Testing', status: 'pending' },
          { stage: 'Quality Check', status: 'pending' }
        ]
      },
      service_history: [
        { date: '2023-11-15', service: 'Regular Maintenance', cost: 85.00, status: 'completed' },
        { date: '2023-08-20', service: 'Wheel Alignment', cost: 75.00, status: 'completed' }
      ]
    }
  ];

  useEffect(() => {
    // Use dummy data instead of fetching from database
    setTickets(dummyTickets);
    setLoading(false);
  }, []);

  const fetchTickets = async () => {
    // Keep the function for future use but use dummy data for now
    setTickets(dummyTickets);
    setLoading(false);
  };

  const handleTicketCreated = () => {
    fetchTickets();
    setShowCreateTicket(false);
  };

  return (
    <DashboardBackground>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} className="w-full">
          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">My Tickets</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Track your repair requests</p>
              </div>
              <Button 
                onClick={() => setShowCreateTicket(true)}
                className="bg-gradient-primary w-full sm:w-auto"
              >
                <span className="mr-2">➕</span>
                <span className="hidden sm:inline">Raise Ticket</span>
                <span className="sm:hidden">Raise</span>
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold mb-2">No repair tickets yet</h3>
                  <p className="text-muted-foreground mb-6">Create your first ticket to get started</p>
                  <Button 
                    onClick={() => setShowCreateTicket(true)}
                    className="bg-gradient-primary"
                  >
                    <span className="mr-2">➕</span>
                    Create First Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="hover:shadow-elegant transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {ticket.vehicles.year} {ticket.vehicles.make} {ticket.vehicles.model}
                        </CardTitle>
                        <StatusBadge status={ticket.status as any} />
                      </div>
                      <CardDescription className="flex items-center text-xs">
                        <span className="mr-1">📅</span>
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {ticket.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Vehicle Status Tab */}
          <TabsContent value="vehicles">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">My Vehicle Status</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Track the progress of your vehicle repairs</p>
              </div>

              <div className="grid gap-6">
                {dummyVehicleStatus.map((vehicleStatus) => (
                  <Card key={vehicleStatus.id} className="hover:shadow-elegant transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg sm:text-xl">
                            {vehicleStatus.vehicle.year} {vehicleStatus.vehicle.make} {vehicleStatus.vehicle.model}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span>Reg: {vehicleStatus.vehicle.reg_no}</span>
                            <span>•</span>
                            <span>{vehicleStatus.vehicle.color}</span>
                            <span>•</span>
                            <span>{vehicleStatus.vehicle.mileage.toLocaleString()} miles</span>
                          </CardDescription>
                        </div>
                        <Badge variant={
                          vehicleStatus.current_ticket.status === 'completed' ? 'default' :
                          vehicleStatus.current_ticket.status === 'in_progress' ? 'secondary' : 'outline'
                        }>
                          {vehicleStatus.current_ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Current Ticket Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm">Current Repair Progress</h3>
                          <span className="text-sm font-medium">{vehicleStatus.current_ticket.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${vehicleStatus.current_ticket.progress_percentage}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Ticket ID:</span>
                            <span className="text-muted-foreground ml-2">{vehicleStatus.current_ticket.id}</span>
                          </div>
                          <div>
                            <span className="font-medium">Assigned Mechanic:</span>
                            <span className="text-muted-foreground ml-2">{vehicleStatus.current_ticket.assigned_mechanic}</span>
                          </div>
                          <div>
                            <span className="font-medium">Estimated Completion:</span>
                            <span className="text-muted-foreground ml-2">
                              {new Date(vehicleStatus.current_ticket.estimated_completion).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Description:</span>
                            <span className="text-muted-foreground ml-2">{vehicleStatus.current_ticket.description}</span>
                          </div>
                        </div>
                      </div>

                      {/* Work Stages */}
                      <div>
                        <h3 className="font-semibold text-sm mb-3">Work Stages</h3>
                        <div className="space-y-2">
                          {vehicleStatus.current_ticket.work_stages.map((stage, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                stage.status === 'completed' ? 'bg-green-500 text-white' :
                                stage.status === 'in_progress' ? 'bg-blue-500 text-white' :
                                'bg-gray-300 text-gray-600'
                              }`}>
                                {stage.status === 'completed' ? '✓' :
                                 stage.status === 'in_progress' ? '⏳' : index + 1}
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium">{stage.stage}</span>
                                {stage.completed_at && (
                                  <p className="text-xs text-muted-foreground">
                                    Completed: {new Date(stage.completed_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <Badge variant={
                                stage.status === 'completed' ? 'default' :
                                stage.status === 'in_progress' ? 'secondary' : 'outline'
                              } className="text-xs">
                                {stage.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Service History */}
                      <div>
                        <h3 className="font-semibold text-sm mb-3">Recent Service History</h3>
                        <div className="space-y-2">
                          {vehicleStatus.service_history.slice(0, 3).map((service, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                              <div>
                                <span className="text-sm font-medium">{service.service}</span>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(service.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-medium">${service.cost.toFixed(2)}</span>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {service.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Invoices</h2>
                <p className="text-muted-foreground text-sm sm:text-base">View your repair invoices</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dummyInvoices.map((invoice) => (
                  <Card key={invoice.id} className="hover:shadow-elegant transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{invoice.id}</CardTitle>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center text-xs">
                        <span className="mr-1">📅</span>
                        {new Date(invoice.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{invoice.vehicle}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {invoice.description}
                        </p>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-lg font-bold text-green-600">
                            ${invoice.amount.toFixed(2)}
                          </span>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Notifications</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Stay updated on your repairs</p>
              </div>
              <div className="space-y-4">
                {dummyNotifications.map((notification) => (
                  <Card key={notification.id} className="hover:shadow-elegant transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {notification.type === 'info' && <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">ℹ️</div>}
                          {notification.type === 'reminder' && <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">⏰</div>}
                          {notification.type === 'success' && <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">✅</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-foreground">
                              {notification.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.date).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
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
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Profile</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Manage your account information</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Name:</span> {profile?.name}
                    </div>
                    <div>
                      <span className="font-medium">Role:</span> 
                      <Badge variant="secondary" className="ml-2 capitalize">
                        {profile?.role}
                      </Badge>
                    </div>
                    {profile?.phone && (
                      <div>
                        <span className="font-medium">Phone:</span> {profile.phone}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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