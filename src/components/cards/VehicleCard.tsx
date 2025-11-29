import React from 'react';
import { motion } from 'framer-motion';
import { Vehicle } from '../../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl border border-gray-100 hover:border-primary/30 transition-all duration-300 cursor-pointer group relative"
      onClick={handleClick}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-text-main font-bold text-lg truncate group-hover:text-primary transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-text-muted text-sm font-semibold">{vehicle.plate}</p>
          </div>
          {vehicle.nickname && (
            <p className="text-primary text-xs font-medium mt-1">"{vehicle.nickname}"</p>
          )}
        </div>
        
        <motion.div
          className="flex-shrink-0"
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <svg className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

