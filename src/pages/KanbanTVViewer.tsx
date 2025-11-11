/**
 * Kanban TV Viewer - Full Screen Display
 * Optimized for wall-mounted TV with auto-pan and real-time updates
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useKanbanBoard, useKanbanColumns, useKanbanCards } from '@/features/kanban-tv/hooks/useKanbanQueries';
import { useKanbanRealtime } from '@/features/kanban-tv/hooks/useKanbanRealtime';
import { TVKanbanCard } from '@/features/kanban-tv/components/TVKanbanCard';
import { Badge } from '@/components/ui/badge';
import { Clock, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';

export const KanbanTVViewer: React.FC = () => {
  const { boardSlug = 'shop-floor' } = useParams();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);

  // Fetch board data
  const { data: board, isLoading: loadingBoard } = useKanbanBoard(boardSlug);
  const { data: columns = [], isLoading: loadingColumns } = useKanbanColumns(board?.id);
  const { data: cards = [], isLoading: loadingCards } = useKanbanCards(board?.id);

  // Real-time subscription with polling fallback
  const { isConnected, lastUpdate } = useKanbanRealtime(board?.id || '', !!board?.id);

  // Group cards by column
  const cardsByColumn = useMemo(() => {
    const grouped: Record<string, typeof cards> = {};
    columns.forEach(col => {
      grouped[col.id] = cards.filter(card => card.column_id === col.id);
    });
    return grouped;
  }, [cards, columns]);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-pan through columns every 8 seconds if more than 4 columns
  useEffect(() => {
    if (columns.length > 4) {
      const interval = setInterval(() => {
        setCurrentColumnIndex(prev => (prev + 1) % Math.ceil(columns.length / 4));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [columns.length]);

  // Get visible columns based on auto-pan
  const visibleColumns = useMemo(() => {
    if (columns.length <= 4) return columns;
    const start = currentColumnIndex * 4;
    return columns.slice(start, start + 4);
  }, [columns, currentColumnIndex]);

  const loading = loadingBoard || loadingColumns || loadingCards;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Shop Floor Display...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Board not found</div>
      </div>
    );
  }

  // Calculate statistics
  const totalCards = cards.length;
  const blockedCards = cards.filter(c => c.is_blocked).length;
  const urgentCards = cards.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">{board.name}</h1>
          <div className="flex items-center gap-4 text-lg">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
              {totalCards} Total
            </Badge>
            {urgentCards > 0 && (
              <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/50">
                {urgentCards} Urgent
              </Badge>
            )}
            {blockedCards > 0 && (
              <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/50">
                {blockedCards} Blocked
              </Badge>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-3 justify-end mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-2xl font-mono">
                {format(currentTime, 'HH:mm:ss')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-green-400">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-amber-400" />
                  <span className="text-sm text-amber-400">Polling</span>
                </>
              )}
            </div>
          </div>
          <div className="text-sm text-slate-400">
            Last update: {format(lastUpdate, 'HH:mm:ss')}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-180px)]">
        {visibleColumns.map((column) => (
          <div 
            key={column.id} 
            className="flex flex-col bg-slate-800/50 rounded-lg p-4 border border-slate-700"
            style={{ borderTopColor: column.color, borderTopWidth: '4px' }}
          >
            {/* Column Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{column.name}</h2>
              <Badge variant="secondary" className="text-lg">
                {cardsByColumn[column.id]?.length || 0}
                {column.wip_limit && ` / ${column.wip_limit}`}
              </Badge>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {cardsByColumn[column.id]?.map((card) => (
                <TVKanbanCard key={card.id} card={card} />
              ))}
              
              {(!cardsByColumn[column.id] || cardsByColumn[column.id].length === 0) && (
                <div className="text-center text-slate-500 py-8">
                  No cards
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-l-4 border-green-600 bg-slate-700"></div>
          <span>On Time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-l-4 border-amber-500 bg-slate-700"></div>
          <span>Due Soon (&lt;2h)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-l-4 border-red-600 bg-slate-700"></div>
          <span>Overdue</span>
        </div>
      </div>
    </div>
  );
};
