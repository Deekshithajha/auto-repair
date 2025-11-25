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
import { InvoicePopup } from './InvoicePopup';

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
    vin?: string | null;
  };
  profiles: {
    name: string;
    phone: string;
    email: string;
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
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [primaryMechanic, setPrimaryMechanic] = useState<Record<string, string>>({});
  const [secondaryMechanic, setSecondaryMechanic] = useState<Record<string, string>>({});
  const [declineReason, setDeclineReason] = useState<Record<string, string>>({});
  const [showDeclineDialog, setShowDeclineDialog] = useState<Record<string, boolean>>({});
  const [showEditDialog, setShowEditDialog] = useState<Record<string, boolean>>({});
  const [editForm, setEditForm] = useState<Record<string, { description: string; pickup_time: string }>>({});
  const [showReassignDialog, setShowReassignDialog] = useState<Record<string, boolean>>({});
  const [showInvoiceDialog, setShowInvoiceDialog] = useState<Record<string, boolean>>({});
  const [selectedTicketForInvoice, setSelectedTicketForInvoice] = useState<Ticket | null>(null);

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
          id,
          ticket_number,
          description,
          status,
          created_at,
          preferred_pickup_time,
          user_id,
          vehicle_id,
          primary_mechanic_id,
          secondary_mechanic_id,
          vehicles:vehicle_id (
            id,
            make,
            model,
            year,
            reg_no,
            vin
          ),
          profiles:user_id (
            id,
            name,
            phone,
            email
          ),
          primary_mechanic:primary_mechanic_id (
            id,
            name
          ),
          secondary_mechanic:secondary_mechanic_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTickets = (data || []).map((ticket: any) => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number || ticket.id.slice(-8),
        description: ticket.description || '',
        status: ticket.status,
        created_at: ticket.created_at,
        preferred_pickup_time: ticket.preferred_pickup_time || ticket.created_at,
        user_id: ticket.user_id,
        vehicle_id: ticket.vehicle_id,
        primary_mechanic_id: ticket.primary_mechanic_id,
        secondary_mechanic_id: ticket.secondary_mechanic_id,
        vehicles: Array.isArray(ticket.vehicles) ? ticket.vehicles[0] : ticket.vehicles,
        profiles: Array.isArray(ticket.profiles) ? ticket.profiles[0] : ticket.profiles,
        primary_mechanic: ticket.primary_mechanic ? (Array.isArray(ticket.primary_mechanic) ? ticket.primary_mechanic[0] : ticket.primary_mechanic) : undefined,
        secondary_mechanic: ticket.secondary_mechanic ? (Array.isArray(ticket.secondary_mechanic) ? ticket.secondary_mechanic[0] : ticket.secondary_mechanic) : undefined,
      }));

      setTickets(formattedTickets);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          user_id,
          employee_id,
          profiles:user_id (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .eq('employment_status', 'active');

      if (error) throw error;

      const formattedEmployees = (data || []).map((emp: any) => {
        const profile = Array.isArray(emp.profiles) ? emp.profiles[0] : emp.profiles;
        return {
          user_id: emp.user_id,
          name: profile?.name || 'Unknown',
          employee_id: emp.employee_id
        };
      });

      setEmployees(formattedEmployees);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch employees",
        variant: "destructive"
      });
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

      await fetchTickets();
      
      toast({
        title: "Success",
        description: "Ticket approved successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve ticket",
        variant: "destructive"
      });
    }
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

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'declined',
          decline_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      await fetchTickets();
      
      setShowDeclineDialog(prev => ({ ...prev, [ticketId]: false }));
      setDeclineReason(prev => ({ ...prev, [ticketId]: '' }));
      
      toast({
        title: "Success",
        description: "Ticket declined successfully"
      });
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
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'assigned',
          primary_mechanic_id: primaryId,
          secondary_mechanic_id: secondaryId,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      await fetchTickets();
      
      setPrimaryMechanic(prev => ({ ...prev, [ticketId]: '' }));
      setSecondaryMechanic(prev => ({ ...prev, [ticketId]: '' }));
      
      toast({
        title: "Success",
        description: "Mechanics assigned successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign mechanics",
        variant: "destructive"
      });
    }
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

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          description: form.description,
          preferred_pickup_time: form.pickup_time,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      await fetchTickets();
      
      setShowEditDialog(prev => ({ ...prev, [ticketId]: false }));
      toast({
        title: "Success",
        description: "Ticket updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket",
        variant: "destructive"
      });
    }
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

    try {
      const secondaryId = secondaryMechanic[ticketId] || null;
      const { error } = await supabase
        .from('tickets')
        .update({ 
          primary_mechanic_id: primaryId,
          secondary_mechanic_id: secondaryId,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      await fetchTickets();
      
      setShowReassignDialog(prev => ({ ...prev, [ticketId]: false }));
      setPrimaryMechanic(prev => ({ ...prev, [ticketId]: '' }));
      setSecondaryMechanic(prev => ({ ...prev, [ticketId]: '' }));
      
      toast({
        title: "Success",
        description: "Mechanics reassigned successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reassign mechanics",
        variant: "destructive"
      });
    }
  };

  const handleGenerateInvoice = (ticket: Ticket) => {
    setSelectedTicketForInvoice(ticket);
    setShowInvoiceDialog(prev => ({ ...prev, [ticket.id]: true }));
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

                  {(ticket.status === 'in_progress' || ticket.status === 'completed') && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleGenerateInvoice(ticket)}
                    >
                      🧾 Generate Invoice
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

      {/* Invoice Popup */}
      <InvoicePopup
        ticket={selectedTicketForInvoice}
        isOpen={selectedTicketForInvoice ? (showInvoiceDialog[selectedTicketForInvoice.id] || false) : false}
        onClose={() => {
          if (selectedTicketForInvoice) {
            setShowInvoiceDialog(prev => ({ ...prev, [selectedTicketForInvoice.id]: false }));
            setSelectedTicketForInvoice(null);
          }
        }}
      />
    </div>
  );
};