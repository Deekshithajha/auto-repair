import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  
  // Dummy data for demonstration
  const dummyTickets: Ticket[] = [
    {
      id: 'tkt-11111111-1111-1111-1111-111111111111',
      ticket_number: 'WO-001',
      description: 'Engine making strange noise, needs diagnostic check. Car has been running rough for the past week.',
      status: 'in_progress',
      created_at: '2024-01-15T10:30:00Z',
      preferred_pickup_time: '2024-01-18T16:00:00Z',
      user_id: '11111111-1111-1111-1111-111111111111',
      vehicle_id: 'veh-11111111-1111-1111-1111-111111111111',
      primary_mechanic_id: '66666666-6666-6666-6666-666666666666',
      secondary_mechanic_id: '77777777-7777-7777-7777-777777777777',
      vehicles: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        reg_no: 'ABC-1234'
      },
      profiles: {
        name: 'John Smith',
        phone: '(555) 123-4567'
      },
      primary_mechanic: {
        name: 'Alex Rodriguez'
      },
      secondary_mechanic: {
        name: 'Lisa Chen'
      }
    },
    {
      id: 'tkt-22222222-2222-2222-2222-222222222222',
      ticket_number: 'WO-002',
      description: 'AC not blowing cold air properly. System needs inspection and repair.',
      status: 'completed',
      created_at: '2024-01-12T09:15:00Z',
      preferred_pickup_time: '2024-01-15T15:30:00Z',
      user_id: '22222222-2222-2222-2222-222222222222',
      vehicle_id: 'veh-22222222-2222-2222-2222-222222222222',
      primary_mechanic_id: '77777777-7777-7777-7777-777777777777',
      secondary_mechanic_id: '88888888-8888-8888-8888-888888888888',
      vehicles: {
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        reg_no: 'XYZ-5678'
      },
      profiles: {
        name: 'Sarah Johnson',
        phone: '(555) 234-5678'
      },
      primary_mechanic: {
        name: 'Lisa Chen'
      },
      secondary_mechanic: {
        name: 'Tom Wilson'
      }
    },
    {
      id: 'tkt-33333333-3333-3333-3333-333333333333',
      ticket_number: 'WO-003',
      description: 'Brake squeaking and oil change needed. Regular maintenance service.',
      status: 'pending',
      created_at: '2024-01-14T14:20:00Z',
      preferred_pickup_time: '2024-01-20T12:00:00Z',
      user_id: '33333333-3333-3333-3333-333333333333',
      vehicle_id: 'veh-33333333-3333-3333-3333-333333333333',
      vehicles: {
        make: 'Ford',
        model: 'Focus',
        year: 2021,
        reg_no: 'DEF-9012'
      },
      profiles: {
        name: 'Mike Davis',
        phone: '(555) 345-6789'
      }
    },
    {
      id: 'tkt-44444444-4444-4444-4444-444444444444',
      ticket_number: 'WO-004',
      description: 'Transmission issues - car jerks when shifting gears. Needs diagnostic.',
      status: 'approved',
      created_at: '2024-01-16T11:45:00Z',
      preferred_pickup_time: '2024-01-22T10:00:00Z',
      user_id: '44444444-4444-4444-4444-444444444444',
      vehicle_id: 'veh-44444444-4444-4444-4444-444444444444',
      vehicles: {
        make: 'BMW',
        model: 'X5',
        year: 2022,
        reg_no: 'GHI-3456'
      },
      profiles: {
        name: 'Emily Wilson',
        phone: '(555) 456-7890'
      }
    },
    {
      id: 'tkt-55555555-5555-5555-5555-555555555555',
      ticket_number: 'WO-005',
      description: 'Engine oil leak detected. Need to identify source and repair.',
      status: 'assigned',
      created_at: '2024-01-17T08:30:00Z',
      preferred_pickup_time: '2024-01-19T14:00:00Z',
      user_id: '55555555-5555-5555-5555-555555555555',
      vehicle_id: 'veh-55555555-5555-5555-5555-555555555555',
      primary_mechanic_id: '88888888-8888-8888-8888-888888888888',
      secondary_mechanic_id: '99999999-9999-9999-9999-999999999999',
      vehicles: {
        make: 'Mercedes',
        model: 'C-Class',
        year: 2021,
        reg_no: 'JKL-7890'
      },
      profiles: {
        name: 'David Brown',
        phone: '(555) 567-8901'
      },
      primary_mechanic: {
        name: 'Tom Wilson'
      },
      secondary_mechanic: {
        name: 'Maria Garcia'
      }
    }
  ];

  const dummyEmployees: Employee[] = [
    { user_id: '66666666-6666-6666-6666-666666666666', name: 'Alex Rodriguez', employee_id: 'EMP001' },
    { user_id: '77777777-7777-7777-7777-777777777777', name: 'Lisa Chen', employee_id: 'EMP002' },
    { user_id: '88888888-8888-8888-8888-888888888888', name: 'Tom Wilson', employee_id: 'EMP003' },
    { user_id: '99999999-9999-9999-9999-999999999999', name: 'Maria Garcia', employee_id: 'EMP004' }
  ];

  const [tickets, setTickets] = useState<Ticket[]>(dummyTickets);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(dummyEmployees);
  const [primaryMechanic, setPrimaryMechanic] = useState<Record<string, string>>({});
  const [secondaryMechanic, setSecondaryMechanic] = useState<Record<string, string>>({});
  const [declineReason, setDeclineReason] = useState<Record<string, string>>({});
  const [showDeclineDialog, setShowDeclineDialog] = useState<Record<string, boolean>>({});
  const [showEditDialog, setShowEditDialog] = useState<Record<string, boolean>>({});
  const [editForm, setEditForm] = useState<Record<string, { description: string; pickup_time: string }>>({});
  const [showReassignDialog, setShowReassignDialog] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Use dummy data instead of database calls
    setTickets(dummyTickets);
    setEmployees(dummyEmployees);
    setLoading(false);
  }, []);

  const handleApprove = async (ticketId: string) => {
    // Update dummy data instead of database
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: 'approved' as any }
        : ticket
    ));
    
    toast({
      title: "Success",
      description: "Ticket approved successfully"
    });
  };

  const handleDecline = async (ticketId: string) => {
    const reason = declineReason[ticketId];
    if (!reason) {
      toast({
        title: "Error",
        description: "Please provide a reason for declining",
        variant: "destructive"
      });
      return;
    }

    // Update dummy data instead of database
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: 'declined' as any }
        : ticket
    ));
    
    setShowDeclineDialog(prev => ({ ...prev, [ticketId]: false }));
    setDeclineReason(prev => ({ ...prev, [ticketId]: '' }));
    
    toast({
      title: "Success",
      description: "Ticket declined successfully"
    });
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

    // Update dummy data instead of database
    const secondaryId = secondaryMechanic[ticketId];
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: 'assigned' as any,
            primary_mechanic_id: primaryId,
            secondary_mechanic_id: secondaryId,
            primary_mechanic: { name: employees.find(e => e.user_id === primaryId)?.name || '' },
            secondary_mechanic: secondaryId ? { name: employees.find(e => e.user_id === secondaryId)?.name || '' } : undefined
          }
        : ticket
    ));
    
    toast({
      title: "Success",
      description: "Mechanics assigned successfully"
    });
  };

  const handleEditTicket = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      setEditForm(prev => ({
        ...prev,
        [ticketId]: {
          description: ticket.description,
          pickup_time: ticket.preferred_pickup_time
        }
      }));
      setShowEditDialog(prev => ({ ...prev, [ticketId]: true }));
    }
  };

  const handleSaveEdit = async (ticketId: string) => {
    const form = editForm[ticketId];
    if (!form) return;

    // Update dummy data
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            description: form.description,
            preferred_pickup_time: form.pickup_time
          }
        : ticket
    ));
    
    setShowEditDialog(prev => ({ ...prev, [ticketId]: false }));
    toast({
      title: "Success",
      description: "Ticket updated successfully"
    });
  };

  const handleReassignMechanics = (ticketId: string) => {
    setShowReassignDialog(prev => ({ ...prev, [ticketId]: true }));
  };

  const handleSaveReassignment = async (ticketId: string) => {
    const primaryId = primaryMechanic[ticketId];
    if (!primaryId) {
      toast({
        title: "Error",
        description: "Please select a primary mechanic",
        variant: "destructive"
      });
      return;
    }

    // Update dummy data
    const secondaryId = secondaryMechanic[ticketId];
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            primary_mechanic_id: primaryId,
            secondary_mechanic_id: secondaryId,
            primary_mechanic: { name: employees.find(e => e.user_id === primaryId)?.name || '' },
            secondary_mechanic: secondaryId ? { name: employees.find(e => e.user_id === secondaryId)?.name || '' } : undefined
          }
        : ticket
    ));
    
    setShowReassignDialog(prev => ({ ...prev, [ticketId]: false }));
    toast({
      title: "Success",
      description: "Mechanics reassigned successfully"
    });
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.status === 'pending' || ticket.status === 'approved' || ticket.status === 'assigned' || ticket.status === 'in_progress' || ticket.status === 'completed'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ticket Management</h2>
          <p className="text-muted-foreground">Review, approve, and assign repair tickets</p>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center p-8">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
              <p className="text-muted-foreground">No repair tickets are currently available for review.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {ticket.vehicles.year} {ticket.vehicles.make} {ticket.vehicles.model}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span>Ticket: {ticket.ticket_number}</span>
                      <span>•</span>
                      <span>Reg: {ticket.vehicles.reg_no}</span>
                      <span>•</span>
                      <span>Customer: {ticket.profiles.name}</span>
                    </CardDescription>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Customer Contact</Label>
                    <p className="text-sm text-muted-foreground">{ticket.profiles.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Preferred Pickup</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ticket.preferred_pickup_time).toLocaleString()}
                    </p>
                  </div>
                </div>

                {(ticket.status === 'pending' || ticket.status === 'approved') && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Assign Mechanics</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Primary Mechanic</Label>
                          <Select 
                            value={primaryMechanic[ticket.id] || ''} 
                            onValueChange={(value) => setPrimaryMechanic(prev => ({ ...prev, [ticket.id]: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select primary mechanic" />
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
                          <Label className="text-xs text-muted-foreground">Secondary Mechanic (Optional)</Label>
                          <Select 
                            value={secondaryMechanic[ticket.id] || ''} 
                            onValueChange={(value) => setSecondaryMechanic(prev => ({ ...prev, [ticket.id]: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select secondary mechanic" />
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
                      </div>
                    </div>
                  </div>
                )}

                {ticket.primary_mechanic && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <Label className="text-sm font-medium">Assigned Mechanics</Label>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Primary:</span> {ticket.primary_mechanic.name}
                      </p>
                      {ticket.secondary_mechanic && (
                        <p className="text-sm">
                          <span className="font-medium">Secondary:</span> {ticket.secondary_mechanic.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {/* Edit and Reassign buttons for all tickets */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditTicket(ticket.id)}
                  >
                    ✏️ Edit Details
                  </Button>
                  
                  {(ticket.status === 'assigned' || ticket.status === 'in_progress') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReassignMechanics(ticket.id)}
                    >
                      🔄 Reassign Mechanics
                    </Button>
                  )}

                  {/* Status-specific actions */}
                  {ticket.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => handleApprove(ticket.id)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => setShowDeclineDialog(prev => ({ ...prev, [ticket.id]: true }))}
                        size="sm"
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  
                  {ticket.status === 'approved' && (
                    <Button 
                      onClick={() => handleAssign(ticket.id)}
                      disabled={!primaryMechanic[ticket.id]}
                      size="sm"
                    >
                      Assign Mechanics
                    </Button>
                  )}
                  
                  {ticket.status === 'assigned' && (
                    <div className="text-sm text-muted-foreground flex items-center">
                      <span className="mr-2">👥</span>
                      Ticket assigned to mechanics
                    </div>
                  )}
                  
                  {ticket.status === 'in_progress' && (
                    <div className="text-sm text-muted-foreground flex items-center">
                      <span className="mr-2">🔧</span>
                      Work in progress
                    </div>
                  )}
                  
                  {ticket.status === 'completed' && (
                    <div className="text-sm text-green-600 font-medium flex items-center">
                      <span className="mr-2">✅</span>
                      Work completed
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Decline Dialog */}
      {Object.entries(showDeclineDialog).map(([ticketId, isOpen]) => (
        isOpen && (
          <div key={ticketId} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Decline Ticket</CardTitle>
                <CardDescription>Please provide a reason for declining this ticket</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`decline-reason-${ticketId}`}>Reason for Decline</Label>
                  <Textarea
                    id={`decline-reason-${ticketId}`}
                    value={declineReason[ticketId] || ''}
                    onChange={(e) => setDeclineReason(prev => ({ ...prev, [ticketId]: e.target.value }))}
                    placeholder="Enter reason for declining this ticket..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeclineDialog(prev => ({ ...prev, [ticketId]: false }))}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDecline(ticketId)}
                    disabled={!declineReason[ticketId]}
                  >
                    Decline Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      ))}

      {/* Edit Ticket Dialog */}
      {Object.entries(showEditDialog).map(([ticketId, isOpen]) => (
        isOpen && (
          <Dialog key={ticketId} open={isOpen} onOpenChange={() => setShowEditDialog(prev => ({ ...prev, [ticketId]: false }))}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Ticket Details</DialogTitle>
                <DialogDescription>Update the description and pickup time for this ticket</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`edit-description-${ticketId}`}>Description</Label>
                  <Textarea
                    id={`edit-description-${ticketId}`}
                    value={editForm[ticketId]?.description || ''}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      [ticketId]: { ...prev[ticketId], description: e.target.value }
                    }))}
                    placeholder="Enter ticket description..."
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`edit-pickup-${ticketId}`}>Preferred Pickup Time</Label>
                  <Input
                    id={`edit-pickup-${ticketId}`}
                    type="datetime-local"
                    value={editForm[ticketId]?.pickup_time ? new Date(editForm[ticketId].pickup_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      [ticketId]: { ...prev[ticketId], pickup_time: e.target.value }
                    }))}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditDialog(prev => ({ ...prev, [ticketId]: false }))}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSaveEdit(ticketId)}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      ))}

      {/* Reassign Mechanics Dialog */}
      {Object.entries(showReassignDialog).map(([ticketId, isOpen]) => (
        isOpen && (
          <Dialog key={ticketId} open={isOpen} onOpenChange={() => setShowReassignDialog(prev => ({ ...prev, [ticketId]: false }))}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Reassign Mechanics</DialogTitle>
                <DialogDescription>Change the primary and secondary mechanics for this ticket</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Primary Mechanic</Label>
                    <Select 
                      value={primaryMechanic[ticketId] || ''} 
                      onValueChange={(value) => setPrimaryMechanic(prev => ({ ...prev, [ticketId]: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary mechanic" />
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
                    <Label className="text-sm font-medium">Secondary Mechanic (Optional)</Label>
                    <Select 
                      value={secondaryMechanic[ticketId] || ''} 
                      onValueChange={(value) => setSecondaryMechanic(prev => ({ ...prev, [ticketId]: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select secondary mechanic" />
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
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowReassignDialog(prev => ({ ...prev, [ticketId]: false }))}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSaveReassignment(ticketId)}
                    disabled={!primaryMechanic[ticketId]}
                  >
                    Reassign Mechanics
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      ))}
    </div>
  );
};