import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { InvoiceCard } from '../../components/cards/InvoiceCard';
import { invoices } from '../../data/invoices';
import { vehicles } from '../../data/vehicles';

export const CustomerInvoices: React.FC = () => {
  const navigate = useNavigate();
  
  const customerId = 'c1';
  const customerInvoices = invoices.filter(i => i.customerId === customerId);
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="My Invoices" showBack />
      
      <div className="px-4 py-6 space-y-3">
        {customerInvoices.map((invoice) => {
          const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
          return (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              vehicle={vehicle}
              onClick={() => navigate(`/customer/invoices/${invoice.id}`)}
            />
          );
        })}
        {customerInvoices.length === 0 && (
          <div className="bg-white rounded-card-lg p-8 text-center shadow-card">
            <p className="text-text-muted">No invoices yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

