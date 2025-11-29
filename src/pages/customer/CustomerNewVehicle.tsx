import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const CustomerNewVehicle: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    plate: '',
    make: '',
    model: '',
    year: '',
    color: '',
    vin: '',
    nickname: '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would create a new vehicle
    // For now, just navigate back to vehicles
    navigate('/customer/vehicles');
  };
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Add New Vehicle" showBack />
      
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="bg-white rounded-card-lg shadow-card p-4">
            <h3 className="text-lg font-semibold text-text-main mb-4">Basic Information</h3>
            <div className="space-y-4">
              <Input
                label="License Plate *"
                placeholder="ABC-1234"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                required
              />
              
              <Input
                label="Make *"
                placeholder="Toyota, Honda, Ford..."
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                required
              />
              
              <Input
                label="Model *"
                placeholder="Camry, Civic, F-150..."
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
              
              <Input
                label="Year *"
                type="number"
                placeholder="2024"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>
          
          {/* Additional Details */}
          <div className="bg-white rounded-card-lg shadow-card p-4">
            <h3 className="text-lg font-semibold text-text-main mb-4">Additional Details (Optional)</h3>
            <div className="space-y-4">
              <Input
                label="Color"
                placeholder="Black, White, Silver..."
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
              
              <Input
                label="VIN (Vehicle Identification Number)"
                placeholder="1HGBH41JXMN109186"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                maxLength={17}
              />
              
              <Input
                label="Nickname"
                placeholder="My Daily Driver, The Beast..."
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              />
            </div>
          </div>
          
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-card-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Why do we need this information?</p>
                <p className="text-sm text-blue-700 mt-1">
                  Vehicle details help us provide accurate service recommendations and maintain proper service records for your vehicle.
                </p>
              </div>
            </div>
          </div>
          
          {/* Submit Buttons */}
          <div className="space-y-3 pt-4">
            <Button type="submit" variant="primary" fullWidth size="lg">
              Add Vehicle
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate('/customer')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

