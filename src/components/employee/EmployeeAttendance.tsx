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

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes: string | null;
  total_hours: number;
  created_at: string;
  updated_at: string;
}

interface TodayAttendance {
  isClockedIn: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
  totalHours: number;
  status: string;
}

export const EmployeeAttendance: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [employeeId, setEmployeeId] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchEmployeeId();
    }
  }, [user]);

  useEffect(() => {
    if (employeeId) {
      fetchAttendanceRecords();
      fetchTodayAttendance();
    }
  }, [employeeId]);

  const fetchEmployeeId = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setEmployeeId(data.id);
    } catch (error: any) {
      console.error('Error fetching employee ID:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .order('date', { ascending: false })
        .limit(30); // Last 30 days

      if (error) throw error;
      setAttendanceRecords(data || []);

    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    if (!employeeId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setTodayAttendance({
          isClockedIn: !!data.clock_in && !data.clock_out,
          clockInTime: data.clock_in,
          clockOutTime: data.clock_out,
          totalHours: data.total_hours || 0,
          status: data.status
        });
      } else {
        setTodayAttendance({
          isClockedIn: false,
          clockInTime: null,
          clockOutTime: null,
          totalHours: 0,
          status: 'absent'
        });
      }

    } catch (error: any) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const handleClockIn = async () => {
    if (!employeeId) return;

    try {
      const now = new Date().toISOString();
      const today = now.split('T')[0];

      const { error } = await supabase
        .from('attendance')
        .upsert({
          employee_id: employeeId,
          date: today,
          clock_in: now,
          status: 'present',
          total_hours: 0
        });

      if (error) throw error;

      toast({
        title: "Clocked In",
        description: "You have successfully clocked in"
      });

      fetchTodayAttendance();
      fetchAttendanceRecords();

    } catch (error: any) {
      console.error('Error clocking in:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clock in",
        variant: "destructive"
      });
    }
  };

  const handleClockOut = async () => {
    if (!employeeId || !todayAttendance?.clockInTime) return;

    try {
      const now = new Date().toISOString();
      const today = now.split('T')[0];
      
      // Calculate total hours
      const clockInTime = new Date(todayAttendance.clockInTime);
      const clockOutTime = new Date(now);
      const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('attendance')
        .update({
          clock_out: now,
          total_hours: totalHours,
          updated_at: now
        })
        .eq('employee_id', employeeId)
        .eq('date', today);

      if (error) throw error;

      toast({
        title: "Clocked Out",
        description: `You have successfully clocked out. Total hours: ${totalHours.toFixed(2)}`
      });

      fetchTodayAttendance();
      fetchAttendanceRecords();

    } catch (error: any) {
      console.error('Error clocking out:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clock out",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAttendance = async (date: string, status: string, notes: string) => {
    if (!employeeId) return;

    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          employee_id: employeeId,
          date: date,
          status: status,
          notes: notes || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance record updated successfully"
      });

      setShowNotesDialog(false);
      setSelectedDate('');
      setNotes('');
      fetchAttendanceRecords();

    } catch (error: any) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update attendance",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'default';
      case 'absent': return 'destructive';
      case 'late': return 'secondary';
      case 'half_day': return 'outline';
      default: return 'outline';
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getWeekSummary = () => {
    const weekRecords = attendanceRecords.slice(0, 7);
    const totalHours = weekRecords.reduce((sum, record) => sum + (record.total_hours || 0), 0);
    const presentDays = weekRecords.filter(record => record.status === 'present').length;
    
    return {
      totalHours: totalHours.toFixed(1),
      presentDays,
      totalDays: weekRecords.length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading attendance...</div>
      </div>
    );
  }

  const weekSummary = getWeekSummary();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Attendance</h2>
        <p className="text-muted-foreground">Track your daily attendance and working hours</p>
      </div>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatTime(todayAttendance?.clockInTime)}
              </div>
              <div className="text-sm text-muted-foreground">Clock In</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatTime(todayAttendance?.clockOutTime)}
              </div>
              <div className="text-sm text-muted-foreground">Clock Out</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {todayAttendance?.totalHours.toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            {!todayAttendance?.isClockedIn ? (
              <Button 
                onClick={handleClockIn}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                🕐 Clock In
              </Button>
            ) : (
              <Button 
                onClick={handleClockOut}
                className="bg-red-600 hover:bg-red-700"
                size="lg"
              >
                🕐 Clock Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Week Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekSummary.totalHours}h</div>
            <div className="text-sm text-muted-foreground">Total Hours</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Present Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekSummary.presentDays}/{weekSummary.totalDays}</div>
            <div className="text-sm text-muted-foreground">Days Present</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weekSummary.totalDays > 0 ? (parseFloat(weekSummary.totalHours) / weekSummary.totalDays).toFixed(1) : '0.0'}h
            </div>
            <div className="text-sm text-muted-foreground">Hours per Day</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your attendance records for the past 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceRecords.length > 0 ? (
              attendanceRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(record.clock_in)} - {formatTime(record.clock_out)}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(record.status)}>
                      {record.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{record.total_hours.toFixed(1)}h</div>
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDate(record.date);
                        setNotes(record.notes || '');
                        setShowNotesDialog(true);
                      }}
                    >
                      📝
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No attendance records found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Attendance</DialogTitle>
            <DialogDescription>
              Add notes or update status for {selectedDate && new Date(selectedDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full p-2 border border-input rounded-md"
                defaultValue="present"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your attendance..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const statusSelect = document.getElementById('status') as HTMLSelectElement;
                  handleUpdateAttendance(selectedDate, statusSelect.value, notes);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
