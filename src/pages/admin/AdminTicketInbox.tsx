import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { FilterChips } from '../../components/ui/FilterChips';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RescheduleManagement } from '../../components/tickets/RescheduleManagement';
import { ticketService } from '../../services/ticketService';
import { employees } from '../../data/employees';
import { Ticket, TicketStatus } from '../../types';

export const AdminTicketInbox: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedMechanicIds, setSelectedMechanicIds] = useState<string[]>([]);

  const statusFilters = [
    'all',
    'pending-admin-review',
    'assigned',
    'in-progress',
    'return-visit-required',
    'rescheduled-awaiting-vehicle',
    'work-completed',
  ];

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const allTickets = await ticketService.getTickets();
        setTickets(allTickets);
      } catch (error) {
        console.error('Failed to load tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
    // Refresh every 5 seconds to get updates
    const interval = setInterval(loadTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter === 'all') return true;
    return ticket.status === statusFilter;
  });

  const handleAssignMechanics = async () => {
    if (!selectedTicket || selectedMechanicIds.length === 0) return;

    try {
      const updated = await ticketService.assignMechanics(selectedTicket.id, selectedMechanicIds);
      setTickets(tickets.map(t => t.id === updated.id ? updated : t));
      setShowAssignModal(false);
      setSelectedTicket(null);
      setSelectedMechanicIds([]);
    } catch (error) {
      console.error('Failed to assign mechanics:', error);
      alert('Failed to assign mechanics. Please try again.');
    }
  };

  const handleToggleMechanic = (mechanicId: string) => {
    setSelectedMechanicIds(prev => {
      if (prev.includes(mechanicId)) {
        return prev.filter(id => id !== mechanicId);
      } else {
        return [...prev, mechanicId];
      }
    });
  };

  const handleSetReschedule = async (data: {
    scheduledDate: string;
    scheduledTime: string;
    notes?: string;
  }) => {
    if (!selectedTicket) return;

    try {
      const rescheduleInfo = {
        ...selectedTicket.rescheduleInfo!,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        notes: data.notes,
      };
      const updated = await ticketService.setRescheduleInfo(selectedTicket.id, rescheduleInfo);
      setTickets(tickets.map(t => t.id === updated.id ? updated : t));
      setShowRescheduleModal(false);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to set reschedule:', error);
      alert('Failed to set reschedule. Please try again.');
    }
  };

  const mechanics = employees.filter((e) => e.role === 'mechanic');

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-soft via-white to-bg-soft pb-24 md:pb-6">
      <TopAppBar
        title="Ticket Inbox"
        leftIcon={
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        }
        onLeftClick={() => navigate('/admin')}
      />

      <div className="px-4 py-6 max-w-6xl mx-auto space-y-6">
        {/* Filters */}
        <div>
          <FilterChips
            filters={statusFilters.map((f) => f.replace(/-/g, ' '))}
            activeFilter={statusFilter.replace(/-/g, ' ')}
            onFilterChange={(f) => setStatusFilter(f.replace(/ /g, '-'))}
          />
        </div>

        {/* Ticket Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTickets.map((ticket, index) => {
              const vehicle = ticket.vehicle;
              const customer = ticket.customer;
              // Get all assigned mechanics
              const assignedMechanicIds = ticket.assignedMechanicIds || 
                (ticket.assignedMechanicId ? [ticket.assignedMechanicId] : []);
              const assignedMechanics = assignedMechanicIds
                .map(id => employees.find(e => e.id === id))
                .filter(Boolean) as typeof employees;

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-text-main">
                          #{ticket.id.toUpperCase()}
                        </h3>
                        <StatusBadge status={ticket.status} />
                        {ticket.status === 'return-visit-required' && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                            🔄 Needs Reschedule
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted">
                        Created {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Customer & Vehicle Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                      <p className="text-xs text-text-muted mb-1">Customer</p>
                      <p className="font-semibold text-text-main">
                        {customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'}
                      </p>
                      {customer && (
                        <>
                          <p className="text-sm text-text-muted">{customer.email}</p>
                          <p className="text-sm text-text-muted">{customer.phone}</p>
                        </>
                      )}
                    </div>

                    <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                      <p className="text-xs text-text-muted mb-1">Vehicle</p>
                      <p className="font-semibold text-text-main">
                        {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown'}
                      </p>
                      {vehicle && (
                        <p className="text-sm text-text-muted">{vehicle.plate}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-text-muted mb-1">Issue Description</p>
                    <p className="text-sm text-text-main">{ticket.symptoms || ticket.description || 'No description'}</p>
                  </div>

                  {/* Services */}
                  {ticket.services && ticket.services.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-text-muted mb-2">Requested Services</p>
                      <div className="flex flex-wrap gap-2">
                        {ticket.services.map((service) => (
                          <span
                            key={service.id}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                          >
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assigned To - More Prominent */}
                  <div className={`mb-4 p-3 rounded-xl ${
                    assignedMechanics.length > 0
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-orange-50 border border-orange-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${
                        assignedMechanics.length > 0 ? 'text-blue-600' : 'text-orange-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-text-muted mb-0.5">
                          Assigned Mechanic{assignedMechanics.length !== 1 ? 's' : ''} ({assignedMechanics.length})
                        </p>
                        {assignedMechanics.length > 0 ? (
                          <div className="space-y-1">
                            {assignedMechanics.map((mechanic) => (
                              <p key={mechanic.id} className="text-sm font-bold text-text-main">
                                {mechanic.firstName} {mechanic.lastName}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-orange-700">Not Assigned</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reschedule Info */}
                  {ticket.rescheduleInfo && (
                    <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl">
                      <p className="text-sm font-semibold text-orange-800 mb-1">
                        Return Visit Required
                      </p>
                      <p className="text-sm text-orange-700">{ticket.rescheduleInfo.reason}</p>
                      {ticket.rescheduleInfo.scheduledDate && (
                        <p className="text-sm font-semibold text-orange-800 mt-2">
                          Scheduled: {new Date(ticket.rescheduleInfo.scheduledDate).toLocaleDateString()} at{' '}
                          {ticket.rescheduleInfo.scheduledTime}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    {/* Show Assign button for all tickets - allows assignment/reassignment */}
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setSelectedMechanicIds(assignedMechanicIds); // Pre-select current mechanics
                        setShowAssignModal(true);
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      {assignedMechanics.length > 0 ? `Manage (${assignedMechanics.length})` : 'Assign Mechanic'}
                    </button>

                    {ticket.status === 'return-visit-required' && !ticket.rescheduleInfo?.scheduledDate && (
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowRescheduleModal(true);
                        }}
                        className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
                      >
                        Set Return Date
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                      className="px-4 py-2 border-2 border-gray-300 text-text-main rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-text-muted font-medium">No tickets found</p>
            </div>
          )}
        </div>
      </div>

      {/* Assign Mechanic Modal */}
      <AnimatePresence>
        {showAssignModal && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-text-main mb-4">
                Assign Mechanic{selectedMechanicIds.length !== 1 ? 's' : ''}
              </h3>

              <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                <p className="text-sm text-text-muted">Ticket</p>
                <p className="font-bold text-text-main">#{selectedTicket.id.toUpperCase()}</p>
                {(() => {
                  const currentIds = selectedTicket.assignedMechanicIds || 
                    (selectedTicket.assignedMechanicId ? [selectedTicket.assignedMechanicId] : []);
                  const currentMechanics = currentIds
                    .map(id => employees.find(e => e.id === id))
                    .filter(Boolean);
                  
                  return currentMechanics.length > 0 ? (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-text-muted mb-1">Currently Assigned</p>
                      {currentMechanics.map((mechanic) => (
                        <p key={mechanic!.id} className="text-sm font-semibold text-text-main">
                          {mechanic!.firstName} {mechanic!.lastName}
                        </p>
                      ))}
                    </div>
                  ) : null;
                })()}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-text-main mb-3">
                  Select Mechanic{selectedMechanicIds.length > 1 ? 's' : ''} (Multiple selection allowed)
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl p-3">
                  {mechanics.map((mechanic) => {
                    const isSelected = selectedMechanicIds.includes(mechanic.id);
                    return (
                      <label
                        key={mechanic.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/10 border-2 border-primary'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleMechanic(mechanic.id)}
                          className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-text-main">
                            {mechanic.firstName} {mechanic.lastName}
                          </p>
                          <p className="text-xs text-text-muted">{mechanic.email}</p>
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </label>
                    );
                  })}
                </div>
                {selectedMechanicIds.length > 0 && (
                  <p className="mt-2 text-sm text-text-muted">
                    {selectedMechanicIds.length} mechanic{selectedMechanicIds.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 text-text-main rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignMechanics}
                  disabled={selectedMechanicIds.length === 0}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign {selectedMechanicIds.length > 0 ? `(${selectedMechanicIds.length})` : ''}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && selectedTicket && selectedTicket.rescheduleInfo && (
          <RescheduleManagement
            ticketId={selectedTicket.id}
            rescheduleInfo={selectedTicket.rescheduleInfo}
            onSetSchedule={handleSetReschedule}
            onCancel={() => setShowRescheduleModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

