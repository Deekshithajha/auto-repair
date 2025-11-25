import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicles: Vehicle[];
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  reg_no: string;
  license_no: string;
  vin?: string;
  repair_history: RepairRecord[];
}

interface RepairRecord {
  id: string;
  ticket_number: string;
  description: string;
  status: string;
  created_at: string;
  completed_at?: string;
  total_cost: number;
  damage_logs: DamageLog[];
}

interface DamageLog {
  id: string;
  description: string;
  logged_at: string;
  logged_by: string;
  is_new_damage: boolean;
  photo_ids?: string[];
}

export const EnhancedVehicleRegistration: React.FC = () => {
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<'license' | 'phone'>('license');
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleHistory, setShowVehicleHistory] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  
  // New customer form
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  
  // New vehicle form
  const [newVehicleForm, setNewVehicleForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    reg_no: '',
    license_no: '',
    vin: ''
  });

  // Dummy data for demonstration
  const dummyCustomers: Customer[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      vehicles: [
        {
          id: 'veh-11111111-1111-1111-1111-111111111111',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          reg_no: 'ABC-1234',
          license_no: 'ABC-1234',
          vin: '1HGBH41JXMN109186',
          repair_history: [
            {
              id: 'repair-1',
              ticket_number: 'WO-001',
              description: 'Engine diagnostic and spark plug replacement',
              status: 'completed',
              created_at: '2024-01-15T10:30:00Z',
              completed_at: '2024-01-18T16:00:00Z',
              total_cost: 285.50,
              damage_logs: [
                {
                  id: 'damage-1',
                  description: 'Engine misfire detected - spark plugs worn',
                  logged_at: '2024-01-15T11:00:00Z',
                  logged_by: 'Alex Rodriguez',
                  is_new_damage: false
                },
                {
                  id: 'damage-2',
                  description: 'Minor scratch on front bumper',
                  logged_at: '2024-01-15T11:30:00Z',
                  logged_by: 'Alex Rodriguez',
                  is_new_damage: true
                }
              ]
            },
            {
              id: 'repair-2',
              ticket_number: 'WO-002',
              description: 'Oil change and brake inspection',
              status: 'completed',
              created_at: '2023-12-10T09:00:00Z',
              completed_at: '2023-12-10T11:00:00Z',
              total_cost: 125.00,
              damage_logs: []
            }
          ]
        }
      ]
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 234-5678',
      vehicles: [
        {
          id: 'veh-22222222-2222-2222-2222-222222222222',
          make: 'Honda',
          model: 'Civic',
          year: 2019,
          reg_no: 'XYZ-5678',
          license_no: 'XYZ-5678',
          vin: '2HGBH41JXMN109187',
          repair_history: [
            {
              id: 'repair-3',
              ticket_number: 'WO-003',
              description: 'AC system repair',
              status: 'completed',
              created_at: '2024-01-12T09:15:00Z',
              completed_at: '2024-01-15T15:30:00Z',
              total_cost: 420.75,
              damage_logs: [
                {
                  id: 'damage-3',
                  description: 'AC compressor failure - refrigerant leak',
                  logged_at: '2024-01-12T10:00:00Z',
                  logged_by: 'Lisa Chen',
                  is_new_damage: false
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search value",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    
    try {
      // Simulate API call with dummy data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let foundCustomerData: Customer | null = null;
      
      if (searchType === 'license') {
        foundCustomerData = dummyCustomers.find(customer => 
          customer.vehicles.some(vehicle => 
            vehicle.license_no.toLowerCase() === searchValue.toLowerCase() ||
            vehicle.reg_no.toLowerCase() === searchValue.toLowerCase()
          )
        ) || null;
      } else {
        foundCustomerData = dummyCustomers.find(customer => 
          customer.phone === searchValue || customer.phone.replace(/\D/g, '') === searchValue.replace(/\D/g, '')
        ) || null;
      }
      
      if (foundCustomerData) {
        setFoundCustomer(foundCustomerData);
        toast({
          title: "Customer Found",
          description: `Found customer: ${foundCustomerData.name}`
        });
      } else {
        setFoundCustomer(null);
        toast({
          title: "No Customer Found",
          description: "No existing customer found. You can create a new customer."
        });
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search for customer",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleHistory(true);
  };

  const handleCreateNewCustomer = async () => {
    if (!newCustomerForm.name || !newCustomerForm.email || !newCustomerForm.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get current user for authentication
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      let profileId: string;
      
      // If user is authenticated, use their ID; otherwise create a new one
      if (authUser) {
        profileId = authUser.id;
      } else {
        // For non-authenticated user creation (admin creating customer)
        profileId = crypto.randomUUID();
      }

      // Create customer profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: profileId,
          name: newCustomerForm.name,
          email: newCustomerForm.email,
          phone: newCustomerForm.phone
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // Create vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          owner_id: profileData.id,
          make: newVehicleForm.make,
          model: newVehicleForm.model,
          year: newVehicleForm.year,
          license_plate: newVehicleForm.license_no,
          vin: newVehicleForm.vin || null
        })
        .select()
        .single();

      if (vehicleError) throw vehicleError;

      toast({
        title: "Success",
        description: "Customer and vehicle created successfully"
      });

      // Reset forms
      setNewCustomerForm({ name: '', email: '', phone: '', password: '' });
      setNewVehicleForm({ make: '', model: '', year: new Date().getFullYear(), reg_no: '', license_no: '', vin: '' });
      setShowNewCustomerForm(false);
      setFoundCustomer(null);
      setSearchValue('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create customer",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vehicle Registration</h2>
        <p className="text-muted-foreground">Search for existing customers or register new ones</p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Existing Customer</CardTitle>
          <CardDescription>Search by license plate or phone number to find existing customers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={searchType} onValueChange={(value: any) => setSearchType(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="license">License Plate</TabsTrigger>
              <TabsTrigger value="phone">Phone Number</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Input
              placeholder={searchType === 'license' ? 'Enter license plate (e.g., ABC-1234)' : 'Enter phone number (e.g., (555) 123-4567)'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {foundCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Found</CardTitle>
            <CardDescription>Select a vehicle or create a new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold">{foundCustomer.name}</h3>
              <p className="text-sm text-muted-foreground">{foundCustomer.email}</p>
              <p className="text-sm text-muted-foreground">{foundCustomer.phone}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Existing Vehicles</h4>
              <div className="grid gap-2">
                {foundCustomer.vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleVehicleSelect(vehicle)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-muted-foreground">
                            License: {vehicle.license_no} • Reg: {vehicle.reg_no}
                          </p>
                        </div>
                        <Badge variant="outline">View History</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowNewCustomerForm(true)}>
                Add New Vehicle
              </Button>
              <Button variant="outline" onClick={() => setFoundCustomer(null)}>
                Search Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Customer Found */}
      {!foundCustomer && searchValue && !searching && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-lg font-semibold mb-2">No Customer Found</h3>
            <p className="text-muted-foreground mb-4">
              No existing customer found with the provided {searchType === 'license' ? 'license plate' : 'phone number'}.
            </p>
            <Button onClick={() => setShowNewCustomerForm(true)}>
              Create New Customer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Vehicle History Dialog */}
      <Dialog open={showVehicleHistory} onOpenChange={setShowVehicleHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vehicle Repair History</DialogTitle>
            <DialogDescription>
              {selectedVehicle && `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.license_no})`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-4">
              {selectedVehicle.repair_history.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔧</div>
                  <h3 className="text-lg font-semibold mb-2">No Repair History</h3>
                  <p className="text-muted-foreground">This vehicle has no previous repair records.</p>
                </div>
              ) : (
                selectedVehicle.repair_history.map((repair) => (
                  <Card key={repair.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{repair.ticket_number}</CardTitle>
                          <CardDescription>{repair.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant={repair.status === 'completed' ? 'default' : 'secondary'}>
                            {repair.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">${repair.total_cost.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Created:</span>
                          <span className="text-muted-foreground ml-2">
                            {new Date(repair.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {repair.completed_at && (
                          <div>
                            <span className="font-medium">Completed:</span>
                            <span className="text-muted-foreground ml-2">
                              {new Date(repair.completed_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {repair.damage_logs.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Damage Logs</h4>
                          <div className="space-y-2">
                            {repair.damage_logs.map((damage) => (
                              <div key={damage.id} className="bg-muted/50 p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <p className="text-sm">{damage.description}</p>
                                  <div className="flex gap-2">
                                    <Badge variant={damage.is_new_damage ? 'destructive' : 'secondary'} className="text-xs">
                                      {damage.is_new_damage ? 'New Damage' : 'Existing'}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Logged by {damage.logged_by} on {new Date(damage.logged_at).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Customer Form Dialog */}
      <Dialog open={showNewCustomerForm} onOpenChange={setShowNewCustomerForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Customer & Vehicle</DialogTitle>
            <DialogDescription>Register a new customer and their vehicle</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, email: e.target.value})}
                    placeholder="customer@email.com"
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({...newCustomerForm, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Make *</Label>
                  <Input
                    value={newVehicleForm.make}
                    onChange={(e) => setNewVehicleForm({...newVehicleForm, make: e.target.value})}
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <Label>Model *</Label>
                  <Input
                    value={newVehicleForm.model}
                    onChange={(e) => setNewVehicleForm({...newVehicleForm, model: e.target.value})}
                    placeholder="Camry"
                  />
                </div>
                <div>
                  <Label>Year *</Label>
                  <Input
                    type="number"
                    value={newVehicleForm.year}
                    onChange={(e) => setNewVehicleForm({...newVehicleForm, year: parseInt(e.target.value) || new Date().getFullYear()})}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <Label>License Plate *</Label>
                  <Input
                    value={newVehicleForm.license_no}
                    onChange={(e) => setNewVehicleForm({...newVehicleForm, license_no: e.target.value.toUpperCase()})}
                    placeholder="ABC-1234"
                  />
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <Input
                    value={newVehicleForm.reg_no}
                    onChange={(e) => setNewVehicleForm({...newVehicleForm, reg_no: e.target.value.toUpperCase()})}
                    placeholder="REG-123456"
                  />
                </div>
                <div>
                  <Label>VIN Number</Label>
                  <Input
                    value={newVehicleForm.vin}
                    onChange={(e) => setNewVehicleForm({...newVehicleForm, vin: e.target.value.toUpperCase()})}
                    placeholder="17-character VIN"
                    maxLength={17}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewCustomerForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNewCustomer}>
                Create Customer & Vehicle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
