import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import logoImage from '../assets/logo/unnamed__1_-removebg-preview.png';
// Background images
import bgImg1 from '../assets/bg img/auto-mechanic-checking-car.jpg';
import bgImg2 from '../assets/bg img/beautiful-girl-with-long-hair-garage-repairing-motorcycle.jpg';
import bgImg3 from '../assets/bg img/car-parts-repair-garage.jpg';
import bgImg4 from '../assets/bg img/car-repair-maintenance-theme-mechanic-uniform-working-auto-service.jpg';
import bgImg5 from '../assets/bg img/medium-shot-man-checking-car.jpg';
import bgImg6 from '../assets/bg img/repair-man-making-car-service.jpg';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  
  // Background images for scrolling animation - each column gets all images in different order
  // Column 1 (left): all images in order 1,2,3,4,5,6
  const leftColumnImages = [bgImg1, bgImg2, bgImg3, bgImg4, bgImg5, bgImg6];
  // Column 2 (middle): all images in order 3,4,5,6,1,2
  const middleColumnImages = [bgImg3, bgImg4, bgImg5, bgImg6, bgImg1, bgImg2];
  // Column 3 (right): all images in order 5,6,1,2,3,4
  const rightColumnImages = [bgImg5, bgImg6, bgImg1, bgImg2, bgImg3, bgImg4];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute left-0 top-0 w-1/3 h-full overflow-hidden">
          <div className="flex flex-col gap-4 animate-scroll-up-slow py-4 pr-4 pl-0">
            {[...leftColumnImages, ...leftColumnImages].map((img, idx) => (
              <div key={`left-${idx}`} className="relative h-40 w-full rounded-lg overflow-hidden">
                <img 
                  src={img} 
                  alt="Auto repair service" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute left-1/3 top-0 w-1/3 h-full overflow-hidden">
          <div className="flex flex-col gap-4 animate-scroll-up-medium py-4 px-4" style={{ transform: 'translateY(-25%)' }}>
            {[...middleColumnImages, ...middleColumnImages].map((img, idx) => (
              <div key={`middle-${idx}`} className="relative h-48 w-full rounded-lg overflow-hidden">
                <img 
                  src={img} 
                  alt="Auto repair service" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute left-2/3 top-0 w-1/3 h-full overflow-hidden">
          <div className="flex flex-col gap-4 animate-scroll-up-fast py-4 pl-4 pr-0" style={{ transform: 'translateY(-50%)' }}>
            {[...rightColumnImages, ...rightColumnImages].map((img, idx) => (
              <div key={`right-${idx}`} className="relative h-32 w-full rounded-lg overflow-hidden">
                <img 
                  src={img} 
                  alt="Auto repair service" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            ))}
          </div>
        </div>
        {/* Gradient overlay for better text readability - reduced opacity */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/40 to-primary-dark/50 z-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-20">
        {/* Logo */}
        <div className="w-64 h-64 mb-8 flex items-center justify-center rounded-full overflow-hidden bg-white">
          <img 
            src={logoImage} 
            alt="Lakewood 76 Auto Repair Logo" 
            className="w-full h-full object-contain max-w-full max-h-full"
          />
        </div>
        
        {/* Hero Text */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-white mb-3">Service Made Simple.</h2>
          <p className="text-white/80 text-base max-w-sm">
            Manage vehicles, tickets, and invoices in one place.
          </p>
        </div>
        
        {/* CTA Button */}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          className="max-w-sm"
          onClick={() => navigate('/mobile-login')}
        >
          Get Started
        </Button>
      </div>
      
      {/* Footer */}
      <div className="text-center py-6 text-white/60 text-sm">
        © 2024 Lakewood 76 Auto Repair
      </div>
    </div>
  );
};

