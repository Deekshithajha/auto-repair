import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, CheckCircle, XCircle, Edit, ArrowRight } from 'lucide-react';
import { QuoteForm } from './QuoteForm';

interface QuoteDetailProps {
  open: boolean;
  onClose: () => void;
  quoteId: string;
}

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  vehicle_id: string;
  ticket_id: string | null;
  status: string;
  is_revised: boolean;
  original_quote_id: string | null;
  recommendations: string | null;
  estimated_cost: number;
  total_amount: number;
  expiration_date: string | null;
  delivery_method: string;
  authorized_by: string | null;
  signed_date: string | null;
  services: any[];
  parts: any[];
  labor_hours: number;
  labor_rate: number;
  labor_cost: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  notes: string | null;
  created_at: string;
  customer_name: string;
  vehicle_info: string;
  ticket_number: string | null;
}

export const QuoteDetail: React.FC<QuoteDetailProps> = ({ open, onClose, quoteId }) => {
  const { toast } = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (open && quoteId) {
      fetchQuote();
    }
  }, [open, quoteId]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          profiles:customer_id (
            name,
            email,
            phone
          ),
          vehicles:vehicle_id (
            make,
            model,
            year,
            license_plate
          ),
          tickets:ticket_id (
            ticket_number
          )
        `)
        .eq('id', quoteId)
        .single();

      if (error) throw error;

      const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      const vehicle = Array.isArray(data.vehicles) ? data.vehicles[0] : data.vehicles;
      const ticket = data.tickets ? (Array.isArray(data.tickets) ? data.tickets[0] : data.tickets) : null;

      setQuote({
        ...data,
        customer_name: profile?.name || 'Unknown',
        vehicle_info: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.license_plate || 'N/A'})` : 'N/A',
        ticket_number: ticket?.ticket_number || null
      } as Quote);
    } catch (error: any) {
      console.error('Error fetching quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch quote details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToTicket = async () => {
    if (!quote) return;

    setConverting(true);
    try {
      // Create a new ticket from the quote
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert([{
          vehicle_id: quote.vehicle_id,
          customer_id: quote.customer_id,
          title: 'Repair Request',
          description: quote.recommendations || 'Quote converted to workorder',
          status: 'approved',
          preferred_pickup_time: quote.expiration_date ? new Date(quote.expiration_date) : null
        }])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Add services to workorder_services
      if (quote.services && quote.services.length > 0) {
        const servicesToInsert = quote.services.map((service: any) => ({
          ticket_id: ticket.id,
          service_name: service.service_name,
          quantity: service.quantity,
          unit_price: service.unit_price,
          labor_hours: service.labor_hours || 0,
          is_taxable: service.is_taxable !== false,
          notes: service.notes || null
        }));

        const { error: servicesError } = await supabase
          .from('workorder_services')
          .insert(servicesToInsert);

        if (servicesError) throw servicesError;
      }

      // Add parts
      if (quote.parts && quote.parts.length > 0) {
        const partsToInsert = quote.parts.map((part: any) => ({
          ticket_id: ticket.id,
          part_name: part.name,
          part_number: part.part_number || null,
          quantity: part.quantity,
          unit_price: part.unit_price
        }));

        const { error: partsError } = await supabase
          .from('parts')
          .insert(partsToInsert);

        if (partsError) throw partsError;
      }

      // Update quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({
          status: 'closed_converted',
          converted_to_ticket_id: ticket.id,
          converted_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: `Quote converted to workorder ${ticket.ticket_number || ticket.id}`
      });

      onClose();
    } catch (error: any) {
      console.error('Error converting quote:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to convert quote',
        variant: 'destructive'
      });
    } finally {
      setConverting(false);
    }
  };

  const handleRejectQuote = async () => {
    if (!quote) return;

    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: 'closed_rejected' })
        .eq('id', quote.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Quote marked as rejected'
      });

      fetchQuote();
    } catch (error: any) {
      console.error('Error rejecting quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject quote',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default" className="bg-blue-500">Open</Badge>;
      case 'closed_converted':
        return <Badge variant="default" className="bg-green-500">Converted</Badge>;
      case 'closed_rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading quote details...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!quote) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Quote not found</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open && !showEditForm} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">{quote.quote_number}</DialogTitle>
                <DialogDescription>
                  Quote Details
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(quote.status)}
                {quote.is_revised && (
                  <Badge variant="outline">Revised</Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Customer and Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Customer</h3>
                <p className="text-muted-foreground">{quote.customer_name}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Vehicle</h3>
                <p className="text-muted-foreground">{quote.vehicle_info}</p>
              </div>
              {quote.ticket_number && (
                <div>
                  <h3 className="font-semibold mb-2">Related Ticket</h3>
                  <p className="text-muted-foreground">{quote.ticket_number}</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Delivery Method</h3>
                <p className="text-muted-foreground capitalize">{quote.delivery_method.replace('_', ' ')}</p>
              </div>
            </div>

            <Separator />

            {/* Recommendations */}
            {quote.recommendations && (
              <div>
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{quote.recommendations}</p>
              </div>
            )}

            {/* Services */}
            {quote.services && quote.services.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Services</h3>
                <div className="space-y-2">
                  {quote.services.map((service: any, index: number) => (
                    <div key={index} className="flex justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{service.service_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {service.quantity} × ${service.unit_price?.toFixed(2) || '0.00'} = ${((service.unit_price || 0) * (service.quantity || 1)).toFixed(2)}
                          {service.labor_hours > 0 && ` | Labor: ${service.labor_hours}h`}
                        </div>
                      </div>
                      <div className="font-medium">
                        ${((service.unit_price || 0) * (service.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parts */}
            {quote.parts && quote.parts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Parts</h3>
                <div className="space-y-2">
                  {quote.parts.map((part: any, index: number) => (
                    <div key={index} className="flex justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{part.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {part.part_number && `Part #: ${part.part_number} | `}
                          Qty: {part.quantity} × ${part.unit_price?.toFixed(2) || '0.00'} = ${((part.unit_price || 0) * (part.quantity || 1)).toFixed(2)}
                          {part.supplier && ` | Supplier: ${part.supplier}`}
                        </div>
                      </div>
                      <div className="font-medium">
                        ${((part.unit_price || 0) * (part.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Labor */}
            {quote.labor_hours > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Labor</h3>
                <p className="text-muted-foreground">
                  {quote.labor_hours} hours × ${quote.labor_rate?.toFixed(2) || '0.00'}/hour = ${quote.labor_cost?.toFixed(2) || '0.00'}
                </p>
              </div>
            )}

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">${quote.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({quote.tax_rate || 0}%):</span>
                <span className="font-medium">${quote.tax_amount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${quote.total_amount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>{' '}
                <span>{new Date(quote.created_at).toLocaleString()}</span>
              </div>
              {quote.expiration_date && (
                <div>
                  <span className="text-muted-foreground">Expires:</span>{' '}
                  <span>{new Date(quote.expiration_date).toLocaleString()}</span>
                </div>
              )}
              {quote.signed_date && (
                <div>
                  <span className="text-muted-foreground">Signed:</span>{' '}
                  <span>{new Date(quote.signed_date).toLocaleString()}</span>
                </div>
              )}
              {quote.authorized_by && (
                <div>
                  <span className="text-muted-foreground">Authorized by:</span>{' '}
                  <span>{quote.authorized_by}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {quote.notes && (
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {quote.status === 'open' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowEditForm(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRejectQuote}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={handleConvertToTicket}
                  disabled={converting}
                  className="bg-gradient-primary"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  {converting ? 'Converting...' : 'Convert to Workorder'}
                </Button>
              </>
            )}
            {quote.status === 'closed_converted' && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="mr-2 h-4 w-4" />
                Converted
              </Badge>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Form */}
      {showEditForm && quote && (
        <QuoteForm
          open={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            fetchQuote();
          }}
          quote={quote}
        />
      )}
    </>
  );
};

