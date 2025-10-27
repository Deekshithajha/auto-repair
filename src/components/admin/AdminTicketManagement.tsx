import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  ticket_number: string;
  description: string;
  status: 'pending' | 'approved' | 'declined' | 'assigned' | 'in_progress' | 'ready_for_pickup' | 'completed';
  created_at: string;
  preferred_pickup_time: string;
  user_id: string;
  vehicle_id: string;
  primary_mechanic_id?: string;
  secondary_mechanic_id?: string;
  vehicles: {
    make: string;
    model: string;
    year: number;
    reg_no: string;
  };
  profiles: {
    name: string;
    phone: string;
  };
  primary_mechanic?: {
    name: string;
  };
  secondary_mechanic?: {
    name: string;
  };
}

interface Employee {
  user_id: string;
  name: string;
  employee_id: string;
}

export const AdminTicketManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryMechanic, setPrimaryMechanic] = useState<Record<string, string>>({});
  const [secondaryMechanic, setSecondaryMechanic] = useState<Record<string, string>>({});
  const [declineReason, setDeclineReason] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTickets();
    fetchEmployees();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          vehicles!inner (
            make,
            model,
            year,
            reg_no
          )
        `)
        .in('status', ['pending', 'approved'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data manually
      const ticketsWithData = await Promise.all(
        (data || []).map(async (ticket) => {
          // Get customer profile
          const { data: customerProfile } = await supabase
            .from('profiles')
            .select('name, phone')
            .eq('id', ticket.user_id)
            .single();

          // Get primary mechanic if exists
          let primaryMechanic = null;
          if (ticket.primary_mechanic_id) {
            const { data: primProf } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', ticket.primary_mechanic_id)
              .single();
            primaryMechanic = primProf;
          }

          // Get secondary mechanic if exists
          let secondaryMechanic = null;
          if (ticket.secondary_mechanic_id) {
            const { data: secProf } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', ticket.secondary_mechanic_id)
              .single();
            secondaryMechanic = secProf;
          }

          return {
            ...ticket,
            profiles: customerProfile || { name: 'Unknown', phone: 'N/A' },
            primary_mechanic: primaryMechanic,
            secondary_mechanic: secondaryMechanic
          };
        })
      );

      setTickets(ticketsWithData as any);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data: employeeData, error } = await supabase
        .from('employees')
        .select('user_id, employee_id')
        .eq('is_active', true)
        .eq('employment_status', 'active');

      if (error) throw error;

      // Fetch profiles for employees
      const employeesWithNames = await Promise.all(
        (employeeData || []).map(async (emp) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', emp.user_id)
            .single();

          return {
            user_id: emp.user_id,
            employee_id: emp.employee_id,
            name: profile?.name || 'Unknown'
          };
        })
      );

      setEmployees(employeesWithNames);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleApprove = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ticket approved successfully"
      });

      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve ticket",
        variant: "destructive"
      });
    }
  };

  const handleDecline = async (ticketId: string) => {
    if (!declineReason[ticketId]) {
      toast({
        title: "Error",
        description: "Please provide a reason for declining",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      // Create notification for customer
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: ticket.user_id,
            type: 'ticket_declined' as any,
            title: 'Ticket Declined',
            message: `Your ticket has been declined. Reason: ${declineReason[ticketId]}`,
            metadata: { ticket_id: ticketId, reason: declineReason[ticketId] }
          });
      }

      toast({
        title: "Success",
        description: "Ticket declined"
      });

      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to decline ticket",
        variant: "destructive"
      });
    }
  };

  const handleAssign = async (ticketId: string) => {
    const primaryId = primaryMechanic[ticketId];
    if (!primaryId) {
      toast({
        title: "Error",
        description: "Please select a primary mechanic",
        variant: "destructive"
      });
      return;
    }

    try {
      const secondaryId = secondaryMechanic[ticketId] || null;

      // Update ticket with mechanics
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({
          primary_mechanic_id: primaryId,
          secondary_mechanic_id: secondaryId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (ticketError) throw ticketError;

      // Create ticket assignment records
      const assignments = [
        {
          ticket_id: ticketId,
          employee_id: primaryId,
          admin_id: user?.id,
          is_auto_assigned: false
        }
      ];

      if (secondaryId) {
        assignments.push({
          ticket_id: ticketId,
          employee_id: secondaryId,
          admin_id: user?.id,
          is_auto_assigned: false
        });
      }

      const { error: assignError } = await supabase
        .from('ticket_assignments')
        .insert(assignments);

      if (assignError) throw assignError;

      // Create notifications for mechanics
      const notifications: any[] = [
        {
          user_id: primaryId,
          type: 'ticket_assigned' as any,
          title: 'New Ticket Assigned',
          message: 'You have been assigned as the primary mechanic for a new ticket.',
          metadata: { ticket_id: ticketId, role: 'primary' }
        }
      ];

      if (secondaryId) {
        notifications.push({
          user_id: secondaryId,
          type: 'ticket_assigned' as any,
          title: 'New Ticket Assigned',
          message: 'You have been assigned as the secondary mechanic for a new ticket.',
          metadata: { ticket_id: ticketId, role: 'secondary' }
        });
      }

      await supabase.from('notifications').insert(notifications);

      toast({
        title: "Success",
        description: "Ticket assigned successfully"
      });

      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign ticket",
        variant: "destructive"
      });
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
                      {ticket.vehicles.year} {ticket.vehicles.make} {ticket.vehicles.model}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {ticket.ticket_number} • Reg: {ticket.vehicles.reg_no} • Customer: {ticket.profiles.name}
                    </CardDescription>
                  </div>
                  <StatusBadge status={ticket.status} />
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
                    <strong>Customer Phone:</strong> {ticket.profiles.phone}
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
                        className="flex-1"
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
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm">Primary Mechanic (Required)</Label>
                        <Select
                          value={primaryMechanic[ticket.id] || ''}
                          onValueChange={(value) => 
                            setPrimaryMechanic(prev => ({ ...prev, [ticket.id]: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Primary Mechanic" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((employee) => (
                              <SelectItem key={employee.user_id} value={employee.user_id}>
                                {employee.name} ({employee.employee_id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Secondary Mechanic (Optional)</Label>
                        <Select
                          value={secondaryMechanic[ticket.id] || ''}
                          onValueChange={(value) => 
                            setSecondaryMechanic(prev => ({ ...prev, [ticket.id]: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Secondary Mechanic (Optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {employees
                              .filter(emp => emp.user_id !== primaryMechanic[ticket.id])
                              .map((employee) => (
                                <SelectItem key={employee.user_id} value={employee.user_id}>
                                  {employee.name} ({employee.employee_id})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleAssign(ticket.id)}
                      className="w-full"
                      size="sm"
                    >
                      👤 Assign Mechanics
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
