/**
 * Kanban Card for TV Display
 * Large, high-contrast design for TV viewing
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, User } from 'lucide-react';
import type { KanbanCard } from '../types/kanban-tv.types';
import { formatDistanceToNow } from 'date-fns';

interface TVKanbanCardProps {
  card: KanbanCard;
  compact?: boolean;
}

const priorityColors = {
  LOW: 'bg-blue-500/20 text-blue-700 border-blue-500/50',
  MEDIUM: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50',
  HIGH: 'bg-orange-500/20 text-orange-700 border-orange-500/50',
  CRITICAL: 'bg-red-500/20 text-red-700 border-red-500/50',
};

const getSLAColor = (eta: string | null): string => {
  if (!eta) return '';
  
  const etaTime = new Date(eta).getTime();
  const now = Date.now();
  const hoursRemaining = (etaTime - now) / (1000 * 60 * 60);

  if (hoursRemaining < 0) return 'border-l-4 border-red-600'; // Overdue
  if (hoursRemaining <= 2) return 'border-l-4 border-amber-500'; // Soon
  return 'border-l-4 border-green-600'; // OK
};

export const TVKanbanCard: React.FC<TVKanbanCardProps> = ({ card, compact = false }) => {
  const slaColor = getSLAColor(card.eta);

  return (
    <Card className={`${slaColor} ${card.is_blocked ? 'border-l-4 border-red-600 opacity-75' : ''} hover:shadow-lg transition-all`}>
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="space-y-2">
          {/* Title & Priority */}
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold line-clamp-2 ${compact ? 'text-base' : 'text-lg'}`}>
              {card.title}
            </h3>
            <Badge 
              variant="outline" 
              className={`${priorityColors[card.priority]} flex-shrink-0 ${compact ? 'text-xs' : ''}`}
            >
              {card.priority}
            </Badge>
          </div>

          {/* Description */}
          {!compact && card.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 items-center text-sm">
            {card.assignee && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">{card.assignee}</span>
              </div>
            )}

            {card.eta && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  {formatDistanceToNow(new Date(card.eta), { addSuffix: true })}
                </span>
              </div>
            )}

            {card.is_blocked && (
              <div className="flex items-center gap-1 text-red-600 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span>BLOCKED</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
