import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { EnhancedVehicleProfile } from './EnhancedVehicleProfile';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  reg_no?: string;
  license_no?: string;
  is_active?: boolean;
  location_status?: string;
  created_at: string;
}

export const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
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

  const handleOpenVehicle = (vehicleId?: string) => {
    setSelectedVehicleId(vehicleId);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedVehicleId(undefined);
    fetchVehicles();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Vehicles</h2>
          <p className="text-muted-foreground">Manage your vehicle information</p>
        </div>
        <Button onClick={() => handleOpenVehicle()} className="bg-gradient-secondary">
          <span className="mr-2">➕</span>
          Add Vehicle
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="text-lg font-semibold mb-2">No vehicles registered</h3>
            <p className="text-muted-foreground mb-6">Add your first vehicle to create repair tickets</p>
            <Button onClick={() => handleOpenVehicle()} className="bg-gradient-secondary">
              <span className="mr-2">➕</span>
              Add First Vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-elegant transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <span className="text-secondary mr-2">🚗</span>
                      {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <CardDescription>
                      Year: {vehicle.year}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {vehicle.location_status && (
                      <Badge variant={vehicle.location_status === 'in_shop' ? 'default' : 'outline'}>
                        {vehicle.location_status === 'in_shop' ? '🏭' : '🏠'}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenVehicle(vehicle.id)}
                    >
                      <span className="text-sm">👁️</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {vehicle.reg_no && (
                    <div>
                      <span className="font-medium">Registration:</span> {vehicle.reg_no}
                    </div>
                  )}
                  {vehicle.license_no && (
                    <div>
                      <span className="font-medium">License:</span> {vehicle.license_no}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Added {new Date(vehicle.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vehicle Details Dialog */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <EnhancedVehicleProfile 
            vehicleId={selectedVehicleId} 
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};