import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { FilterChips } from '../../components/ui/FilterChips';
import { InvoiceCard } from '../../components/cards/InvoiceCard';
import { invoices } from '../../data/invoices';
import { vehicles } from '../../data/vehicles';

export const AdminInvoices: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filters = ['All', 'Paid', 'Pending', 'Overdue'];
  
  const filteredInvoices = invoices.filter(invoice => {
    if (activeFilter === 'All') return true;
    return invoice.status.toLowerCase() === activeFilter.toLowerCase();
  });
  
  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Invoices" showBack />
      
      <div className="px-4 py-6 space-y-4">
        {/* Revenue Summary */}
        <div className="bg-primary text-white rounded-card-lg p-6 shadow-card">
          <p className="text-white/80 text-sm mb-1">Total Revenue (Paid)</p>
          <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
        
        <FilterChips
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => {
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
          {filteredInvoices.length === 0 && (
            <div className="bg-white rounded-card-lg p-8 text-center shadow-card">
              <p className="text-text-muted">No invoices found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

