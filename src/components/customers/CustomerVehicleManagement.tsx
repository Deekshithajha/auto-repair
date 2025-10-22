import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_no?: string;
  vin?: string;
  photos?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  license_no: string;
  vin: string;
}

export const CustomerVehicleManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehiclePhotos, setVehiclePhotos] = useState<Record<string, File[]>>({});
  
  const [formData, setFormData] = useState<VehicleFormData>({
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    license_no: '',
    vin: ''
  });

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  const fetchVehicles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to load vehicles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (vehicleId: string, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setVehiclePhotos(prev => ({
      ...prev,
      [vehicleId]: [...(prev[vehicleId] || []), ...fileArray].slice(0, 5) // Limit to 5 photos
    }));
  };

  const removePhoto = (vehicleId: string, index: number) => {
    setVehiclePhotos(prev => ({
      ...prev,
      [vehicleId]: prev[vehicleId]?.filter((_, i) => i !== index) || []
    }));
  };

  const uploadVehiclePhotos = async (vehicleId: string, photos: File[]) => {
    if (photos.length === 0) return [];

    const uploadPromises = photos.map(async (photo, index) => {
      const fileExt = photo.name.split('.').pop();
      const fileName = `vehicle-${vehicleId}/${Date.now()}-${index}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('vehicle-photos')
        .upload(fileName, photo);
      
      if (error) throw error;
      return fileName;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const vehicleData = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        license_no: formData.license_no || null,
        vin: formData.vin || null,
        user_id: user.id,
        is_active: true
      };

      let vehicleId: string;

      if (editingVehicle) {
        // Update existing vehicle
        const { data, error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id)
          .select()
          .single();

        if (error) throw error;
        vehicleId = editingVehicle.id;
      } else {
        // Create new vehicle
        const { data, error } = await supabase
          .from('vehicles')
          .insert([vehicleData])
          .select()
          .single();

        if (error) throw error;
        vehicleId = data.id;
      }

      // Upload photos if any
      const photos = vehiclePhotos[editingVehicle?.id || 'new'];
      if (photos && photos.length > 0) {
        const uploadedPhotos = await uploadVehiclePhotos(vehicleId, photos);
        
        // Update vehicle with photo paths
        const { error: photoError } = await supabase
          .from('vehicles')
          .update({ photos: uploadedPhotos })
          .eq('id', vehicleId);

        if (photoError) throw photoError;
      }

      toast({
        title: "Success",
        description: editingVehicle ? "Vehicle updated successfully" : "Vehicle added successfully",
      });

      // Reset form and close dialog
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear().toString(),
        license_no: '',
        vin: ''
      });
      setVehiclePhotos({});
      setEditingVehicle(null);
      setShowAddDialog(false);
      fetchVehicles();

    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save vehicle",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      license_no: vehicle.license_no || '',
      vin: vehicle.vin || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ is_active: false })
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle removed successfully",
      });

      fetchVehicles();
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to remove vehicle",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear().toString(),
      license_no: '',
      vin: ''
    });
    setVehiclePhotos({});
    setEditingVehicle(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading your vehicles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Vehicles</h2>
          <p className="text-muted-foreground">Manage your registered vehicles</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <span className="mr-2">🚗</span>
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </DialogTitle>
              <DialogDescription>
                {editingVehicle ? 'Update your vehicle information' : 'Add a new vehicle to your account'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                    placeholder="Toyota, Honda, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Camry, Civic, etc."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_no">License Plate</Label>
                  <Input
                    id="license_no"
                    value={formData.license_no}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_no: e.target.value.toUpperCase() }))}
                    placeholder="ABC-1234"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN Number</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                  placeholder="17-character VIN"
                  maxLength={17}
                />
              </div>

              <div className="space-y-2">
                <Label>Vehicle Photos</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📸</div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload photos of your vehicle (max 5 photos)
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload(editingVehicle?.id || 'new', e.target.files)}
                      className="hidden"
                      id="vehicle-photo-upload"
                    />
                    <Label
                      htmlFor="vehicle-photo-upload"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 cursor-pointer"
                    >
                      Choose Photos
                    </Label>
                  </div>
                  
                  {/* Photo Previews */}
                  {vehiclePhotos[editingVehicle?.id || 'new']?.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {vehiclePhotos[editingVehicle?.id || 'new'].map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Vehicle ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                            onClick={() => removePhoto(editingVehicle?.id || 'new', index)}
                          >
                            <span className="text-xs">✕</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.filter(v => v.is_active).map((vehicle) => (
          <Card key={vehicle.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <CardDescription>
                    {vehicle.license_no && `License: ${vehicle.license_no}`}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicle.vin && (
                <div className="text-sm text-muted-foreground">
                  <strong>VIN:</strong> {vehicle.vin}
                </div>
              )}
              
              {vehicle.photos && vehicle.photos.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Photos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {vehicle.photos.slice(0, 4).map((photo, index) => (
                      <img
                        key={index}
                        src={`${supabase.storage.from('vehicle-photos').getPublicUrl(photo).data.publicUrl}`}
                        alt={`Vehicle photo ${index + 1}`}
                        className="w-full h-16 object-cover rounded-md"
                      />
                    ))}
                    {vehicle.photos.length > 4 && (
                      <div className="w-full h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                        +{vehicle.photos.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEdit(vehicle)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDelete(vehicle.id)}
                  className="flex-1"
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicles.filter(v => v.is_active).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="text-lg font-semibold mb-2">No Vehicles Added</h3>
            <p className="text-muted-foreground mb-4">
              Add your first vehicle to get started with our services
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              Add Your First Vehicle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};



