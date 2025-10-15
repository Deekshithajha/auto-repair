import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RaiseTicketWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketCreated?: () => void;
}

interface Profile {
  id: string;
  name: string;
  role: 'user' | 'employee' | 'admin';
  phone?: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_no?: string | null;
}

type Step = 1 | 2;

export const RaiseTicketWizard: React.FC<RaiseTicketWizardProps> = ({ open, onOpenChange, onTicketCreated }) => {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [isExistingCustomer, setIsExistingCustomer] = useState(true);
  const [customerSearchEmail, setCustomerSearchEmail] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_no: '',
  });
  const [ticketDetails, setTicketDetails] = useState({
    description: '',
    preferred_pickup_time: '',
  });

  useEffect(() => {
    if (!open) {
      // reset state when closed
      setTimeout(() => {
        setStep(1);
        setLoading(false);
        setIsExistingCustomer(true);
        setCustomerSearchEmail('');
        setSelectedCustomer(null);
        setNewCustomer({ name: '', email: '', password: '' });
        setVehicles([]);
        setSelectedVehicleId('');
        setNewVehicle({ make: '', model: '', year: new Date().getFullYear() });
        setTicketDetails({ description: '', preferred_pickup_time: '' });
      }, 200);
    }
  }, [open]);

  const canContinueStep1 = useMemo(() => {
    if (isExistingCustomer) {
      return Boolean(selectedCustomer?.id);
    }
    return Boolean(newCustomer.email && newCustomer.password && newCustomer.name);
  }, [isExistingCustomer, selectedCustomer, newCustomer]);

  const fetchCustomerByEmail = async () => {
    if (!customerSearchEmail) return;
    setLoading(true);
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', customerSearchEmail);
      if (error) throw error;
      if (users && users.length > 0) {
        const u = users[0] as any;
        setSelectedCustomer({ id: u.id, name: u.name, role: u.role, phone: u.phone });
        // load vehicles for this customer
        const { data: vehiclesData, error: vehErr } = await supabase
          .from('vehicles')
          .select('id, make, model, year, license_no')
          .eq('user_id', u.id)
          .order('updated_at', { ascending: false });
        if (!vehErr && vehiclesData) setVehicles(vehiclesData as any);
        toast({ title: 'Customer found', description: `${u.name} selected` });
      } else {
        setSelectedCustomer(null);
        toast({ title: 'No customer found', description: 'Use New Customer to create one.' });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Lookup failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!canContinueStep1) return;
      // If new customer, create via supabase auth signUp (client-side) and insert profile if your triggers don't
      if (!isExistingCustomer) {
        setLoading(true);
        try {
          const { error } = await supabase.auth.signUp({
            email: newCustomer.email,
            password: newCustomer.password,
            options: {
              data: { name: newCustomer.name },
            },
          });
          if (error) throw error;
          // Fetch created profile by email
          const { data: prof, error: profErr } = await supabase
            .from('profiles')
            .select('*')
            .ilike('email', newCustomer.email)
            .maybeSingle();
          if (profErr) throw profErr;
          if (prof) {
            setSelectedCustomer({ id: prof.id, name: prof.name, role: prof.role, phone: prof.phone });
          }
          toast({ title: 'Customer created', description: `${newCustomer.name} added` });
        } catch (err: any) {
          console.error(err);
          toast({ title: 'Customer creation failed', description: err.message, variant: 'destructive' });
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer?.id) {
      toast({ title: 'Missing customer', description: 'Select or create a customer first', variant: 'destructive' });
      return;
    }
    if (!ticketDetails.description) {
      toast({ title: 'Missing details', description: 'Add a problem description', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      let vehicleId = selectedVehicleId;
      if (!vehicleId) {
        // insert new vehicle
        const { data: veh, error: vehErr } = await supabase
          .from('vehicles')
          .insert([{ make: newVehicle.make, model: newVehicle.model, year: newVehicle.year, license_no: newVehicle.license_no, user_id: selectedCustomer.id }])
          .select()
          .single();
        if (vehErr) throw vehErr;
        vehicleId = veh.id;
      }

      const { error: tErr } = await supabase
        .from('tickets')
        .insert([{ vehicle_id: vehicleId, description: ticketDetails.description, preferred_pickup_time: ticketDetails.preferred_pickup_time || null, user_id: selectedCustomer.id }]);
      if (tErr) throw tErr;

      toast({ title: 'Ticket created', description: 'Repair ticket has been created' });
      onOpenChange(false);
      if (onTicketCreated) onTicketCreated();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Failed to create ticket', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Raise New Ticket</DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Step 1: Customer credentials (new or existing)' : 'Step 2: Vehicle details and ticket'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4" role="group" aria-labelledby="customer-step-heading">
              <h3 id="customer-step-heading" className="text-sm font-semibold">Customer</h3>
              <div className="flex gap-3 items-center">
                <Button type="button" variant={isExistingCustomer ? 'default' : 'outline'} onClick={() => setIsExistingCustomer(true)}>
                  Existing Customer
                </Button>
                <Button type="button" variant={!isExistingCustomer ? 'default' : 'outline'} onClick={() => setIsExistingCustomer(false)}>
                  New Customer
                </Button>
              </div>

              {isExistingCustomer ? (
                <div className="space-y-3">
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <div className="flex gap-2">
                    <Input id="customerEmail" type="email" placeholder="customer@email.com" value={customerSearchEmail} onChange={(e) => setCustomerSearchEmail(e.target.value)} />
                    <Button type="button" onClick={fetchCustomerByEmail} disabled={loading}>Lookup</Button>
                  </div>
                  {selectedCustomer && (
                    <p className="text-sm">Selected: <span className="font-medium">{selectedCustomer.name}</span></p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newName">Full Name</Label>
                    <Input id="newName" value={newCustomer.name} onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">Email</Label>
                    <Input id="newEmail" type="email" value={newCustomer.email} onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))} required />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="newPassword">Temporary Password</Label>
                    <Input id="newPassword" type="password" value={newCustomer.password} onChange={(e) => setNewCustomer(prev => ({ ...prev, password: e.target.value }))} required />
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <div />
                <Button type="button" onClick={handleNext} disabled={!canContinueStep1 || loading}>Next</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6" role="group" aria-labelledby="vehicle-step-heading">
              <h3 id="vehicle-step-heading" className="text-sm font-semibold">Vehicle & Ticket</h3>

              {/* Existing vehicle dropdown */}
              {vehicles.length > 0 && (
                <div className="space-y-2">
                  <Label>Use Previous Vehicle</Label>
                  <Select value={selectedVehicleId} onValueChange={(v) => setSelectedVehicleId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a previous vehicle (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.year} {v.make} {v.model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Or enter a new vehicle below</p>
                </div>
              )}

              {/* New vehicle fields */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" value={newVehicle.make} onChange={(e) => setNewVehicle(prev => ({ ...prev, make: e.target.value }))} placeholder="Toyota" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" value={newVehicle.model} onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))} placeholder="Camry" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" value={newVehicle.year} onChange={(e) => setNewVehicle(prev => ({ ...prev, year: parseInt(e.target.value || '0') }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_no">License Plate</Label>
                  <Input id="license_no" value={newVehicle.license_no} onChange={(e) => setNewVehicle(prev => ({ ...prev, license_no: e.target.value.toUpperCase() }))} placeholder="ABC-1234" />
                </div>
              </div>

              {/* Ticket details */}
              <div className="space-y-2">
                <Label htmlFor="description">Problem Description *</Label>
                <Textarea id="description" rows={4} value={ticketDetails.description} onChange={(e) => setTicketDetails(prev => ({ ...prev, description: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup">Preferred Pickup Time (optional)</Label>
                <Input id="pickup" type="datetime-local" value={ticketDetails.preferred_pickup_time} onChange={(e) => setTicketDetails(prev => ({ ...prev, preferred_pickup_time: e.target.value }))} />
              </div>

              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                </div>
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Ticket'}</Button>
              </DialogFooter>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RaiseTicketWizard;


