import React from 'react';
import { TicketStatus, InvoiceStatus, QuoteStatus } from '../../types';

interface StatusBadgeProps {
  status: TicketStatus | InvoiceStatus | QuoteStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusStyles = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'open':
      case 'pending':
      case 'draft':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-accent-warning/10 text-accent-warning';
      case 'completed':
      case 'paid':
      case 'approved':
        return 'bg-accent-success/10 text-accent-success';
      case 'waiting-pickup':
        return 'bg-purple-100 text-purple-700';
      case 'overdue':
      case 'rejected':
        return 'bg-accent-danger/10 text-accent-danger';
      case 'sent':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  const formatStatus = (status: string) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeStyles} ${getStatusStyles(status)}`}>
      {formatStatus(status)}
    </span>
  );
};

