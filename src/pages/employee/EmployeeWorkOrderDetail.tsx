import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { RescheduleRequest } from '../../components/tickets/RescheduleRequest';
import { MechanicIntakeForm } from '../../components/tickets/MechanicIntakeForm';
import { AdditionalFindings } from '../../components/tickets/AdditionalFindings';
import { ticketService } from '../../services/ticketService';
import { Ticket, PhotoCategory, RescheduleInfo } from '../../types';
import { employees } from '../../data/employees';

export const EmployeeWorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const mechanicId = 'e1'; // In real app, get from auth context

  useEffect(() => {
    const loadTicket = async () => {
      if (!id) return;
      try {
        const loadedTicket = await ticketService.getTicketById(id);
        setTicket(loadedTicket);
        if (loadedTicket?.notes) {
          setNotes(loadedTicket.notes);
        }
        // Show intake form if ticket is assigned/in-progress but intake not completed
        if (loadedTicket && (loadedTicket.status === 'assigned' || loadedTicket.status === 'in-progress') && !loadedTicket.mechanicIntake) {
          setShowIntakeForm(true);
        }
      } catch (error) {
        console.error('Failed to load ticket:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
        <TopAppBar title="Loading..." showBack />
        <div className="px-4 py-6">
          <p className="text-text-muted text-center">Loading work order...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
        <TopAppBar title="Work Order Not Found" showBack />
        <div className="px-4 py-6">
          <p className="text-text-muted text-center">Work order not found</p>
        </div>
      </div>
    );
  }

  const vehicle = ticket.vehicle;
  
  // Get all assigned mechanics
  const assignedMechanicIds = ticket.assignedMechanicIds || 
    (ticket.assignedMechanicId ? [ticket.assignedMechanicId] : []);
  const assignedMechanics = assignedMechanicIds
    .map(id => employees.find(e => e.id === id))
    .filter(Boolean) as typeof employees;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  return (
    <div className="min-h-screen bg-bg-soft pb-24 md:pb-0">
      <TopAppBar title={`Work Order #${ticket.id.toUpperCase()}`} showBack />
      
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
              <p className="text-white/80 text-sm">Vehicle</p>
              <p className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Color</p>
              <p className="font-semibold">{vehicle.color || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Assigned Mechanics */}
        {assignedMechanics.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-card-lg p-4 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-text-main">
                Assigned Team ({assignedMechanics.length})
              </h3>
            </div>
            <div className="space-y-2">
              {assignedMechanics.map((mechanic) => (
                <div key={mechanic.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {mechanic.firstName[0]}{mechanic.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-text-main">
                      {mechanic.firstName} {mechanic.lastName}
                    </p>
                    <p className="text-xs text-text-muted">{mechanic.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Description */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-2">Description</h3>
          <p className="text-text-main">{ticket.symptoms || ticket.description || 'No description provided'}</p>
        </div>

        {/* Pre-Service Intake */}
        {showIntakeForm && (
          <MechanicIntakeForm
            ticketId={ticket.id}
            vehicleMake={vehicle.make}
            vehicleModel={vehicle.model}
            vehicleYear={vehicle.year}
            onComplete={async (intake) => {
              try {
                const updated = await ticketService.setMechanicIntake(ticket.id, intake);
                setTicket(updated);
                setShowIntakeForm(false);
              } catch (error) {
                console.error('Failed to save intake:', error);
                alert('Failed to save intake. Please try again.');
              }
            }}
            onCancel={() => setShowIntakeForm(false)}
          />
        )}

        {/* Intake Summary (if completed) */}
        {ticket.mechanicIntake && !showIntakeForm && (
          <div className="bg-white rounded-card-lg p-4 shadow-card">
            <h3 className="text-lg font-semibold text-text-main mb-4">Pre-Service Intake</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Mileage</p>
                <p className="font-semibold text-text-main">{ticket.mechanicIntake.mileage.toLocaleString()} mi</p>
              </div>
              <div>
                <p className="text-text-muted">VIN</p>
                <p className="font-semibold text-text-main font-mono text-xs">{ticket.mechanicIntake.vin}</p>
              </div>
              <div>
                <p className="text-text-muted">Engine</p>
                <p className="font-semibold text-text-main">{ticket.mechanicIntake.engineType}</p>
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
                <p className="text-text-muted">Fuel Type</p>
                <p className="font-semibold text-text-main capitalize">{ticket.mechanicIntake.fuelType}</p>
              </div>
            </div>
            {ticket.mechanicIntake.checkEngineLightOn && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800">⚠️ Check Engine Light ON</p>
              </div>
            )}
          </div>
        )}

        {/* Additional Findings */}
        {(ticket.status === 'in-progress' || ticket.status === 'assigned') && (
          <div className="bg-white rounded-card-lg p-4 shadow-card">
            <AdditionalFindings
              findings={ticket.additionalFindings || []}
              onAddFinding={async (finding) => {
                try {
                  const updated = await ticketService.addAdditionalFinding(ticket.id, finding);
                  setTicket(updated);
                } catch (error) {
                  console.error('Failed to add finding:', error);
                  alert('Failed to add finding. Please try again.');
                }
              }}
              mechanicId={mechanicId}
            />
          </div>
        )}
        
        {/* Assigned Services */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-4">Assigned Services</h3>
          <div className="space-y-3">
            {ticket.services.map((service) => (
              <div key={service.id} className="flex items-center justify-between py-2 border-b border-border-soft last:border-0">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={service.status === 'completed'}
                    readOnly
                    className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-primary"
                  />
                  <span className="text-text-main font-medium">{service.name}</span>
                </div>
                {service.status && (
                  <StatusBadge status={service.status} size="sm" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Parts & Labor */}
        {(ticket.parts || ticket.labor) && (
          <div className="bg-white rounded-card-lg p-4 shadow-card">
            <h3 className="text-lg font-semibold text-text-main mb-4">Parts & Labor</h3>
            
            {ticket.parts && ticket.parts.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-text-muted mb-2">Parts</p>
                <div className="space-y-2">
                  {ticket.parts.map((part) => (
                    <div key={part.id} className="flex justify-between text-sm">
                      <span className="text-text-main">{part.name} (×{part.quantity})</span>
                      <span className="text-text-main font-medium">{formatCurrency(part.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {ticket.labor && ticket.labor.length > 0 && (
              <div>
                <p className="text-sm font-medium text-text-muted mb-2">Labor</p>
                <div className="space-y-2">
                  {ticket.labor.map((labor) => (
                    <div key={labor.id} className="flex justify-between text-sm">
                      <span className="text-text-main">{labor.description} ({labor.hours} hrs)</span>
                      <span className="text-text-main font-medium">{formatCurrency(labor.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Photos */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-4">Photos</h3>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <button
                key={i}
                className="aspect-square bg-bg-soft rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        
        {/* Notes */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-main">Notes</h3>
            {notes !== (ticket.notes || '') && (
              <button
                onClick={async () => {
                  try {
                    const updated = await ticketService.updateTicketNotes(ticket.id, notes);
                    setTicket(updated);
                    alert('Notes saved successfully!');
                  } catch (error) {
                    console.error('Failed to save notes:', error);
                    alert('Failed to save notes. Please try again.');
                  }
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                Save Notes
              </button>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this work order..."
            className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={4}
          />
          {ticket.notes && notes === ticket.notes && (
            <p className="text-xs text-text-muted mt-2">
              Last updated: {new Date(ticket.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:relative bg-white border-t border-border-soft p-4 space-y-2 md:mt-6 md:rounded-lg md:shadow-md">
        {ticket.status === 'assigned' && !ticket.mechanicIntake && (
          <Button variant="primary" fullWidth onClick={() => setShowIntakeForm(true)}>
            Start Pre-Service Intake
          </Button>
        )}
        {ticket.status === 'assigned' && ticket.mechanicIntake && (
          <Button variant="primary" fullWidth onClick={async () => {
            try {
              const updated = await ticketService.updateTicketStatus(ticket.id, 'in-progress');
              setTicket(updated);
            } catch (error) {
              console.error('Failed to update status:', error);
              alert('Failed to update status. Please try again.');
            }
          }}>
            Mark as In Progress
          </Button>
        )}
        {ticket.status === 'in-progress' && (
          <>
            <Button variant="primary" fullWidth onClick={async () => {
              try {
                const updated = await ticketService.updateTicketStatus(ticket.id, 'work-completed');
                setTicket(updated);
              } catch (error) {
                console.error('Failed to update status:', error);
                alert('Failed to update status. Please try again.');
              }
            }}>
              Mark Work as Completed
            </Button>
            <button
              onClick={() => setShowRescheduleModal(true)}
              className="w-full py-3 border-2 border-orange-500 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Request Return Visit
            </button>
          </>
        )}
        {ticket.status === 'work-completed' && (
          <Button variant="secondary" fullWidth onClick={() => {}}>
            Create Follow-up Quote
          </Button>
        )}
      </div>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <RescheduleRequest
            ticketId={ticket.id}
            onSubmit={async (data) => {
              try {
                const rescheduleInfo: RescheduleInfo = {
                  reason: data.reason,
                  notes: data.notes,
                  requestedByMechanicId: mechanicId,
                  photos: data.photos,
                };
                const updated = await ticketService.setRescheduleInfo(ticket.id, rescheduleInfo);
                setTicket(updated);
                setShowRescheduleModal(false);
              } catch (error) {
                console.error('Failed to submit reschedule request:', error);
                alert('Failed to submit reschedule request. Please try again.');
              }
            }}
            onCancel={() => setShowRescheduleModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

