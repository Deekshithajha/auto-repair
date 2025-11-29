import React from 'react';
import { Ticket, Vehicle } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface TicketCardProps {
  ticket: Ticket;
  vehicle?: Vehicle;
  onClick?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, vehicle, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div
      className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl border border-gray-100 hover:border-primary/20 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wide">Ticket #{ticket.id.toUpperCase()}</p>
          </div>
          <h3 className="text-text-main font-bold text-lg mb-1 group-hover:text-primary transition-colors">
            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}
          </h3>
          {vehicle && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-text-muted text-sm font-medium">{vehicle.plate}</p>
            </div>
          )}
        </div>
        <StatusBadge status={ticket.status} size="sm" />
      </div>
      
      <p className="text-text-main text-sm mb-4 line-clamp-2 leading-relaxed">{ticket.description}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Updated {formatDate(ticket.updatedAt)}</span>
        </div>
        {ticket.estimatedCompletion && (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 bg-accent-warning rounded-full animate-pulse"></div>
            <span className="text-primary font-semibold">
              ETA: {formatDate(ticket.estimatedCompletion)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

