import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopAppBar } from '../../components/navigation/TopAppBar';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { TicketCard } from '../../components/cards/TicketCard';
import { tickets } from '../../data/tickets';
import { vehicles } from '../../data/vehicles';
import { invoices } from '../../data/invoices';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  const carsInShop = tickets.filter(t => t.status !== 'completed').length;
  const completedToday = tickets.filter(t => {
    if (t.status !== 'completed') return false;
    const today = new Date().toDateString();
    const updated = new Date(t.updatedAt).toDateString();
    return today === updated;
  }).length;
  
  const monthlyRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };
  
  const kanbanSections = [
    { title: 'Open', tickets: tickets.filter(t => t.status === 'open'), color: 'blue' },
    { title: 'In Progress', tickets: tickets.filter(t => t.status === 'in-progress'), color: 'yellow' },
    { title: 'Waiting Pickup', tickets: tickets.filter(t => t.status === 'waiting-pickup'), color: 'orange' },
    { title: 'Closed', tickets: tickets.filter(t => t.status === 'completed'), color: 'green' },
  ];

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
    <div className="min-h-screen bg-gradient-to-b from-bg-soft via-white to-bg-soft pb-16 md:pb-0">
      <TopAppBar
        title="Dashboard"
        leftIcon={
          <div className="text-primary font-bold text-xl">76</div>
        }
      />
      
      <motion.div
        className="px-4 py-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* KPI Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => navigate('/admin/tickets')}
            className="cursor-pointer"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300">
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13h14M5 13l-1-4h16l-1 4M5 13v4a1 1 0 001 1h12a1 1 0 001-1v-4" />
                  </svg>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Cars In Shop</p>
              <p className="text-white text-3xl font-bold">{carsInShop}</p>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Completed Today</p>
              <p className="text-white text-3xl font-bold">{completedToday}</p>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Revenue This Month</p>
              <p className="text-white text-2xl font-bold">{formatCurrency(monthlyRevenue)}</p>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Ticket Inbox */}
        <motion.div variants={itemVariants}>
          <SectionHeader
            title="Ticket Inbox"
            subtitle="Recent tickets requiring attention"
            action={{
              label: 'View All',
              onClick: () => navigate('/admin/tickets/inbox'),
            }}
          />
          <div className="space-y-3 mt-4">
            {tickets.slice(0, 5).map((ticket, index) => {
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
                    onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        
        {/* Live Shop View - Kanban */}
        <motion.div variants={itemVariants}>
          <SectionHeader title="Live Shop View" />
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {kanbanSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1, duration: 0.4 }}
                className="min-w-[280px] bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-text-main text-lg">{section.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    section.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    section.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    section.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {section.tickets.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {section.tickets.slice(0, 3).map((ticket, ticketIndex) => {
                    const vehicle = vehicles.find(v => v.id === ticket.vehicleId);
                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: ticketIndex * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl cursor-pointer hover:shadow-md border border-gray-100 transition-all duration-200"
                        onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                      >
                        <p className="text-xs text-text-muted mb-1 font-medium">#{ticket.id.toUpperCase()}</p>
                        <p className="text-sm font-semibold text-text-main">
                          {vehicle ? `${vehicle.plate}` : 'Vehicle'}
                        </p>
                        <p className="text-xs text-text-muted mt-1 line-clamp-1">{ticket.description}</p>
                      </motion.div>
                    );
                  })}
                  {section.tickets.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-text-muted">No tickets</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

