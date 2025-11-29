import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ticketService } from '../../services/ticketService';
import { Ticket, TicketStatus } from '../../types';
import { employees } from '../../data/employees';

const SHOP_PHONE = '(555) 123-4567';
const SHOP_EMAIL = 'info@lakewood76.com';
const SHOP_ADDRESS = '123 Main Street, Lakewood, CO 80226';

export const CustomerTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTicket = async () => {
      if (!id) return;
      try {
        const fetchedTicket = await ticketService.getTicketById(id);
        setTicket(fetchedTicket);
      } catch (error) {
        console.error('Failed to load ticket:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [id]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDateOnly = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const formatTime = (timeString?: string): string => {
    if (!timeString) return '';
    // Handle time strings like "10:00" or "10:00 AM"
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    // Convert 24-hour to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusExplanation = (status: TicketStatus): string => {
    switch (status) {
      case 'pending-admin-review':
        return 'We\'ve received your ticket and are reviewing it.';
      case 'assigned':
        return 'Your ticket has been assigned to a mechanic.';
      case 'in-progress':
        return 'We\'re working on your vehicle.';
      case 'return-visit-required':
        return 'We need your vehicle back for follow-up work.';
      case 'rescheduled-awaiting-vehicle':
        return 'Your return visit is scheduled. Please bring your vehicle on the date shown below.';
      case 'work-completed':
        return 'Work on your vehicle is complete.';
      case 'invoice-generated':
        return 'Your invoice is ready for review.';
      case 'closed-paid':
        return 'This ticket has been completed and paid.';
      default:
        return 'Your ticket is being processed.';
    }
  };

  const getShortTicketId = (ticketId: string): string => {
    // Use last 6 characters or full ID if shorter
    return ticketId.length > 6 ? ticketId.slice(-6).toUpperCase() : ticketId.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-16 md:pb-0 flex items-center justify-center">
        <p className="text-gray-600">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 pb-16 md:pb-0">
        <TopAppBar 
          title="Ticket Not Found" 
          showBack 
          onLeftClick={() => navigate('/customer/tickets')}
        />
        <div className="px-4 py-6">
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-600">Ticket not found</p>
            <button
              onClick={() => navigate('/customer/tickets')}
              className="mt-4 text-primary font-semibold hover:underline"
            >
              Back to Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  const vehicle = ticket.vehicle;
  const assignedMechanicIds = ticket.assignedMechanicIds || 
    (ticket.assignedMechanicId ? [ticket.assignedMechanicId] : []);
  const assignedMechanics = assignedMechanicIds
    .map(id => employees.find(e => e.id === id))
    .filter(Boolean);

  // Get primary issue (first service name or symptoms)
  const primaryIssue = ticket.services && ticket.services.length > 0
    ? ticket.services[0].name
    : ticket.symptoms || ticket.description || 'Service request';

  return (
    <div className="min-h-screen bg-slate-50 pb-16 md:pb-0">
      {/* Page Header */}
      <TopAppBar 
        title={`Ticket #${getShortTicketId(ticket.id)}`}
        showBack
        onLeftClick={() => navigate('/customer/tickets')}
        rightIcon={
          <div className="text-primary font-bold text-lg">76</div>
        }
      />
      
      <div className="px-4 py-6 space-y-4 max-w-2xl mx-auto">
        {/* 1. Ticket & Status Summary Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          <p className="text-gray-700 mb-3 leading-relaxed">
            {getStatusExplanation(ticket.status)}
          </p>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Created</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(ticket.createdAt)}</p>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Primary Issue</p>
            <p className="text-sm font-medium text-gray-900">{primaryIssue}</p>
          </div>
        </div>

        {/* 2. Vehicle Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">License Plate</p>
              <p className="text-xl font-bold text-gray-900">{vehicle.plate}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Make & Model</p>
                <p className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Year</p>
                <p className="font-semibold text-gray-900">{vehicle.year}</p>
              </div>
            </div>
            {ticket.mechanicIntake?.mileage && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Mileage at Intake</p>
                <p className="font-semibold text-gray-900">
                  {ticket.mechanicIntake.mileage.toLocaleString()} miles
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Upcoming Visit / Reschedule Card */}
        {(() => {
          const hasRescheduleInfo = ticket.rescheduleInfo && ticket.rescheduleInfo !== null;
          const isReturnVisitRequired = ticket.status === 'return-visit-required';
          const isRescheduled = ticket.status === 'rescheduled-awaiting-vehicle';
          const hasScheduledDate = ticket.rescheduleInfo?.scheduledDate;

          // Don't show if no reschedule info at all
          if (!hasRescheduleInfo && !isReturnVisitRequired && !isRescheduled) {
            return null;
          }

          // Show "return visit requested" card
          if (isReturnVisitRequired && !hasScheduledDate) {
            const requestingMechanic = ticket.rescheduleInfo?.requestedByMechanicId
              ? employees.find(e => e.id === ticket.rescheduleInfo?.requestedByMechanicId)
              : null;

            return (
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">Return visit requested</h3>
                    <p className="text-amber-800 mb-3">
                      We'll need your vehicle back for follow-up work. We're arranging a date and will notify you as soon as it's scheduled.
                    </p>
                    {requestingMechanic && (
                      <p className="text-sm text-amber-700">
                        Requested by {requestingMechanic.firstName} {requestingMechanic.lastName}
                      </p>
                    )}
                    {ticket.rescheduleInfo?.reason && (
                      <p className="text-sm text-amber-700 mt-2 italic">
                        "{ticket.rescheduleInfo.reason}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Show "return visit scheduled" card
          if (isRescheduled && hasScheduledDate) {
            const scheduledDate = formatDateOnly(ticket.rescheduleInfo.scheduledDate!);
            const scheduledTime = ticket.rescheduleInfo.scheduledTime 
              ? formatTime(ticket.rescheduleInfo.scheduledTime)
              : 'Time to be confirmed';

            return (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Return visit scheduled</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm text-blue-700 mb-1">Date</p>
                    <p className="font-semibold text-blue-900">{scheduledDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 mb-1">Time</p>
                    <p className="font-semibold text-blue-900">{scheduledTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 mb-1">Location</p>
                    <p className="font-semibold text-blue-900">{SHOP_ADDRESS}</p>
                  </div>
                  {ticket.rescheduleInfo.notes && (
                    <div className="pt-3 border-t border-blue-200">
                      <p className="text-sm text-blue-800">{ticket.rescheduleInfo.notes}</p>
                    </div>
                  )}
                  {!ticket.rescheduleInfo.notes && (
                    <div className="pt-3 border-t border-blue-200">
                      <p className="text-sm text-blue-800">
                        Please bring your vehicle during this time window so we can complete the follow-up work.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-blue-200">
                  <button
                    onClick={() => {
                      // TODO: Implement calendar integration
                      console.log('Add to calendar');
                      alert('Calendar integration coming soon!');
                    }}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Add to Calendar
                  </button>
                  <a
                    href={`tel:${SHOP_PHONE.replace(/\D/g, '')}`}
                    className="flex-1 px-4 py-3 text-center border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Need to change? Call us
                  </a>
                </div>
              </div>
            );
          }

          // Default: no follow-up scheduled
          return (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600">No follow-up visit scheduled.</p>
            </div>
          );
        })()}

        {/* 4. Service & Issue Details Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What we're working on</h3>
          
          {/* Services */}
          {ticket.services && ticket.services.length > 0 && (
            <div className="space-y-3 mb-6">
              {ticket.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      service.status === 'completed' ? 'bg-green-500' : 
                      service.status === 'in-progress' ? 'bg-blue-500' : 
                      'bg-gray-300'
                    }`}>
                      {service.status === 'completed' && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-900 font-medium">{service.name}</span>
                  </div>
                  {service.status && (
                    <StatusBadge status={service.status} size="sm" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Additional Findings */}
          {ticket.additionalFindings && ticket.additionalFindings.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-base font-semibold text-gray-900 mb-3">Additional findings</h4>
              <div className="space-y-4">
                {ticket.additionalFindings.map((finding) => {
                  const severityColors = {
                    low: 'bg-green-100 text-green-700',
                    medium: 'bg-yellow-100 text-yellow-700',
                    high: 'bg-red-100 text-red-700',
                  };
                  const statusColors = {
                    proposed: 'bg-blue-100 text-blue-700',
                    approved: 'bg-green-100 text-green-700',
                    declined: 'bg-gray-100 text-gray-700',
                  };

                  return (
                    <div key={finding.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{finding.title}</h5>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[finding.severity]}`}>
                            {finding.severity}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[finding.status]}`}>
                            {finding.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{finding.description}</p>
                      {finding.requiresCustomerApproval && finding.status === 'proposed' && (
                        <p className="text-xs text-amber-600 mt-2 font-medium">
                          ⚠️ Requires your approval
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 5. Simple Timeline Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
          <div className="space-y-4">
            {/* Ticket Created */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="w-0.5 h-full bg-gray-200"></div>
              </div>
              <div className="flex-1 pb-4">
                <p className="font-medium text-gray-900">Ticket created</p>
                <p className="text-sm text-gray-600">{formatDate(ticket.createdAt)}</p>
              </div>
            </div>

            {/* Assigned to Mechanic */}
            {assignedMechanics.length > 0 && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="w-0.5 h-full bg-gray-200"></div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900">Assigned to mechanic</p>
                  <p className="text-sm text-gray-600">
                    {assignedMechanics.map(m => `${m.firstName} ${m.lastName}`).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Work Started */}
            {['in-progress', 'work-completed', 'invoice-generated', 'closed-paid'].includes(ticket.status) && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="w-0.5 h-full bg-gray-200"></div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900">Work started</p>
                  <p className="text-sm text-gray-600">{formatDate(ticket.updatedAt)}</p>
                </div>
              </div>
            )}

            {/* Return Visit Requested */}
            {(ticket.status === 'return-visit-required' || ticket.status === 'rescheduled-awaiting-vehicle') && ticket.rescheduleInfo && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-0.5 h-full bg-gray-200"></div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900">Return visit requested</p>
                  <p className="text-sm text-gray-600">
                    {ticket.rescheduleInfo.reason || 'Follow-up work needed'}
                  </p>
                </div>
              </div>
            )}

            {/* Return Visit Scheduled */}
            {ticket.status === 'rescheduled-awaiting-vehicle' && ticket.rescheduleInfo?.scheduledDate && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="w-0.5 h-full bg-gray-200"></div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900">Return visit scheduled</p>
                  <p className="text-sm text-gray-600">
                    {formatDateOnly(ticket.rescheduleInfo.scheduledDate)}
                    {ticket.rescheduleInfo.scheduledTime && ` at ${formatTime(ticket.rescheduleInfo.scheduledTime)}`}
                  </p>
                </div>
              </div>
            )}

            {/* Work Completed */}
            {['work-completed', 'invoice-generated', 'closed-paid'].includes(ticket.status) && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Work completed</p>
                  <p className="text-sm text-gray-600">{formatDate(ticket.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6. Help / Contact Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Questions about this ticket?</h3>
          <p className="text-sm text-gray-600 mb-4">
            We're here to help. Reach out to us anytime.
          </p>
          <div className="space-y-3">
            <a
              href={`tel:${SHOP_PHONE.replace(/\D/g, '')}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium text-gray-900">{SHOP_PHONE}</span>
            </a>
            <a
              href={`mailto:${SHOP_EMAIL}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-gray-900">{SHOP_EMAIL}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
