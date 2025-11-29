import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { Button } from '../../components/ui/Button';
import { customers } from '../../data/customers';

export const CustomerProfile: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock customer data
  const customer = customers[0];
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Profile" showBack />
      
      <div className="px-4 py-6 space-y-4">
        {/* Profile Header */}
        <div className="bg-white rounded-card-lg p-6 shadow-card text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-main">{customer.firstName} {customer.lastName}</h2>
          <p className="text-text-muted mt-1">{customer.email}</p>
        </div>
        
        {/* Contact Info */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Email</p>
              <p className="text-text-main font-medium">{customer.email}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Phone</p>
              <p className="text-text-main font-medium">{customer.phone}</p>
            </div>
            {customer.address && (
              <div>
                <p className="text-text-muted text-sm">Address</p>
                <p className="text-text-main font-medium">{customer.address}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-4">Account Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{customer.vehicles.length}</p>
              <p className="text-text-muted text-sm">Vehicles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{customer.tickets.length}</p>
              <p className="text-text-muted text-sm">Tickets</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{customer.invoices.length}</p>
              <p className="text-text-muted text-sm">Invoices</p>
            </div>
          </div>
        </div>
        
        {/* Settings */}
        <div className="bg-white rounded-card-lg shadow-card overflow-hidden">
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-bg-soft transition-colors">
            <span className="text-text-main font-medium">Edit Profile</span>
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-bg-soft transition-colors border-t border-border-soft">
            <span className="text-text-main font-medium">Notifications</span>
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-bg-soft transition-colors border-t border-border-soft">
            <span className="text-text-main font-medium">Help & Support</span>
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Logout */}
        <Button variant="danger" fullWidth onClick={() => navigate('/')}>
          Log Out
        </Button>
      </div>
    </div>
  );
};

