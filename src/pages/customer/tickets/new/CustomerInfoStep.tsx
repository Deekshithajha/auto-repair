import React, { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { CustomerInfo } from './NewTicketFlow';

interface CustomerInfoStepProps {
  customerInfo: CustomerInfo;
  onUpdate: (info: CustomerInfo) => void;
  onNext: () => void;
}

export const CustomerInfoStep: React.FC<CustomerInfoStepProps> = ({
  customerInfo,
  onUpdate,
  onNext,
}) => {
  const [formData, setFormData] = useState<CustomerInfo>(customerInfo);
  
  const handleChange = (field: keyof CustomerInfo, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Info Card */}
      <div className="bg-white rounded-card-lg shadow-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-main">Your Information</h2>
            <p className="text-sm text-text-muted">Please confirm or update your details</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="John Doe"
          />
          
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            placeholder="your.email@example.com"
          />
          
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
            placeholder="(555) 123-4567"
          />
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              Full Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
              placeholder="123 Main St, City, State ZIP"
              className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>
      
      {/* Notification Preference */}
      <div className="bg-white rounded-card-lg shadow-card p-6">
        <h3 className="text-lg font-semibold text-text-main mb-4">Notification Preference</h3>
        <p className="text-sm text-text-muted mb-4">How would you like to receive updates?</p>
        
        <div className="space-y-2">
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            formData.notificationPreference === 'text'
              ? 'border-primary bg-primary/5'
              : 'border-border-soft hover:border-primary/50'
          }`}>
            <input
              type="radio"
              name="notification"
              value="text"
              checked={formData.notificationPreference === 'text'}
              onChange={(e) => handleChange('notificationPreference', e.target.value as any)}
              className="w-5 h-5 text-primary"
            />
            <div className="flex items-center gap-3 flex-1">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <div>
                <p className="font-medium text-text-main">Text Message</p>
                <p className="text-sm text-text-muted">Get SMS updates</p>
              </div>
            </div>
          </label>
          
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            formData.notificationPreference === 'call'
              ? 'border-primary bg-primary/5'
              : 'border-border-soft hover:border-primary/50'
          }`}>
            <input
              type="radio"
              name="notification"
              value="call"
              checked={formData.notificationPreference === 'call'}
              onChange={(e) => handleChange('notificationPreference', e.target.value as any)}
              className="w-5 h-5 text-primary"
            />
            <div className="flex items-center gap-3 flex-1">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="font-medium text-text-main">Phone Call</p>
                <p className="text-sm text-text-muted">Receive phone updates</p>
              </div>
            </div>
          </label>
          
          <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            formData.notificationPreference === 'email'
              ? 'border-primary bg-primary/5'
              : 'border-border-soft hover:border-primary/50'
          }`}>
            <input
              type="radio"
              name="notification"
              value="email"
              checked={formData.notificationPreference === 'email'}
              onChange={(e) => handleChange('notificationPreference', e.target.value as any)}
              className="w-5 h-5 text-primary"
            />
            <div className="flex items-center gap-3 flex-1">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium text-text-main">Email</p>
                <p className="text-sm text-text-muted">Get email notifications</p>
              </div>
            </div>
          </label>
        </div>
      </div>
      
      {/* Continue Button */}
      <Button type="submit" variant="primary" fullWidth size="lg" className="mt-6">
        Continue to Vehicle
      </Button>
    </form>
  );
};

