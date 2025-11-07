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
import { EnhancedFileUpload } from '@/components/shared/EnhancedFileUpload';
import { VehicleServiceHistory } from '@/components/vehicles/VehicleServiceHistory';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_no?: string;
  reg_no?: string;
  vin?: string;
  engine_size?: string;
  mileage?: number;
  trim_code?: string;
  drive_train?: string;
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
  reg_no: string;
  vin: string;
  engine_size: string;
  mileage: string;
  trim_code: string;
  drive_train: string;
}

export const CustomerVehicleManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehiclePhotos, setVehiclePhotos] = useState<Record<string, File[]>>({});
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<string | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  
  const [formData, setFormData] = useState<VehicleFormData>({
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    license_no: '',
    reg_no: '',
    vin: '',
    engine_size: '',
    mileage: '',
    trim_code: '',
    drive_train: ''
  });
  const [existingPhotos, setExistingPhotos] = useState<Record<string, Array<{id: string, data: string}>>>({});
  const [photosToRemove, setPhotosToRemove] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  const fetchVehicles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;
      
      // Fetch photos for each vehicle from vehicle_photos table
      const vehiclesWithPhotos = await Promise.all(
        (vehiclesData || []).map(async (vehicle) => {
          const { data: photosData, error: photosError } = await supabase
            .from('vehicle_photos')
            .select('id, photo_data')
            .eq('vehicle_id', vehicle.id);
          
          if (photosError) {
            console.error('Error fetching photos for vehicle:', vehicle.id, photosError);
            return { ...vehicle, photos: [] };
          }
          
          // Store photo data for display
          const photoIds = (photosData || []).map(p => p.id);
          return { ...vehicle, photos: photoIds };
        })
      );
      
      setVehicles(vehiclesWithPhotos);
      
      // Store photo data for editing
      const photosMap: Record<string, Array<{id: string, data: string}>> = {};
      for (const vehicle of vehiclesData || []) {
        const { data: photosData } = await supabase
          .from('vehicle_photos')
          .select('id, photo_data')
          .eq('vehicle_id', vehicle.id);
        
        if (photosData) {
          photosMap[vehicle.id] = photosData.map(p => ({ id: p.id, data: p.photo_data || '' }));
        }
      }
      setExistingPhotos(photosMap);
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

  const handlePhotoUpload = (vehicleId: string, files: File[]) => {
    setVehiclePhotos(prev => ({
      ...prev,
      [vehicleId]: [...(prev[vehicleId] || []), ...files].slice(0, 5) // Limit to 5 photos
    }));
  };

  const removePhoto = (vehicleId: string, index: number) => {
    setVehiclePhotos(prev => ({
      ...prev,
      [vehicleId]: prev[vehicleId]?.filter((_, i) => i !== index) || []
    }));
  };

  const removeExistingPhoto = (vehicleId: string, photoId: string) => {
    setPhotosToRemove(prev => ({
      ...prev,
      [vehicleId]: [...(prev[vehicleId] || []), photoId]
    }));
    setExistingPhotos(prev => ({
      ...prev,
      [vehicleId]: prev[vehicleId]?.filter(p => p.id !== photoId) || []
    }));
  };

  const restoreRemovedPhoto = (vehicleId: string, photoId: string) => {
    setPhotosToRemove(prev => ({
      ...prev,
      [vehicleId]: prev[vehicleId]?.filter(p => p !== photoId) || []
    }));
    // Restore photo data from existing photos
    const removedPhoto = existingPhotos[vehicleId]?.find(p => p.id === photoId);
    if (removedPhoto) {
      setExistingPhotos(prev => ({
        ...prev,
        [vehicleId]: [...(prev[vehicleId] || []), removedPhoto]
      }));
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

  const uploadVehiclePhotos = async (vehicleId: string, photos: File[]) => {
    if (photos.length === 0) return [];

    const uploadPromises = photos.map(async (photo) => {
      // Convert image to base64
      const base64Data = await convertFileToBase64(photo);
      
      // Get current user for uploaded_by field
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Store photo directly in database
      const { data, error } = await supabase
        .from('vehicle_photos')
        .insert({
          vehicle_id: vehicleId,
          photo_type: 'exterior',
          photo_data: base64Data,
          storage_path: null,
          uploaded_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data.id;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Normalize VIN to uppercase and trim spaces to avoid accidental duplicates
      const normalizedVin = (formData.vin || '').trim().toUpperCase();
      const vehicleData = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        license_no: formData.license_no || null,
        reg_no: formData.reg_no || null,
        vin: normalizedVin || null,
        engine_size: formData.engine_size || null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        trim_code: formData.trim_code || null,
        drive_train: formData.drive_train || null,
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
        // If VIN is provided, check for existing vehicle to avoid UNIQUE constraint errors
        if (normalizedVin) {
          const { data: existingByVin, error: existingVinErr } = await supabase
            .from('vehicles')
            .select('id, user_id')
            .eq('vin', normalizedVin)
            .maybeSingle();

          if (existingVinErr) throw existingVinErr;

          if (existingByVin) {
            if (existingByVin.user_id === user.id) {
              // Vehicle already exists for this user. Update it instead of inserting a duplicate
              const { error: updErr } = await supabase
                .from('vehicles')
                .update(vehicleData)
                .eq('id', existingByVin.id);
              if (updErr) throw updErr;
              vehicleId = existingByVin.id;
              toast({ title: 'Vehicle exists', description: 'Updated your existing vehicle with the new details.' });
            } else {
              throw new Error('This VIN is already registered to another customer. Please verify the VIN.');
            }
          } else {
            // Safe to insert a fresh record
            const { data, error } = await supabase
              .from('vehicles')
              .insert([vehicleData])
              .select()
              .single();
            if (error) throw error;
            vehicleId = data.id;
          }
        } else {
          // No VIN provided, just insert
          const { data, error } = await supabase
            .from('vehicles')
            .insert([vehicleData])
            .select()
            .single();
          if (error) throw error;
          vehicleId = data.id;
        }
      }

      // Handle photos: remove deleted ones and add new ones
      const photosToDelete = photosToRemove[editingVehicle?.id || ''] || [];
      const newPhotos = vehiclePhotos[editingVehicle?.id || 'new'] || [];
      const existingPhotosList = existingPhotos[editingVehicle?.id || ''] || [];
      
      // Delete removed photos from database
      if (photosToDelete.length > 0) {
        const deletePromises = photosToDelete.map(photoId => 
          supabase.from('vehicle_photos').delete().eq('id', photoId)
        );
        await Promise.all(deletePromises);
      }

      // Upload new photos (store as base64 in database)
      let uploadedPhotoIds: string[] = [];
      if (newPhotos.length > 0) {
        uploadedPhotoIds = await uploadVehiclePhotos(vehicleId, newPhotos);
      }

      // Combine existing (not removed) photo IDs with new uploaded photo IDs
      const existingPhotoIds = existingPhotosList
        .filter(p => !photosToDelete.includes(p.id))
        .map(p => p.id);
      const finalPhotoIds = [
        ...existingPhotoIds,
        ...uploadedPhotoIds
      ];

      // Update vehicle with all photo IDs (if vehicles table has photos column)
      // Note: We're now storing photos in vehicle_photos table, so we may not need to update vehicles.photos
      // But keeping this for backward compatibility if needed
      if (editingVehicle || finalPhotoIds.length > 0) {
        const { error: photoError } = await supabase
          .from('vehicles')
          .update({ photos: finalPhotoIds })
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
        reg_no: '',
        vin: '',
        engine_size: '',
        mileage: '',
        trim_code: '',
        drive_train: ''
      });
      setVehiclePhotos({});
      setExistingPhotos({});
      setPhotosToRemove({});
      setEditingVehicle(null);
      setShowAddDialog(false);
      fetchVehicles();

    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      // Handle Postgres unique violation for VIN gracefully
      const message = (error?.code === '23505' || /duplicate key value.*vehicles_vin_key/i.test(error?.message || ''))
        ? 'A vehicle with this VIN already exists. If it is yours, edit that vehicle instead.'
        : (error.message || 'Failed to save vehicle');
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      license_no: vehicle.license_no || '',
      reg_no: vehicle.reg_no || '',
      vin: vehicle.vin || '',
      engine_size: vehicle.engine_size || '',
      mileage: vehicle.mileage?.toString() || '',
      trim_code: vehicle.trim_code || '',
      drive_train: vehicle.drive_train || ''
    });
    
    // Fetch existing photos from database
    const { data: photosData } = await supabase
      .from('vehicle_photos')
      .select('id, photo_data')
      .eq('vehicle_id', vehicle.id);
    
    setExistingPhotos(prev => ({
      ...prev,
      [vehicle.id]: (photosData || []).map(p => ({ id: p.id, data: p.photo_data || '' }))
    }));
    setPhotosToRemove(prev => ({
      ...prev,
      [vehicle.id]: []
    }));
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
      reg_no: '',
      vin: '',
      engine_size: '',
      mileage: '',
      trim_code: '',
      drive_train: ''
    });
    setVehiclePhotos({});
    setExistingPhotos({});
    setPhotosToRemove({});
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg_no">Registration Number</Label>
                  <Input
                    id="reg_no"
                    value={formData.reg_no}
                    onChange={(e) => setFormData(prev => ({ ...prev, reg_no: e.target.value.toUpperCase() }))}
                    placeholder="REG-1234"
                  />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="engine_size">Engine Size</Label>
                  <Input
                    id="engine_size"
                    value={formData.engine_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, engine_size: e.target.value }))}
                    placeholder="2.0L, 3.5L, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                    placeholder="50000"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trim_code">Trim Code</Label>
                  <Input
                    id="trim_code"
                    value={formData.trim_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, trim_code: e.target.value }))}
                    placeholder="LE, XLE, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drive_train">Drive Train</Label>
                  <Input
                    id="drive_train"
                    value={formData.drive_train}
                    onChange={(e) => setFormData(prev => ({ ...prev, drive_train: e.target.value }))}
                    placeholder="FWD, RWD, AWD, 4WD"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vehicle Photos</Label>
                
                {/* Existing Photos */}
                {editingVehicle && existingPhotos[editingVehicle.id] && existingPhotos[editingVehicle.id].length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm text-muted-foreground mb-2 block">Existing Photos</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {existingPhotos[editingVehicle.id].map((photo, index) => {
                        const isRemoved = photosToRemove[editingVehicle.id]?.includes(photo.id);
                        return (
                          <div key={photo.id} className={`relative ${isRemoved ? 'opacity-50' : ''}`}>
                            <img
                              src={photo.data}
                              alt={`Existing photo ${index + 1}`}
                              className="w-full h-20 object-cover rounded-md border"
                            />
                            {isRemoved ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 bg-green-500 hover:bg-green-600"
                                onClick={() => restoreRemovedPhoto(editingVehicle.id, photo.id)}
                                title="Restore photo"
                              >
                                <span className="text-xs text-white">↺</span>
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                                onClick={() => removeExistingPhoto(editingVehicle.id, photo.id)}
                                title="Remove photo"
                              >
                                <span className="text-xs">✕</span>
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* New Photo Upload */}
                <EnhancedFileUpload
                  onFilesSelected={(files) => handlePhotoUpload(editingVehicle?.id || 'new', files)}
                  accept="image/*"
                  multiple={true}
                  maxFiles={5}
                  maxFileSize={10}
                  placeholder="Upload new photos of your vehicle"
                  id="vehicle-photo-upload"
                />
                  
                {/* New Photo Previews */}
                {vehiclePhotos[editingVehicle?.id || 'new']?.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm text-muted-foreground mb-2 block">New Photos</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {vehiclePhotos[editingVehicle?.id || 'new'].map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`New photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                            onClick={() => removePhoto(editingVehicle?.id || 'new', index)}
                            title="Remove photo"
                          >
                            <span className="text-xs">✕</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              <div className="space-y-1 text-sm">
                {vehicle.vin && (
                  <div className="text-muted-foreground">
                    <strong>VIN:</strong> {vehicle.vin}
                  </div>
                )}
                {vehicle.reg_no && (
                  <div className="text-muted-foreground">
                    <strong>Reg:</strong> {vehicle.reg_no}
                  </div>
                )}
                {vehicle.engine_size && (
                  <div className="text-muted-foreground">
                    <strong>Engine:</strong> {vehicle.engine_size}
                  </div>
                )}
                {vehicle.mileage && (
                  <div className="text-muted-foreground">
                    <strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} miles
                  </div>
                )}
                {vehicle.trim_code && (
                  <div className="text-muted-foreground">
                    <strong>Trim:</strong> {vehicle.trim_code}
                  </div>
                )}
                {vehicle.drive_train && (
                  <div className="text-muted-foreground">
                    <strong>Drive:</strong> {vehicle.drive_train}
                  </div>
                )}
              </div>
              
              {vehicle.photos && vehicle.photos.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Photos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {existingPhotos[vehicle.id]?.slice(0, 4).map((photo, index) => (
                      <img
                        key={photo.id}
                        src={photo.data}
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

              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="default" 
                  onClick={() => {
                    setSelectedVehicleForHistory(vehicle.id);
                    setShowHistoryDialog(true);
                  }}
                  className="w-full"
                >
                  📋 View Service History
                </Button>
                <div className="flex gap-2">
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

      {/* Service History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service History</DialogTitle>
            <DialogDescription>
              {selectedVehicleForHistory && vehicles.find(v => v.id === selectedVehicleForHistory) && (
                <>
                  Complete service history for {vehicles.find(v => v.id === selectedVehicleForHistory)?.year}{' '}
                  {vehicles.find(v => v.id === selectedVehicleForHistory)?.make}{' '}
                  {vehicles.find(v => v.id === selectedVehicleForHistory)?.model}
                  {vehicles.find(v => v.id === selectedVehicleForHistory)?.license_no && 
                    ` (${vehicles.find(v => v.id === selectedVehicleForHistory)?.license_no})`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedVehicleForHistory && (
            <VehicleServiceHistory vehicleId={selectedVehicleForHistory} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};



