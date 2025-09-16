import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  description: string;
  status: string;
  created_at: string;
  preferred_pickup_time: string;
  user_id: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    reg_no: string;
  };
  customer_name: string;
  customer_phone: string;
}

interface Employee {
  user_id: string;
  name: string;
}

export const AdminTicketManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Record<string, string>>({});
  const [declineReason, setDeclineReason] = useState<Record<string, string>>({});

  // Dummy data for demonstration
  const dummyTickets: Ticket[] = [
    {
      id: 'TICKET-001',
      description: 'Engine making strange noise, needs diagnostic check. Car has been running rough for the past week.',
      status: 'pending',
      created_at: '2024-01-16T10:30:00Z',
      preferred_pickup_time: '2024-01-17T16:00:00Z',
      user_id: 'user-1',
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        reg_no: 'ABC-1234'
      },
      customer_name: 'John Smith',
      customer_phone: '(555) 123-4567'
    },
    {
      id: 'TICKET-002',
      description: 'Air conditioning not working properly. Blowing warm air instead of cold.',
      status: 'approved',
      created_at: '2024-01-16T09:15:00Z',
      preferred_pickup_time: '2024-01-18T14:00:00Z',
      user_id: 'user-2',
      vehicle: {
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        reg_no: 'XYZ-5678'
      },
      customer_name: 'Sarah Johnson',
      customer_phone: '(555) 234-5678'
    },
    {
      id: 'TICKET-003',
      description: 'Oil change and brake pad replacement. Regular maintenance service.',
      status: 'assigned',
      created_at: '2024-01-15T14:20:00Z',
      preferred_pickup_time: '2024-01-16T17:00:00Z',
      user_id: 'user-3',
      vehicle: {
        make: 'Ford',
        model: 'Focus',
        year: 2021,
        reg_no: 'DEF-9012'
      },
      customer_name: 'Mike Davis',
      customer_phone: '(555) 345-6789'
    },
    {
      id: 'TICKET-004',
      description: 'Transmission slipping, especially when shifting gears. Needs immediate attention.',
      status: 'in_progress',
      created_at: '2024-01-15T11:45:00Z',
      preferred_pickup_time: '2024-01-17T12:00:00Z',
      user_id: 'user-4',
      vehicle: {
        make: 'Chevrolet',
        model: 'Malibu',
        year: 2018,
        reg_no: 'GHI-3456'
      },
      customer_name: 'Emily Wilson',
      customer_phone: '(555) 456-7890'
    },
    {
      id: 'TICKET-005',
      description: 'Brake pads worn out, squeaking noise when braking. Safety concern.',
      status: 'pending',
      created_at: '2024-01-16T08:00:00Z',
      preferred_pickup_time: '2024-01-18T10:00:00Z',
      user_id: 'user-5',
      vehicle: {
        make: 'Nissan',
        model: 'Altima',
        year: 2022,
        reg_no: 'JKL-7890'
      },
      customer_name: 'David Brown',
      customer_phone: '(555) 567-8901'
    }
  ];

  const dummyEmployees: Employee[] = [
    {
      user_id: 'emp-1',
      name: 'John Smith'
    },
    {
      user_id: 'emp-2',
      name: 'Sarah Johnson'
    },
    {
      user_id: 'emp-3',
      name: 'Mike Davis'
    },
    {
      user_id: 'emp-4',
      name: 'Lisa Anderson'
    }
  ];

  useEffect(() => {
    // Use dummy data instead of fetching from database
    setTickets(dummyTickets);
    setEmployees(dummyEmployees);
    setLoading(false);
  }, []);

  const fetchTickets = async () => {
    // Use dummy data instead of fetching from database
    setTickets(dummyTickets);
      setLoading(false);
  };

  const fetchEmployees = async () => {
    // Use dummy data instead of fetching from database
    setEmployees(dummyEmployees);
  };

  const handleApprove = async (ticketId: string) => {
    // Update dummy data instead of database
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: 'approved' }
        : ticket
    ));

      toast({
        title: "Success",
        description: "Ticket approved successfully",
      });
  };

  const handleDecline = async (ticketId: string) => {
    if (!declineReason[ticketId]) {
      toast({
        title: "Error",
        description: "Please provide a reason for declining",
        variant: "destructive",
      });
      return;
    }

    // Update dummy data instead of database
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: 'declined' }
        : ticket
    ));

      toast({
        title: "Success",
        description: "Ticket declined",
      });
  };

  const handleAssign = async (ticketId: string) => {
    const employeeId = selectedEmployee[ticketId];
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }

    // Update dummy data instead of database
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: 'assigned' }
        : ticket
    ));

      toast({
        title: "Success",
        description: "Ticket assigned successfully",
      });
  };

  const handleAutoAssign = async (ticketId: string) => {
    // Simulate auto-assignment with dummy data
    const availableEmployees = dummyEmployees;
    if (availableEmployees.length > 0) {
      // Update dummy data instead of database
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: 'assigned' }
          : ticket
      ));

        toast({
          title: "Success",
          description: "Ticket auto-assigned successfully",
        });
      } else {
        toast({
          title: "Warning",
          description: "No available employees for auto-assignment",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'assigned': return 'bg-blue-500';
      case 'in_progress': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="grid gap-4 md:gap-6">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No tickets requiring admin action</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="w-full">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base sm:text-lg">
                      {ticket.vehicle.year} {ticket.vehicle.make} {ticket.vehicle.model}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Reg: {ticket.vehicle.reg_no} • Customer: {ticket.customer_name}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(ticket.status)} text-white text-xs px-2 py-1`}>
                    {ticket.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Issue:</strong> {ticket.description}
                  </div>
                  <div>
                    <strong>Preferred Pickup:</strong>{' '}
                    {ticket.preferred_pickup_time 
                      ? new Date(ticket.preferred_pickup_time).toLocaleString()
                      : 'Not specified'}
                  </div>
                  <div>
                    <strong>Customer Phone:</strong> {ticket.customer_phone}
                  </div>
                  <div>
                    <strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}
                  </div>
                </div>

                {ticket.status === 'pending' && (
                  <div className="flex flex-col space-y-3 pt-4 border-t">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => handleApprove(ticket.id)}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        size="sm"
                      >
                        ✅ Approve
                      </Button>
                      <Button 
                        onClick={() => handleDecline(ticket.id)}
                        variant="destructive"
                        className="flex-1"
                        size="sm"
                      >
                        ❌ Decline
                      </Button>
                    </div>
                    
                    <Textarea
                      placeholder="Reason for declining (required if declining)"
                      value={declineReason[ticket.id] || ''}
                      onChange={(e) => 
                        setDeclineReason(prev => ({ ...prev, [ticket.id]: e.target.value }))
                      }
                      className="text-sm"
                    />
                  </div>
                )}

                {ticket.status === 'approved' && (
                  <div className="flex flex-col space-y-3 pt-4 border-t">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={selectedEmployee[ticket.id] || ''}
                        onValueChange={(value) => 
                          setSelectedEmployee(prev => ({ ...prev, [ticket.id]: value }))
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.user_id} value={employee.user_id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        onClick={() => handleAssign(ticket.id)}
                        className="bg-blue-600 hover:blue-700 text-white sm:w-auto w-full"
                        size="sm"
                      >
                        👤 Assign
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={() => handleAutoAssign(ticket.id)}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      🤖 Auto-Assign
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};