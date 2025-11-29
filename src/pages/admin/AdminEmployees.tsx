import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { FloatingActionButton } from '../../components/ui/FloatingActionButton';
import { employees } from '../../data/employees';

export const AdminEmployees: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Employees" showBack />
      
      <div className="px-4 py-6 space-y-3">
        {employees.map((employee) => (
          <div
            key={employee.id}
            onClick={() => navigate(`/admin/employees/${employee.id}`)}
            className="bg-white rounded-card-lg p-4 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-text-main">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  {employee.isOnline && (
                    <div className="w-2 h-2 rounded-full bg-accent-success"></div>
                  )}
                </div>
                <p className="text-sm text-text-muted">{employee.employeeId}</p>
                <p className="text-sm text-primary font-medium capitalize">{employee.role}</p>
                <div className="flex gap-4 mt-2">
                  <div>
                    <p className="text-xs text-text-muted">Active Tickets</p>
                    <p className="text-sm font-semibold text-text-main">{employee.assignedTickets.length}</p>
                  </div>
                </div>
              </div>
              
              <svg className="w-5 h-5 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      
      <FloatingActionButton
        onClick={() => {}}
        label="Add Employee"
      />
    </div>
  );
};

