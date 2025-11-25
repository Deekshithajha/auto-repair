import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay, parseISO } from 'date-fns';
import { CalendarIcon, Car, User, Clock, PlayCircle } from 'lucide-react';

interface RescheduledVehicle {
  ticket_id: string;
  ticket_number: string;
  scheduled_date: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  description: string;
  status: string;
  work_session_id?: string;
}

export const EmployeeRescheduledVehicles: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [rescheduledVehicles, setRescheduledVehicles] = useState<RescheduledVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<RescheduledVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<RescheduledVehicle | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startingWork, setStartingWork] = useState(false);
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
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      const filtered = rescheduledVehicles.filter(vehicle => 
        isSameDay(parseISO(vehicle.scheduled_date), selectedDate)
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(rescheduledVehicles);
    }
  }, [selectedDate, rescheduledVehicles]);

  const fetchRescheduledVehicles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Get tickets assigned to this employee that are rescheduled
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          scheduled_date,
          description,
          status,
          vehicles:vehicle_id (
            id,
            make,
            model,
            year,
            license_plate
          ),
          profiles:customer_id (
            id,
            name,
            phone
          )
        `)
        .eq('status', 'pending')
        .not('scheduled_date', 'is', null)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Get work sessions for these tickets
      const ticketIds = (tickets || []).map((t: any) => t.id);
      const { data: workSessions } = await supabase
        .from('work_sessions')
        .select('id, ticket_id, status')
        .in('ticket_id', ticketIds)
        .eq('employee_id', user.id);

      const vehiclesWithSessions = (tickets || []).map((ticket: any) => {
        const session = workSessions?.find(ws => ws.ticket_id === ticket.id);
        return {
          ticket_id: ticket.id,
          ticket_number: ticket.ticket_number || ticket.id.slice(-8),
          scheduled_date: ticket.scheduled_date,
          vehicle: Array.isArray(ticket.vehicles) ? ticket.vehicles[0] : ticket.vehicles,
          customer: Array.isArray(ticket.profiles) ? ticket.profiles[0] : ticket.profiles,
          description: ticket.description,
          status: ticket.status,
          work_session_id: session?.id
        };
      });

      setRescheduledVehicles(vehiclesWithSessions);
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
      const dateStr = format(parseISO(vehicle.scheduled_date), 'yyyy-MM-dd');
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

  const handleStartWorkAgain = async () => {
    if (!selectedVehicle || !user) return;

    try {
      setStartingWork(true);

      // Check if work session exists
      let workSessionId = selectedVehicle.work_session_id;

      if (!workSessionId) {
        // Create new work session
        const { data: newSession, error: sessionError } = await supabase
          .from('work_sessions')
          .insert({
            ticket_id: selectedVehicle.ticket_id,
            employee_id: user.id,
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        workSessionId = newSession.id;
      } else {
        // Update existing work session
        const { error: updateError } = await supabase
          .from('work_sessions')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', workSessionId);

        if (updateError) throw updateError;
      }

      // Update ticket status
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedVehicle.ticket_id);

      if (ticketError) throw ticketError;

      // Send notification to customer
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([{
          user_id: selectedVehicle.customer.id,
          type: 'vehicle_ready',
          title: 'Work Resumed',
          message: `Work has resumed on your vehicle ${selectedVehicle.vehicle.make} ${selectedVehicle.vehicle.model}.`,
          ticket_id: selectedVehicle.ticket_id
        }]);

      if (notifError) console.error('Notification error:', notifError);

      toast({
        title: 'Success',
        description: 'Work has been resumed. You can now continue working on this vehicle.'
      });

      setShowDetailsDialog(false);
      fetchRescheduledVehicles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start work',
        variant: 'destructive'
      });
    } finally {
      setStartingWork(false);
    }
  };

  const datesWithVehicles = getDatesWithVehicles();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Rescheduled Vehicles</h1>
        <p className="text-muted-foreground">View and resume work on rescheduled vehicles</p>
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
                            {vehicle.status === 'in_progress' && (
                              <Badge variant="default">In Progress</Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{vehicle.customer.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{format(parseISO(vehicle.scheduled_date), 'MMM dd, yyyy hh:mm a')}</span>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedVehicle && (
            <>
              <DialogHeader>
                <DialogTitle>Vehicle Details</DialogTitle>
                <DialogDescription>
                  View vehicle information and resume work
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
                        <p className="text-sm text-muted-foreground">License Plate</p>
                        <p className="font-semibold">{selectedVehicle.vehicle.license_plate}</p>
                      </div>
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
                    </div>
                  </CardContent>
                </Card>

                {/* Schedule Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Scheduled Date</p>
                      <p className="font-semibold">
                        {format(parseISO(selectedVehicle.scheduled_date), 'MMMM dd, yyyy hh:mm a')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Service Description</p>
                      <p className="font-semibold">{selectedVehicle.description}</p>
                    </div>
                  </CardContent>
</Card>

                {/* Actions */}
                <div className="flex gap-2">
                  {selectedVehicle.status !== 'in_progress' && (
                    <Button 
                      onClick={handleStartWorkAgain}
                      disabled={startingWork}
                      className="flex items-center gap-2"
                    >
                      <PlayCircle className="h-4 w-4" />
                      {startingWork ? 'Starting...' : 'Start Work Again'}
                    </Button>
                  )}
                  {selectedVehicle.status === 'in_progress' && (
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/employee/worklog'}
                    >
                      Continue Work
                    </Button>
                  )}
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

