import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { KpiCard } from '../../components/ui/KpiCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { TicketCard } from '../../components/cards/TicketCard';
import { tickets } from '../../data/tickets';
import { vehicles } from '../../data/vehicles';
import { invoices } from '../../data/invoices';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Mock customer data
  const customerName = 'Sarah';
  const customerId = 'c1';
  
  // Filter data for this customer
  const customerTickets = tickets.filter(t => t.customerId === customerId);
  const customerVehicles = vehicles.filter(v => v.customerId === customerId);
  const customerInvoices = invoices.filter(i => i.customerId === customerId);
  
  const openTickets = customerTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  const pendingInvoices = customerInvoices.filter(i => i.status === 'pending').length;
  
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-soft via-white to-bg-soft">
      <TopAppBar
        title={`Hello, ${customerName}`}
        leftIcon={
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        rightIcon={
          <svg className="w-6 h-6 text-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        onRightClick={() => navigate('/customer/profile')}
      />
      
      <motion.div
        className="px-4 py-6 space-y-6 pb-24 md:pb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* KPI Cards */}
        <motion.div
          variants={itemVariants}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4"
        >
          <motion.div
            className="min-w-[160px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-500/20 cursor-pointer hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Open Tickets</p>
              <p className="text-white text-3xl font-bold">{openTickets}</p>
            </div>
          </motion.div>
          
          <motion.div
            className="min-w-[160px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 shadow-lg shadow-purple-500/20 cursor-pointer hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Vehicles</p>
              <p className="text-white text-3xl font-bold">{customerVehicles.length}</p>
            </div>
          </motion.div>
          
          <motion.div
            className="min-w-[160px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 shadow-lg shadow-orange-500/20 cursor-pointer hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Invoices Due</p>
              <p className="text-white text-3xl font-bold">{pendingInvoices}</p>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-text-main mb-5 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-primary to-primary-light rounded-full"></span>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                onClick={() => navigate('/customer/tickets/new')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:border-primary hover:bg-gradient-to-br hover:from-primary/20 hover:to-primary/10 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-primary">Raise Ticket</span>
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/customer/vehicles/new')}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-2 border-purple-500/20 hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-purple-500/10 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-xl group-hover:shadow-purple-500/30 transition-all">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13h14M5 13l-1-4h16l-1 4M5 13v4a1 1 0 001 1h12a1 1 0 001-1v-4" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-purple-600">Add Vehicle</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        {/* My Tickets */}
        <motion.div variants={itemVariants}>
          <SectionHeader
            title="My Tickets"
            action={{
              label: 'View All',
              onClick: () => navigate('/customer/tickets'),
            }}
          />
          <div className="space-y-3 mt-4">
            {customerTickets.slice(0, 3).map((ticket, index) => {
              const vehicle = vehicles.find(v => v.id === ticket.vehicleId);
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                >
                  <TicketCard
                    ticket={ticket}
                    vehicle={vehicle}
                    onClick={() => navigate(`/customer/tickets/${ticket.id}`)}
                  />
                </motion.div>
              );
            })}
            {customerTickets.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-text-muted font-medium">No tickets yet</p>
                <p className="text-text-muted text-sm mt-1">Create your first service ticket</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

