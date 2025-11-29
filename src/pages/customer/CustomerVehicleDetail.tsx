import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { TicketCard } from '../../components/cards/TicketCard';
import { vehicles } from '../../data/vehicles';
import { tickets } from '../../data/tickets';

export const CustomerVehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'status' | 'history'>('status');
  
  const vehicle = vehicles.find(v => v.id === id);
  const vehicleTickets = tickets.filter(t => t.vehicleId === id);
  
  if (!vehicle) {
    return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Vehicle Not Found" showBack />
        <div className="px-4 py-6">
          <p className="text-text-muted text-center">Vehicle not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Vehicle Details" showBack />
      
      <div className="px-4 py-6 space-y-4">
        {/* Vehicle Summary Card */}
        <div className="bg-primary text-white rounded-card-lg p-6 shadow-card">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">{vehicle.year} {vehicle.make} {vehicle.model}</h2>
            <p className="text-xl font-semibold text-white/90">{vehicle.plate}</p>
            {vehicle.nickname && (
              <p className="text-white/80 mt-2">"{vehicle.nickname}"</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-white/80 text-sm">Color</p>
              <p className="font-semibold">{vehicle.color || 'N/A'}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">VIN</p>
              <p className="font-semibold text-xs">{vehicle.vin ? `${vehicle.vin.slice(0, 8)}...` : 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-card p-1 shadow-card">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'status'
                ? 'bg-primary text-white'
                : 'text-text-main hover:bg-bg-soft'
            }`}
          >
            Status & Tickets
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-primary text-white'
                : 'text-text-main hover:bg-bg-soft'
            }`}
          >
            Service History
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            <div className="bg-white rounded-card-lg p-4 shadow-card">
              <h3 className="text-lg font-semibold text-text-main mb-3">Current Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-bg-soft rounded-lg">
                  <p className="text-2xl font-bold text-primary">{vehicleTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length}</p>
                  <p className="text-sm text-text-muted">Active Tickets</p>
                </div>
                <div className="text-center p-3 bg-bg-soft rounded-lg">
                  <p className="text-2xl font-bold text-accent-success">{vehicleTickets.filter(t => t.status === 'completed').length}</p>
                  <p className="text-sm text-text-muted">Completed</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-text-main mb-3">Recent Tickets</h3>
              <div className="space-y-3">
                {vehicleTickets.slice(0, 5).map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    vehicle={vehicle}
                    onClick={() => navigate(`/customer/tickets/${ticket.id}`)}
                  />
                ))}
                {vehicleTickets.length === 0 && (
                  <div className="bg-white rounded-card-lg p-8 text-center shadow-card">
                    <p className="text-text-muted">No tickets for this vehicle</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-main">Service History</h3>
            {vehicleTickets.filter(t => t.status === 'completed').map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                vehicle={vehicle}
                onClick={() => navigate(`/customer/tickets/${ticket.id}`)}
              />
            ))}
            {vehicleTickets.filter(t => t.status === 'completed').length === 0 && (
              <div className="bg-white rounded-card-lg p-8 text-center shadow-card">
                <p className="text-text-muted">No service history yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

