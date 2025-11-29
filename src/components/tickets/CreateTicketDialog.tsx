import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { EnhancedFileUpload } from '@/components/shared/EnhancedFileUpload';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_no?: string;
  is_active: boolean;
}

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketCreated: () => void;
}

export const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
  open,
  onOpenChange,
  onTicketCreated
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [vehicleSelectionType, setVehicleSelectionType] = useState<'existing' | 'new'>('existing');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_no: '',
    description: '',
    preferred_pickup_time: ''
  });
  const [photos, setPhotos] = useState<File[]>([]);

  // Fetch user's registered vehicles
  const fetchVehicles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchVehicles();
    }
  }, [open]);

  const handlePhotoUpload = (files: File[]) => {
    setPhotos(prev => [...prev, ...files].slice(0, 5)); // Limit to 5 photos
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (ticketId: string) => {
    const uploadPromises = photos.map(async (photo, index) => {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${ticketId}/${Date.now()}-${index}.${fileExt}`;
      
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
    
    // Validate based on selection type
    if (vehicleSelectionType === 'existing') {
      if (!selectedVehicleId || !formData.description) {
        toast({
          title: "Error",
          description: "Please select a vehicle and provide a description",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!formData.make || !formData.model || !formData.description || !formData.license_no) {
        toast({
          title: "Error",
          description: "Please fill in all required fields (make, model, year, license plate, description)",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      let vehicleId: string;

      if (vehicleSelectionType === 'existing') {
        // Use selected existing vehicle
        vehicleId = selectedVehicleId;
      } else {
        // Create new vehicle
        const { data: vehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .insert([{
            make: formData.make,
            model: formData.model,
            year: formData.year,
            license_no: formData.license_no,
            user_id: user.id,
            is_active: true
          }])
          .select()
          .single();

        if (vehicleError) throw vehicleError;
        vehicleId = vehicle.id;
      }

      // Create the ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert([{
          vehicle_id: vehicleId,
          description: formData.description,
          preferred_pickup_time: formData.preferred_pickup_time || null,
          user_id: user.id
        }])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Upload photos if any
      if (photos.length > 0) {
        await uploadPhotos(ticket.id);
      }

      toast({
        title: "Success",
        description: "Repair ticket created successfully"
      });

      // Reset form
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        license_no: '',
        description: '',
        preferred_pickup_time: ''
      });
      setPhotos([]);
      setSelectedVehicleId('');
      setVehicleSelectionType('existing');
      
      onTicketCreated();
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      license_no: '',
      description: '',
      preferred_pickup_time: ''
    });
    setPhotos([]);
    setSelectedVehicleId('');
    setVehicleSelectionType('existing');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto sm:w-full">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl">Create Repair Ticket</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Submit a new repair request for your vehicle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Vehicle Selection Type */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm sm:text-base font-semibold">Vehicle Selection *</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={vehicleSelectionType === 'existing' ? 'default' : 'outline'}
                onClick={() => setVehicleSelectionType('existing')}
                className="h-10 sm:h-11"
              >
                🚗 Use Registered Vehicle
              </Button>
              <Button
                type="button"
                variant={vehicleSelectionType === 'new' ? 'default' : 'outline'}
                onClick={() => setVehicleSelectionType('new')}
                className="h-10 sm:h-11"
              >
                ➕ Add New Vehicle
              </Button>
            </div>
          </div>

          {/* Vehicle Selection */}
          {vehicleSelectionType === 'existing' ? (
            <div className="space-y-2">
              <Label htmlFor="vehicle-select" className="text-sm">Select Vehicle *</Label>
              {vehicles.length > 0 ? (
                <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                    <SelectValue placeholder="Choose your vehicle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.license_no && `(${vehicle.license_no})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 border border-dashed border-muted-foreground/25 rounded-lg text-center">
                  <div className="text-2xl mb-2">🚗</div>
                  <p className="text-sm text-muted-foreground mb-3">No vehicles registered yet</p>
                  <p className="text-xs text-muted-foreground">Switch to "Add New Vehicle" to register your first vehicle</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-sm sm:text-base font-semibold">New Vehicle Information *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make" className="text-sm">Make</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                    placeholder="Toyota, Honda, etc."
                    required
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Camry, Civic, etc."
                    required
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license" className="text-sm">License Plate</Label>
                  <Input
                    id="license"
                    value={formData.license_no}
                    onChange={(e) => setFormData(prev => ({ ...prev, license_no: e.target.value.toUpperCase() }))}
                    placeholder="ABC-1234"
                    required
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Problem Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">Problem Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the issue with your vehicle in detail..."
              rows={3}
              required
              className="text-sm sm:text-base resize-none"
            />
          </div>

          {/* Preferred Pickup Time */}
          <div className="space-y-2">
            <Label htmlFor="pickup_time" className="text-sm">Preferred Pickup Time (Optional)</Label>
            <Input
              id="pickup_time"
              type="datetime-local"
              value={formData.preferred_pickup_time}
              onChange={(e) => setFormData(prev => ({ ...prev, preferred_pickup_time: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              className="h-10 sm:h-11 text-sm sm:text-base"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm">Damage Photos (Optional)</Label>
            <EnhancedFileUpload
              onFilesSelected={handlePhotoUpload}
              accept="image/*"
              multiple={true}
              maxFiles={5}
              maxFileSize={10}
              placeholder="Upload photos of the damage"
              id="photo-upload"
            />
            
            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-16 sm:h-20 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <span className="text-xs">✕</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="w-full sm:w-auto order-2 sm:order-1 h-10 sm:h-11"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-primary h-10 sm:h-11"
            >
              {loading && <span className="mr-2 animate-pulse">⚙️</span>}
              Create Ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};