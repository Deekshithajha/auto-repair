import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WorkSession {
  id: string;
  employee_id: string;
  ticket_id: string;
  status: string;
  started_at: string;
  ended_at?: string;
  notes?: string;
  tickets: {
    id: string;
    description: string;
    vehicles: {
      make: string;
      model: string;
      year: number;
      reg_no: string;
    };
  };
  employees: {
    profiles: {
      name: string;
    };
  };
}

export const LiveMonitor: React.FC = () => {
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSessions();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('work-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_sessions'
        },
        () => {
          fetchActiveSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActiveSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('work_sessions')
        .select(`
          *,
          tickets!inner(
            id,
            description,
            vehicles(make, model, year, reg_no)
          ),
          employees!inner(
            profiles!inner(name)
          )
        `)
        .in('status', ['in_progress', 'not_started'])
        .order('started_at', { ascending: false });

      if (error) throw error;
      setWorkSessions((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching work sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'default';
      case 'not_started': return 'secondary';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const getElapsedTime = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const hours = Math.floor((now - start) / (1000 * 60 * 60));
    const minutes = Math.floor(((now - start) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading live monitor...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Real-time Work Monitor</h2>
        <p className="text-muted-foreground">Live tracking of active work sessions</p>
      </div>

      {workSessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">💤</div>
            <h3 className="text-xl font-semibold mb-2">No Active Work Sessions</h3>
            <p className="text-muted-foreground">All employees are currently idle</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workSessions.map((session) => {
            const employee = Array.isArray(session.employees) ? session.employees[0] : session.employees;
            const ticket = Array.isArray(session.tickets) ? session.tickets[0] : session.tickets;
            const vehicle = Array.isArray(ticket?.vehicles) ? ticket.vehicles[0] : ticket?.vehicles;

            return (
              <Card key={session.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {employee?.profiles?.name || 'Unknown Employee'}
                    </CardTitle>
                    <Badge variant={getStatusColor(session.status)}>
                      {session.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center text-xs">
                    <span className="mr-1">🚗</span>
                    {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Task:</span>
                      <span className="text-sm text-muted-foreground truncate ml-2">
                        {ticket?.description || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Started:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(session.started_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Elapsed:</span>
                      <span className="text-sm text-muted-foreground">
                        {getElapsedTime(session.started_at)}
                      </span>
                    </div>
                    {session.notes && (
                      <div className="pt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Notes:</span> {session.notes}
                      </div>
                    )}
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
