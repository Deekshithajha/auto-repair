import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/Button';
import { services, ServiceOption } from '../../../../data/services';
import { SelectedService } from './NewTicketFlow';

interface ServiceSelectionStepProps {
  selectedServices: SelectedService[];
  onUpdateServices: (services: SelectedService[]) => void;
  onNext: () => void;
}

export const ServiceSelectionStep: React.FC<ServiceSelectionStepProps> = ({
  selectedServices,
  onUpdateServices,
  onNext,
}) => {
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<{ [key: string]: string }>({});
  const [servicePhotos, setServicePhotos] = useState<{ [key: string]: string[] }>({});
  const [customServiceDescription, setCustomServiceDescription] = useState<string>('');
  const [isCustomServiceEnabled, setIsCustomServiceEnabled] = useState<boolean>(false);
  
  const standardServices = services.filter(s => s.category === 'standard');
  const customServices = services.filter(s => s.category === 'custom');
  
  // Initialize custom service state from selectedServices if it exists
  useEffect(() => {
    const customService = selectedServices.find(s => s.id === 'custom-service');
    if (customService && !isCustomServiceEnabled) {
      setIsCustomServiceEnabled(true);
      setCustomServiceDescription(customService.symptoms || '');
      if (customService.photos) {
        setServicePhotos(prev => ({ ...prev, 'custom-service': customService.photos || [] }));
      }
    }
  }, []); // Only run on mount
  
  const isServiceSelected = (serviceId: string, subOptionId?: string) => {
    return selectedServices.some(s => 
      s.id === serviceId && (!subOptionId || s.subOptionId === subOptionId)
    );
  };
  
  const toggleService = (service: ServiceOption, subOption?: { id: string; name: string; price?: number }) => {
    const serviceId = service.id;
    const subOptionId = subOption?.id;
    
    if (isServiceSelected(serviceId, subOptionId)) {
      // Remove service
      onUpdateServices(
        selectedServices.filter(s => !(s.id === serviceId && s.subOptionId === subOptionId))
      );
    } else {
      // Add service
      const newService: SelectedService = {
        id: serviceId,
        name: service.name,
        price: subOption?.price || service.price,
        subOptionId: subOption?.id,
        subOptionName: subOption?.name,
        symptoms: symptoms[serviceId] || '',
        photos: servicePhotos[serviceId] || [],
      };
      onUpdateServices([...selectedServices, newService]);
    }
  };
  
  const updateSymptoms = (serviceId: string, text: string) => {
    setSymptoms({ ...symptoms, [serviceId]: text });
    // Update existing service if selected
    const updatedServices = selectedServices.map(s => 
      s.id === serviceId ? { ...s, symptoms: text } : s
    );
    onUpdateServices(updatedServices);
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, serviceId: string) => {
    const files = e.target.files;
    if (!files) return;
    
    const currentPhotos = servicePhotos[serviceId] || [];
    
    // Limit to 5 photos per service
    if (currentPhotos.length >= 5) {
      return;
    }
    
    Array.from(files).forEach(file => {
      if (currentPhotos.length >= 5) return;
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...(servicePhotos[serviceId] || []), reader.result as string];
        setServicePhotos({ ...servicePhotos, [serviceId]: newPhotos });
        
        // Update service with photos
        if (serviceId === 'custom-service') {
          // For custom service, preserve description
          const existingService = selectedServices.find(s => s.id === 'custom-service');
          if (existingService) {
            const updatedServices = selectedServices.map(s => 
              s.id === serviceId ? { ...s, photos: newPhotos } : s
            );
            onUpdateServices(updatedServices);
          } else if (isCustomServiceEnabled && customServiceDescription.trim()) {
            // Create custom service if it doesn't exist but is enabled
            const customService: SelectedService = {
              id: 'custom-service',
              name: 'Other Service (Not Listed)',
              price: undefined,
              symptoms: customServiceDescription,
              photos: newPhotos,
            };
            onUpdateServices([...selectedServices, customService]);
          }
        } else {
          const updatedServices = selectedServices.map(s => 
            s.id === serviceId ? { ...s, photos: newPhotos } : s
          );
          onUpdateServices(updatedServices);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removePhoto = (serviceId: string, photoIndex: number) => {
    const currentPhotos = servicePhotos[serviceId] || [];
    const newPhotos = currentPhotos.filter((_, i) => i !== photoIndex);
    setServicePhotos({ ...servicePhotos, [serviceId]: newPhotos });
    
    // Update service with photos
    if (serviceId === 'custom-service') {
      // For custom service, preserve description
      const existingService = selectedServices.find(s => s.id === 'custom-service');
      if (existingService) {
        const updatedServices = selectedServices.map(s => 
          s.id === serviceId ? { ...s, photos: newPhotos } : s
        );
        onUpdateServices(updatedServices);
      }
    } else {
      const updatedServices = selectedServices.map(s => 
        s.id === serviceId ? { ...s, photos: newPhotos } : s
      );
      onUpdateServices(updatedServices);
    }
  };
  
  const handleCustomServiceToggle = (enabled: boolean) => {
    setIsCustomServiceEnabled(enabled);
    
    if (enabled) {
      // Add custom service if description exists
      if (customServiceDescription.trim()) {
        const customService: SelectedService = {
          id: 'custom-service',
          name: 'Other Service (Not Listed)',
          price: undefined,
          symptoms: customServiceDescription,
          photos: servicePhotos['custom-service'] || [],
        };
        
        // Remove existing custom service if any
        const filtered = selectedServices.filter(s => s.id !== 'custom-service');
        onUpdateServices([...filtered, customService]);
      }
    } else {
      // Remove custom service
      onUpdateServices(selectedServices.filter(s => s.id !== 'custom-service'));
      setCustomServiceDescription('');
      setServicePhotos({ ...servicePhotos, 'custom-service': [] });
    }
  };
  
  const handleCustomServiceDescriptionChange = (text: string) => {
    setCustomServiceDescription(text);
    
    // Update custom service if enabled
    if (isCustomServiceEnabled && text.trim()) {
      const customService: SelectedService = {
        id: 'custom-service',
        name: 'Other Service (Not Listed)',
        price: undefined,
        symptoms: text,
        photos: servicePhotos['custom-service'] || [],
      };
      
      // Remove existing custom service if any
      const filtered = selectedServices.filter(s => s.id !== 'custom-service');
      onUpdateServices([...filtered, customService]);
    } else if (isCustomServiceEnabled && !text.trim()) {
      // Remove if description is empty
      onUpdateServices(selectedServices.filter(s => s.id !== 'custom-service'));
    }
  };
  
  const handleContinue = () => {
    // Check if custom service is enabled but has no description
    if (isCustomServiceEnabled && !customServiceDescription.trim()) {
      return;
    }
    
    if (selectedServices.length > 0) {
      onNext();
    }
  };
  
  const canContinue = () => {
    // Must have at least one service selected
    if (selectedServices.length === 0) return false;
    
    // If custom service is enabled, description is required
    if (isCustomServiceEnabled && !customServiceDescription.trim()) return false;
    
    return true;
  };
  
  return (
    <div className="space-y-6">
      {/* Standard Services */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-text-main">Standard Services</h2>
        </div>
        <p className="text-sm text-text-muted mb-4">Fixed pricing services</p>
        
        <div className="space-y-3">
          {standardServices.map((service) => (
            <div key={service.id} className="bg-white rounded-card-lg shadow-card overflow-hidden">
              <div
                onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
                className="p-4 cursor-pointer hover:bg-bg-soft/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-main">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-text-muted mt-1">{service.description}</p>
                    )}
                    {service.price && !service.subOptions && (
                      <p className="text-primary font-semibold mt-2">${service.price}</p>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-text-muted transition-transform ${
                      expandedService === service.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {expandedService === service.id && (
                <div className="px-4 pb-4 border-t border-border-soft pt-4">
                  {service.subOptions ? (
                    <div className="space-y-2">
                      {service.subOptions.map((subOption) => (
                        <label
                          key={subOption.id}
                          className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            isServiceSelected(service.id, subOption.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border-soft hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isServiceSelected(service.id, subOption.id)}
                              onChange={() => toggleService(service, subOption)}
                              className="w-5 h-5 text-primary rounded"
                            />
                            <span className="font-medium text-text-main">{subOption.name}</span>
                          </div>
                          {subOption.price && (
                            <span className="text-primary font-semibold">${subOption.price}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-border-soft cursor-pointer hover:border-primary/50">
                      <input
                        type="checkbox"
                        checked={isServiceSelected(service.id)}
                        onChange={() => toggleService(service)}
                        className="w-5 h-5 text-primary rounded"
                      />
                      <span className="font-medium text-text-main">Select this service</span>
                    </label>
                  )}
                  
                  {isServiceSelected(service.id) && (
                    <div className="mt-3 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                          Describe symptoms (optional)
                        </label>
                        <textarea
                          value={symptoms[service.id] || ''}
                          onChange={(e) => updateSymptoms(service.id, e.target.value)}
                          placeholder="What symptoms are you experiencing?"
                          className="w-full px-3 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          rows={2}
                        />
                      </div>
                      
                      {/* Photo Upload */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-text-main">
                            Add Photos (optional)
                          </label>
                          <span className="text-xs text-text-muted">
                            {(servicePhotos[service.id] || []).length}/5
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {(servicePhotos[service.id] || []).map((photo, index) => (
                            <div key={index} className="relative aspect-square">
                              <img
                                src={photo}
                                alt={`Service ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(service.id, index)}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-accent-danger text-white rounded-full flex items-center justify-center shadow-lg"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          
                          {(servicePhotos[service.id] || []).length < 5 && (
                            <label className="aspect-square bg-bg-soft border-2 border-dashed border-border-soft rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handlePhotoUpload(e, service.id)}
                                className="hidden"
                                capture="environment"
                              />
                              <svg className="w-6 h-6 text-text-muted mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-xs text-text-muted text-center">Add Photo</span>
                            </label>
                          )}
                        </div>
                        
                        <p className="text-xs text-text-muted mt-2">
                          Photos help us diagnose the issue. Max 5 photos, 5MB each.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Custom Services */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-text-main">Custom Services</h2>
        </div>
        <p className="text-sm text-text-muted mb-4">Variable pricing - quote provided after inspection</p>
        
        <div className="space-y-3">
          {customServices.map((service) => (
            <div key={service.id} className="bg-white rounded-card-lg shadow-card overflow-hidden">
              <label className="flex items-start gap-3 p-4 cursor-pointer hover:bg-bg-soft/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isServiceSelected(service.id)}
                  onChange={() => toggleService(service)}
                  className="w-5 h-5 text-primary rounded mt-0.5"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-text-main">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-text-muted mt-1">{service.description}</p>
                  )}
                  <p className="text-xs text-accent-warning mt-2 font-medium">Price determined after inspection</p>
                </div>
              </label>
              
              {isServiceSelected(service.id) && (
                <div className="px-4 pb-4 border-t border-border-soft pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                      Describe the issue (recommended)
                    </label>
                    <textarea
                      value={symptoms[service.id] || ''}
                      onChange={(e) => updateSymptoms(service.id, e.target.value)}
                      placeholder="Please describe what's happening..."
                      className="w-full px-3 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      rows={3}
                    />
                  </div>
                  
                  {/* Photo Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-text-main">
                        Add Photos (optional)
                      </label>
                      <span className="text-xs text-text-muted">
                        {(servicePhotos[service.id] || []).length}/5
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {(servicePhotos[service.id] || []).map((photo, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={photo}
                            alt={`Service ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(service.id, index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-accent-danger text-white rounded-full flex items-center justify-center shadow-lg"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      {(servicePhotos[service.id] || []).length < 5 && (
                        <label className="aspect-square bg-bg-soft border-2 border-dashed border-border-soft rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handlePhotoUpload(e, service.id)}
                            className="hidden"
                            capture="environment"
                          />
                          <svg className="w-6 h-6 text-text-muted mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs text-text-muted text-center">Add Photo</span>
                        </label>
                      )}
                    </div>
                    
                    <p className="text-xs text-text-muted mt-2">
                      Photos help us provide accurate quotes. Max 5 photos, 5MB each.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Service Not Listed */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <h2 className="text-xl font-semibold text-text-main">Service Not Listed?</h2>
        </div>
        <p className="text-sm text-text-muted mb-4">Describe the service you need if it's not in our list</p>
        
        <div className="bg-white rounded-card-lg shadow-card overflow-hidden">
          <label className="flex items-start gap-3 p-4 cursor-pointer hover:bg-bg-soft/50 transition-colors">
            <input
              type="checkbox"
              checked={isCustomServiceEnabled}
              onChange={(e) => handleCustomServiceToggle(e.target.checked)}
              className="w-5 h-5 text-primary rounded mt-0.5"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-text-main">I need a service that's not listed</h3>
              <p className="text-sm text-text-muted mt-1">Describe what you need and we'll provide a quote</p>
              <p className="text-xs text-accent-warning mt-2 font-medium">Price determined after review</p>
            </div>
          </label>
          
          {isCustomServiceEnabled && (
            <div className="px-4 pb-4 border-t border-border-soft pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-2">
                  Describe the service you need <span className="text-accent-danger">*</span>
                </label>
                <textarea
                  value={customServiceDescription}
                  onChange={(e) => handleCustomServiceDescriptionChange(e.target.value)}
                  placeholder="Please describe the service you need in detail. For example: 'I need help with my car's electrical system - the dashboard lights are flickering and the radio keeps cutting out.'"
                  className="w-full px-3 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  rows={4}
                  required
                />
                <p className="text-xs text-text-muted mt-2">
                  The more details you provide, the better we can help you.
                </p>
              </div>
              
              {/* Photo Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-text-main">
                    Add Photos (optional)
                  </label>
                  <span className="text-xs text-text-muted">
                    {(servicePhotos['custom-service'] || []).length}/5
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {(servicePhotos['custom-service'] || []).map((photo, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={photo}
                        alt={`Custom service ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto('custom-service', index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-accent-danger text-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  {(servicePhotos['custom-service'] || []).length < 5 && (
                    <label className="aspect-square bg-bg-soft border-2 border-dashed border-border-soft rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handlePhotoUpload(e, 'custom-service')}
                        className="hidden"
                        capture="environment"
                      />
                      <svg className="w-6 h-6 text-text-muted mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs text-text-muted text-center">Add Photo</span>
                    </label>
                  )}
                </div>
                
                <p className="text-xs text-text-muted mt-2">
                  Photos help us understand your needs better. Max 5 photos, 5MB each.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-card-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold text-text-main">{selectedServices.length} Service(s) Selected</p>
          </div>
          <ul className="text-sm text-text-main space-y-1">
            {selectedServices.map((service, index) => (
              <li key={index}>
                • {service.name} {service.subOptionName && `(${service.subOptionName})`}
                {service.price && ` - $${service.price}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Continue Button */}
      <Button
        variant="primary"
        fullWidth
        size="lg"
        onClick={handleContinue}
        disabled={!canContinue()}
        className="mt-6"
      >
        Continue to Review
      </Button>
    </div>
  );
};

