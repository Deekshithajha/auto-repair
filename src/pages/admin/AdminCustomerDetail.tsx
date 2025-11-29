import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { VehicleCard } from '../../components/cards/VehicleCard';
import { TicketCard } from '../../components/cards/TicketCard';
import { InvoiceCard } from '../../components/cards/InvoiceCard';
import { customers } from '../../data/customers';
import { vehicles } from '../../data/vehicles';
import { tickets } from '../../data/tickets';
import { invoices } from '../../data/invoices';

export const AdminCustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'vehicles' | 'tickets' | 'invoices'>('vehicles');
  
  const customer = customers.find(c => c.id === id);
  const customerVehicles = vehicles.filter(v => v.customerId === id);
  const customerTickets = tickets.filter(t => t.customerId === id);
  const customerInvoices = invoices.filter(i => i.customerId === id);
  
  if (!customer) {
    return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Customer Not Found" showBack />
        <div className="px-4 py-6">
          <p className="text-text-muted text-center">Customer not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Customer Details" showBack />
      
      <div className="px-4 py-6 space-y-4">
        {/* Customer Info Card */}
        <div className="bg-white rounded-card-lg p-6 shadow-card">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-text-main">{customer.firstName} {customer.lastName}</h2>
              <p className="text-sm text-text-muted mt-1">{customer.email}</p>
              <p className="text-sm text-text-muted">{customer.phone}</p>
              {customer.address && (
                <p className="text-sm text-text-muted mt-2">{customer.address}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border-soft">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{customerVehicles.length}</p>
              <p className="text-xs text-text-muted">Vehicles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{customerTickets.length}</p>
              <p className="text-xs text-text-muted">Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{customerInvoices.length}</p>
              <p className="text-xs text-text-muted">Invoices</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-card p-1 shadow-card">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'vehicles'
                ? 'bg-primary text-white'
                : 'text-text-main hover:bg-bg-soft'
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'tickets'
                ? 'bg-primary text-white'
                : 'text-text-main hover:bg-bg-soft'
            }`}
          >
            Tickets
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'invoices'
                ? 'bg-primary text-white'
                : 'text-text-main hover:bg-bg-soft'
            }`}
          >
            Invoices
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="space-y-3">
          {activeTab === 'vehicles' && customerVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onClick={() => navigate(`/admin/vehicles/${vehicle.id}`)}
            />
          ))}
          
          {activeTab === 'tickets' && customerTickets.map((ticket) => {
            const vehicle = vehicles.find(v => v.id === ticket.vehicleId);
            return (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                vehicle={vehicle}
                onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
              />
            );
          })}
          
          {activeTab === 'invoices' && customerInvoices.map((invoice) => {
            const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
            return (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                vehicle={vehicle}
                onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
              />
            );
          })}
          
          {((activeTab === 'vehicles' && customerVehicles.length === 0) ||
            (activeTab === 'tickets' && customerTickets.length === 0) ||
            (activeTab === 'invoices' && customerInvoices.length === 0)) && (
            <div className="bg-white rounded-card-lg p-8 text-center shadow-card">
              <p className="text-text-muted">No {activeTab} found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

