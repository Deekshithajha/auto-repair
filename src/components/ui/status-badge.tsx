import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TicketStatus = 'pending' | 'approved' | 'declined' | 'assigned' | 'in_progress' | 'ready_for_pickup' | 'completed';

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-status-pending/10 text-status-pending border-status-pending/20'
  },
  approved: {
    label: 'Approved',
    className: 'bg-status-approved/10 text-status-approved border-status-approved/20'
  },
  declined: {
    label: 'Declined',
    className: 'bg-status-declined/10 text-status-declined border-status-declined/20'
  },
  assigned: {
    label: 'Assigned',
    className: 'bg-status-assigned/10 text-status-assigned border-status-assigned/20'
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20'
  },
  ready_for_pickup: {
    label: 'Ready for Pickup',
    className: 'bg-status-ready/10 text-status-ready border-status-ready/20'
  },
  completed: {
    label: 'Completed',
    className: 'bg-status-completed/10 text-status-completed border-status-completed/20'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
};