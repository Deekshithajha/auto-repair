import React from 'react';
import { Invoice, Vehicle } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface InvoiceCardProps {
  invoice: Invoice;
  vehicle?: Vehicle;
  onClick?: () => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, vehicle, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  return (
    <div
      className="bg-white rounded-card-lg p-4 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-text-muted text-xs font-medium mb-1">Invoice #{invoice.id.toUpperCase()}</p>
          <p className="text-text-muted text-sm">Ticket #{invoice.ticketId.toUpperCase()}</p>
          {vehicle && (
            <p className="text-text-main font-medium text-sm mt-1">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          )}
        </div>
        <StatusBadge status={invoice.status} size="sm" />
      </div>
      
      <div className="flex items-end justify-between pt-3 border-t border-border-soft">
        <div className="text-xs text-text-muted">
          <p>Created: {formatDate(invoice.createdAt)}</p>
          {invoice.dueDate && <p>Due: {formatDate(invoice.dueDate)}</p>}
        </div>
        <p className="text-text-main text-xl font-semibold">{formatCurrency(invoice.total)}</p>
      </div>
    </div>
  );
};

