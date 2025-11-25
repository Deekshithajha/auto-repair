import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { Clock, CheckCircle, PlayCircle, PauseCircle } from 'lucide-react';

interface WorkSession {
  id: string;
  ticket_id: string;
  started_at: string;
  ended_at: string | null;
  hours_worked: number | null;
  status: string;
  notes: string | null;
  ticket: {
    ticket_number: string;
    title: string;
    description: string;
    vehicle: {
      make: string;
      model: string;
      year: number;
      license_plate: string;
    };
  };
}

export const EmployeeWorkLog: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWorkSessions();
      
      // Set up realtime subscription
      const channel = supabase
        .channel('work_sessions_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'work_sessions' },
          () => {
            fetchWorkSessions();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchWorkSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get employee ID from user ID
      const { data: employeeData, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (empError) throw empError;

      // Fetch work sessions
      const { data, error } = await supabase
        .from('work_sessions')
        .select(`
          id,
          ticket_id,
          started_at,
          ended_at,
          hours_worked,
          status,
          notes,
          tickets:ticket_id (
            ticket_number,
            title,
            description,
            vehicles:vehicle_id (
              make,
              model,
              year,
              license_plate
            )
          )
        `)
        .eq('employee_id', employeeData.id)
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const sessions: WorkSession[] = (data || []).map((session: any) => ({
        id: session.id,
        ticket_id: session.ticket_id,
        started_at: session.started_at,
        ended_at: session.ended_at,
        hours_worked: session.hours_worked,
        status: session.status,
        notes: session.notes,
        ticket: {
          ticket_number: session.tickets?.ticket_number || 'N/A',
          title: session.tickets?.title || 'Untitled',
          description: session.tickets?.description || '',
          vehicle: {
            make: session.tickets?.vehicles?.make || '',
            model: session.tickets?.vehicles?.model || '',
            year: session.tickets?.vehicles?.year || 0,
            license_plate: session.tickets?.vehicles?.license_plate || ''
          }
        }
      }));

      setWorkSessions(sessions);
      
      // Find active session
      const active = sessions.find(s => s.status === 'in_progress');
      setActiveSession(active || null);

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch work sessions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      const session = workSessions.find(s => s.id === sessionId);
      if (!session) return;

      const startTime = new Date(session.started_at);
      const endTime = new Date();
      const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('work_sessions')
        .update({
          status: 'completed',
          ended_at: endTime.toISOString(),
          hours_worked: hoursWorked,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Work session ended successfully'
      });

      fetchWorkSessions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to end work session',
        variant: 'destructive'
      });
    }
  };

  const calculateDuration = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  const getTotalHoursWorked = () => {
    return workSessions
      .filter(s => s.hours_worked !== null)
      .reduce((total, s) => total + (s.hours_worked || 0), 0)
      .toFixed(2);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⚙️</div>
            <p>Loading work log...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSession ? '1' : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeSession ? 'In Progress' : 'No active sessions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workSessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalHoursWorked()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Session */}
      {activeSession && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              Active Work Session
            </CardTitle>
            <CardDescription>Currently in progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Ticket</p>
              <p className="font-semibold">{activeSession.ticket.ticket_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-semibold">
                {activeSession.ticket.vehicle.year} {activeSession.ticket.vehicle.make} {activeSession.ticket.vehicle.model}
              </p>
              <p className="text-xs text-muted-foreground">{activeSession.ticket.vehicle.license_plate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Started</p>
              <p className="font-semibold">
                {formatDistanceToNow(new Date(activeSession.started_at), { addSuffix: true })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-semibold">{calculateDuration(activeSession.started_at, null)} hours</p>
            </div>
            <Button 
              onClick={() => handleEndSession(activeSession.id)}
              className="w-full"
              variant="outline"
            >
              <PauseCircle className="h-4 w-4 mr-2" />
              End Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Work Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Sessions</CardTitle>
          <CardDescription>Your work history</CardDescription>
        </CardHeader>
        <CardContent>
          {workSessions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No work sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workSessions.map((session) => (
                <Card key={session.id} className={session.status === 'in_progress' ? 'border-primary/50' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {session.status === 'in_progress' ? (
                            <PlayCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          <h3 className="font-semibold">{session.ticket.ticket_number}</h3>
                          <Badge variant={session.status === 'in_progress' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{session.ticket.title}</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            {session.ticket.vehicle.year} {session.ticket.vehicle.make} {session.ticket.vehicle.model}
                          </p>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Started: {format(new Date(session.started_at), 'MMM dd, yyyy hh:mm a')}</span>
                          </div>
                          {session.ended_at && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Ended: {format(new Date(session.ended_at), 'MMM dd, yyyy hh:mm a')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {session.hours_worked 
                            ? `${session.hours_worked.toFixed(2)} hrs`
                            : `${calculateDuration(session.started_at, session.ended_at)} hrs`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
