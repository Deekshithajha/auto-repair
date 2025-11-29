import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Vehicle } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface WorkOrderCardProps {
  ticket: Ticket;
  vehicle?: Vehicle;
  onAccept?: (ticketId: string) => void;
  onComplete?: (ticketId: string) => void;
  acceptedAt?: string | null;
  startedAt?: string | null;
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
  ticket,
  vehicle,
  onAccept,
  onComplete,
  acceptedAt,
  startedAt,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeElapsed = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
    return `${diffMins}m`;
  };

  const handleAccept = async () => {
    if (!onAccept) return;
    setIsAccepting(true);
    // Simulate API call
    setTimeout(() => {
      onAccept(ticket.id);
      setIsAccepting(false);
    }, 500);
  };

  const handleComplete = async () => {
    if (!onComplete) return;
    setIsCompleting(true);
    // Simulate API call
    setTimeout(() => {
      onComplete(ticket.id);
      setIsCompleting(false);
    }, 500);
  };

  const isAccepted = acceptedAt !== null && acceptedAt !== undefined;
  const isInProgress = ticket.status === 'in-progress' || isAccepted;
  const isCompleted = ticket.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-wide">
              Ticket #{ticket.id.toUpperCase()}
            </p>
          </div>
          <h3 className="text-text-main font-bold text-lg mb-1">
            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}
          </h3>
          {vehicle && (
            <div className="flex items-center gap-2 mb-2">
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

      {/* Services List */}
      {ticket.services && ticket.services.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-text-muted mb-2">Services:</p>
          <div className="space-y-1">
            {ticket.services.map((service) => (
              <div key={service.id} className="flex items-center justify-between text-xs">
                <span className="text-text-main">{service.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  service.status === 'completed' ? 'bg-green-100 text-green-700' :
                  service.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {service.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamp Display */}
      {startedAt && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-semibold text-blue-700">
              Started: {formatDate(startedAt)} • {formatTimeElapsed(startedAt)} elapsed
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        {!isAccepted && !isCompleted && (
          <motion.button
            onClick={handleAccept}
            disabled={isAccepting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAccepting ? (
              <>
                <span className="inline-block w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span>Accepting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Accept & Start</span>
              </>
            )}
          </motion.button>
        )}

        {isInProgress && !isCompleted && (
          <motion.button
            onClick={handleComplete}
            disabled={isCompleting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCompleting ? (
              <>
                <span className="inline-block w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span>Completing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Mark Complete</span>
              </>
            )}
          </motion.button>
        )}

        {isCompleted && (
          <div className="flex-1 py-3 px-4 bg-green-50 border-2 border-green-200 text-green-700 font-semibold text-sm rounded-lg flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Completed</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-text-muted mt-3 pt-3 border-t border-gray-100">
        <span>Created {formatDate(ticket.createdAt)}</span>
        {ticket.estimatedCompletion && !isCompleted && (
          <span className="text-primary font-medium">
            ETA: {formatDate(ticket.estimatedCompletion)}
          </span>
        )}
      </div>
    </motion.div>
  );
};

