import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Plus, Trash2, Edit } from 'lucide-react';

interface Ticket {
  id: string;
  ticket_number: string;
  status: string;
  description: string;
  created_at: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    vin: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface StandardService {
  id: string;
  service_name: string;
  category: string;
  default_price: number | null;
  labor_hours: number | null;
  taxable: boolean;
  description: string | null;
}

interface WorkorderService {
  id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  labor_hours: number | null;
  is_taxable: boolean;
  notes: string | null;
}

interface PartUsed {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  is_taxable: boolean;
}

interface InvoiceData {
  ticket: Ticket | null;
  services: WorkorderService[];
  parts: PartUsed[];
  tax_rate: number;
  notes: string;
}

export const InvoiceGeneration: React.FC = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [standardServices, setStandardServices] = useState<StandardService[]>([]);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    ticket: null,
    services: [],
    parts: [],
    tax_rate: 8.25, // Default US sales tax rate (8.25% is common in many states)
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showPartDialog, setShowPartDialog] = useState(false);
  const [editingService, setEditingService] = useState<WorkorderService | null>(null);
  const [editingPart, setEditingPart] = useState<PartUsed | null>(null);

  // New service/part form data
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
    quantity: 1,
    unit_price: 0,
    is_taxable: true
  });

  useEffect(() => {
    fetchTickets();
    fetchStandardServices();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          status,
          description,
          created_at,
          vehicle:vehicles(id, make, model, year, vin),
          customer:profiles!tickets_user_id_fkey(id, name, email, phone)
        `)
        .in('status', ['completed', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      // @ts-ignore - Supabase type inference issue with renamed relation
      setTickets(data || []);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tickets',
        variant: 'destructive'
      });
    }
  };

  const fetchStandardServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services' as any)
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setStandardServices((data || []) as any);
    } catch (error: any) {
      console.error('Error fetching services:', error);
    }
  };

  const handleTicketSelect = async (ticketId: string) => {
    if (!ticketId) {
      setInvoiceData(prev => ({ ...prev, ticket: null, services: [], parts: [] }));
      return;
    }

    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    setInvoiceData(prev => ({ ...prev, ticket }));

    // Fetch existing services for this ticket
    try {
      const { data: services, error: servicesError } = await supabase
        .from('services' as any)
        .select('*')
        .eq('ticket_id', ticketId);

      if (servicesError) throw servicesError;

      setInvoiceData(prev => ({ ...prev, services: (services || []) as any }));
    } catch (error: any) {
      console.error('Error fetching services:', error);
    }
  };

  const calculateSubtotal = () => {
    const serviceTotal = invoiceData.services.reduce((sum, service) => 
      sum + (service.unit_price * service.quantity), 0
    );
    const partTotal = invoiceData.parts.reduce((sum, part) => 
      sum + (part.unit_price * part.quantity), 0
    );
    return serviceTotal + partTotal;
  };

  const calculateTaxableAmount = () => {
    const taxableServices = invoiceData.services
      .filter(service => service.is_taxable)
      .reduce((sum, service) => sum + (service.unit_price * service.quantity), 0);
    
    const taxableParts = invoiceData.parts
      .filter(part => part.is_taxable)
      .reduce((sum, part) => sum + (part.unit_price * part.quantity), 0);
    
    return taxableServices + taxableParts;
  };

  const calculateTax = () => {
    return (calculateTaxableAmount() * invoiceData.tax_rate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleAddService = () => {
    if (!newService.service_name || newService.unit_price <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in service name and price',
        variant: 'destructive'
      });
      return;
    }

    const service: WorkorderService = {
      id: `temp-${Date.now()}`,
      ...newService
    };

    setInvoiceData(prev => ({
      ...prev,
      services: [...prev.services, service]
    }));

    setNewService({
      service_name: '',
      quantity: 1,
      unit_price: 0,
      labor_hours: 0,
      is_taxable: true,
      notes: ''
    });
    setShowServiceDialog(false);
  };

  const handleAddPart = () => {
    if (!newPart.name || newPart.unit_price <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in part name and price',
        variant: 'destructive'
      });
      return;
    }

    const part: PartUsed = {
      id: `temp-${Date.now()}`,
      ...newPart
    };

    setInvoiceData(prev => ({
      ...prev,
      parts: [...prev.parts, part]
    }));

    setNewPart({
      name: '',
      quantity: 1,
      unit_price: 0,
      is_taxable: true
    });
    setShowPartDialog(false);
  };

  const handleRemoveService = (serviceId: string) => {
    setInvoiceData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== serviceId)
    }));
  };

  const handleRemovePart = (partId: string) => {
    setInvoiceData(prev => ({
      ...prev,
      parts: prev.parts.filter(p => p.id !== partId)
    }));
  };

  const handleEditService = (service: WorkorderService) => {
    setEditingService(service);
    setNewService({
      service_name: service.service_name,
      quantity: service.quantity,
      unit_price: service.unit_price,
      labor_hours: service.labor_hours || 0,
      is_taxable: service.is_taxable,
      notes: service.notes || ''
    });
    setShowServiceDialog(true);
  };

  const handleUpdateService = () => {
    if (!editingService || !newService.service_name || newService.unit_price <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in service name and price',
        variant: 'destructive'
      });
      return;
    }

    setInvoiceData(prev => ({
      ...prev,
      services: prev.services.map(s => 
        s.id === editingService.id 
          ? { ...s, ...newService }
          : s
      )
    }));

    setEditingService(null);
    setNewService({
      service_name: '',
      quantity: 1,
      unit_price: 0,
      labor_hours: 0,
      is_taxable: true,
      notes: ''
    });
    setShowServiceDialog(false);
  };

  const handleEditPart = (part: PartUsed) => {
    setEditingPart(part);
    setNewPart({
      name: part.name,
      quantity: part.quantity,
      unit_price: part.unit_price,
      is_taxable: part.is_taxable
    });
    setShowPartDialog(true);
  };

  const handleUpdatePart = () => {
    if (!editingPart || !newPart.name || newPart.unit_price <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in part name and price',
        variant: 'destructive'
      });
      return;
    }

    setInvoiceData(prev => ({
      ...prev,
      parts: prev.parts.map(p => 
        p.id === editingPart.id 
          ? { ...p, ...newPart }
          : p
      )
    }));

    setEditingPart(null);
    setNewPart({
      name: '',
      quantity: 1,
      unit_price: 0,
      is_taxable: true
    });
    setShowPartDialog(false);
  };

  const handleSaveInvoice = async () => {
    if (!invoiceData.ticket) {
      toast({
        title: 'Error',
        description: 'Please select a ticket',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Save services to workorder_services table
      for (const service of invoiceData.services) {
        if (service.id.startsWith('temp-')) {
          // New service - insert
          const { error } = await supabase
            .from('workorder_services')
            .insert({
              ticket_id: invoiceData.ticket!.id,
              service_name: service.service_name,
              quantity: service.quantity,
              unit_price: service.unit_price,
              labor_hours: service.labor_hours,
              is_taxable: service.is_taxable,
              notes: service.notes
            });

          if (error) throw error;
        }
      }

      toast({
        title: 'Success',
        description: 'Invoice data saved successfully',
      });
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to save invoice data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInvoicePDF = () => {
    // This would integrate with a PDF generation library
    toast({
      title: 'PDF Generation',
      description: 'Invoice PDF generation feature coming soon',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice Generation</h2>
          <p className="text-muted-foreground">Generate invoices for completed work orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateInvoicePDF} disabled={!invoiceData.ticket}>
            <Download className="w-4 h-4 mr-2" />
            Generate PDF
          </Button>
          <Button onClick={handleSaveInvoice} disabled={!invoiceData.ticket || loading}>
            <FileText className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Invoice'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Invoice Details */}
        <div className="space-y-6">
          {/* Ticket Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Ticket</CardTitle>
              <CardDescription>Choose a ticket to generate invoice for</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTicketId} onValueChange={(value) => {
                setSelectedTicketId(value);
                handleTicketSelect(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a ticket" />
                </SelectTrigger>
                <SelectContent>
                  {tickets.map((ticket) => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      {ticket.ticket_number} - {ticket.vehicle.make} {ticket.vehicle.model} ({ticket.vehicle.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Customer & Vehicle Info */}
          {invoiceData.ticket && (
            <Card>
              <CardHeader>
                <CardTitle>Customer & Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Customer</Label>
                    <p className="text-sm">{invoiceData.ticket.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{invoiceData.ticket.customer.email}</p>
                    <p className="text-xs text-muted-foreground">{invoiceData.ticket.customer.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Vehicle</Label>
                    <p className="text-sm">{invoiceData.ticket.vehicle.year} {invoiceData.ticket.vehicle.make} {invoiceData.ticket.vehicle.model}</p>
                    <p className="text-xs text-muted-foreground">VIN: {invoiceData.ticket.vehicle.vin}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>Work performed on the vehicle</CardDescription>
                </div>
                <Button onClick={() => setShowServiceDialog(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoiceData.services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{service.service_name}</span>
                        <Badge variant={service.is_taxable ? 'default' : 'secondary'}>
                          {service.is_taxable ? 'Taxable' : 'Non-taxable'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {service.quantity} × {formatCurrency(service.unit_price)} = {formatCurrency(service.unit_price * service.quantity)}
                      </div>
                      {service.notes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Notes: {service.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveService(service.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {invoiceData.services.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No services added</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Parts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Parts Used</CardTitle>
                  <CardDescription>Parts and materials used in the repair</CardDescription>
                </div>
                <Button onClick={() => setShowPartDialog(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Part
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoiceData.parts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{part.name}</span>
                        <Badge variant={part.is_taxable ? 'default' : 'secondary'}>
                          {part.is_taxable ? 'Taxable' : 'Non-taxable'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {part.quantity} × {formatCurrency(part.unit_price)} = {formatCurrency(part.unit_price * part.quantity)}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPart(part)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemovePart(part.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {invoiceData.parts.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No parts added</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Invoice Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable Amount:</span>
                  <span>{formatCurrency(calculateTaxableAmount())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Rate:</span>
                  <span>{invoiceData.tax_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Amount:</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.01"
                  value={invoiceData.tax_rate}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Invoice Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes for the invoice..."
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Service Dialog */}
      {showServiceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingService ? 'Edit Service' : 'Add Service'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  value={newService.service_name}
                  onChange={(e) => setNewService(prev => ({ ...prev, service_name: e.target.value }))}
                  placeholder="Enter service name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newService.quantity}
                    onChange={(e) => setNewService(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-price">Unit Price ($)</Label>
                  <Input
                    id="unit-price"
                    type="number"
                    step="0.01"
                    value={newService.unit_price}
                    onChange={(e) => setNewService(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="labor-hours">Labor Hours</Label>
                <Input
                  id="labor-hours"
                  type="number"
                  step="0.1"
                  value={newService.labor_hours}
                  onChange={(e) => setNewService(prev => ({ ...prev, labor_hours: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newService.notes}
                  onChange={(e) => setNewService(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-taxable"
                  checked={newService.is_taxable}
                  onChange={(e) => setNewService(prev => ({ ...prev, is_taxable: e.target.checked }))}
                />
                <Label htmlFor="is-taxable">Taxable</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={editingService ? handleUpdateService : handleAddService} className="flex-1">
                  {editingService ? 'Update' : 'Add'} Service
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowServiceDialog(false);
                  setEditingService(null);
                  setNewService({
                    service_name: '',
                    quantity: 1,
                    unit_price: 0,
                    labor_hours: 0,
                    is_taxable: true,
                    notes: ''
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Part Dialog */}
      {showPartDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingPart ? 'Edit Part' : 'Add Part'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="part-name">Part Name</Label>
                <Input
                  id="part-name"
                  value={newPart.name}
                  onChange={(e) => setNewPart(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter part name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="part-quantity">Quantity</Label>
                  <Input
                    id="part-quantity"
                    type="number"
                    min="1"
                    value={newPart.quantity}
                    onChange={(e) => setNewPart(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="part-unit-price">Unit Price ($)</Label>
                  <Input
                    id="part-unit-price"
                    type="number"
                    step="0.01"
                    value={newPart.unit_price}
                    onChange={(e) => setNewPart(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="part-is-taxable"
                  checked={newPart.is_taxable}
                  onChange={(e) => setNewPart(prev => ({ ...prev, is_taxable: e.target.checked }))}
                />
                <Label htmlFor="part-is-taxable">Taxable</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={editingPart ? handleUpdatePart : handleAddPart} className="flex-1">
                  {editingPart ? 'Update' : 'Add'} Part
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowPartDialog(false);
                  setEditingPart(null);
                  setNewPart({
                    name: '',
                    quantity: 1,
                    unit_price: 0,
                    is_taxable: true
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

