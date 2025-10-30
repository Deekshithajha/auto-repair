import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Plus, Trash2, Edit, X } from 'lucide-react';

interface Ticket {
  id: string;
  ticket_number: string;
  description: string;
  status: string;
  created_at: string;
  vehicles: {
    make: string;
    model: string;
    year: number;
    reg_no: string;
    vin: string;
  };
  profiles: {
    name: string;
    phone: string;
    email: string;
  };
}

interface StandardService {
  id: string;
  service_name: string;
  category: 'standard' | 'non_standard';
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

interface InvoicePopupProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoicePopup: React.FC<InvoicePopupProps> = ({ ticket, isOpen, onClose }) => {
  const { toast } = useToast();
  const [standardServices, setStandardServices] = useState<StandardService[]>([]);
  const [services, setServices] = useState<WorkorderService[]>([]);
  const [parts, setParts] = useState<PartUsed[]>([]);
  const [laborRate, setLaborRate] = useState(120.00);
  const [taxRate, setTaxRate] = useState(8.25);
  const [notes, setNotes] = useState('');
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
    if (isOpen && ticket) {
      fetchStandardServices();
      fetchExistingServices();
    }
  }, [isOpen, ticket]);

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

  const fetchExistingServices = async () => {
    if (!ticket) return;

    try {
      const { data, error } = await supabase
        .from('workorder_services')
        .select('*')
        .eq('ticket_id', ticket.id);

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
    }
  };

  const calculateSubtotal = () => {
    const serviceTotal = services.reduce((sum, service) => 
      sum + (service.unit_price * service.quantity), 0
    );
    const partTotal = parts.reduce((sum, part) => 
      sum + (part.unit_price * part.quantity), 0
    );
    return serviceTotal + partTotal;
  };

  const calculateTaxableAmount = () => {
    const taxableServices = services
      .filter(service => service.is_taxable)
      .reduce((sum, service) => sum + (service.unit_price * service.quantity), 0);
    
    const taxableParts = parts
      .filter(part => part.is_taxable)
      .reduce((sum, part) => sum + (part.unit_price * part.quantity), 0);
    
    return taxableServices + taxableParts;
  };

  const calculateTax = () => {
    return (calculateTaxableAmount() * taxRate) / 100;
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

    setServices(prev => [...prev, service]);
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

    setParts(prev => [...prev, part]);
    setNewPart({
      name: '',
      quantity: 1,
      unit_price: 0,
      is_taxable: true
    });
    setShowPartDialog(false);
  };

  const handleRemoveService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleRemovePart = (partId: string) => {
    setParts(prev => prev.filter(p => p.id !== partId));
  };

  const handleSaveInvoice = async () => {
    if (!ticket) return;

    try {
      // Save services to workorder_services table
      for (const service of services) {
        if (service.id.startsWith('temp-')) {
          const { error } = await supabase
            .from('workorder_services')
            .insert({
              ticket_id: ticket.id,
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
        description: 'Invoice generated successfully',
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate invoice',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!ticket) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Shop Logo and Customer Details */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">AUTO REPAIR INC</h1>
                <p className="text-blue-100">Professional Automotive Services</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
              <p className="text-blue-100"><strong>Name:</strong> {ticket.profiles.name}</p>
              <p className="text-blue-100"><strong>Phone:</strong> {ticket.profiles.phone}</p>
              <p className="text-blue-100"><strong>Email:</strong> {ticket.profiles.email}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
              <p className="text-blue-100"><strong>Vehicle:</strong> {ticket.vehicles.year} {ticket.vehicles.make} {ticket.vehicles.model}</p>
              <p className="text-blue-100"><strong>Registration:</strong> {ticket.vehicles.reg_no}</p>
              <p className="text-blue-100"><strong>VIN:</strong> {ticket.vehicles.vin}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-400">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100"><strong>Invoice #:</strong> {ticket.ticket_number}</p>
                <p className="text-blue-100"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-blue-100"><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                <p className="text-blue-100"><strong>Status:</strong> {ticket.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Services and Parts */}
            <div className="space-y-6">
              {/* Services */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Services</CardTitle>
                    <Button onClick={() => setShowServiceDialog(true)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {services.map((service) => (
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
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveService(service.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No services added</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Parts */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Parts Used</CardTitle>
                    <Button onClick={() => setShowPartDialog(true)} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Part
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {parts.map((part) => (
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
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemovePart(part.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {parts.length === 0 && (
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
                      <span>{taxRate}%</span>
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
                    <Label htmlFor="labor-rate">Labor Rate (per hour)</Label>
                    <Input
                      id="labor-rate"
                      type="number"
                      step="0.01"
                      value={laborRate}
                      onChange={(e) => setLaborRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      step="0.01"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Invoice Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes for the invoice..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleSaveInvoice} className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Invoice
                </Button>
                <Button variant="outline" onClick={() => {}}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Service Dialog */}
        {showServiceDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add Service</CardTitle>
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
                  <Button onClick={handleAddService} className="flex-1">
                    Add Service
                  </Button>
                  <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Part Dialog */}
        {showPartDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add Part</CardTitle>
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
                  <Button onClick={handleAddPart} className="flex-1">
                    Add Part
                  </Button>
                  <Button variant="outline" onClick={() => setShowPartDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

