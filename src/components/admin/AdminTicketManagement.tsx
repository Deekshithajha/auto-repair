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

  useEffect(() => {
    fetchTickets();
    fetchEmployees();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data: ticketData, error } = await supabase
        .from('tickets')
        .select(`
          id,
          description,
          status,
          created_at,
          preferred_pickup_time,
          user_id,
          vehicle:vehicles(make, model, year, reg_no)
        `)
        .in('status', ['pending', 'approved', 'assigned', 'in_progress']);

      if (error) throw error;

      // Fetch customer profiles separately
      const ticketsWithCustomers = await Promise.all(
        (ticketData || []).map(async (ticket) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, phone')
            .eq('id', ticket.user_id)
            .single();

          return {
            ...ticket,
            customer_name: profileData?.name || 'Unknown',
            customer_phone: profileData?.phone || 'Not provided'
          };
        })
      );

      setTickets(ticketsWithCustomers);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data: employeeData, error } = await supabase
        .from('employees')
        .select('user_id')
        .eq('is_active', true);

      if (error) throw error;

      // Fetch employee profiles separately
      const employeesWithProfiles = await Promise.all(
        (employeeData || []).map(async (employee) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', employee.user_id)
            .single();

          return {
            user_id: employee.user_id,
            name: profileData?.name || 'Unknown Employee'
          };
        })
      );

      setEmployees(employeesWithProfiles);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleApprove = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: 'approved' })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ticket approved successfully",
      });

      fetchTickets();
    } catch (error) {
      console.error('Error approving ticket:', error);
      toast({
        title: "Error",
        description: "Failed to approve ticket",
        variant: "destructive",
      });
    }
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

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'declined'
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ticket declined",
      });

      fetchTickets();
    } catch (error) {
      console.error('Error declining ticket:', error);
      toast({
        title: "Error",
        description: "Failed to decline ticket",
        variant: "destructive",
      });
    }
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

    try {
      // Create assignment
      const { error: assignError } = await supabase
        .from('ticket_assignments')
        .insert({
          ticket_id: ticketId,
          employee_id: employeeId,
          admin_id: user?.id,
          is_auto_assigned: false
        });

      if (assignError) throw assignError;

      // Update ticket status
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'assigned' })
        .eq('id', ticketId);

      if (updateError) throw updateError;

      // Create work session
      const { error: workSessionError } = await supabase
        .from('work_sessions')
        .insert({
          ticket_id: ticketId,
          employee_id: employeeId,
          status: 'not_started'
        });

      if (workSessionError) throw workSessionError;

      toast({
        title: "Success",
        description: "Ticket assigned successfully",
      });

      fetchTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      });
    }
  };

  const handleAutoAssign = async (ticketId: string) => {
    try {
      const { data, error } = await supabase.rpc('auto_assign_employee', {
        ticket_id_param: ticketId
      });

      if (error) throw error;

      if (data) {
        // Create work session for auto-assigned employee
        const { error: workSessionError } = await supabase
          .from('work_sessions')
          .insert({
            ticket_id: ticketId,
            employee_id: data,
            status: 'not_started'
          });

        if (workSessionError) console.warn('Work session creation failed:', workSessionError);

        toast({
          title: "Success",
          description: "Ticket auto-assigned successfully",
        });
        fetchTickets();
      } else {
        toast({
          title: "Warning",
          description: "No available employees for auto-assignment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error auto-assigning ticket:', error);
      toast({
        title: "Error",
        description: "Failed to auto-assign ticket",
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