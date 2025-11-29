import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { FilterChips } from '../../components/ui/FilterChips';
import { TicketCard } from '../../components/cards/TicketCard';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { tickets } from '../../data/tickets';
import { vehicles } from '../../data/vehicles';
import { employees } from '../../data/employees';

export const AdminTickets: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  
  const filters = ['All', 'Unassigned', 'In Progress', 'Completed'];
  
  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unassigned') return !ticket.assignedTo;
    if (activeFilter === 'In Progress') return ticket.status === 'in-progress';
    if (activeFilter === 'Completed') return ticket.status === 'completed';
    return true;
  });
  
  const handleAssignClick = (ticketId: string) => {
    setSelectedTicket(ticketId);
    setShowAssignModal(true);
  };
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="All Tickets" showBack />
      
      <div className="px-4 py-6 space-y-4">
        <FilterChips
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const vehicle = vehicles.find(v => v.id === ticket.vehicleId);
            return (
              <div key={ticket.id} className="relative">
                <TicketCard
                  ticket={ticket}
                  vehicle={vehicle}
                  onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                />
                {!ticket.assignedTo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignClick(ticket.id);
                    }}
                    className="absolute top-4 right-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full hover:bg-primary-light transition-colors"
                  >
                    Assign
                  </button>
                )}
              </div>
            );
          })}
          {filteredTickets.length === 0 && (
            <div className="bg-white rounded-card-lg p-8 text-center shadow-card">
              <p className="text-text-muted">No tickets found</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Assign Mechanic Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Mechanic"
      >
        <div className="space-y-3">
          {employees.filter(e => e.role === 'mechanic').map((employee) => (
            <button
              key={employee.id}
              onClick={() => {
                // In a real app, this would update the ticket
                setShowAssignModal(false);
              }}
              className="w-full p-4 bg-bg-soft rounded-lg hover:bg-gray-200 transition-colors text-left"
            >
              <p className="font-semibold text-text-main">{employee.firstName} {employee.lastName}</p>
              <p className="text-sm text-text-muted">{employee.employeeId}</p>
              <p className="text-xs text-text-muted mt-1">
                {employee.assignedTickets.length} active tickets
              </p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

