import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { FilterChips } from '../../components/ui/FilterChips';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { quotes } from '../../data/quotes';
import { vehicles } from '../../data/vehicles';

export const AdminQuotes: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filters = ['All', 'Draft', 'Sent', 'Approved', 'Rejected'];
  
  const filteredQuotes = quotes.filter(quote => {
    if (activeFilter === 'All') return true;
    return quote.status.toLowerCase() === activeFilter.toLowerCase();
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Quotes" showBack />
      
      <div className="px-4 py-6 space-y-4">
        <FilterChips
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        
        <div className="space-y-3">
          {filteredQuotes.map((quote) => {
            const vehicle = vehicles.find(v => v.id === quote.vehicleId);
            return (
              <div
                key={quote.id}
                onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                className="bg-white rounded-card-lg p-4 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-text-muted text-xs font-medium mb-1">Quote #{quote.id.toUpperCase()}</p>
                    {vehicle && (
                      <p className="text-text-main font-semibold">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={quote.status} size="sm" />
                </div>
                
                <div className="space-y-2 mb-3">
                  {quote.services.slice(0, 2).map((service) => (
                    <p key={service.id} className="text-sm text-text-main">• {service.name}</p>
                  ))}
                  {quote.services.length > 2 && (
                    <p className="text-sm text-text-muted">+ {quote.services.length - 2} more</p>
                  )}
                </div>
                
                <div className="flex items-end justify-between pt-3 border-t border-border-soft">
                  <div className="text-xs text-text-muted">
                    <p>Valid until: {formatDate(quote.validUntil)}</p>
                  </div>
                  <p className="text-text-main text-xl font-semibold">{formatCurrency(quote.total)}</p>
                </div>
              </div>
            );
          })}
          {filteredQuotes.length === 0 && (
            <div className="bg-white rounded-card-lg p-8 text-center shadow-card">
              <p className="text-text-muted">No quotes found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

