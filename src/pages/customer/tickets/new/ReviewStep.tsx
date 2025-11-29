import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { TicketFormData } from './NewTicketFlow';
import { ticketService } from '../../../../services/ticketService';
import { Photo } from '../../../../types';

interface ReviewStepProps {
  formData: TicketFormData;
  onUpdate: (data: Partial<TicketFormData>) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ formData, onUpdate }) => {
  const navigate = useNavigate();
  const [pickupTime, setPickupTime] = useState(formData.pickupTime);
  const [carStatus, setCarStatus] = useState<'in-shop' | 'not-in-shop'>(formData.carStatus);
  const [dropOffDate, setDropOffDate] = useState(formData.dropOffDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    if (!formData.selectedVehicle) {
      setError('Please select a vehicle');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Collect all photos from services
      const photos: Photo[] = [];
      formData.selectedServices.forEach((service) => {
        if (service.photos) {
          service.photos.forEach((dataUrl, index) => {
            photos.push({
              id: `photo-${Date.now()}-${index}`,
              category: 'other',
              dataUrl,
              createdAt: new Date().toISOString(),
            });
          });
        }
      });

      // Create ticket via TicketService
      const ticket = await ticketService.createTicketFromCustomerFlow({
        customerInfo: formData.customerInfo,
        vehicle: formData.selectedVehicle,
        selectedServices: formData.selectedServices,
        schedulingPreferences: {
          pickupTime,
          carStatus,
          dropOffDate: carStatus === 'not-in-shop' ? dropOffDate : undefined,
        },
        photos,
      });

      // Update final data
      onUpdate({ pickupTime, carStatus, dropOffDate });
      
      // Navigate to success page with ticket ID
      navigate('/customer/tickets/submitted', { 
        state: { 
          ticketNumber: ticket.id.toUpperCase(), 
          ticketId: ticket.id,
          formData: { ...formData, pickupTime, carStatus, dropOffDate } 
        }
      });
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError('Failed to submit ticket. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  const calculateTotal = () => {
    return formData.selectedServices.reduce((sum, service) => {
      return sum + (service.price || 0);
    }, 0);
  };
  
  const total = calculateTotal();
  const hasVariablePricing = formData.selectedServices.some(s => !s.price);
  
  return (
    <div className="space-y-4">
      {/* Customer Info Summary */}
      <div className="bg-white rounded-card-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-text-main mb-4">Customer Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Name:</span>
            <span className="text-text-main font-medium">{formData.customerInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Email:</span>
            <span className="text-text-main font-medium">{formData.customerInfo.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Phone:</span>
            <span className="text-text-main font-medium">{formData.customerInfo.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Notifications:</span>
            <span className="text-text-main font-medium capitalize">{formData.customerInfo.notificationPreference}</span>
          </div>
        </div>
      </div>
      
      {/* Vehicle Summary */}
      <div className="bg-white rounded-card-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-text-main mb-4">Vehicle</h3>
        {formData.selectedVehicle ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-main">
                {formData.selectedVehicle.year} {formData.selectedVehicle.make} {formData.selectedVehicle.model}
              </p>
              <p className="text-sm text-text-muted">{formData.selectedVehicle.plate}</p>
            </div>
          </div>
        ) : (
          <p className="text-text-muted">No vehicle selected</p>
        )}
      </div>
      
      {/* Services Summary */}
      <div className="bg-white rounded-card-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-text-main mb-4">Selected Services</h3>
        <div className="space-y-3">
          {formData.selectedServices.map((service, index) => (
            <div key={index} className="pb-3 border-b border-border-soft last:border-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-text-main">{service.name}</p>
                  {service.subOptionName && (
                    <p className="text-sm text-text-muted">{service.subOptionName}</p>
                  )}
                  {service.symptoms && (
                    <p className="text-xs text-text-muted mt-1 italic">"{service.symptoms}"</p>
                  )}
                </div>
                <p className="font-semibold text-primary ml-4">
                  {service.price ? `$${service.price}` : 'TBD'}
                </p>
              </div>
              
              {/* Service Photos */}
              {service.photos && service.photos.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-text-muted mb-2">
                    Attached Photos ({service.photos.length})
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {service.photos.map((photo, photoIndex) => (
                      <div key={photoIndex} className="aspect-square">
                        <img
                          src={photo}
                          alt={`Service photo ${photoIndex + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-border-soft"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {total > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-border-soft">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-text-main">
                {hasVariablePricing ? 'Estimated Total:' : 'Total:'}
              </span>
              <span className="text-2xl font-bold text-primary">${total}</span>
            </div>
            {hasVariablePricing && (
              <p className="text-xs text-text-muted mt-2">
                * Final price may vary based on inspection
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Car Status */}
      <div className="bg-white rounded-card-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-text-main mb-4">Vehicle Status</h3>
        <div className="space-y-2">
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            carStatus === 'in-shop'
              ? 'border-primary bg-primary/5'
              : 'border-border-soft hover:border-primary/50'
          }`}>
            <input
              type="radio"
              name="carStatus"
              value="in-shop"
              checked={carStatus === 'in-shop'}
              onChange={(e) => setCarStatus(e.target.value as any)}
              className="w-5 h-5 text-primary"
            />
            <div>
              <p className="font-medium text-text-main">Vehicle is already in shop</p>
              <p className="text-sm text-text-muted">We already have your vehicle</p>
            </div>
          </label>
          
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            carStatus === 'not-in-shop'
              ? 'border-primary bg-primary/5'
              : 'border-border-soft hover:border-primary/50'
          }`}>
            <input
              type="radio"
              name="carStatus"
              value="not-in-shop"
              checked={carStatus === 'not-in-shop'}
              onChange={(e) => setCarStatus(e.target.value as any)}
              className="w-5 h-5 text-primary"
            />
            <div>
              <p className="font-medium text-text-main">Need to drop off vehicle</p>
              <p className="text-sm text-text-muted">You'll bring it in later</p>
            </div>
          </label>
        </div>
        
        {carStatus === 'not-in-shop' && (
          <div className="mt-4">
            <Input
              label="Expected Drop-off Date"
              type="date"
              value={dropOffDate}
              onChange={(e) => setDropOffDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        )}
      </div>
      
      {/* Preferred Pickup Time */}
      <div className="bg-white rounded-card-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-text-main mb-4">Preferred Pickup Time</h3>
        <Input
          label="What time works best for you?"
          type="time"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          required
        />
        <p className="text-xs text-text-muted mt-2">
          We'll do our best to accommodate your preferred time
        </p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        variant="primary"
        fullWidth
        size="lg"
        onClick={handleSubmit}
        disabled={isSubmitting || !pickupTime || (carStatus === 'not-in-shop' && !dropOffDate) || !formData.selectedVehicle}
        className="mt-6"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
      </Button>
      
      <p className="text-xs text-center text-text-muted">
        By submitting, you agree to our terms of service
      </p>
    </div>
  );
};

