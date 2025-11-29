import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { ticketService } from '../../services/ticketService';
import { employees } from '../../data/employees';
import { Ticket } from '../../types';

export const AdminTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMechanicIds, setSelectedMechanicIds] = useState<string[]>([]);

  useEffect(() => {
    const loadTicket = async () => {
      if (!id) return;
      try {
        const fetchedTicket = await ticketService.getTicketById(id);
        setTicket(fetchedTicket);
        if (fetchedTicket) {
          // Initialize selected mechanics from ticket
          const assignedIds = fetchedTicket.assignedMechanicIds || 
            (fetchedTicket.assignedMechanicId ? [fetchedTicket.assignedMechanicId] : []);
          setSelectedMechanicIds(assignedIds);
        }
      } catch (error) {
        console.error('Failed to load ticket:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [id]);

  const handleAssignMechanics = async () => {
    if (!ticket || selectedMechanicIds.length === 0) return;

    try {
      const updated = await ticketService.assignMechanics(ticket.id, selectedMechanicIds);
      setTicket(updated);
      setShowAssignModal(false);
    } catch (error) {
      console.error('Failed to assign mechanics:', error);
      alert('Failed to assign mechanics. Please try again.');
    }
  };

  const handleRemoveMechanic = async (mechanicId: string) => {
    if (!ticket) return;

    try {
      const updated = await ticketService.removeMechanic(ticket.id, mechanicId);
      setTicket(updated);
      // Update selected list
      setSelectedMechanicIds(updated.assignedMechanicIds || []);
    } catch (error) {
      console.error('Failed to remove mechanic:', error);
      alert('Failed to remove mechanic. Please try again.');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft pb-16 md:pb-0 flex items-center justify-center">
        <p className="text-text-muted">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
        <TopAppBar title="Ticket Not Found" showBack onLeftClick={() => navigate('/admin/tickets/inbox')} />
        <div className="px-4 py-6">
          <p className="text-text-muted text-center">Ticket not found</p>
        </div>
      </div>
    );
  }

  const vehicle = ticket.vehicle;
  const customer = ticket.customer;
  
  // Get all assigned mechanics
  const assignedMechanicIds = ticket.assignedMechanicIds || 
    (ticket.assignedMechanicId ? [ticket.assignedMechanicId] : []);
  const assignedMechanics = assignedMechanicIds
    .map(id => employees.find(e => e.id === id))
    .filter(Boolean) as typeof employees;
  
  const mechanics = employees.filter((e) => e.role === 'mechanic');

  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar 
        title={`Ticket #${ticket.id.toUpperCase()}`} 
        showBack 
        onLeftClick={() => navigate('/admin/tickets/inbox')} 
      />
      
      <div className="px-4 py-6 space-y-4">
        {/* Vehicle Summary Card */}
        <div className="bg-primary text-white rounded-card-lg p-6 shadow-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm mb-1">License Plate</p>
              <p className="text-2xl font-bold">{vehicle.plate}</p>
            </div>
            <StatusBadge status={ticket.status} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/80 text-sm">Make & Model</p>
              <p className="font-semibold">{vehicle.make} {vehicle.model}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Year</p>
              <p className="font-semibold">{vehicle.year}</p>
            </div>
          </div>
        </div>

        {/* Assigned Mechanics Card - PROMINENT */}
        <div className={`rounded-card-lg p-4 shadow-card ${
          assignedMechanics.length > 0
            ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300' 
            : 'bg-orange-50 border-2 border-orange-300'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                assignedMechanics.length > 0 ? 'bg-blue-500' : 'bg-orange-500'
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-muted mb-1">
                  Assigned Mechanic{assignedMechanics.length !== 1 ? 's' : ''} ({assignedMechanics.length})
                </p>
                {assignedMechanics.length > 0 ? (
                  <p className="text-xs text-text-muted">Click to manage assignments</p>
                ) : (
                  <p className="text-lg font-bold text-orange-700">Not Assigned</p>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedMechanicIds(assignedMechanicIds);
                setShowAssignModal(true);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                assignedMechanics.length > 0
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {assignedMechanics.length > 0 ? 'Manage' : 'Assign'}
            </button>
          </div>
          
          {/* List of assigned mechanics */}
          {assignedMechanics.length > 0 && (
            <div className="space-y-2 mt-3 pt-3 border-t border-blue-200">
              {assignedMechanics.map((mechanic) => (
                <div key={mechanic.id} className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                  <div>
                    <p className="font-semibold text-text-main">
                      {mechanic.firstName} {mechanic.lastName}
                    </p>
                    <p className="text-xs text-text-muted">{mechanic.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveMechanic(mechanic.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-3">Customer Information</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-text-muted">Name</p>
              <p className="font-semibold text-text-main">
                {customer.firstName} {customer.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Email</p>
              <p className="text-text-main">{customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Phone</p>
              <p className="text-text-main">{customer.phone}</p>
            </div>
            {customer.address && (
              <div>
                <p className="text-sm text-text-muted">Address</p>
                <p className="text-text-main">{customer.address}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-2">Description</h3>
          <p className="text-text-main">{ticket.symptoms || ticket.description || 'No description provided'}</p>
          {ticket.notes && (
            <div className="mt-3 pt-3 border-t border-border-soft">
              <p className="text-sm font-semibold text-text-muted mb-1">Additional Notes</p>
              <p className="text-text-main">{ticket.notes}</p>
            </div>
          )}
        </div>
        
        {/* Services */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-4">Services</h3>
          <div className="space-y-3">
            {ticket.services && ticket.services.length > 0 ? (
              ticket.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between py-2 border-b border-border-soft last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      service.status === 'completed' ? 'bg-accent-success' : 'bg-gray-200'
                    }`}>
                      {service.status === 'completed' && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-text-main font-medium">{service.name}</span>
                  </div>
                  {service.status && (
                    <StatusBadge status={service.status} size="sm" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-text-muted text-sm">No services assigned</p>
            )}
          </div>
        </div>

        {/* Pre-Service Intake */}
        {ticket.mechanicIntake && (
          <div className="bg-white rounded-card-lg p-4 shadow-card">
            <h3 className="text-lg font-semibold text-text-main mb-4">Pre-Service Intake</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Mileage</p>
                <p className="font-semibold text-text-main">{ticket.mechanicIntake.mileage.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-text-muted">VIN</p>
                <p className="font-semibold text-text-main">{ticket.mechanicIntake.vin}</p>
              </div>
              <div>
                <p className="text-text-muted">Engine Type</p>
                <p className="font-semibold text-text-main">{ticket.mechanicIntake.engineType}</p>
              </div>
              <div>
                <p className="text-text-muted">Fuel Type</p>
                <p className="font-semibold text-text-main capitalize">{ticket.mechanicIntake.fuelType}</p>
              </div>
              <div>
                <p className="text-text-muted">Transmission</p>
                <p className="font-semibold text-text-main capitalize">{ticket.mechanicIntake.transmissionType}</p>
              </div>
              <div>
                <p className="text-text-muted">Drivetrain</p>
                <p className="font-semibold text-text-main uppercase">{ticket.mechanicIntake.drivetrain}</p>
              </div>
              <div>
                <p className="text-text-muted">Check Engine Light</p>
                <p className="font-semibold text-text-main">
                  {ticket.mechanicIntake.checkEngineLightOn ? 'On' : 'Off'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Findings */}
        {ticket.additionalFindings && ticket.additionalFindings.length > 0 && (
          <div className="bg-white rounded-card-lg p-4 shadow-card">
            <h3 className="text-lg font-semibold text-text-main mb-4">Additional Findings</h3>
            <div className="space-y-3">
              {ticket.additionalFindings.map((finding) => (
                <div key={finding.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-text-main">{finding.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      finding.status === 'approved' ? 'bg-green-100 text-green-700' :
                      finding.status === 'declined' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {finding.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted mb-2">{finding.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-text-muted">Severity:</span>
                    <span className={`font-medium capitalize ${
                      finding.severity === 'high' ? 'text-red-600' :
                      finding.severity === 'medium' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {finding.severity}
                    </span>
                    {finding.requiresCustomerApproval && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                        Needs Approval
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        {ticket.photos && ticket.photos.length > 0 && (
          <div className="bg-white rounded-card-lg p-4 shadow-card">
            <h3 className="text-lg font-semibold text-text-main mb-4">Photos</h3>
            <div className="grid grid-cols-3 gap-3">
              {ticket.photos.map((photo) => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={photo.dataUrl} 
                    alt={photo.description || 'Ticket photo'} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reschedule Info */}
        {ticket.rescheduleInfo && (
          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-4">
            <p className="text-sm font-semibold text-orange-800 mb-1">Return Visit Required</p>
            <p className="text-sm text-orange-700 mb-2">{ticket.rescheduleInfo.reason}</p>
            {ticket.rescheduleInfo.scheduledDate && (
              <p className="text-sm font-semibold text-orange-800">
                Scheduled: {new Date(ticket.rescheduleInfo.scheduledDate).toLocaleDateString()} at{' '}
                {ticket.rescheduleInfo.scheduledTime}
              </p>
            )}
          </div>
        )}
        
        {/* Timeline */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-4">Timeline</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="w-0.5 h-full bg-border-soft"></div>
              </div>
              <div className="flex-1 pb-4">
                <p className="font-medium text-text-main">Created</p>
                <p className="text-sm text-text-muted">{formatDate(ticket.createdAt)}</p>
                <p className="text-xs text-text-muted mt-1">
                  Source: {ticket.source === 'customer' ? 'Customer Portal' : 'Employee Entry'}
                </p>
              </div>
            </div>
            {assignedMechanics.length > 0 && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="w-0.5 h-full bg-border-soft"></div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-text-main">Assigned</p>
                  <p className="text-sm text-text-muted">
                    {assignedMechanics.map(m => `${m.firstName} ${m.lastName}`).join(', ')}
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  ['in-progress', 'work-completed', 'invoice-generated', 'closed-paid'].includes(ticket.status) 
                    ? 'bg-primary' 
                    : 'bg-gray-300'
                }`}></div>
                <div className="w-0.5 h-full bg-border-soft"></div>
              </div>
              <div className="flex-1 pb-4">
                <p className="font-medium text-text-main">In Progress</p>
                <p className="text-sm text-text-muted">
                  {['in-progress', 'work-completed', 'invoice-generated', 'closed-paid'].includes(ticket.status) 
                    ? formatDate(ticket.updatedAt) 
                    : 'Pending'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  ['work-completed', 'invoice-generated', 'closed-paid'].includes(ticket.status) 
                    ? 'bg-primary' 
                    : 'bg-gray-300'
                }`}></div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-main">Completed</p>
                <p className="text-sm text-text-muted">
                  {['work-completed', 'invoice-generated', 'closed-paid'].includes(ticket.status)
                    ? formatDate(ticket.updatedAt)
                    : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Mechanic Modal */}
      <AnimatePresence>
        {showAssignModal && (
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
                <p className="font-bold text-text-main">#{ticket.id.toUpperCase()}</p>
                {assignedMechanics.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-text-muted mb-1">Currently Assigned</p>
                    {assignedMechanics.map((mechanic) => (
                      <p key={mechanic.id} className="text-sm font-semibold text-text-main">
                        {mechanic.firstName} {mechanic.lastName}
                      </p>
                    ))}
                  </div>
                )}
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
    </div>
  );
};

