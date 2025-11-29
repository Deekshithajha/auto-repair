import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { Button } from '../../components/ui/Button';
import { employees } from '../../data/employees';
import { tickets } from '../../data/tickets';

export const EmployeeProfile: React.FC = () => {
  const navigate = useNavigate();
  
  const employee = employees[0];
  const employeeTickets = tickets.filter(t => t.assignedTo === employee.id);
  const completedTickets = employeeTickets.filter(t => t.status === 'completed').length;
  
  return (
    <div className="min-h-screen bg-bg-soft pb-16 md:pb-0">
      <TopAppBar title="Profile" showBack />
      
      <div className="px-4 py-6 space-y-4">
        {/* Profile Header */}
        <div className="bg-white rounded-card-lg p-6 shadow-card text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-main">{employee.firstName} {employee.lastName}</h2>
          <p className="text-text-muted mt-1">{employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${employee.isOnline ? 'bg-accent-success' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-text-muted">{employee.isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        
        {/* Employee Info */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-4">Employee Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-text-muted text-sm">Employee ID</p>
              <p className="text-text-main font-medium">{employee.employeeId}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Email</p>
              <p className="text-text-main font-medium">{employee.email}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Phone</p>
              <p className="text-text-main font-medium">{employee.phone}</p>
            </div>
          </div>
        </div>
        
        {/* Performance Stats */}
        <div className="bg-white rounded-card-lg p-4 shadow-card">
          <h3 className="text-lg font-semibold text-text-main mb-4">Performance</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{employeeTickets.length}</p>
              <p className="text-text-muted text-sm">Total Jobs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-success">{completedTickets}</p>
              <p className="text-text-muted text-sm">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-warning">{employeeTickets.length - completedTickets}</p>
              <p className="text-text-muted text-sm">Active</p>
            </div>
          </div>
        </div>
        
        {/* Settings */}
        <div className="bg-white rounded-card-lg shadow-card overflow-hidden">
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-bg-soft transition-colors">
            <span className="text-text-main font-medium">Edit Profile</span>
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-bg-soft transition-colors border-t border-border-soft">
            <span className="text-text-main font-medium">Notifications</span>
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-bg-soft transition-colors border-t border-border-soft">
            <span className="text-text-main font-medium">Help & Support</span>
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Logout */}
        <Button variant="danger" fullWidth onClick={() => navigate('/')}>
          Log Out
        </Button>
      </div>
    </div>
  );
};

