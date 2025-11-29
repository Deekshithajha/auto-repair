import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface StandardService {
  id: string;
  service_name: string;
  default_price: number;
  labor_hours: number;
  taxable: boolean;
}

interface WorkorderService {
  id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  labor_hours: number;
  is_taxable: boolean;
}

interface ServiceSelectorProps {
  ticketId: string;
  onServicesChange?: () => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({ ticketId, onServicesChange }) => {
  const { toast } = useToast();
  const [standardServices, setStandardServices] = useState<StandardService[]>([]);
  const [addedServices, setAddedServices] = useState<WorkorderService[]>([]);
  const [serviceType, setServiceType] = useState<'standard' | 'custom'>('standard');
  const [selectedStandardService, setSelectedStandardService] = useState<string>('');
  const [customService, setCustomService] = useState({
    service_name: '',
    quantity: 1,
    unit_price: 0,
    labor_hours: 0,
    is_taxable: true
  });

  useEffect(() => {
    fetchStandardServices();
    fetchAddedServices();
  }, [ticketId]);

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

  const fetchAddedServices = async () => {
    try {
      const { data, error } = await supabase
        .from('workorder_services')
        .select('*')
        .eq('ticket_id', ticketId);

      if (error) throw error;
      setAddedServices(data || []);
    } catch (error: any) {
      console.error('Error fetching added services:', error);
    }
  };

  const handleAddStandardService = async () => {
    if (!selectedStandardService) {
      toast({
        title: "Error",
        description: "Please select a service",
        variant: "destructive"
      });
      return;
    }

    const service = standardServices.find(s => s.id === selectedStandardService);
    if (!service) return;

    try {
      const { error } = await supabase
        .from('workorder_services')
        .insert({
          ticket_id: ticketId,
          service_id: service.id,
          service_name: service.service_name,
          quantity: 1,
          unit_price: service.default_price,
          labor_hours: service.labor_hours,
          is_taxable: service.taxable
        });

      if (error) throw error;

      toast({
        title: "Service Added",
        description: `${service.service_name} has been added`
      });

      setSelectedStandardService('');
      fetchAddedServices();
      onServicesChange?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add service",
        variant: "destructive"
      });
    }
  };

  const handleAddCustomService = async () => {
    if (!customService.service_name || customService.unit_price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('workorder_services')
        .insert({
          ticket_id: ticketId,
          service_name: customService.service_name,
          quantity: customService.quantity,
          unit_price: customService.unit_price,
          labor_hours: customService.labor_hours,
          is_taxable: customService.is_taxable
        });

      if (error) throw error;

      toast({
        title: "Custom Service Added",
        description: `${customService.service_name} has been added`
      });

      setCustomService({
        service_name: '',
        quantity: 1,
        unit_price: 0,
        labor_hours: 0,
        is_taxable: true
      });
      fetchAddedServices();
      onServicesChange?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add custom service",
        variant: "destructive"
      });
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('workorder_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Service Removed",
        description: "Service has been removed from work order"
      });

      fetchAddedServices();
      onServicesChange?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove service",
        variant: "destructive"
      });
    }
  };

  const calculateTotal = () => {
    return addedServices.reduce((sum, service) => 
      sum + (service.quantity * service.unit_price), 0
    ).toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Service Section */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={serviceType === 'standard' ? 'default' : 'outline'}
              onClick={() => setServiceType('standard')}
              size="sm"
            >
              Standard Service
            </Button>
            <Button
              variant={serviceType === 'custom' ? 'default' : 'outline'}
              onClick={() => setServiceType('custom')}
              size="sm"
            >
              Custom Service
            </Button>
          </div>

          {serviceType === 'standard' ? (
            <div className="flex gap-2">
              <Select value={selectedStandardService} onValueChange={setSelectedStandardService}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a service..." />
                </SelectTrigger>
                <SelectContent>
                  {standardServices.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.service_name} - ${service.default_price.toFixed(2)} ({service.labor_hours}h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddStandardService}>Add</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Service Name</Label>
                <Input
                  value={customService.service_name}
                  onChange={(e) => setCustomService({...customService, service_name: e.target.value})}
                  placeholder="e.g., Engine Diagnostics"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={customService.unit_price}
                    onChange={(e) => setCustomService({...customService, unit_price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Labor Hours</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={customService.labor_hours}
                    onChange={(e) => setCustomService({...customService, labor_hours: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={customService.is_taxable}
                  onCheckedChange={(checked) => setCustomService({...customService, is_taxable: checked as boolean})}
                />
                <Label>Taxable</Label>
              </div>
              <Button onClick={handleAddCustomService} className="w-full">Add Custom Service</Button>
            </div>
          )}
        </div>

        {/* Added Services List */}
        {addedServices.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-semibold text-sm">Added Services</h4>
            {addedServices.map(service => (
              <div key={service.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{service.service_name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${service.unit_price.toFixed(2)} × {service.quantity} = ${(service.unit_price * service.quantity).toFixed(2)}
                    {service.labor_hours > 0 && ` • ${service.labor_hours}h labor`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveService(service.id)}
                  className="bg-destructive/10 hover:bg-destructive/20"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <div className="flex justify-between font-bold text-sm pt-2 border-t">
              <span>Total Services:</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
