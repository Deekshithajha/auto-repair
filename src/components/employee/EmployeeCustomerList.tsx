import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Search, Eye, Car } from 'lucide-react';
import { EnhancedCustomerProfile } from '@/components/customers/EnhancedCustomerProfile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  system_id: string;
  created_at: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  color: string;
  vin: string;
}

export const EmployeeCustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, Vehicle[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.system_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'customer');

      if (rolesError) throw rolesError;

      const customerIds = new Set(rolesData.map(r => r.user_id));
      const customersData = profilesData.filter(p => customerIds.has(p.id));

      setCustomers(customersData);
      setFilteredCustomers(customersData);

      // Fetch vehicles for all customers
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .in('owner_id', customersData.map(c => c.id));

      if (vehiclesError) throw vehiclesError;

      const vehiclesByOwner: Record<string, Vehicle[]> = {};
      vehiclesData?.forEach(vehicle => {
        if (!vehiclesByOwner[vehicle.owner_id]) {
          vehiclesByOwner[vehicle.owner_id] = [];
        }
        vehiclesByOwner[vehicle.owner_id].push(vehicle);
      });

      setVehicles(vehiclesByOwner);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowProfile(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Customer Directory</h2>
        <p className="text-muted-foreground">View customer profiles and vehicles</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-muted-foreground">No customers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{customer.name || 'No Name'}</CardTitle>
                <CardDescription>ID: {customer.system_id || customer.id.slice(0, 8)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Email: {customer.email || 'N/A'}</p>
                  <p className="text-muted-foreground">Phone: {customer.phone || 'N/A'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary">
                    {vehicles[customer.id]?.length || 0} vehicle{vehicles[customer.id]?.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewProfile(customer)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-100px)]">
            {selectedCustomer && (
              <EnhancedCustomerProfile 
                customerId={selectedCustomer.id}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
