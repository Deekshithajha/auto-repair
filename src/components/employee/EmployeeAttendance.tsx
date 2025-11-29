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

// Helper function to calculate hours between two timestamps
const calculateHours = (clockIn: string | null, clockOut: string | null): number => {
  if (!clockIn || !clockOut) return 0;
  const start = new Date(clockIn).getTime();
  const end = new Date(clockOut).getTime();
  return Math.round((end - start) / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
};

export const EmployeeAttendance: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
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
        const totalHours = calculateHours(data.clock_in, data.clock_out);
        setTodayAttendance({
          isClockedIn: !!data.clock_in && !data.clock_out,
          clockInTime: data.clock_in,
          clockOutTime: data.clock_out,
          totalHours: totalHours,
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

  // Attendance is now admin-controlled - employees can only view

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
    const totalHours = weekRecords.reduce((sum, record) => 
      sum + calculateHours(record.clock_in, record.clock_out), 0
    );
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

          <div className="text-center mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              ⚠️ Attendance is managed by your administrator
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Contact your admin to update attendance records
            </p>
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
                      <div className="font-medium">
                        {calculateHours(record.clock_in, record.clock_out).toFixed(1)}h
                      </div>
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Admin Managed
                    </span>
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

    </div>
  );
};
