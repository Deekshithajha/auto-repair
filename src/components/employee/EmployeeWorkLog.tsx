import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface WorkLogEntry {
  id: string;
  employee_id: string;
  ticket_id: string;
  work_description: string;
  hours_worked: number;
  work_date: string;
  status: 'in_progress' | 'completed' | 'paused';
  notes?: string;
  created_at: string;
  updated_at: string;
  // Related data
  ticket?: {
    id: string;
    description: string;
    status: string;
    vehicle?: {
      make: string;
      model: string;
      year: number;
      license_no: string;
    };
    customer?: {
      name: string;
      phone: string;
    };
  };
}

export const EmployeeWorkLog: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workLogs, setWorkLogs] = useState<WorkLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLogEntry | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const [newWorkLog, setNewWorkLog] = useState({
    ticket_id: '',
    work_description: '',
    hours_worked: 0,
    work_date: new Date().toISOString().split('T')[0],
    status: 'in_progress' as const,
    notes: ''
  });

  const [editWorkLog, setEditWorkLog] = useState({
    work_description: '',
    hours_worked: 0,
    work_date: '',
    status: 'in_progress' as const,
    notes: ''
  });

  const [availableTickets, setAvailableTickets] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchWorkLogs();
      fetchAvailableTickets();
    }
  }, [user]);

  const fetchWorkLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get employee ID
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (employeeError) throw employeeError;

      // Fetch work logs with related ticket data
      const { data, error } = await supabase
        .from('work_logs')
        .select(`
          *,
          tickets (
            id,
            description,
            status,
            vehicles (
              make,
              model,
              year,
              license_no
            ),
            profiles (
              name,
              phone
            )
          )
        `)
        .eq('employee_id', employeeData.id)
        .order('work_date', { ascending: false });

      if (error) throw error;

      // Transform data to match interface
      const transformedLogs = (data || []).map(log => ({
        ...log,
        ticket: log.tickets ? {
          id: log.tickets.id,
          description: log.tickets.description,
          status: log.tickets.status,
          vehicle: log.tickets.vehicles,
          customer: log.tickets.profiles
        } : undefined
      }));

      setWorkLogs(transformedLogs);

    } catch (error: any) {
      console.error('Error fetching work logs:', error);
      toast({
        title: "Error",
        description: "Failed to load work logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTickets = async () => {
    if (!user) return;

    try {
      // Get tickets assigned to this employee
      const { data, error } = await supabase
        .from('ticket_assignments')
        .select(`
          tickets (
            id,
            description,
            status,
            vehicles (
              make,
              model,
              year,
              license_no
            ),
            profiles (
              name,
              phone
            )
          )
        `)
        .eq('employee_id', user.id);

      if (error) throw error;

      const tickets = (data || []).map(assignment => ({
        id: assignment.tickets.id,
        description: assignment.tickets.description,
        status: assignment.tickets.status,
        vehicle: assignment.tickets.vehicles,
        customer: assignment.tickets.profiles
      }));

      setAvailableTickets(tickets);

    } catch (error: any) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleAddWorkLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Get employee ID
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (employeeError) throw employeeError;

      const { error } = await supabase
        .from('work_logs')
        .insert({
          employee_id: employeeData.id,
          ticket_id: newWorkLog.ticket_id,
          work_description: newWorkLog.work_description,
          hours_worked: newWorkLog.hours_worked,
          work_date: newWorkLog.work_date,
          status: newWorkLog.status,
          notes: newWorkLog.notes || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work log entry added successfully"
      });

      setShowAddDialog(false);
      setNewWorkLog({
        ticket_id: '',
        work_description: '',
        hours_worked: 0,
        work_date: new Date().toISOString().split('T')[0],
        status: 'in_progress',
        notes: ''
      });

      fetchWorkLogs();

    } catch (error: any) {
      console.error('Error adding work log:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add work log entry",
        variant: "destructive"
      });
    }
  };

  const handleEditWorkLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    try {
      const { error } = await supabase
        .from('work_logs')
        .update({
          work_description: editWorkLog.work_description,
          hours_worked: editWorkLog.hours_worked,
          work_date: editWorkLog.work_date,
          status: editWorkLog.status,
          notes: editWorkLog.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingLog.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work log entry updated successfully"
      });

      setShowEditDialog(false);
      setEditingLog(null);
      fetchWorkLogs();

    } catch (error: any) {
      console.error('Error updating work log:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update work log entry",
        variant: "destructive"
      });
    }
  };

  const handleDeleteWorkLog = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this work log entry?')) return;

    try {
      const { error } = await supabase
        .from('work_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Work log entry deleted successfully"
      });

      fetchWorkLogs();

    } catch (error: any) {
      console.error('Error deleting work log:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete work log entry",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (log: WorkLogEntry) => {
    setEditingLog(log);
    setEditWorkLog({
      work_description: log.work_description,
      hours_worked: log.hours_worked,
      work_date: log.work_date,
      status: log.status,
      notes: log.notes || ''
    });
    setShowEditDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'paused': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading work logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Work Log</h2>
        <p className="text-muted-foreground">Record and track your work activities, hours spent, and job progress</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What is the Work Log for?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Time Tracking:</strong> Record hours worked on specific jobs and tasks</li>
            <li>• <strong>Activity Documentation:</strong> Document what work was performed on each vehicle</li>
            <li>• <strong>Progress Tracking:</strong> Track job status (in progress, completed, paused)</li>
            <li>• <strong>Performance Records:</strong> Maintain records of your work efficiency and productivity</li>
            <li>• <strong>Billing Support:</strong> Provide accurate time records for customer billing</li>
            <li>• <strong>Quality Assurance:</strong> Document work performed for quality control and training</li>
          </ul>
        </div>
      </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          + Add Work Log
        </Button>
      </div>

      {/* Work Log Entries */}
      <div className="space-y-4">
        {workLogs.length > 0 ? (
          workLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {log.ticket?.vehicle ? 
                        `${log.ticket.vehicle.make} ${log.ticket.vehicle.model} (${log.ticket.vehicle.year})` : 
                        'Unknown Vehicle'
                      }
                    </CardTitle>
                    <CardDescription>
                      {log.ticket?.customer?.name} • {log.ticket?.vehicle?.license_no}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(log.status)}>
                      {log.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(log)}
                      >
                        ✏️
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteWorkLog(log.id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Work Description:</Label>
                    <p className="text-sm text-muted-foreground mt-1">{log.work_description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium">Hours Worked:</Label>
                      <p className="font-medium">{log.hours_worked}h</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Date:</Label>
                      <p className="font-medium">{new Date(log.work_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Ticket Status:</Label>
                      <p className="font-medium">{log.ticket?.status || 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Created:</Label>
                      <p className="font-medium">{new Date(log.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {log.notes && (
                    <div>
                      <Label className="text-sm font-medium">Notes:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No work log entries found</p>
              <Button 
                onClick={() => setShowAddDialog(true)} 
                className="mt-4"
                variant="outline"
              >
                Add Your First Work Log
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Work Log Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Work Log Entry</DialogTitle>
            <DialogDescription>
              Record your work activities and hours
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWorkLog} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket_id">Ticket *</Label>
                <select
                  id="ticket_id"
                  value={newWorkLog.ticket_id}
                  onChange={(e) => setNewWorkLog(prev => ({ ...prev, ticket_id: e.target.value }))}
                  className="w-full p-2 border border-input rounded-md"
                  required
                >
                  <option value="">Select a ticket</option>
                  {availableTickets.map((ticket) => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.vehicle ? 
                        `${ticket.vehicle.make} ${ticket.vehicle.model} - ${ticket.description}` : 
                        ticket.description
                      }
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="work_date">Work Date *</Label>
                <Input
                  id="work_date"
                  type="date"
                  value={newWorkLog.work_date}
                  onChange={(e) => setNewWorkLog(prev => ({ ...prev, work_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_description">Work Description *</Label>
              <Textarea
                id="work_description"
                value={newWorkLog.work_description}
                onChange={(e) => setNewWorkLog(prev => ({ ...prev, work_description: e.target.value }))}
                placeholder="Describe the work performed..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours_worked">Hours Worked *</Label>
                <Input
                  id="hours_worked"
                  type="number"
                  step="0.5"
                  min="0"
                  value={newWorkLog.hours_worked}
                  onChange={(e) => setNewWorkLog(prev => ({ ...prev, hours_worked: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={newWorkLog.status}
                  onChange={(e) => setNewWorkLog(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-2 border border-input rounded-md"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newWorkLog.notes}
                onChange={(e) => setNewWorkLog(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the work..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Add Work Log
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Work Log Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Work Log Entry</DialogTitle>
            <DialogDescription>
              Update your work log entry
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditWorkLog} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_work_description">Work Description *</Label>
              <Textarea
                id="edit_work_description"
                value={editWorkLog.work_description}
                onChange={(e) => setEditWorkLog(prev => ({ ...prev, work_description: e.target.value }))}
                placeholder="Describe the work performed..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_hours_worked">Hours Worked *</Label>
                <Input
                  id="edit_hours_worked"
                  type="number"
                  step="0.5"
                  min="0"
                  value={editWorkLog.hours_worked}
                  onChange={(e) => setEditWorkLog(prev => ({ ...prev, hours_worked: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_work_date">Work Date *</Label>
                <Input
                  id="edit_work_date"
                  type="date"
                  value={editWorkLog.work_date}
                  onChange={(e) => setEditWorkLog(prev => ({ ...prev, work_date: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status *</Label>
                <select
                  id="edit_status"
                  value={editWorkLog.status}
                  onChange={(e) => setEditWorkLog(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-2 border border-input rounded-md"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_notes">Notes (Optional)</Label>
              <Textarea
                id="edit_notes"
                value={editWorkLog.notes}
                onChange={(e) => setEditWorkLog(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the work..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Update Work Log
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
