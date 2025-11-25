import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ServiceRecord {
  id: string;
  description: string;
  status: string;
  created_at: string;
  work_started_at?: string;
  work_completed_at?: string;
  scheduled_pickup_time?: string;
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: number;
  };
  parts?: Array<{
    id: string;
    part_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

interface VehicleServiceHistoryProps {
  vehicleId: string;
}

export const VehicleServiceHistory: React.FC<VehicleServiceHistoryProps> = ({ vehicleId }) => {
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceHistory();
  }, [vehicleId]);

  const fetchServiceHistory = async () => {
    try {
      setLoading(true);

      // Fetch all tickets for this vehicle
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          invoices:invoices(id, invoice_number, total_amount),
          parts:parts(id, part_name, quantity, unit_price)
        `)
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      setServiceRecords((tickets || []) as ServiceRecord[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'assigned': return 'default';
      case 'in_progress': return 'default';
      case 'completed': return 'outline';
      case 'declined': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'assigned': return '👤';
      case 'in_progress': return '🔧';
      case 'completed': return '✔️';
      case 'declined': return '❌';
      default: return '📋';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const hours = Math.abs(endDate.getTime() - startDate.getTime()) / 36e5;
    
    if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (serviceRecords.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-4xl mb-4">🔧</div>
          <h3 className="text-lg font-semibold mb-2">No Service History</h3>
          <p className="text-muted-foreground">
            This vehicle has no service records yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Service History Timeline</CardTitle>
          <CardDescription>
            Complete service history for this vehicle ({serviceRecords.length} record{serviceRecords.length !== 1 ? 's' : ''})
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="relative space-y-4">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

        {serviceRecords.map((record, index) => (
          <Card key={record.id} className="relative ml-0 sm:ml-12">
            {/* Timeline Dot */}
            <div className="hidden sm:block absolute -left-12 top-6 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-lg">
              {getStatusIcon(record.status)}
            </div>

            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="sm:hidden text-lg">{getStatusIcon(record.status)}</span>
                    <CardTitle className="text-base">
                      Service Request #{index + 1}
                    </CardTitle>
                    <Badge variant={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {format(new Date(record.created_at), 'PPP')}
                  </CardDescription>
                </div>
                {record.invoice && (
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(record.invoice.total_amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.invoice.invoice_number}
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm">{record.description}</p>

              {/* Timeline Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {record.work_started_at && (
                  <div>
                    <p className="text-muted-foreground text-xs">Started</p>
                    <p className="font-medium">
                      {format(new Date(record.work_started_at), 'PPp')}
                    </p>
                  </div>
                )}
                {record.work_completed_at && (
                  <div>
                    <p className="text-muted-foreground text-xs">Completed</p>
                    <p className="font-medium">
                      {format(new Date(record.work_completed_at), 'PPp')}
                    </p>
                  </div>
                )}
                {record.work_started_at && record.work_completed_at && (
                  <div>
                    <p className="text-muted-foreground text-xs">Duration</p>
                    <p className="font-medium">
                      {calculateDuration(record.work_started_at, record.work_completed_at)}
                    </p>
                  </div>
                )}
              </div>

              {/* Parts List */}
              {record.parts && record.parts.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                    onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                  >
                    <span>View Parts ({record.parts.length})</span>
                    <span>{expandedRecord === record.id ? '▼' : '▶'}</span>
                  </Button>

                  {expandedRecord === record.id && (
                    <div className="space-y-2 pt-2 border-t">
                      {record.parts.map((part) => (
                        <div key={part.id} className="flex justify-between text-sm">
                          <span>
                            {part.part_name} <span className="text-muted-foreground">x{part.quantity}</span>
                          </span>
                          <span className="font-medium">
                            {formatCurrency(part.unit_price * part.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Pickup Info */}
              {record.scheduled_pickup_time && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <span>🚗</span>
                  <span>
                    Pickup: {format(new Date(record.scheduled_pickup_time), 'PPp')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};