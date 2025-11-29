import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

export const TicketSubmitted: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ticketNumber, formData } = location.state || {};
  
  if (!ticketNumber) {
    navigate('/customer');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-bg-soft flex flex-col items-center justify-center px-4 py-12 pb-16 md:pb-12">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-accent-success/10 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      {/* Success Message */}
      <h1 className="text-3xl font-bold text-text-main text-center mb-2">
        Ticket Submitted!
      </h1>
      <p className="text-text-muted text-center mb-8">
        Your service request has been received
      </p>
      
      {/* Ticket Number Card */}
      <div className="bg-white rounded-card-lg shadow-card p-6 w-full max-w-md mb-6">
        <div className="text-center mb-6">
          <p className="text-sm text-text-muted mb-2">Your Ticket Number</p>
          <p className="text-4xl font-bold text-primary tracking-wider">{ticketNumber}</p>
        </div>
        
        <div className="border-t border-border-soft pt-6 space-y-4">
          <div>
            <p className="text-sm text-text-muted mb-1">Vehicle</p>
            <p className="font-semibold text-text-main">
              {formData?.selectedVehicle?.year} {formData?.selectedVehicle?.make} {formData?.selectedVehicle?.model}
            </p>
            <p className="text-sm text-text-muted">{formData?.selectedVehicle?.plate}</p>
          </div>
          
          <div>
            <p className="text-sm text-text-muted mb-1">Services Requested</p>
            <p className="font-semibold text-text-main">{formData?.selectedServices?.length || 0} service(s)</p>
          </div>
          
          <div>
            <p className="text-sm text-text-muted mb-1">Notification Method</p>
            <p className="font-semibold text-text-main capitalize">
              {formData?.customerInfo?.notificationPreference}
            </p>
          </div>
        </div>
      </div>
      
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-card-lg p-4 w-full max-w-md mb-6">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">What's Next?</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• We'll review your request within 24 hours</li>
              <li>• You'll receive updates via {formData?.customerInfo?.notificationPreference}</li>
              <li>• Track your ticket status in the app</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={() => navigate('/customer/tickets')}
        >
          View My Tickets
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate('/customer')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

