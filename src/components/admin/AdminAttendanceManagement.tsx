import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Clock, Play, Pause, StopCircle, XCircle, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from 'date-fns';

interface Employee {
  id: string;
  user_id: string;
  employee_id: string;
  is_active: boolean;
  user_profiles?: {
    name: string;
  };
}

interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes: string | null;
  created_at: string;
}

interface WorkSession {
  id: string;
  ticket_id: string;
  employee_id: string;
  started_at: string;
  ended_at: string | null;
  status: string;
  notes: string | null;
}

export const AdminAttendanceManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendanceData();
    }
  }, [selectedEmployee, currentMonth]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('employee_id');

      if (error) throw error;

      // Fetch profile names separately
      const employeesWithProfiles = await Promise.all(
        (data || []).map(async (emp) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', emp.user_id)
            .single();
          return { ...emp, user_profiles: profile };
        })
      );

      setEmployees(employeesWithProfiles);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const fetchAttendanceData = async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const { data: attendance, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', selectedEmployee.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });

      const { data: sessions, error: sessError } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('employee_id', selectedEmployee.user_id)
        .gte('started_at', start)
        .lte('started_at', end)
        .order('started_at', { ascending: false });

      if (attError) throw attError;
      if (sessError) throw sessError;

      setAttendanceRecords((attendance || []) as any);
      setWorkSessions((sessions || []) as any);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async (employeeId: string) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('attendance')
        .insert({
          employee_id: employeeId,
          date: today,
          clock_in: new Date().toISOString(),
          status: 'present',
        });

      if (error) throw error;
      toast({ title: 'Success', description: 'Employee clocked in' });
      fetchAttendanceData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleClockOut = async (attendanceId: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          clock_out: new Date().toISOString(),
        })
        .eq('id', attendanceId);

      if (error) throw error;
      toast({ title: 'Success', description: 'Employee clocked out' });
      fetchAttendanceData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleMarkAbsent = async (employeeId: string) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('attendance')
        .insert({
          employee_id: employeeId,
          date: today,
          status: 'absent',
        });

      if (error) throw error;
      toast({ title: 'Success', description: 'Employee marked as absent' });
      fetchAttendanceData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-green-500',
      absent: 'bg-red-500',
      late: 'bg-orange-400',
      half_day: 'bg-blue-500',
    };
    
    return (
      <Badge className={colors[status] || 'bg-gray-500'}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getTodayAttendance = (employeeId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return attendanceRecords.find(att => 
      att.employee_id === employeeId && att.date === today
    );
  };

  const calculateWorkHours = (clockIn: string | null, clockOut: string | null) => {
    if (!clockIn) return 0;
    const end = clockOut ? new Date(clockOut) : new Date();
    const start = new Date(clockIn);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  const renderMonthlyCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-bold p-2">{day}</div>
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const attendance = attendanceRecords.find(att => att.date === dateStr);
          
          const getColor = () => {
            if (!attendance) return 'bg-gray-100';
            switch(attendance.status) {
              case 'present': return 'bg-green-100 border-green-500';
              case 'absent': return 'bg-red-100 border-red-500';
              case 'late': return 'bg-orange-100 border-orange-500';
              case 'half_day': return 'bg-blue-100 border-blue-500';
              default: return 'bg-gray-100';
            }
          };

          return (
            <div
              key={dateStr}
              className={`p-2 border-2 rounded ${getColor()} ${isToday(day) ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="text-center font-semibold">{format(day, 'd')}</div>
              {attendance && (
                <div className="text-xs text-center mt-1">
                  {calculateWorkHours(attendance.clock_in, attendance.clock_out)}h
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Attendance Management</CardTitle>
          <CardDescription>Track and manage employee attendance and work hours</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Today's Status</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const todayAtt = getTodayAttendance(employee.id);
                
                return (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.employee_id}</TableCell>
                    <TableCell>{employee.user_profiles?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {todayAtt ? getStatusBadge(todayAtt.status) : (
                        <Badge variant="outline">Not Clocked In</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {todayAtt?.clock_in ? format(new Date(todayAtt.clock_in), 'HH:mm') : '-'}
                    </TableCell>
                    <TableCell>
                      {todayAtt?.clock_out ? format(new Date(todayAtt.clock_out), 'HH:mm') : '-'}
                    </TableCell>
                    <TableCell>
                      {todayAtt ? calculateWorkHours(todayAtt.clock_in, todayAtt.clock_out) : '0.00'}h
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!todayAtt && (
                          <>
                            <Button size="sm" className="bg-green-500" onClick={() => handleClockIn(employee.id)}>
                              <Clock className="w-4 h-4 mr-1" />
                              Clock In
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleMarkAbsent(employee.id)}>
                              <XCircle className="w-4 h-4 mr-1" />
                              Absent
                            </Button>
                          </>
                        )}
                        {todayAtt && !todayAtt.clock_out && todayAtt.status === 'present' && (
                          <Button size="sm" className="bg-gray-500" onClick={() => handleClockOut(todayAtt.id)}>
                            <StopCircle className="w-4 h-4 mr-1" />
                            Clock Out
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setDialogOpen(true);
                          }}
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Attendance Details - {selectedEmployee?.user_profiles?.name || 'Unknown'}
            </DialogTitle>
            <DialogDescription>
              View daily and monthly attendance records
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="monthly">
            <TabsList>
              <TabsTrigger value="monthly">Monthly View</TabsTrigger>
              <TabsTrigger value="daily">Daily Records</TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="space-y-4">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                >
                  Previous
                </Button>
                <h3 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h3>
                <Button
                  variant="outline"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                >
                  Next
                </Button>
              </div>
              {renderMonthlyCalendar()}
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Days Present</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {attendanceRecords.filter(att => att.status === 'present').length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total Days Absent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {attendanceRecords.filter(att => att.status === 'absent').length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="daily">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Hours Worked</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {record.clock_in ? format(new Date(record.clock_in), 'HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {record.clock_out ? format(new Date(record.clock_out), 'HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {calculateWorkHours(record.clock_in, record.clock_out)}h
                      </TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};
