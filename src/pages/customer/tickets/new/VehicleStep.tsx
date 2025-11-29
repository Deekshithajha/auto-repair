import React, { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Vehicle } from '../../../../types';
import { vehicles } from '../../../../data/vehicles';

interface VehicleStepProps {
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onNext: () => void;
}

export const VehicleStep: React.FC<VehicleStepProps> = ({
  selectedVehicle,
  onSelectVehicle,
  onNext,
}) => {
  const customerId = 'c1';
  const customerVehicles = vehicles.filter(v => v.customerId === customerId);
  
  const [mode, setMode] = useState<'select' | 'add'>('select');
  const [photos, setPhotos] = useState<string[]>([]);
  const [vinPhoto, setVinPhoto] = useState<string | null>(null);
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);
  
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    make: '',
    model: '',
    year: '',
    damageDescription: '',
  });
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'exterior' | 'vin' | 'damage') => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'exterior') {
          setPhotos(prev => [...prev, result]);
        } else if (type === 'vin') {
          setVinPhoto(result);
        } else if (type === 'damage') {
          if (damagePhotos.length < 3) {
            setDamagePhotos(prev => [...prev, result]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removePhoto = (index: number, type: 'exterior' | 'damage') => {
    if (type === 'exterior') {
      setPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setDamagePhotos(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  const handleSelectExisting = (vehicle: Vehicle) => {
    onSelectVehicle(vehicle);
  };
  
  const handleAddNew = () => {
    // Create a new vehicle object
    const vehicle: Vehicle = {
      id: `v-new-${Date.now()}`,
      customerId,
      plate: newVehicle.plate,
      make: newVehicle.make,
      model: newVehicle.model,
      year: parseInt(newVehicle.year),
    };
    onSelectVehicle(vehicle);
  };
  
  const handleContinue = () => {
    if (selectedVehicle) {
      onNext();
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 bg-white rounded-card p-1 shadow-card">
        <button
          onClick={() => setMode('select')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            mode === 'select'
              ? 'bg-primary text-white'
              : 'text-text-main hover:bg-bg-soft'
          }`}
        >
          Select Existing
        </button>
        <button
          onClick={() => setMode('add')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            mode === 'add'
              ? 'bg-primary text-white'
              : 'text-text-main hover:bg-soft'
          }`}
        >
          Add New Vehicle
        </button>
      </div>
      
      {/* Select Existing Vehicle */}
      {mode === 'select' && (
        <div className="space-y-3">
          {customerVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => handleSelectExisting(vehicle)}
              className={`bg-white rounded-card-lg shadow-card p-4 cursor-pointer transition-all ${
                selectedVehicle?.id === vehicle.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:shadow-card-hover'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <p className="text-lg font-semibold text-text-main">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-text-muted font-medium">{vehicle.plate}</p>
                  {vehicle.nickname && (
                    <p className="text-xs text-primary mt-1">"{vehicle.nickname}"</p>
                  )}
                </div>
                
                {selectedVehicle?.id === vehicle.id && (
                  <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add New Vehicle */}
      {mode === 'add' && (
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="bg-white rounded-card-lg shadow-card p-6">
            <h3 className="text-lg font-semibold text-text-main mb-4">Vehicle Information</h3>
            <div className="space-y-4">
              <Input
                label="License Plate *"
                placeholder="ABC-1234"
                value={newVehicle.plate}
                onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                required
              />
              
              <Input
                label="Make *"
                placeholder="Toyota, Honda, Ford..."
                value={newVehicle.make}
                onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                required
              />
              
              <Input
                label="Model *"
                placeholder="Camry, Civic, F-150..."
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                required
              />
              
              <Input
                label="Year *"
                type="number"
                placeholder="2024"
                value={newVehicle.year}
                onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>
          
          {/* Photos - Exterior */}
          <div className="bg-white rounded-card-lg shadow-card p-6">
            <h3 className="text-lg font-semibold text-text-main mb-2">Exterior Photos (Optional)</h3>
            <p className="text-sm text-text-muted mb-4">Help us identify your vehicle</p>
            
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img src={photo} alt={`Exterior ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index, 'exterior')}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-accent-danger text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {photos.length < 4 && (
                <label className="aspect-square bg-bg-soft border-2 border-dashed border-border-soft rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoUpload(e, 'exterior')}
                    className="hidden"
                    capture="environment"
                  />
                  <svg className="w-8 h-8 text-text-muted mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs text-text-muted">Add Photo</span>
                </label>
              )}
            </div>
          </div>
          
          {/* VIN Photo */}
          <div className="bg-white rounded-card-lg shadow-card p-6">
            <h3 className="text-lg font-semibold text-text-main mb-2">VIN Sticker (Optional)</h3>
            <p className="text-sm text-text-muted mb-4">Photo of VIN sticker on door jamb</p>
            
            {vinPhoto ? (
              <div className="relative w-full aspect-video">
                <img src={vinPhoto} alt="VIN" className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => setVinPhoto(null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-accent-danger text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="w-full aspect-video bg-bg-soft border-2 border-dashed border-border-soft rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, 'vin')}
                  className="hidden"
                  capture="environment"
                />
                <svg className="w-12 h-12 text-text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-text-muted">Take Photo of VIN</span>
              </label>
            )}
          </div>
          
          {/* Damage Description & Photos */}
          <div className="bg-white rounded-card-lg shadow-card p-6">
            <h3 className="text-lg font-semibold text-text-main mb-4">Existing Damage (Optional)</h3>
            
            <textarea
              value={newVehicle.damageDescription}
              onChange={(e) => setNewVehicle({ ...newVehicle, damageDescription: e.target.value })}
              placeholder="Describe any existing damage or issues..."
              className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              rows={3}
            />
            
            <p className="text-sm text-text-muted mb-3">Damage Photos (up to 3)</p>
            <div className="grid grid-cols-3 gap-3">
              {damagePhotos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img src={photo} alt={`Damage ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index, 'damage')}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-accent-danger text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {damagePhotos.length < 3 && (
                <label className="aspect-square bg-bg-soft border-2 border-dashed border-border-soft rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'damage')}
                    className="hidden"
                    capture="environment"
                  />
                  <svg className="w-8 h-8 text-text-muted mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-text-muted">Add Photo</span>
                </label>
              )}
            </div>
          </div>
          
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleAddNew}
            disabled={!newVehicle.plate || !newVehicle.make || !newVehicle.model || !newVehicle.year}
          >
            Add This Vehicle
          </Button>
        </div>
      )}
      
      {/* Continue Button */}
      {mode === 'select' && selectedVehicle && (
        <Button variant="primary" fullWidth size="lg" onClick={handleContinue} className="mt-6">
          Continue to Services
        </Button>
      )}
    </div>
  );
};

