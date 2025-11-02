# Kanban Board Feature

A production-ready Admin Kanban board for managing work orders (tickets) with drag-and-drop, realtime updates, and comprehensive filtering.

## Features

- **Drag & Drop**: Move work orders between status columns with mouse or keyboard
- **Realtime Updates**: Automatic updates via Supabase Realtime subscriptions
- **Filters**: Filter by mechanic, priority, vehicle make, date range, and free-text search
- **Responsive**: Mobile-first design with horizontal scrolling on small screens
- **Accessibility**: Full keyboard navigation and screen reader support
- **Optimistic Updates**: Instant UI updates with rollback on failure
- **Dummy & Live Modes**: Switch between dummy data and live Supabase data

## Architecture

The feature is organized into a self-contained module:

```
src/features/kanban/
├── api/
│   ├── kanban.adapters.ts   # Dummy and live data adapters
│   └── kanban.queries.ts     # TanStack Query hooks
├── components/
│   ├── KanbanBoard.tsx       # Main board component
│   ├── KanbanColumn.tsx      # Status column
│   ├── KanbanCard.tsx        # Work order card
│   ├── KanbanToolbar.tsx     # Filters and controls
│   ├── KanbanSkeleton.tsx    # Loading state
│   └── EmptyState.tsx        # Empty state
├── hooks/
│   ├── useKanbanDnd.ts       # Drag & drop logic
│   └── useRealtimeWorkorders.ts # Realtime subscription
├── types/
│   └── kanban.types.ts       # TypeScript types
├── utils/
│   ├── status.config.ts      # Status configuration
│   └── a11y.ts               # Accessibility helpers
├── index.ts                  # Public API
└── README.md                 # This file
```

## Usage

```tsx
import { KanbanBoard } from '@/features/kanban';

function AdminLiveMonitor() {
  const [employees, setEmployees] = useState([]);
  
  return (
    <div>
      <h1>Work Order Kanban</h1>
      <KanbanBoard employees={employees} />
    </div>
  );
}
```

## Adapter Layer

The adapter layer (`kanban.adapters.ts`) provides a unified interface for both dummy and live data:

### Toggle Between Modes

Set the environment variable:
```bash
VITE_USE_DUMMY_DATA=true  # Use dummy data
VITE_USE_DUMMY_DATA=false # Use live Supabase data (default)
```

### Dummy Mode

- In-memory store with sample work orders
- Simulates network latency (~150-200ms)
- Random failures (1% probability) for resilience testing
- No database required

### Live Mode

- Connects to Supabase `tickets` table
- Realtime subscriptions via Supabase Realtime
- Full CRUD operations with RLS enforcement
- Joins with vehicles and employees for display

## Status Configuration

Statuses are configured in `utils/status.config.ts`. The source of truth is the `ticket_status` enum from Supabase:

- `pending` - New tickets awaiting approval
- `approved` - Approved for work
- `declined` - Rejected tickets
- `assigned` - Assigned to mechanic
- `in_progress` - Work in progress
- `ready_for_pickup` - Completed, ready for customer
- `completed` - Fully closed

Column order, labels, colors, and optional WIP limits are configured here.

## Drag & Drop

### Mouse/Touch
- Click and hold to drag
- Drop on target column
- Visual feedback during drag

### Keyboard
- Focus a card
- Press Space/Enter to pick up
- Use Arrow Keys to move between columns
- Press Space/Enter to drop
- Escape to cancel

### Constraints
- Moving to "completed" or "declined" allowed (can be made configurable)
- Same column drops allow reordering (future enhancement)

## Realtime Updates

The `useRealtimeWorkorders` hook subscribes to Supabase Realtime for the `tickets` table:

- **INSERT**: New card appears in appropriate column
- **UPDATE**: Card updates (status change triggers column move)
- **DELETE**: Card removed from board

Updates are debounced to prevent UI churn with high-frequency updates.

## Filters

### Available Filters
- **Mechanic**: Filter by assigned mechanic (dropdown)
- **Priority**: Multi-select (low, normal, high, urgent)
- **Vehicle Make**: Free text (e.g., "Toyota")
- **Date Range**: Quick presets (Today, Week, Month) or custom
- **Search**: Free text search across ticket ID, vehicle, mechanic, description

### Filter Behavior
- Filters apply immediately (client-side)
- Active filters shown as badges with remove buttons
- "Reset Filters" button clears all
- Total card count displayed

## Responsive Design

### Mobile (≤640px)
- Horizontal scrollable columns
- Cards full-width within columns
- Compact toolbar

### Tablet (641-1024px)
- 2-4 columns visible depending on width
- Standard card sizing

### Desktop (>1024px)
- All columns visible (up to 7)
- Comfortable spacing
- Full feature set

## Accessibility

- **ARIA Labels**: All interactive elements properly labeled
- **Keyboard Navigation**: Full DnD support via keyboard
- **Screen Reader**: Announcements for drag/drop actions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Meets WCAG AA standards

## Error Handling

- **Network Errors**: Retry button shown
- **Optimistic Update Failures**: Automatic rollback with toast notification
- **Empty States**: Helpful messages and actions
- **Loading States**: Skeleton placeholders

## Performance

- **Query Caching**: TanStack Query caches work orders for 30 seconds
- **Optimistic Updates**: Instant UI feedback
- **Debounced Realtime**: Prevents UI churn
- **Virtualization**: Ready for `@tanstack/react-virtual` if needed (not implemented yet)

## Dependencies

- `@dnd-kit/core` - Core drag & drop
- `@dnd-kit/sortable` - Sortable items
- `@dnd-kit/modifiers` - DnD modifiers
- `@tanstack/react-query` - Server state management
- `date-fns` - Date formatting
- `sonner` - Toast notifications

## Integration

The Kanban board is integrated into the Admin Live Monitor screen:

```tsx
// src/components/admin/LiveMonitor.tsx
import { KanbanBoard } from '@/features/kanban';

export const LiveMonitor: React.FC = () => {
  return (
    <div>
      <h2>Work Order Kanban Board</h2>
      <KanbanBoard employees={employees} />
    </div>
  );
};
```

## Future Enhancements

- [ ] Server-side filtering for large datasets
- [ ] Card reordering within columns
- [ ] Bulk actions (assign multiple cards)
- [ ] Custom status workflows
- [ ] Export/print board
- [ ] Card detail modal/drawer
- [ ] Column width customization
- [ ] Saved filter presets
- [ ] Analytics per column (avg time, throughput)

## Troubleshooting

### Cards not appearing
- Check `VITE_USE_DUMMY_DATA` setting
- Verify Supabase connection
- Check RLS policies allow admin access

### Drag not working
- Ensure `@dnd-kit` packages installed
- Check browser console for errors
- Verify cards have valid IDs

### Realtime not updating
- Check Supabase Realtime enabled for project
- Verify channel subscription active
- Check network tab for WebSocket connection

### Filters not working
- Check filter state updates correctly
- Verify adapter filter logic matches data structure

