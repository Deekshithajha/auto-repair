import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { PhotoViewerModal } from '../shared/PhotoViewerModal';
import { VehicleServiceHistory } from './VehicleServiceHistory';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  reg_no?: string;
  license_no?: string;
  vin?: string;
  engine_size?: string;
  mileage?: number;
  trim_code?: string;
  drive_train?: string;
  location_status: 'in_shop' | 'not_in_shop';
  is_active: boolean;
  expected_return_date?: string;
  created_at: string;
}

interface VehiclePhoto {
  id: string;
  vehicle_id: string;
  photo_type: 'exterior' | 'interior' | 'vin_sticker' | 'damage';
  storage_path: string | null;
  photo_data: string | null;
  uploaded_at: string;
}

interface DamageLog {
  id: string;
  vehicle_id: string;
  description: string;
  logged_at: string;
  ticket_id?: string;
  logged_by: string;
}

interface EnhancedVehicleProfileProps {
  vehicleId?: string;
  onClose?: () => void;
}

export const EnhancedVehicleProfile: React.FC<EnhancedVehicleProfileProps> = ({ vehicleId, onClose }) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [photos, setPhotos] = useState<VehiclePhoto[]>([]);
  const [damageLog, setDamageLog] = useState<DamageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(!vehicleId);
  const [expectedReturnDate, setExpectedReturnDate] = useState<Date | undefined>();
  
  // Form data for customer fields
  const [customerFormData, setCustomerFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    reg_no: '',
    license_no: ''
  });

  // Form data for mechanic fields
  const [mechanicFormData, setMechanicFormData] = useState({
    vin: '',
    engine_size: '',
    mileage: 0,
    trim_code: '',
    drive_train: '',
    location_status: 'not_in_shop' as 'in_shop' | 'not_in_shop',
    is_active: true
  });

  const [damageFormData, setDamageFormData] = useState({
    description: '',
    photoFile: null as File | null
  });

  // Photo viewer state
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [viewerPhotos, setViewerPhotos] = useState<Array<{ id: string; url: string; caption?: string; date?: string }>>([]);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleData();
    }
  }, [vehicleId]);

  const fetchVehicleData = async () => {
    if (!vehicleId) return;
    
    try {
      setLoading(true);
      
      // Fetch vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();

      if (vehicleError) throw vehicleError;
      
      setVehicle(vehicleData as Vehicle);
      setCustomerFormData({
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        reg_no: vehicleData.reg_no || '',
        license_no: vehicleData.license_no || ''
      });
      
      setMechanicFormData({
        vin: vehicleData.vin || '',
        engine_size: vehicleData.engine_size || '',
        mileage: vehicleData.mileage || 0,
        trim_code: vehicleData.trim_code || '',
        drive_train: vehicleData.drive_train || '',
        location_status: (vehicleData.location_status as 'in_shop' | 'not_in_shop') || 'not_in_shop',
        is_active: vehicleData.is_active
      });

      if (vehicleData.expected_return_date) {
        setExpectedReturnDate(new Date(vehicleData.expected_return_date));
      }

      // Fetch photos
      const { data: photosData } = await supabase
        .from('vehicle_photos')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('uploaded_at', { ascending: false });

      setPhotos((photosData || []) as VehiclePhoto[]);

      // Fetch damage log
      const { data: damageData } = await supabase
        .from('damage_log')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('logged_at', { ascending: false });

      setDamageLog(damageData || []);

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

  const handleSaveCustomerFields = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (vehicleId) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update(customerFormData)
          .eq('id', vehicleId);
        
        if (error) throw error;
      } else {
        // Create new vehicle
        const { data, error } = await supabase
          .from('vehicles')
          .insert([{ ...customerFormData, user_id: user.id }])
          .select()
          .single();
        
        if (error) throw error;
        
        // Redirect to edit the newly created vehicle
        window.location.hash = `#vehicle/${data.id}`;
      }

      toast({
        title: "Success",
        description: "Vehicle information saved"
      });
      
      setIsEditing(false);
      if (vehicleId) {
        fetchVehicleData();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSaveMechanicFields = async () => {
    if (!vehicleId) return;
    
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          ...mechanicFormData,
          expected_return_date: expectedReturnDate?.toISOString()
        })
        .eq('id', vehicleId);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Mechanic fields updated"
      });
      
      fetchVehicleData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (photoType: VehiclePhoto['photo_type'], file: File) => {
    if (!vehicleId || !file) return;
    
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert image to base64
      const base64Data = await convertFileToBase64(file);

      // Save photo record directly in database
      const { error: dbError } = await supabase
        .from('vehicle_photos')
        .insert([{
          vehicle_id: vehicleId,
          photo_type: photoType,
          photo_data: base64Data,
          storage_path: null,
          uploaded_by: user.id
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Photo uploaded successfully"
      });
      
      fetchVehicleData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddDamageLog = async () => {
    if (!vehicleId || !damageFormData.description) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('damage_log')
        .insert([{
          vehicle_id: vehicleId,
          description: damageFormData.description,
          logged_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Damage log entry added"
      });
      
      setDamageFormData({ description: '', photoFile: null });
      fetchVehicleData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getPhotoUrl = (photo: VehiclePhoto) => {
    // Use photo_data if available (base64), otherwise fall back to storage_path
    if (photo.photo_data) {
      return photo.photo_data;
    }
    if (photo.storage_path) {
      const { data } = supabase.storage
        .from('vehicle-photos')
        .getPublicUrl(photo.storage_path);
      return data.publicUrl;
    }
    return '';
  };

  const handleOpenPhotoViewer = (photoType: string) => {
    const typePhotos = photos
      .filter(p => p.photo_type === photoType)
      .map(p => ({
        id: p.id,
        url: getPhotoUrl(p),
        caption: `${photoType.replace('_', ' ')} photo`,
        date: new Date(p.uploaded_at).toLocaleDateString()
      }));
    
    setViewerPhotos(typePhotos);
    setInitialPhotoIndex(0);
    setPhotoViewerOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">
            {vehicle ? `${vehicle.make} ${vehicle.model}` : 'New Vehicle'}
          </h2>
          {vehicle && (
            <div className="flex gap-2 mt-2">
              <Badge variant={vehicle.is_active ? "default" : "secondary"}>
                {vehicle.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant={vehicle.location_status === 'in_shop' ? "default" : "outline"}>
                {vehicle.location_status === 'in_shop' ? '🏭 In Shop' : '🏠 Not In Shop'}
              </Badge>
            </div>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>✕</Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="damage">Damage Log</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {/* Customer Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Customer Information</CardTitle>
                  <CardDescription>Basic vehicle details</CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    ✏️ Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Make *</Label>
                  <Input
                    value={customerFormData.make}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, make: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Toyota, Honda, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model *</Label>
                  <Input
                    value={customerFormData.model}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, model: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Camry, Civic, etc."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Year *</Label>
                <Input
                  type="number"
                  value={customerFormData.year}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  disabled={!isEditing}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              
              <div className="space-y-2">
                <Label>License Plate</Label>
                <Input
                  value={customerFormData.license_no}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, license_no: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="ABC-1234"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input
                  value={customerFormData.reg_no}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, reg_no: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="REG123456"
                />
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveCustomerFields} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mechanic Section - Only visible if vehicle exists */}
          {vehicleId && (
            <Card>
              <CardHeader>
                <CardTitle>Mechanic Information</CardTitle>
                <CardDescription>Technical details (Staff only)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>VIN</Label>
                  <Input
                    value={mechanicFormData.vin}
                    onChange={(e) => setMechanicFormData(prev => ({ ...prev, vin: e.target.value }))}
                    placeholder="17-character VIN"
                    maxLength={17}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Engine Size</Label>
                    <Input
                      value={mechanicFormData.engine_size}
                      onChange={(e) => setMechanicFormData(prev => ({ ...prev, engine_size: e.target.value }))}
                      placeholder="2.0L, 3.5L V6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mileage</Label>
                    <Input
                      type="number"
                      value={mechanicFormData.mileage}
                      onChange={(e) => setMechanicFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trim Code</Label>
                    <Input
                      value={mechanicFormData.trim_code}
                      onChange={(e) => setMechanicFormData(prev => ({ ...prev, trim_code: e.target.value }))}
                      placeholder="LX, EX, Sport"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Drive Train</Label>
                    <Select
                      value={mechanicFormData.drive_train}
                      onValueChange={(value) => setMechanicFormData(prev => ({ ...prev, drive_train: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select drive train" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FWD">FWD</SelectItem>
                        <SelectItem value="RWD">RWD</SelectItem>
                        <SelectItem value="AWD">AWD</SelectItem>
                        <SelectItem value="4WD">4WD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Location Status</Label>
                      <p className="text-sm text-muted-foreground">Is vehicle currently in shop?</p>
                    </div>
                    <Switch
                      checked={mechanicFormData.location_status === 'in_shop'}
                      onCheckedChange={(checked) => 
                        setMechanicFormData(prev => ({ ...prev, location_status: checked ? 'in_shop' : 'not_in_shop' }))
                      }
                    />
                  </div>

                  {mechanicFormData.location_status === 'not_in_shop' && (
                    <div className="space-y-2">
                      <Label>Expected Return Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {expectedReturnDate ? format(expectedReturnDate, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={expectedReturnDate}
                            onSelect={setExpectedReturnDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Active Status</Label>
                      <p className="text-sm text-muted-foreground">Is this vehicle active in system?</p>
                    </div>
                    <Switch
                      checked={mechanicFormData.is_active}
                      onCheckedChange={(checked) => 
                        setMechanicFormData(prev => ({ ...prev, is_active: checked }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveMechanicFields} className="w-full">
                  Update Mechanic Info
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Photos</CardTitle>
              <CardDescription>Upload and manage vehicle photos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['exterior', 'interior', 'vin_sticker'].map((type) => (
                  <div key={type} className="space-y-2">
                    <Label className="capitalize">{type.replace('_', ' ')}</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(type as VehiclePhoto['photo_type'], file);
                      }}
                      disabled={uploading || !vehicleId}
                    />
                    {photos.filter(p => p.photo_type === type).map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={getPhotoUrl(photo)}
                          alt={type}
                          className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleOpenPhotoViewer(type)}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded">
                          <span className="text-white text-sm">👁️ View</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Damage Log Tab */}
        <TabsContent value="damage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Damage History</CardTitle>
              <CardDescription>Track vehicle damage across visits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new damage */}
              {vehicleId && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Add Damage Entry</h4>
                  <Textarea
                    placeholder="Describe the damage..."
                    value={damageFormData.description}
                    onChange={(e) => setDamageFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Button onClick={handleAddDamageLog} disabled={!damageFormData.description}>
                    Add Damage Log
                  </Button>
                </div>
              )}

              {/* Damage history */}
              <div className="space-y-3">
                {damageLog.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>{new Date(log.logged_at).toLocaleDateString()}</span>
                        {log.ticket_id && <Badge variant="outline">Linked to ticket</Badge>}
                      </div>
                      <p>{log.description}</p>
                    </CardContent>
                  </Card>
                ))}
                {damageLog.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No damage logs recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {vehicleId ? (
            <VehicleServiceHistory vehicleId={vehicleId} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Service History</CardTitle>
                <CardDescription>Service history will be available after vehicle is created</CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Photo Viewer Modal */}
      <PhotoViewerModal
        photos={viewerPhotos}
        initialIndex={initialPhotoIndex}
        open={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
      />
    </div>
  );
};