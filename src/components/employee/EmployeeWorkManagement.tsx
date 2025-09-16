import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface WorkSession {
  id: string;
  ticket_id: string;
  status: string;
  started_at: string;
  ended_at: string;
  notes: string;
  ticket: {
    id: string;
    description: string;
    status: string;
    user_id: string;
    vehicle: {
      make: string;
      model: string;
      year: number;
      reg_no: string;
    };
    customer_name: string;
    customer_phone: string;
  };
}

interface PartUsed {
  name: string;
  quantity: number;
  unit_price: number;
}

export const EmployeeWorkManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [workNotes, setWorkNotes] = useState<Record<string, string>>({});
  const [partsUsed, setPartsUsed] = useState<Record<string, PartUsed[]>>({});
  const [newPart, setNewPart] = useState<Record<string, PartUsed>>({});

  // Dummy data for demonstration
  const dummyWorkSessions: WorkSession[] = [
    {
      id: '1',
      ticket_id: 'TICKET-001',
      status: 'not_started',
      started_at: '',
      ended_at: '',
      notes: '',
      ticket: {
        id: 'TICKET-001',
        description: 'Engine making strange noise, needs diagnostic check. Car has been running rough for the past week.',
        status: 'pending',
        user_id: 'user-1',
        vehicle: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          reg_no: 'ABC-1234'
        },
        customer_name: 'John Smith',
        customer_phone: '(555) 123-4567'
      }
    },
    {
      id: '2',
      ticket_id: 'TICKET-002',
      status: 'in_progress',
      started_at: '2024-01-16T08:30:00Z',
      ended_at: '',
      notes: '',
      ticket: {
        id: 'TICKET-002',
        description: 'Air conditioning not working properly. Blowing warm air instead of cold.',
        status: 'in_progress',
        user_id: 'user-2',
        vehicle: {
          make: 'Honda',
          model: 'Civic',
          year: 2019,
          reg_no: 'XYZ-5678'
        },
        customer_name: 'Sarah Johnson',
        customer_phone: '(555) 234-5678'
      }
    },
    {
      id: '3',
      ticket_id: 'TICKET-003',
      status: 'completed',
      started_at: '2024-01-15T09:00:00Z',
      ended_at: '2024-01-15T14:30:00Z',
      notes: 'Oil change completed successfully. Replaced oil filter and topped up fluids. Customer notified.',
      ticket: {
        id: 'TICKET-003',
        description: 'Oil change and brake pad replacement. Regular maintenance service.',
        status: 'completed',
        user_id: 'user-3',
        vehicle: {
          make: 'Ford',
          model: 'Focus',
          year: 2021,
          reg_no: 'DEF-9012'
        },
        customer_name: 'Mike Davis',
        customer_phone: '(555) 345-6789'
      }
    }
  ];

  const dummyPartsUsed: Record<string, PartUsed[]> = {
    'TICKET-002': [
      { name: 'AC Compressor', quantity: 1, unit_price: 450.00 },
      { name: 'Refrigerant R134a', quantity: 2, unit_price: 25.00 },
      { name: 'AC Filter', quantity: 1, unit_price: 35.00 }
    ],
    'TICKET-003': [
      { name: 'Motor Oil 5W-30', quantity: 5, unit_price: 8.50 },
      { name: 'Oil Filter', quantity: 1, unit_price: 12.00 },
      { name: 'Brake Pads (Front)', quantity: 1, unit_price: 85.00 }
    ]
  };

  useEffect(() => {
    // Use dummy data instead of fetching from database
    setWorkSessions(dummyWorkSessions);
    setPartsUsed(dummyPartsUsed);
    setLoading(false);
  }, [user?.id]);

  const fetchWorkSessions = async () => {
    // Use dummy data instead of fetching from database
    setWorkSessions(dummyWorkSessions);
    setPartsUsed(dummyPartsUsed);
      setLoading(false);
  };

  const fetchPartsForTicket = async (ticketId: string) => {
    // Use dummy data instead of fetching from database
      setPartsUsed(prev => ({
        ...prev,
      [ticketId]: dummyPartsUsed[ticketId] || []
      }));
  };

  const handleStartWork = async (sessionId: string, ticketId: string) => {
    // Update dummy data instead of database
    setWorkSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
          status: 'in_progress',
          started_at: new Date().toISOString()
          }
        : session
    ));

      toast({
        title: "Success",
        description: "Work started successfully",
      });
  };

  const handleAddPart = async (ticketId: string) => {
    const part = newPart[ticketId];
    if (!part?.name || !part?.quantity || !part?.unit_price) {
      toast({
        title: "Error",
        description: "Please fill in all part details",
        variant: "destructive",
      });
      return;
    }

    // Update dummy data instead of database
    setPartsUsed(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), part]
    }));

      toast({
        title: "Success",
        description: "Part added successfully",
      });

      // Clear the form
      setNewPart(prev => ({
        ...prev,
        [ticketId]: { name: '', quantity: 0, unit_price: 0 }
      }));
  };

  const handleFinishWork = async (sessionId: string, ticketId: string) => {
    // Update dummy data instead of database
    setWorkSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
          status: 'completed',
          ended_at: new Date().toISOString(),
          notes: workNotes[sessionId] || ''
          }
        : session
    ));

      toast({
        title: "Success",
        description: "Work completed! Customer has been notified.",
      });
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading work assignments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="grid gap-4 md:gap-6">
        {workSessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No work assignments available</p>
            </CardContent>
          </Card>
        ) : (
          workSessions.map((session) => (
            <Card key={session.id} className="w-full">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base sm:text-lg">
                      {session.ticket.vehicle.year} {session.ticket.vehicle.make} {session.ticket.vehicle.model}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Reg: {session.ticket.vehicle.reg_no} • Customer: {session.ticket.customer_name}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(session.status)} text-white text-xs px-2 py-1`}>
                    {session.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Issue:</strong> {session.ticket.description}
                  </div>
                  <div>
                    <strong>Customer Phone:</strong> {session.ticket.customer_phone}
                  </div>
                  {session.started_at && (
                    <div>
                      <strong>Started:</strong> {new Date(session.started_at).toLocaleString()}
                    </div>
                  )}
                  {session.ended_at && (
                    <div>
                      <strong>Completed:</strong> {new Date(session.ended_at).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Parts Section */}
                {session.status !== 'not_started' && (
                  <div className="border-t pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h4 className="font-medium">Parts Used</h4>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="sm:w-auto w-full">
                            🔧 Add Part
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Part</DialogTitle>
                            <DialogDescription>
                              Add a part used for this repair
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="partName">Part Name</Label>
                              <Input
                                id="partName"
                                placeholder="e.g., Brake Pad"
                                value={newPart[session.ticket_id]?.name || ''}
                                onChange={(e) => setNewPart(prev => ({
                                  ...prev,
                                  [session.ticket_id]: { 
                                    ...prev[session.ticket_id], 
                                    name: e.target.value,
                                    quantity: prev[session.ticket_id]?.quantity || 0,
                                    unit_price: prev[session.ticket_id]?.unit_price || 0
                                  }
                                }))}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                  id="quantity"
                                  type="number"
                                  placeholder="1"
                                  value={newPart[session.ticket_id]?.quantity || ''}
                                  onChange={(e) => setNewPart(prev => ({
                                    ...prev,
                                    [session.ticket_id]: { 
                                      ...prev[session.ticket_id], 
                                      quantity: parseInt(e.target.value) || 0,
                                      name: prev[session.ticket_id]?.name || '',
                                      unit_price: prev[session.ticket_id]?.unit_price || 0
                                    }
                                  }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="price">Unit Price ($)</Label>
                                <Input
                                  id="price"
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={newPart[session.ticket_id]?.unit_price || ''}
                                  onChange={(e) => setNewPart(prev => ({
                                    ...prev,
                                    [session.ticket_id]: { 
                                      ...prev[session.ticket_id], 
                                      unit_price: parseFloat(e.target.value) || 0,
                                      name: prev[session.ticket_id]?.name || '',
                                      quantity: prev[session.ticket_id]?.quantity || 0
                                    }
                                  }))}
                                />
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleAddPart(session.ticket_id)}
                              className="w-full"
                            >
                              Add Part
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {partsUsed[session.ticket_id]?.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        {partsUsed[session.ticket_id].map((part, index) => (
                          <div key={index} className="flex justify-between items-center bg-muted p-2 rounded">
                            <span>{part.name} (x{part.quantity})</span>
                            <span>${(part.quantity * part.unit_price).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center font-medium pt-2 border-t">
                          <span>Total Parts Cost:</span>
                          <span>${partsUsed[session.ticket_id].reduce((sum, part) => sum + (part.quantity * part.unit_price), 0).toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No parts added yet</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 pt-4 border-t">
                  {session.status === 'not_started' && (
                    <Button 
                      onClick={() => handleStartWork(session.id, session.ticket_id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                    >
                      🚀 Start Work
                    </Button>
                  )}

                  {session.status === 'in_progress' && (
                    <>
                      <Textarea
                        placeholder="Add work notes (optional)"
                        value={workNotes[session.id] || ''}
                        onChange={(e) => 
                          setWorkNotes(prev => ({ ...prev, [session.id]: e.target.value }))
                        }
                        className="text-sm"
                      />
                      <Button 
                        onClick={() => handleFinishWork(session.id, session.ticket_id)}
                        className="bg-green-600 hover:bg-green-700 text-white w-full"
                      >
                        ✅ Finish Work & Notify Customer
                      </Button>
                    </>
                  )}

                  {session.status === 'completed' && session.notes && (
                    <div className="bg-muted p-3 rounded text-sm">
                      <strong>Work Notes:</strong> {session.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};