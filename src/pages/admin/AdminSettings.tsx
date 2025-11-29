import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'main' | 'services' | 'statuses'>('main');
  
  const services = [
    'Oil Change',
    'Tire Rotation',
    'Brake Service',
    'Transmission Service',
    'Engine Diagnostic',
    'Wheel Alignment',
    'Battery Replacement',
    'Air Filter Replacement',
  ];
  
  const statuses = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'waiting-pickup', label: 'Waiting Pickup' },
    { value: 'completed', label: 'Completed' },
  ];
  
  if (activeSection === 'services') {
    return (
      <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
        <TopAppBar
          title="Service Library"
          showBack
          onLeftClick={() => setActiveSection('main')}
        />
        
        <div className="px-4 py-6 space-y-4">
          <div className="bg-white rounded-card-lg p-4 shadow-card">
            <h3 className="text-lg font-semibold text-text-main mb-4">Available Services</h3>
            <div className="space-y-2">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-bg-soft rounded-lg"
                >
                  <span className="text-text-main font-medium">{service}</span>
                  <button className="text-accent-danger hover:text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-card-lg p-4 shadow-card">
            <h3 className="text-lg font-semibold text-text-main mb-4">Add New Service</h3>
            <Input placeholder="Service name" />
            <Button variant="primary" fullWidth className="mt-3">
              Add Service
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (activeSection === 'statuses') {
    return (
      <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
        <TopAppBar
          title="Status Configuration"
          showBack
          onLeftClick={() => setActiveSection('main')}
        />
        
        <div className="px-4 py-6">
          <div className="bg-white rounded-card-lg p-4 shadow-card">
            <h3 className="text-lg font-semibold text-text-main mb-4">Ticket Statuses</h3>
            <div className="space-y-2">
              {statuses.map((status) => (
                <div
                  key={status.value}
                  className="flex items-center justify-between p-3 bg-bg-soft rounded-lg"
                >
                  <span className="text-text-main font-medium">{status.label}</span>
                  <span className="text-text-muted text-sm">{status.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Settings" showBack />
      
      <div className="px-4 py-6 space-y-4">
        {/* Shop Information */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-4">Shop Information</h3>
          <div className="space-y-3">
            <Input label="Shop Name" defaultValue="Lakewood 76 Auto Repair" />
            <Input label="Phone" defaultValue="(555) 123-4567" />
            <Input label="Email" defaultValue="info@lakewood76.com" />
            <Input label="Address" defaultValue="123 Main St, Seattle, WA 98101" />
          </div>
          <Button variant="primary" fullWidth className="mt-4">
            Save Changes
          </Button>
        </div>
        
        {/* Configuration */}
        <div className="bg-white rounded-card-lg shadow-card overflow-hidden">
          <button
            onClick={() => setActiveSection('services')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-bg-soft transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-text-main font-medium">Service Library</span>
            </div>
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button
            onClick={() => setActiveSection('statuses')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-bg-soft transition-colors border-t border-border-soft"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-text-main font-medium">Status Configuration</span>
            </div>
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Account Actions */}
        <div className="space-y-3">
          <Button variant="secondary" fullWidth onClick={() => {}}>
            Export Data
          </Button>
          <Button variant="danger" fullWidth onClick={() => navigate('/')}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

