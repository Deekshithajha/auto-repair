import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../../../components/navigation/TopAppBar';
import { CustomerInfoStep } from './CustomerInfoStep';
import { VehicleStep } from './VehicleStep';
import { ServiceSelectionStep } from './ServiceSelectionStep';
import { ReviewStep } from './ReviewStep';
import { Vehicle } from '../../../../types';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  notificationPreference: 'text' | 'call' | 'email';
}

export interface SelectedService {
  id: string;
  name: string;
  price?: number;
  subOptionId?: string;
  subOptionName?: string;
  symptoms?: string;
  photos?: string[];
}

export interface TicketFormData {
  customerInfo: CustomerInfo;
  selectedVehicle: Vehicle | null;
  selectedServices: SelectedService[];
  pickupTime: string;
  carStatus: 'in-shop' | 'not-in-shop';
  dropOffDate: string;
}

export const NewTicketFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<TicketFormData>({
    customerInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Seattle, WA 98101',
      notificationPreference: 'text',
    },
    selectedVehicle: null,
    selectedServices: [],
    pickupTime: '',
    carStatus: 'not-in-shop',
    dropOffDate: '',
  });
  
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    } else {
      navigate('/customer');
    }
  };
  
  const updateCustomerInfo = (info: CustomerInfo) => {
    setFormData({ ...formData, customerInfo: info });
  };
  
  const updateVehicle = (vehicle: Vehicle) => {
    setFormData({ ...formData, selectedVehicle: vehicle });
  };
  
  const updateServices = (services: SelectedService[]) => {
    setFormData({ ...formData, selectedServices: services });
  };
  
  const updateReviewData = (data: Partial<TicketFormData>) => {
    setFormData({ ...formData, ...data });
  };
  
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Confirm Your Info';
      case 2:
        return 'Select Vehicle';
      case 3:
        return 'Select Services';
      case 4:
        return 'Review & Submit';
      default:
        return 'New Ticket';
    }
  };
  
  return (
    <div className="min-h-screen bg-bg-soft pb-20 md:pb-6">
      <TopAppBar title={getStepTitle()} showBack onLeftClick={handleBack} />
      
      {/* Progress Indicator */}
      <div className="bg-white border-b border-border-soft px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  step === currentStep
                    ? 'bg-primary text-white'
                    : step < currentStep
                    ? 'bg-accent-success text-white'
                    : 'bg-gray-200 text-text-muted'
                }`}
              >
                {step < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-colors ${
                    step < currentStep ? 'bg-accent-success' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-2">
          <span className={currentStep === 1 ? 'text-primary font-medium' : ''}>Info</span>
          <span className={currentStep === 2 ? 'text-primary font-medium' : ''}>Vehicle</span>
          <span className={currentStep === 3 ? 'text-primary font-medium' : ''}>Services</span>
          <span className={currentStep === 4 ? 'text-primary font-medium' : ''}>Review</span>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="px-4 py-6">
        {currentStep === 1 && (
          <CustomerInfoStep
            customerInfo={formData.customerInfo}
            onUpdate={updateCustomerInfo}
            onNext={handleNext}
          />
        )}
        
        {currentStep === 2 && (
          <VehicleStep
            selectedVehicle={formData.selectedVehicle}
            onSelectVehicle={updateVehicle}
            onNext={handleNext}
          />
        )}
        
        {currentStep === 3 && (
          <ServiceSelectionStep
            selectedServices={formData.selectedServices}
            onUpdateServices={updateServices}
            onNext={handleNext}
          />
        )}
        
        {currentStep === 4 && (
          <ReviewStep
            formData={formData}
            onUpdate={updateReviewData}
          />
        )}
      </div>
    </div>
  );
};

