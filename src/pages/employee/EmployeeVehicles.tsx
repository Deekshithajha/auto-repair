import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { Input } from '../../components/ui/Input';
import { VehicleCard } from '../../components/cards/VehicleCard';
import { vehicles } from '../../data/vehicles';

export const EmployeeVehicles: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredVehicles = vehicles.filter(vehicle => {
    const query = searchQuery.toLowerCase();
    return (
      vehicle.plate.toLowerCase().includes(query) ||
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.year.toString().includes(query)
    );
  });
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="All Vehicles" showBack />
      
      <div className="px-4 py-6 space-y-4">
        <Input
          placeholder="Search by plate, make, model, or year..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="space-y-3">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onClick={() => navigate(`/employee/vehicles/${vehicle.id}`)}
            />
          ))}
          {filteredVehicles.length === 0 && (
            <div className="bg-white rounded-card-lg p-8 text-center shadow-card">
              <p className="text-text-muted">No vehicles found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

