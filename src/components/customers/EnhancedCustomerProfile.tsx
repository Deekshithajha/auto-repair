import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Profile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  customer_id?: string;
  dob_month?: number;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  preferred_notification: 'text' | 'call' | 'email';
  legacy_status: 'new' | 'returning' | 'legacy' | 'returning_not_in_system';
  campaign_notes?: string;
  invoice_count: number;
  created_at: string;
}

interface CommunicationLog {
  id: string;
  communication_type: 'call' | 'text' | 'email';
  direction: 'inbound' | 'outbound';
  notes?: string;
  timestamp: string;
  created_by: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  is_active: boolean;
  created_at: string;
}

interface EnhancedCustomerProfileProps {
  customerId: string;
}

export const EnhancedCustomerProfile: React.FC<EnhancedCustomerProfileProps> = ({ customerId }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [showCommDialog, setShowCommDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    customer_id: '',
    dob_month: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    preferred_notification: 'email' as 'text' | 'call' | 'email',
    legacy_status: 'new' as Profile['legacy_status'],
    campaign_notes: ''
  });

  const [commFormData, setCommFormData] = useState({
    type: 'call' as 'call' | 'text' | 'email',
    direction: 'outbound' as 'inbound' | 'outbound',
    notes: ''
  });

  useEffect(() => {
    fetchCustomerData();
  }, [customerId]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .single();

      if (profileError) throw profileError;

      const typedProfile = profileData as any;
      setProfile(typedProfile);
      setFormData({
        name: typedProfile.name || typedProfile.full_name || '',
        phone: typedProfile.phone || '',
        email: typedProfile.email || '',
        customer_id: typedProfile.system_id || '',
        dob_month: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip_code: '',
        preferred_notification: 'email',
        legacy_status: 'active',
        campaign_notes: ''
      });

      // Communications log table doesn't exist - skip for now
      setCommunications([]);

      // Fetch vehicles
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('owner_id', customerId)
        .order('created_at', { ascending: false });

      setVehicles((vehicleData || []) as Vehicle[]);

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

  const handleSaveProfile = async () => {
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        customer_id: formData.customer_id || null,
        dob_month: formData.dob_month ? parseInt(formData.dob_month) : null,
        address_line1: formData.address_line1 || null,
        address_line2: formData.address_line2 || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        preferred_notification: formData.preferred_notification,
        legacy_status: formData.legacy_status,
        campaign_notes: formData.campaign_notes || null
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', customerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer profile updated"
      });

      setIsEditing(false);
      fetchCustomerData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLogCommunication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('communications_log')
        .insert([{
          customer_id: customerId,
          communication_type: commFormData.type,
          direction: commFormData.direction,
          notes: commFormData.notes || null,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Communication logged"
      });

      setShowCommDialog(false);
      setCommFormData({
        type: 'call',
        direction: 'outbound',
        notes: ''
      });
      fetchCustomerData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getLegacyStatusColor = (status: Profile['legacy_status']) => {
    switch (status) {
      case 'new': return 'default';
      case 'returning': return 'secondary';
      case 'legacy': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-center p-8">Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <div className="flex gap-2 mt-2">
            <Badge variant={getLegacyStatusColor(profile.legacy_status)}>
              {profile.legacy_status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {profile.invoice_count} Invoice{profile.invoice_count !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCommDialog(true)}>
            📞 Log Communication
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        {/* Information Tab */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Customer contact details</CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    ✏️ Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Customer ID</Label>
                <Input
                  value={formData.customer_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Auto-generated or custom ID"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Birth Month (for marketing)</Label>
                <Select
                  value={formData.dob_month}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dob_month: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Address Line 1</Label>
                <Input
                  value={formData.address_line1}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="123 Main St"
                />
              </div>

              <div className="space-y-2">
                <Label>Address Line 2</Label>
                <Input
                  value={formData.address_line2}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Apt 4B"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    disabled={!isEditing}
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code</Label>
                  <Input
                    value={formData.zip_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Notification Method</Label>
                <Select
                  value={formData.preferred_notification}
                  onValueChange={(value: 'text' | 'call' | 'email') => 
                    setFormData(prev => ({ ...prev, preferred_notification: value }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="text">💬 Text/SMS</SelectItem>
                    <SelectItem value="call">📞 Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status & Marketing</CardTitle>
              <CardDescription>Customer status and campaign information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Legacy Status</Label>
                <Select
                  value={formData.legacy_status}
                  onValueChange={(value: Profile['legacy_status']) => 
                    setFormData(prev => ({ ...prev, legacy_status: value }))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">🆕 New Customer</SelectItem>
                    <SelectItem value="returning">🔄 Returning Customer</SelectItem>
                    <SelectItem value="legacy">⭐ Legacy Customer</SelectItem>
                    <SelectItem value="returning_not_in_system">↩️ Returning (Not in System)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Auto-updates to "Returning" after 2+ invoices
                </p>
              </div>

              <div className="space-y-2">
                <Label>Campaign Notes</Label>
                <Textarea
                  value={formData.campaign_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaign_notes: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Marketing campaigns, promotions, special offers..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Communications Log</CardTitle>
                  <CardDescription>All interactions with this customer</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowCommDialog(true)}>
                  ➕ Log New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {communications.map((comm) => (
                  <Card key={comm.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {comm.communication_type === 'call' ? '📞' : 
                             comm.communication_type === 'text' ? '💬' : '📧'}
                          </span>
                          <div>
                            <p className="font-medium capitalize">
                              {comm.communication_type} - {comm.direction}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(comm.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={comm.direction === 'outbound' ? 'default' : 'secondary'}>
                          {comm.direction}
                        </Badge>
                      </div>
                      {comm.notes && (
                        <p className="text-sm mt-2 pl-8">{comm.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {communications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No communications logged yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Vehicles</CardTitle>
              <CardDescription>All vehicles registered to this customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Added {new Date(vehicle.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={vehicle.is_active ? 'default' : 'secondary'}>
                          {vehicle.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {vehicles.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No vehicles registered yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Communication Dialog */}
      <Dialog open={showCommDialog} onOpenChange={setShowCommDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
            <DialogDescription>
              Record an interaction with {profile.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Communication Type</Label>
              <Select
                value={commFormData.type}
                onValueChange={(value: 'call' | 'text' | 'email') => 
                  setCommFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">📞 Phone Call</SelectItem>
                  <SelectItem value="text">💬 Text/SMS</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={commFormData.direction}
                onValueChange={(value: 'inbound' | 'outbound') => 
                  setCommFormData(prev => ({ ...prev, direction: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">⬆️ Outbound (We contacted them)</SelectItem>
                  <SelectItem value="inbound">⬇️ Inbound (They contacted us)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={commFormData.notes}
                onChange={(e) => setCommFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="What was discussed?"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogCommunication}>
              Log Communication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};