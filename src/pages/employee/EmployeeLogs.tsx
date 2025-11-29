import React from 'react';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { tickets } from '../../data/tickets';
import { vehicles } from '../../data/vehicles';
import { employees } from '../../data/employees';

export const EmployeeLogs: React.FC = () => {
  const employee = employees[0];
  const employeeTickets = tickets.filter(t => t.assignedTo === employee.id);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  
  // Create activity log from tickets
  const activityLog = employeeTickets.flatMap(ticket => {
    const vehicle = vehicles.find(v => v.id === ticket.vehicleId);
    const activities = [];
    
    activities.push({
      id: `${ticket.id}-created`,
      type: 'assigned',
      ticket: ticket.id,
      vehicle: vehicle ? `${vehicle.plate} - ${vehicle.make} ${vehicle.model}` : 'Unknown',
      timestamp: ticket.createdAt,
    });
    
    if (ticket.status !== 'open') {
      activities.push({
        id: `${ticket.id}-progress`,
        type: 'started',
        ticket: ticket.id,
        vehicle: vehicle ? `${vehicle.plate} - ${vehicle.make} ${vehicle.model}` : 'Unknown',
        timestamp: ticket.updatedAt,
      });
    }
    
    if (ticket.status === 'completed') {
      activities.push({
        id: `${ticket.id}-completed`,
        type: 'completed',
        ticket: ticket.id,
        vehicle: vehicle ? `${vehicle.plate} - ${vehicle.make} ${vehicle.model}` : 'Unknown',
        timestamp: ticket.updatedAt,
      });
    }
    
    return activities;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assigned':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'started':
        return (
          <svg className="w-5 h-5 text-accent-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-accent-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  const getActivityText = (type: string) => {
    switch (type) {
      case 'assigned':
        return 'Assigned to work order';
      case 'started':
        return 'Started work on';
      case 'completed':
        return 'Completed work on';
      default:
        return 'Activity';
    }
  };
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Activity Logs" showBack />
      
      <div className="px-4 py-6">
        <div className="space-y-3">
          {activityLog.map((activity) => (
            <div key={activity.id} className="bg-white rounded-card-lg p-4 shadow-card">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-text-main font-medium mb-1">
                    {getActivityText(activity.type)}
                  </p>
                  <p className="text-text-main text-sm mb-1">
                    Ticket #{activity.ticket.toUpperCase()}
                  </p>
                  <p className="text-text-muted text-sm mb-2">{activity.vehicle}</p>
                  <p className="text-text-muted text-xs">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            </div>
          ))}
          {activityLog.length === 0 && (
            <div className="bg-white rounded-card-lg p-8 text-center shadow-card">
              <p className="text-text-muted">No activity logs yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

