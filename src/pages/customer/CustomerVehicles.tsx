import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { VehicleCard } from '../../components/cards/VehicleCard';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { vehicles } from '../../data/vehicles';

export const CustomerVehicles: React.FC = () => {
  const navigate = useNavigate();
  
  const customerId = 'c1';
  const customerVehicles = vehicles.filter(v => v.customerId === customerId);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-soft via-white to-bg-soft">
      <TopAppBar title="My Vehicles" showBack />
      
      <motion.div
        className="px-4 py-6 space-y-4 pb-24 md:pb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {customerVehicles.length > 0 ? (
          customerVehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              variants={itemVariants}
            >
              <VehicleCard
                vehicle={vehicle}
                onClick={() => {
                  console.log('Navigating to vehicle:', vehicle.id);
                  navigate(`/customer/vehicles/${vehicle.id}`);
                }}
              />
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-text-muted font-medium">No vehicles yet</p>
            <p className="text-text-muted text-sm mt-1">Add your first vehicle to get started</p>
          </motion.div>
        )}
      </motion.div>
      
      <FloatingActionButton
        onClick={() => navigate('/customer/vehicles/new')}
        label="Add Vehicle"
      />
    </div>
  );
};

