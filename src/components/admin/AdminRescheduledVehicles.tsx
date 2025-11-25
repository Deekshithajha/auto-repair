import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay, startOfDay, parseISO } from 'date-fns';
import { CalendarIcon, Car, User, Wrench, Clock, CheckCircle2, Circle } from 'lucide-react';

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
    license_no?: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  primary_mechanic: {
    id: string;
    name: string;
  } | null;
  secondary_mechanic: {
    id: string;
    name: string;
  } | null;
  progress_percentage: number;
  description: string;
  status: string;
  work_stages?: {
    stage: string;
    status: 'completed' | 'in_progress' | 'pending';
    completed_at?: string;
  }[];
}

export const AdminRescheduledVehicles: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [rescheduledVehicles, setRescheduledVehicles] = useState<RescheduledVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<RescheduledVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<RescheduledVehicle | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRescheduledVehicles();
    // Set up real-time subscription
    const subscription = supabase
      .channel('rescheduled_vehicles_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets', filter: 'reschedule_date=not.is.null' },
        () => {
          fetchRescheduledVehicles();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const filtered = rescheduledVehicles.filter(vehicle => 
        isSameDay(parseISO(vehicle.reschedule_date), selectedDate)
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(rescheduledVehicles);
    }
  }, [selectedDate, rescheduledVehicles]);

  const fetchRescheduledVehicles = async () => {
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
          primary_mechanic_id,
          secondary_mechanic_id,
          vehicles:vehicle_id (
            id,
            make,
            model,
            year,
            reg_no,
            license_no
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
        .not('reschedule_date', 'is', null)
        .order('reschedule_date', { ascending: true });

      if (error) throw error;

      // Calculate progress and work stages
      const vehiclesWithProgress = await Promise.all(
        (tickets || []).map(async (ticket: any) => {
          // Get work sessions to calculate progress
          const { data: workSessions } = await supabase
            .from('work_sessions')
            .select('status, started_at, ended_at')
            .eq('ticket_id', ticket.id);

          const totalSessions = workSessions?.length || 0;
          const completedSessions = workSessions?.filter(ws => ws.status === 'completed').length || 0;
          const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

          // Get damage log items for work stages
          const { data: damageLogs } = await supabase
            .from('damage_log')
            .select('id, description')
            .eq('ticket_id', ticket.id);

          const workStages = damageLogs?.map((log: any) => ({
            stage: log.description || 'Work item',
            status: 'pending' as const,
            completed_at: undefined
          })) || [];

          return {
            ticket_id: ticket.id,
            ticket_number: ticket.ticket_number || ticket.id.slice(-8),
            reschedule_date: ticket.reschedule_date,
            reschedule_reason: ticket.reschedule_reason,
            vehicle: Array.isArray(ticket.vehicles) ? ticket.vehicles[0] : ticket.vehicles,
            customer: Array.isArray(ticket.profiles) ? ticket.profiles[0] : ticket.profiles,
            primary_mechanic: Array.isArray(ticket.primary_mechanic) ? ticket.primary_mechanic[0] : ticket.primary_mechanic,
            secondary_mechanic: Array.isArray(ticket.secondary_mechanic) ? ticket.secondary_mechanic[0] : ticket.secondary_mechanic,
            progress_percentage: progress,
            description: ticket.description,
            status: ticket.status,
            work_stages: workStages
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

  const getDatesWithVehicles = () => {
    const dates = new Set<string>();
    rescheduledVehicles.forEach(vehicle => {
      const dateStr = format(parseISO(vehicle.reschedule_date), 'yyyy-MM-dd');
      dates.add(dateStr);
    });
    return Array.from(dates).map(d => parseISO(d));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleVehicleClick = (vehicle: RescheduledVehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsDialog(true);
  };

  const handleAutoReschedule = async (vehicle: RescheduledVehicle) => {
    try {
      const nextDay = new Date(parseISO(vehicle.reschedule_date));
      nextDay.setDate(nextDay.getDate() + 1);

      const { error } = await supabase
        .from('tickets')
        .update({ 
          reschedule_date: nextDay.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicle.ticket_id);

      if (error) throw error;

      // Send notification to customer
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([{
          user_id: vehicle.customer.id,
          type: 'service_reminder',
          title: 'Vehicle Rescheduled',
          message: `Your vehicle ${vehicle.vehicle.make} ${vehicle.vehicle.model} has been rescheduled to ${format(nextDay, 'MMM dd, yyyy')} as you did not arrive on the scheduled date.`,
          ticket_id: vehicle.ticket_id
        }]);

      if (notifError) console.error('Notification error:', notifError);

      toast({
        title: 'Success',
        description: 'Vehicle automatically rescheduled to next day and customer notified'
      });

      fetchRescheduledVehicles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reschedule',
        variant: 'destructive'
      });
    }
  };

  const datesWithVehicles = getDatesWithVehicles();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Rescheduled Vehicles</h1>
        <p className="text-muted-foreground">Manage vehicles that have been rescheduled for later dates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Click on a date to view rescheduled vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              modifiers={{
                hasVehicles: datesWithVehicles
              }}
              className="rounded-md border"
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-primary/20 border-2 border-primary rounded"></div>
                <span>Date with rescheduled vehicles</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? `Vehicles for ${format(selectedDate, 'MMMM dd, yyyy')}`
                : 'All Rescheduled Vehicles'}
            </CardTitle>
            <CardDescription>
              {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-4xl mb-4">⚙️</div>
                <p>Loading vehicles...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {selectedDate 
                    ? 'No vehicles rescheduled for this date'
                    : 'No rescheduled vehicles found'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVehicles.map((vehicle) => (
                  <Card 
                    key={vehicle.ticket_id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleVehicleClick(vehicle)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Car className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">
                              {vehicle.vehicle.make} {vehicle.vehicle.model} ({vehicle.vehicle.year})
                            </h3>
                            <Badge variant="outline">{vehicle.ticket_number}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{vehicle.customer.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{format(parseISO(vehicle.reschedule_date), 'MMM dd, yyyy hh:mm a')}</span>
                            </div>
                            {vehicle.primary_mechanic && (
                              <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4" />
                                <span>Primary: {vehicle.primary_mechanic.name}</span>
                                {vehicle.secondary_mechanic && (
                                  <span className="ml-2">| Secondary: {vehicle.secondary_mechanic.name}</span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${vehicle.progress_percentage}%` }}
                                ></div>
                              </div>
                              <span>{vehicle.progress_percentage}% Complete</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedVehicle && (
            <>
              <DialogHeader>
                <DialogTitle>Vehicle Details</DialogTitle>
                <DialogDescription>
                  Complete information about the rescheduled vehicle
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Vehicle Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Make & Model</p>
                        <p className="font-semibold">
                          {selectedVehicle.vehicle.make} {selectedVehicle.vehicle.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Year</p>
                        <p className="font-semibold">{selectedVehicle.vehicle.year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Registration</p>
                        <p className="font-semibold">{selectedVehicle.vehicle.reg_no}</p>
                      </div>
                      {selectedVehicle.vehicle.license_no && (
                        <div>
                          <p className="text-sm text-muted-foreground">License</p>
                          <p className="font-semibold">{selectedVehicle.vehicle.license_no}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-semibold">{selectedVehicle.customer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-semibold">{selectedVehicle.customer.phone}</p>
                      </div>
                      {selectedVehicle.customer.email && (
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-semibold">{selectedVehicle.customer.email}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Mechanic Information */}
                {(selectedVehicle.primary_mechanic || selectedVehicle.secondary_mechanic) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5" />
                        Assigned Mechanics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedVehicle.primary_mechanic && (
                        <div>
                          <p className="text-sm text-muted-foreground">Primary Mechanic</p>
                          <p className="font-semibold">{selectedVehicle.primary_mechanic.name}</p>
                        </div>
                      )}
                      {selectedVehicle.secondary_mechanic && (
                        <div>
                          <p className="text-sm text-muted-foreground">Secondary Mechanic</p>
                          <p className="font-semibold">{selectedVehicle.secondary_mechanic.name}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Progress Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Work Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-semibold">{selectedVehicle.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all" 
                          style={{ width: `${selectedVehicle.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    {selectedVehicle.work_stages && selectedVehicle.work_stages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium mb-2">Work Stages</p>
                        {selectedVehicle.work_stages.map((stage, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {stage.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={stage.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                              {stage.stage}
                            </span>
                            {stage.completed_at && (
                              <span className="text-xs text-muted-foreground ml-auto">
                                {format(parseISO(stage.completed_at), 'MMM dd, yyyy')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reschedule Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Reschedule Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Rescheduled Date</p>
                      <p className="font-semibold">
                        {format(parseISO(selectedVehicle.reschedule_date), 'MMMM dd, yyyy hh:mm a')}
                      </p>
                    </div>
                    {selectedVehicle.reschedule_reason && (
                      <div>
                        <p className="text-sm text-muted-foreground">Reason</p>
                        <p className="font-semibold">{selectedVehicle.reschedule_reason}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Service Description</p>
                      <p className="font-semibold">{selectedVehicle.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleAutoReschedule(selectedVehicle)}
                  >
                    Auto-Reschedule to Next Day
                  </Button>
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

