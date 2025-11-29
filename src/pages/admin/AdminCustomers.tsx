import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { Input } from '../../components/ui/Input';
import { customers } from '../../data/customers';

export const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCustomers = customers.filter(customer => {
    const query = searchQuery.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(query) ||
      customer.lastName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    );
  });
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Customers" showBack />
      
      <div className="px-4 py-6 space-y-4">
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => navigate(`/admin/customers/${customer.id}`)}
              className="bg-white rounded-card-lg p-4 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-text-main">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <p className="text-sm text-text-muted">{customer.email}</p>
                  <p className="text-sm text-text-muted">{customer.phone}</p>
                </div>
                <svg className="w-5 h-5 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              
              <div className="flex gap-6 pt-3 border-t border-border-soft">
                <div>
                  <p className="text-xs text-text-muted">Vehicles</p>
                  <p className="text-lg font-semibold text-primary">{customer.vehicles.length}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Tickets</p>
                  <p className="text-lg font-semibold text-primary">{customer.tickets.length}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Invoices</p>
                  <p className="text-lg font-semibold text-primary">{customer.invoices.length}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="bg-white rounded-card-lg p-8 text-center shadow-card">
              <p className="text-text-muted">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

