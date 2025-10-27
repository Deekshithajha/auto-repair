import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  user_id: string;
  employee_id: string;
  hire_date: string;
  is_active: boolean;
  employment_status?: string;
  profiles: {
    name: string;
    email: string;
    phone?: string;
  };
  employee_details?: {
    employment_type?: string;
    hourly_rate?: number;
    overtime_rate?: number;
  }[];
}

export const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    employment_type: 'full_time' as 'full_time' | 'part_time' | 'contractor',
    hourly_rate: 0,
    overtime_rate: 0,
    employment_status: 'active' as 'active' | 'on_leave' | 'terminated'
  });

  const [terminateOpen, setTerminateOpen] = useState(false);
  const [terminateForm, setTerminateForm] = useState({
    termination_date: '',
    termination_reason: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch employees with joined profile data manually
      const { data: employeeData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .order('hire_date', { ascending: false });

      if (empError) throw empError;

      // Fetch profile data for each employee
      const employeesWithProfiles = await Promise.all(
        (employeeData || []).map(async (emp) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email, phone')
            .eq('id', emp.user_id)
            .single();

          const { data: details } = await supabase
            .from('employee_details')
            .select('employment_type, hourly_rate, overtime_rate')
            .eq('employee_id', emp.id);

          return {
            ...emp,
            profiles: profile || { name: 'Unknown', email: 'N/A', phone: null },
            employee_details: details || []
          };
        })
      );

      setEmployees(employeesWithProfiles as any);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setViewDetailsOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    const details = Array.isArray(employee.employee_details) && employee.employee_details.length > 0
      ? employee.employee_details[0]
      : null;
    
    setEditForm({
      employment_type: (details?.employment_type as any) || 'full_time',
      hourly_rate: details?.hourly_rate || 0,
      overtime_rate: details?.overtime_rate || 0,
      employment_status: (employee.employment_status as any) || 'active'
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEmployee) return;

    try {
      // Update employee status
      const { error: empError } = await supabase
        .from('employees')
        .update({
          employment_status: editForm.employment_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedEmployee.id);

      if (empError) throw empError;

      // Upsert employee details
      const { error: detailsError } = await supabase
        .from('employee_details')
        .upsert({
          employee_id: selectedEmployee.id,
          employment_type: editForm.employment_type,
          hourly_rate: editForm.hourly_rate,
          overtime_rate: editForm.overtime_rate,
          updated_at: new Date().toISOString()
        });

      if (detailsError) throw detailsError;

      toast({
        title: "Success",
        description: "Employee details updated successfully"
      });

      setEditOpen(false);
      fetchEmployees();
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">Manage employees, rates, and employment status</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => {
          const details = Array.isArray(employee.employee_details) && employee.employee_details.length > 0
            ? employee.employee_details[0]
            : null;

          return (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{employee.profiles.name}</CardTitle>
                  <Badge variant={employee.employment_status === 'active' ? 'default' : 'secondary'}>
                    {employee.employment_status || 'active'}
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
                    <span className="text-sm font-medium">Type:</span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {details?.employment_type?.replace('_', ' ') || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Hourly Rate:</span>
                    <span className="text-sm text-muted-foreground">
                      ${details?.hourly_rate?.toFixed(2) || '0.00'}/hr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="text-sm text-muted-foreground">
                      {employee.profiles.phone || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Hired:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="pt-2 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewDetails(employee)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(employee)}
                    >
                      Edit
                    </Button>
                  </div>
                  {employee.employment_status === 'active' && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setTerminateOpen(true);
                      }}
                    >
                      Terminate Employee
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>Complete information for {selectedEmployee?.profiles.name}</DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedEmployee.profiles.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Employee ID</Label>
                  <p className="font-medium">{selectedEmployee.employee_id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedEmployee.profiles.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedEmployee.profiles.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Hire Date</Label>
                  <p className="font-medium">
                    {new Date(selectedEmployee.hire_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p className="font-medium capitalize">{selectedEmployee.employment_status || 'active'}</p>
                </div>
                {Array.isArray(selectedEmployee.employee_details) && selectedEmployee.employee_details.length > 0 && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">Employment Type</Label>
                      <p className="font-medium capitalize">
                        {selectedEmployee.employee_details[0].employment_type?.replace('_', ' ') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Hourly Rate</Label>
                      <p className="font-medium">
                        ${selectedEmployee.employee_details[0].hourly_rate?.toFixed(2) || '0.00'}/hr
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Overtime Rate</Label>
                      <p className="font-medium">
                        ${selectedEmployee.employee_details[0].overtime_rate?.toFixed(2) || '0.00'}/hr
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employment details for {selectedEmployee?.profiles.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employment Type</Label>
              <Select 
                value={editForm.employment_type} 
                onValueChange={(value: any) => setEditForm({...editForm, employment_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Employment Status</Label>
              <Select 
                value={editForm.employment_status} 
                onValueChange={(value: any) => setEditForm({...editForm, employment_status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hourly Rate ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={editForm.hourly_rate}
                onChange={(e) => setEditForm({...editForm, hourly_rate: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label>Overtime Rate ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={editForm.overtime_rate}
                onChange={(e) => setEditForm({...editForm, overtime_rate: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terminate Employee Dialog */}
      <Dialog open={terminateOpen} onOpenChange={setTerminateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Employee</DialogTitle>
            <DialogDescription>
              This will permanently terminate {selectedEmployee?.profiles.name}'s employment. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Termination Date</Label>
              <Input
                type="date"
                value={terminateForm.termination_date}
                onChange={(e) => setTerminateForm({...terminateForm, termination_date: e.target.value})}
              />
            </div>
            <div>
              <Label>Reason for Termination (Minimum 200 characters)</Label>
              <Textarea
                value={terminateForm.termination_reason}
                onChange={(e) => setTerminateForm({...terminateForm, termination_reason: e.target.value})}
                placeholder="Provide detailed reason for termination..."
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {terminateForm.termination_reason.length}/200 characters
              </p>
            </div>
            <div className="bg-destructive/10 border border-destructive/50 rounded p-3">
              <p className="text-sm text-destructive font-semibold">⚠️ Warning</p>
              <p className="text-sm text-muted-foreground">
                This will set the employee status to "terminated" and mark them as inactive.
                All open tickets will need to be reassigned manually.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setTerminateOpen(false);
                setTerminateForm({ termination_date: '', termination_reason: '' });
              }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  if (!selectedEmployee) return;
                  
                  if (!terminateForm.termination_date) {
                    toast({
                      title: "Error",
                      description: "Please select a termination date",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  if (terminateForm.termination_reason.length < 200) {
                    toast({
                      title: "Error",
                      description: "Termination reason must be at least 200 characters",
                      variant: "destructive"
                    });
                    return;
                  }

                  if (!confirm(`Are you sure you want to terminate ${selectedEmployee.profiles.name}? This action cannot be undone.`)) {
                    return;
                  }

                  try {
                    const { error } = await supabase
                      .from('employees')
                      .update({
                        employment_status: 'terminated',
                        termination_date: terminateForm.termination_date,
                        termination_reason: terminateForm.termination_reason,
                        is_active: false,
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', selectedEmployee.id);

                    if (error) throw error;

                    toast({
                      title: "Employee Terminated",
                      description: `${selectedEmployee.profiles.name} has been terminated. Please reassign any open tickets.`
                    });

                    setTerminateOpen(false);
                    setTerminateForm({ termination_date: '', termination_reason: '' });
                    fetchEmployees();
                  } catch (error: any) {
                    toast({
                      title: "Error",
                      description: error.message || "Failed to terminate employee",
                      variant: "destructive"
                    });
                  }
                }}
              >
                Confirm Termination
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
