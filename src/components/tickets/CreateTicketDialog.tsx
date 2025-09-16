import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
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
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    description: '',
    preferred_pickup_time: ''
  });
  const [photos, setPhotos] = useState<File[]>([]);

  // Remove fetchVehicles since we're using text input now

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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
    
    if (!formData.make || !formData.model || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Create or find vehicle first
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert([{
          make: formData.make,
          model: formData.model,
          year: formData.year,
          user_id: user.id
        }])
        .select()
        .single();

      if (vehicleError) throw vehicleError;

      // Create the ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert([{
          vehicle_id: vehicle.id,
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
        description: '',
        preferred_pickup_time: ''
      });
      setPhotos([]);
      
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
      description: '',
      preferred_pickup_time: ''
    });
    setPhotos([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Repair Ticket</DialogTitle>
          <DialogDescription>
            Submit a new repair request for your vehicle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Vehicle Information *</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                  placeholder="Toyota, Honda, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Camry, Civic, etc."
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
          </div>

          {/* Problem Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Problem Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the issue with your vehicle in detail..."
              rows={4}
              required
            />
          </div>

          {/* Preferred Pickup Time */}
          <div className="space-y-2">
            <Label htmlFor="pickup_time">Preferred Pickup Time (Optional)</Label>
            <Input
              id="pickup_time"
              type="datetime-local"
              value={formData.preferred_pickup_time}
              onChange={(e) => setFormData(prev => ({ ...prev, preferred_pickup_time: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Damage Photos (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <div className="text-2xl mb-2">📸</div>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload photos of the damage (max 5 photos)
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <Label
                  htmlFor="photo-upload"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 cursor-pointer"
                >
                  Choose Photos
                </Label>
              </div>
              
              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <span className="text-xs">✕</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-primary"
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