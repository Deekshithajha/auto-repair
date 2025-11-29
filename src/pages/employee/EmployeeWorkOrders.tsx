import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { FilterChips } from '../../components/ui/FilterChips';
import { TicketCard } from '../../components/cards/TicketCard';
import { tickets } from '../../data/tickets';
import { vehicles } from '../../data/vehicles';
import { employees } from '../../data/employees';

export const EmployeeWorkOrders: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  
  const employee = employees[0];
  const employeeTickets = tickets.filter(t => t.assignedTo === employee.id);
  
  const filters = ['All', 'Open', 'In Progress', 'Completed'];
  
  const filteredTickets = employeeTickets.filter(ticket => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'In Progress') return ticket.status === 'in-progress';
    return ticket.status.toLowerCase() === activeFilter.toLowerCase();
  });
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Work Orders" showBack />
      
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
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                vehicle={vehicle}
                onClick={() => navigate(`/employee/work-orders/${ticket.id}`)}
              />
            );
          })}
          {filteredTickets.length === 0 && (
            <div className="bg-white rounded-card-lg p-8 text-center shadow-card">
              <p className="text-text-muted">No work orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

