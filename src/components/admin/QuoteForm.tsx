import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuoteFormProps {
  open: boolean;
  onClose: () => void;
  quote?: {
    id: string;
    quote_number: string;
    customer_id: string;
    vehicle_id: string;
    ticket_id: string | null;
    status: string;
    recommendations: string | null;
    estimated_cost: number;
    expiration_date: string | null;
    delivery_method: string;
    services: any[];
    parts: any[];
    labor_hours: number;
    labor_rate: number;
    labor_cost: number;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    notes: string | null;
  };
  ticketId?: string;
  vehicleId?: string;
  customerId?: string;
}

interface Service {
  id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  labor_hours: number;
  is_taxable: boolean;
  notes?: string;
}

interface Part {
  id: string;
  name: string;
  part_number?: string;
  quantity: number;
  unit_price: number;
  is_taxable: boolean;
  warranty_details?: string;
  supplier?: string;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({ 
  open, 
  onClose, 
  quote,
  ticketId,
  vehicleId,
  customerId
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [standardServices, setStandardServices] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    customer_id: customerId || quote?.customer_id || '',
    vehicle_id: vehicleId || quote?.vehicle_id || '',
    ticket_id: ticketId || quote?.ticket_id || '',
    recommendations: quote?.recommendations || '',
    expiration_date: quote?.expiration_date ? new Date(quote.expiration_date) : null as Date | null,
    delivery_method: quote?.delivery_method || 'in_person',
    labor_hours: quote?.labor_hours || 0,
    labor_rate: quote?.labor_rate || 0,
    tax_rate: quote?.tax_rate || 8.25,
    notes: quote?.notes || ''
  });

  const [services, setServices] = useState<Service[]>(quote?.services || []);
  const [parts, setParts] = useState<Part[]>(quote?.parts || []);
  const [selectedService, setSelectedService] = useState<string>('');
  const [newService, setNewService] = useState({
    service_name: '',
    quantity: 1,
    unit_price: 0,
    labor_hours: 0,
    is_taxable: true,
    notes: ''
  });
  const [newPart, setNewPart] = useState({
    name: '',
    part_number: '',
    quantity: 1,
    unit_price: 0,
    is_taxable: true,
    warranty_details: '',
    supplier: ''
  });

  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchStandardServices();
      if (formData.customer_id) {
        fetchVehicles(formData.customer_id);
      }
      if (formData.vehicle_id) {
        fetchTickets(formData.vehicle_id);
      }
    }
  }, [open, formData.customer_id, formData.vehicle_id]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .order('name');
      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchVehicles = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, license_plate')
        .eq('owner_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchTickets = async (vehicleId: string) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_number, description, status')
        .eq('vehicle_id', vehicleId)
        .in('status', ['pending', 'approved', 'assigned', 'in_progress'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchStandardServices = async () => {
    try {
      const { data, error } = await supabase
        .from('standard_services')
        .select('*')
        .eq('is_active', true)
        .order('service_name');
      if (error) throw error;
      setStandardServices(data || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
    }
  };

  const calculateTotals = () => {
    const servicesSubtotal = services.reduce((sum, s) => sum + (s.unit_price * s.quantity), 0);
    const partsSubtotal = parts.reduce((sum, p) => sum + (p.unit_price * p.quantity), 0);
    const laborCost = formData.labor_hours * formData.labor_rate;
    const subtotal = servicesSubtotal + partsSubtotal + laborCost;
    
    const taxableAmount = services.filter(s => s.is_taxable).reduce((sum, s) => sum + (s.unit_price * s.quantity), 0) +
      parts.filter(p => p.is_taxable).reduce((sum, p) => sum + (p.unit_price * p.quantity), 0);
    const taxAmount = (taxableAmount * formData.tax_rate) / 100;
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total, laborCost };
  };

  const handleAddStandardService = () => {
    if (!selectedService) return;
    const service = standardServices.find(s => s.id === selectedService);
    if (!service) return;

    const newServiceItem: Service = {
      id: `temp-${Date.now()}`,
      service_name: service.service_name,
      quantity: 1,
      unit_price: service.default_price || 0,
      labor_hours: service.labor_hours || 0,
      is_taxable: service.taxable !== false,
      notes: service.description || ''
    };

    setServices([...services, newServiceItem]);
    setSelectedService('');
  };

  const handleAddCustomService = () => {
    if (!newService.service_name || newService.unit_price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter service name and price',
        variant: 'destructive'
      });
      return;
    }

    const serviceItem: Service = {
      id: `temp-${Date.now()}`,
      ...newService
    };

    setServices([...services, serviceItem]);
    setNewService({
      service_name: '',
      quantity: 1,
      unit_price: 0,
      labor_hours: 0,
      is_taxable: true,
      notes: ''
    });
  };

  const handleAddPart = () => {
    if (!newPart.name || newPart.unit_price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter part name and price',
        variant: 'destructive'
      });
      return;
    }

    const partItem: Part = {
      id: `temp-${Date.now()}`,
      ...newPart
    };

    setParts([...parts, partItem]);
    setNewPart({
      name: '',
      part_number: '',
      quantity: 1,
      unit_price: 0,
      is_taxable: true,
      warranty_details: '',
      supplier: ''
    });
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
  };

  const handleSubmit = async () => {
    if (!formData.customer_id || !formData.vehicle_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select customer and vehicle',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { subtotal, taxAmount, total, laborCost } = calculateTotals();

      const quoteData: any = {
        customer_id: formData.customer_id,
        vehicle_id: formData.vehicle_id,
        ticket_id: formData.ticket_id || null,
        recommendations: formData.recommendations || null,
        estimated_cost: total,
        expiration_date: formData.expiration_date?.toISOString() || null,
        delivery_method: formData.delivery_method,
        services: services,
        parts: parts,
        labor_hours: formData.labor_hours,
        labor_rate: formData.labor_rate,
        labor_cost: laborCost,
        subtotal: subtotal,
        tax_rate: formData.tax_rate,
        tax_amount: taxAmount,
        total_amount: total,
        notes: formData.notes || null,
        created_by: user?.id
      };

      if (quote) {
        // Update existing quote
        const { error } = await supabase
          .from('quotes')
          .update(quoteData)
          .eq('id', quote.id);
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Quote updated successfully'
        });
      } else {
        // Create new quote
        const { error } = await supabase
          .from('quotes')
          .insert([quoteData]);
        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Quote created successfully'
        });
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving quote:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save quote',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quote ? 'Edit Quote' : 'Create New Quote'}</DialogTitle>
          <DialogDescription>
            {quote ? `Editing quote ${quote.quote_number}` : 'Create a new quote/estimate for a customer'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer and Vehicle Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Customer *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, customer_id: value, vehicle_id: '', ticket_id: '' });
                  fetchVehicles(value);
                }}
                disabled={!!customerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Vehicle *</Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, vehicle_id: value, ticket_id: '' });
                  fetchTickets(value);
                }}
                disabled={!!vehicleId || !formData.customer_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.license_plate || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Related Ticket (Optional)</Label>
              <Select
                value={formData.ticket_id}
                onValueChange={(value) => setFormData({ ...formData, ticket_id: value })}
                disabled={!!ticketId || !formData.vehicle_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ticket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {tickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      {ticket.ticket_number} - {ticket.description?.substring(0, 50)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Delivery Method</Label>
              <Select
                value={formData.delivery_method}
                onValueChange={(value) => setFormData({ ...formData, delivery_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <Label>Expiration Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expiration_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expiration_date ? (
                    format(formData.expiration_date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.expiration_date || undefined}
                  onSelect={(date) => setFormData({ ...formData, expiration_date: date || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Recommendations */}
          <div>
            <Label>Recommendations</Label>
            <Textarea
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              placeholder="Enter repair recommendations..."
              rows={3}
            />
          </div>

          {/* Services Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Services</Label>
            </div>

            {/* Add Standard Service */}
            <div className="flex gap-2">
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select standard service" />
                </SelectTrigger>
                <SelectContent>
                  {standardServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.service_name} - ${service.default_price?.toFixed(2) || '0.00'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddStandardService} variant="outline">
                Add Service
              </Button>
            </div>

            {/* Add Custom Service */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <Input
                placeholder="Service name"
                value={newService.service_name}
                onChange={(e) => setNewService({ ...newService, service_name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Price"
                value={newService.unit_price || ''}
                onChange={(e) => setNewService({ ...newService, unit_price: parseFloat(e.target.value) || 0 })}
              />
              <Input
                type="number"
                placeholder="Qty"
                value={newService.quantity || ''}
                onChange={(e) => setNewService({ ...newService, quantity: parseInt(e.target.value) || 1 })}
              />
              <Input
                type="number"
                placeholder="Labor hours"
                value={newService.labor_hours || ''}
                onChange={(e) => setNewService({ ...newService, labor_hours: parseFloat(e.target.value) || 0 })}
              />
              <Button onClick={handleAddCustomService} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Services List */}
            {services.length > 0 && (
              <div className="space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{service.service_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {service.quantity} × ${service.unit_price.toFixed(2)} = ${(service.unit_price * service.quantity).toFixed(2)}
                        {service.labor_hours > 0 && ` | Labor: ${service.labor_hours}h`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Parts</Label>
            </div>

            {/* Add Part */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
              <Input
                placeholder="Part name"
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
              />
              <Input
                placeholder="Part #"
                value={newPart.part_number}
                onChange={(e) => setNewPart({ ...newPart, part_number: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Price"
                value={newPart.unit_price || ''}
                onChange={(e) => setNewPart({ ...newPart, unit_price: parseFloat(e.target.value) || 0 })}
              />
              <Input
                type="number"
                placeholder="Qty"
                value={newPart.quantity || ''}
                onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
              />
              <Input
                placeholder="Supplier"
                value={newPart.supplier}
                onChange={(e) => setNewPart({ ...newPart, supplier: e.target.value })}
              />
              <Button onClick={handleAddPart} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Parts List */}
            {parts.length > 0 && (
              <div className="space-y-2">
                {parts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{part.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {part.part_number && `Part #: ${part.part_number} | `}
                        Qty: {part.quantity} × ${part.unit_price.toFixed(2)} = ${(part.unit_price * part.quantity).toFixed(2)}
                        {part.supplier && ` | Supplier: ${part.supplier}`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePart(part.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Labor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Labor Hours</Label>
              <Input
                type="number"
                value={formData.labor_hours || ''}
                onChange={(e) => setFormData({ ...formData, labor_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Labor Rate ($/hour)</Label>
              <Input
                type="number"
                value={formData.labor_rate || ''}
                onChange={(e) => setFormData({ ...formData, labor_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                value={formData.tax_rate || ''}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 8.25 })}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Totals Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({formData.tax_rate}%):</span>
              <span className="font-medium">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-primary">
            {loading ? 'Saving...' : quote ? 'Update Quote' : 'Create Quote'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

