import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

type Step = 1 | 2 | 3;

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
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    channels: [] as ('email' | 'sms' | 'whatsapp')[],
    primary: 'sms' as 'email' | 'sms' | 'whatsapp',
    comms_opt_in: true,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    preferred_pickup_at: '',
    email: '',
    phone: '',
    whatsapp_number: '',
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
        setNewVehicle({ make: '', model: '', year: new Date().getFullYear(), license_no: '' });
        setTicketDetails({ description: '', preferred_pickup_time: '' });
        setCreatedTicketId(null);
        setNotificationPrefs({
          channels: [],
          primary: 'sms',
          comms_opt_in: true,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          preferred_pickup_at: '',
          email: '',
          phone: '',
          whatsapp_number: '',
        });
      }, 200);
    }
  }, [open]);

  // Auto-detect timezone on mount
  useEffect(() => {
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    setNotificationPrefs(prev => ({ ...prev, timezone: detectedTz }));
  }, []);

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
    if (step === 3) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2) {
      // Step 2: Create ticket, then move to step 3
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

        const { data: ticket, error: tErr } = await supabase
          .from('tickets')
          .insert([{ vehicle_id: vehicleId, description: ticketDetails.description, preferred_pickup_time: ticketDetails.preferred_pickup_time || null, user_id: selectedCustomer.id }])
          .select()
          .single();
        if (tErr) throw tErr;

        setCreatedTicketId(ticket.id);
        // Pre-fill notification prefs with customer data
        setNotificationPrefs(prev => ({
          ...prev,
          email: newCustomer.email || selectedCustomer.email || '',
          phone: selectedCustomer.phone || '',
        }));
        setStep(3);
        toast({ title: 'Ticket created', description: 'Now set notification preferences' });
      } catch (err: any) {
        console.error(err);
        toast({ title: 'Failed to create ticket', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      // Step 3: Save notification preferences
      await handleSaveNotificationPrefs();
    }
  };

  const handleSaveNotificationPrefs = async () => {
    if (!createdTicketId) {
      toast({ title: 'Error', description: 'No ticket found', variant: 'destructive' });
      return;
    }

    // Validate channels selected
    if (notificationPrefs.channels.length === 0) {
      toast({ title: 'Missing channels', description: 'Select at least one notification channel', variant: 'destructive' });
      return;
    }

    // Validate contact info based on selected channels
    if (notificationPrefs.channels.includes('email') && !notificationPrefs.email) {
      toast({ title: 'Missing email', description: 'Email is required when email channel is selected', variant: 'destructive' });
      return;
    }
    if (notificationPrefs.channels.includes('sms') && !notificationPrefs.phone) {
      toast({ title: 'Missing phone', description: 'Phone number is required when SMS channel is selected', variant: 'destructive' });
      return;
    }
    if (notificationPrefs.channels.includes('whatsapp') && !notificationPrefs.whatsapp_number && !notificationPrefs.phone) {
      toast({ title: 'Missing WhatsApp number', description: 'WhatsApp number is required when WhatsApp channel is selected', variant: 'destructive' });
      return;
    }

    if (!notificationPrefs.preferred_pickup_at) {
      toast({ title: 'Missing pickup time', description: 'Please select preferred pickup date and time', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Convert local datetime to ISO string
      const pickupDateTime = new Date(notificationPrefs.preferred_pickup_at).toISOString();

      const supabaseUrl = 'https://vlelbfqrszjzyuplrogx.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/save-notification-prefs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_id: createdTicketId,
          channels: notificationPrefs.channels,
          primary: notificationPrefs.primary,
          comms_opt_in: notificationPrefs.comms_opt_in,
          language: notificationPrefs.language,
          timezone: notificationPrefs.timezone,
          preferred_pickup_at: pickupDateTime,
          email: notificationPrefs.email,
          phone: notificationPrefs.phone,
          whatsapp_number: notificationPrefs.whatsapp_number || notificationPrefs.phone,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save preferences');
      }

      toast({ title: 'Preferences saved', description: 'Confirmation message sent' });
      onOpenChange(false);
      if (onTicketCreated) onTicketCreated();
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Failed to save preferences', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (channel: 'email' | 'sms' | 'whatsapp', checked: boolean) => {
    setNotificationPrefs(prev => {
      const newChannels = checked
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel);
      
      // If primary channel is removed, set first remaining channel as primary
      let newPrimary = prev.primary;
      if (!newChannels.includes(newPrimary) && newChannels.length > 0) {
        newPrimary = newChannels[0];
      } else if (newChannels.length === 0) {
        newPrimary = 'sms';
      }

      return {
        ...prev,
        channels: newChannels,
        primary: newPrimary,
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Raise New Ticket</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Step 1: Customer credentials (new or existing)'}
            {step === 2 && 'Step 2: Vehicle details and ticket'}
            {step === 3 && 'Step 3: Notifications & Pickup'}
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
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Next: Notifications'}</Button>
              </DialogFooter>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6" role="group" aria-labelledby="notification-step-heading">
              <h3 id="notification-step-heading" className="text-sm font-semibold">Notifications & Pickup Preferences</h3>

              {/* Notification Channels */}
              <div className="space-y-3">
                <Label>Notification Channels (Select all that apply)</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="channel-email"
                      checked={notificationPrefs.channels.includes('email')}
                      onCheckedChange={(checked) => handleChannelToggle('email', checked as boolean)}
                    />
                    <Label htmlFor="channel-email" className="font-normal cursor-pointer">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="channel-sms"
                      checked={notificationPrefs.channels.includes('sms')}
                      onCheckedChange={(checked) => handleChannelToggle('sms', checked as boolean)}
                    />
                    <Label htmlFor="channel-sms" className="font-normal cursor-pointer">SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="channel-whatsapp"
                      checked={notificationPrefs.channels.includes('whatsapp')}
                      onCheckedChange={(checked) => handleChannelToggle('whatsapp', checked as boolean)}
                    />
                    <Label htmlFor="channel-whatsapp" className="font-normal cursor-pointer">WhatsApp</Label>
                  </div>
                </div>
              </div>

              {/* Primary Channel */}
              {notificationPrefs.channels.length > 0 && (
                <div className="space-y-2">
                  <Label>Primary Notification Channel</Label>
                  <RadioGroup
                    value={notificationPrefs.primary}
                    onValueChange={(value) => setNotificationPrefs(prev => ({ ...prev, primary: value as 'email' | 'sms' | 'whatsapp' }))}
                  >
                    {notificationPrefs.channels.map(channel => (
                      <div key={channel} className="flex items-center space-x-2">
                        <RadioGroupItem value={channel} id={`primary-${channel}`} />
                        <Label htmlFor={`primary-${channel}`} className="font-normal cursor-pointer capitalize">{channel}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Contact Information (conditionally required) */}
              {notificationPrefs.channels.includes('email') && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={notificationPrefs.email}
                    onChange={(e) => setNotificationPrefs(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              )}

              {notificationPrefs.channels.includes('sms') && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (SMS) *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={notificationPrefs.phone}
                    onChange={(e) => setNotificationPrefs(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                    required
                  />
                </div>
              )}

              {notificationPrefs.channels.includes('whatsapp') && (
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={notificationPrefs.whatsapp_number || notificationPrefs.phone}
                    onChange={(e) => setNotificationPrefs(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                    placeholder="+1234567890"
                    required
                  />
                </div>
              )}

              {/* Language & Timezone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={notificationPrefs.language}
                    onValueChange={(value) => setNotificationPrefs(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={notificationPrefs.timezone}
                    onValueChange={(value) => setNotificationPrefs(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="comms-opt-in"
                  checked={notificationPrefs.comms_opt_in}
                  onCheckedChange={(checked) => setNotificationPrefs(prev => ({ ...prev, comms_opt_in: checked as boolean }))}
                />
                <Label htmlFor="comms-opt-in" className="font-normal cursor-pointer">
                  I agree to be contacted via selected channels
                </Label>
              </div>

              {/* Preferred Pickup Date/Time */}
              <div className="space-y-2">
                <Label htmlFor="pickup_at">Preferred Pickup Date & Time *</Label>
                <Input
                  id="pickup_at"
                  type="datetime-local"
                  value={notificationPrefs.preferred_pickup_at}
                  onChange={(e) => setNotificationPrefs(prev => ({ ...prev, preferred_pickup_at: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>

              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save & Send Confirmation'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RaiseTicketWizard;


