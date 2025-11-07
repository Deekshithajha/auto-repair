import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { Car, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';

interface RescheduledVehicle {
  ticket_id: string;
  ticket_number: string;
  reschedule_date: string;
  reschedule_reason: string | null;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    reg_no: string;
  };
  description: string;
  status: string;
  work_stages: {
    stage: string;
    status: 'completed' | 'in_progress' | 'pending';
    completed_at?: string;
  }[];
  progress_percentage: number;
}

export const CustomerRescheduledVehicles: React.FC = () => {
  const { user } = useAuth();
  const [rescheduledVehicles, setRescheduledVehicles] = useState<RescheduledVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchRescheduledVehicles();
      // Set up real-time subscription
      const subscription = supabase
        .channel('rescheduled_vehicles_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'tickets', filter: `user_id=eq.${user.id}` },
          () => {
            fetchRescheduledVehicles();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchRescheduledVehicles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          reschedule_date,
          reschedule_reason,
          description,
          status,
          vehicles:vehicle_id (
            id,
            make,
            model,
            year,
            reg_no
          )
        `)
        .eq('user_id', user.id)
        .not('reschedule_date', 'is', null)
        .order('reschedule_date', { ascending: true });

      if (error) throw error;

      // Get work progress for each ticket
      const vehiclesWithProgress = await Promise.all(
        (tickets || []).map(async (ticket: any) => {
          // Get damage log items for work stages
          const { data: damageLogs } = await supabase
            .from('damage_logs')
            .select('id, description, is_completed, completed_at')
            .eq('ticket_id', ticket.id);

          const workStages = damageLogs?.map((log: any) => ({
            stage: log.description || 'Work item',
            status: log.is_completed ? 'completed' as const : 'pending' as const,
            completed_at: log.completed_at || undefined
          })) || [];

          // Get work sessions to calculate progress
          const { data: workSessions } = await supabase
            .from('work_sessions')
            .select('status, started_at, ended_at')
            .eq('ticket_id', ticket.id);

          const totalSessions = workSessions?.length || 0;
          const completedSessions = workSessions?.filter(ws => ws.status === 'completed').length || 0;
          const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

          return {
            ticket_id: ticket.id,
            ticket_number: ticket.ticket_number || ticket.id.slice(-8),
            reschedule_date: ticket.reschedule_date,
            reschedule_reason: ticket.reschedule_reason,
            vehicle: Array.isArray(ticket.vehicles) ? ticket.vehicles[0] : ticket.vehicles,
            description: ticket.description,
            status: ticket.status,
            work_stages: workStages,
            progress_percentage: progress
          };
        })
      );

      setRescheduledVehicles(vehiclesWithProgress);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch rescheduled vehicles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Rescheduled Vehicles</h1>
        <p className="text-muted-foreground">
          View your vehicles that have been rescheduled for service
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-muted-foreground">Loading your vehicles...</p>
        </div>
      ) : rescheduledVehicles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Rescheduled Vehicles</h3>
            <p className="text-muted-foreground">
              You don't have any vehicles currently rescheduled for service.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {rescheduledVehicles.map((vehicle) => (
            <Card key={vehicle.ticket_id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Car className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-xl">
                        {vehicle.vehicle.make} {vehicle.vehicle.model} ({vehicle.vehicle.year})
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Registration: {vehicle.vehicle.reg_no} | Ticket: {vehicle.ticket_number}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(parseISO(vehicle.reschedule_date), 'MMM dd, yyyy')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Reschedule Information */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold mb-1">Scheduled Return Date</p>
                      <p className="text-lg">
                        {format(parseISO(vehicle.reschedule_date), 'EEEE, MMMM dd, yyyy')} at{' '}
                        {format(parseISO(vehicle.reschedule_date), 'hh:mm a')}
                      </p>
                      {vehicle.reschedule_reason && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <span className="font-medium">Reason:</span> {vehicle.reschedule_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Service Description */}
                <div>
                  <p className="font-semibold mb-2">Service Description</p>
                  <p className="text-muted-foreground">{vehicle.description}</p>
                </div>

                {/* Progress Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold">Work Progress</p>
                    <span className="text-sm font-semibold text-primary">
                      {vehicle.progress_percentage}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 mb-4">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all" 
                      style={{ width: `${vehicle.progress_percentage}%` }}
                    ></div>
                  </div>

                  {/* Work Stages */}
                  {vehicle.work_stages && vehicle.work_stages.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="font-semibold text-sm mb-2">Work Breakdown</p>
                      <div className="space-y-2">
                        {vehicle.work_stages.map((stage, index) => (
                          <div 
                            key={index} 
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              stage.status === 'completed' 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-muted/50'
                            }`}
                          >
                            {stage.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className={`font-medium ${
                                stage.status === 'completed' 
                                  ? 'line-through text-muted-foreground' 
                                  : ''
                              }`}>
                                {stage.stage}
                              </p>
                              {stage.completed_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Completed on {format(parseISO(stage.completed_at), 'MMM dd, yyyy')}
                                </p>
                              )}
                            </div>
                            {stage.status === 'completed' && (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                Done
                              </Badge>
                            )}
                            {stage.status === 'pending' && (
                              <Badge variant="outline">
                                Pending
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <p className="font-semibold mb-2">Summary</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Completed Items</p>
                      <p className="font-semibold text-lg">
                        {vehicle.work_stages.filter(s => s.status === 'completed').length} / {vehicle.work_stages.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining Items</p>
                      <p className="font-semibold text-lg">
                        {vehicle.work_stages.filter(s => s.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

