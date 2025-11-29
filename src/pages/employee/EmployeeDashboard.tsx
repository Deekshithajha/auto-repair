import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { FilterChips } from '../../components/ui/FilterChips';
import { KpiCard } from '../../components/ui/KpiCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { WorkOrderCard } from '../../components/cards/WorkOrderCard';
import { vehicles } from '../../data/vehicles';
import { employees } from '../../data/employees';
import { Ticket } from '../../types';
import { ticketService } from '../../services/ticketService';

export const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState('Today');
  const [acceptedTasks, setAcceptedTasks] = useState<{ [key: string]: string }>({});
  const [localTickets, setLocalTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock employee data
  const employee = employees[0];
  
  // Load tickets from TicketService
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const allTickets = await ticketService.getTickets();
        const employeeTickets = allTickets.filter(t => {
          // Check new array field
          if (t.assignedMechanicIds && t.assignedMechanicIds.includes(employee.id)) {
            return true;
          }
          // Check legacy field for backward compatibility
          return t.assignedMechanicId === employee.id;
        });
        setLocalTickets(employeeTickets);
      } catch (error) {
        console.error('Failed to load tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTickets();
    // Refresh every 5 seconds
    const interval = setInterval(loadTickets, 5000);
    return () => clearInterval(interval);
  }, [employee.id]);
  
  // Load accepted tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`acceptedTasks_${employee.id}`);
    if (saved) {
      setAcceptedTasks(JSON.parse(saved));
    }
  }, [employee.id]);
  
  // Save accepted tasks to localStorage
  useEffect(() => {
    localStorage.setItem(`acceptedTasks_${employee.id}`, JSON.stringify(acceptedTasks));
  }, [acceptedTasks, employee.id]);
  
  const handleAccept = async (ticketId: string) => {
    try {
      const now = new Date().toISOString();
      setAcceptedTasks(prev => ({ ...prev, [ticketId]: now }));
      
      // Update ticket status to in-progress via TicketService
      const updated = await ticketService.updateTicketStatus(ticketId, 'in-progress');
      setLocalTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
    } catch (error) {
      console.error('Failed to accept ticket:', error);
      alert('Failed to accept ticket. Please try again.');
    }
  };
  
  const handleComplete = async (ticketId: string) => {
    try {
      // Update ticket status to work-completed via TicketService
      const updated = await ticketService.updateTicketStatus(ticketId, 'work-completed');
      setLocalTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
    } catch (error) {
      console.error('Failed to complete ticket:', error);
      alert('Failed to complete ticket. Please try again.');
    }
  };
  
  const assignedCount = localTickets.filter(t => t.status === 'assigned').length;
  const inProgressCount = localTickets.filter(t => t.status === 'in-progress').length;
  const completedTodayCount = localTickets.filter(t => {
    if (t.status !== 'work-completed') return false;
    const today = new Date().toDateString();
    const updated = new Date(t.updatedAt).toDateString();
    return today === updated;
  }).length;
  
  const dateFilters = ['Today', 'Tomorrow', 'Week'];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-soft via-white to-bg-soft">
      <TopAppBar
        title={`Hi, ${employee.firstName}`}
        leftIcon={
          <div className="text-primary font-bold text-xl">76</div>
        }
        rightIcon={
          <button
            onClick={() => navigate('/employee/tickets/new')}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Ticket</span>
          </button>
        }
      />
      
      <motion.div
        className="px-4 py-6 space-y-6 pb-24 md:pb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Date Filters */}
        <motion.div variants={containerVariants}>
          <FilterChips
            filters={dateFilters}
            activeFilter={dateFilter}
            onFilterChange={setDateFilter}
          />
        </motion.div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-500/20 cursor-pointer hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Assigned</p>
              <p className="text-white text-3xl font-bold">{assignedCount}</p>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-5 shadow-lg shadow-yellow-500/20 cursor-pointer hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">In Progress</p>
              <p className="text-white text-3xl font-bold">{inProgressCount}</p>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 shadow-lg shadow-green-500/20 cursor-pointer hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Done Today</p>
              <p className="text-white text-3xl font-bold">{completedTodayCount}</p>
            </div>
          </motion.div>
        </div>
        
        {/* My Work Orders */}
        <motion.div variants={containerVariants}>
          <SectionHeader
            title="My Work Orders"
            action={{
              label: 'View All',
              onClick: () => navigate('/employee/work-orders'),
            }}
          />
          <div className="space-y-4 mt-4">
            {localTickets.slice(0, 5).map((ticket, index) => {
              const vehicle = ticket.vehicle;
              const startedAt = acceptedTasks[ticket.id] || null;
              
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <WorkOrderCard
                    ticket={ticket}
                    vehicle={vehicle}
                    onAccept={handleAccept}
                    onComplete={handleComplete}
                    acceptedAt={startedAt}
                    startedAt={startedAt || undefined}
                  />
                </motion.div>
              );
            })}
            {localTickets.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-text-muted font-medium">No work orders assigned</p>
                <p className="text-text-muted text-sm mt-1">You'll see assigned tasks here</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

