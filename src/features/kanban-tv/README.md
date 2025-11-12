# Kanban TV Display System

A standalone TV display system for auto repair shops to visualize work orders on wall-mounted screens.

## Features

✅ **Separate Authentication** - Independent user system from main app
✅ **Real-time Updates** - WebSocket subscriptions with 15s polling fallback  
✅ **TV-Optimized UI** - Large text, high contrast, auto-pan for >4 columns
✅ **SLA Tracking** - Color-coded ETA indicators (green/amber/red)
✅ **Priority Badges** - Visual priority levels (LOW/MEDIUM/HIGH/CRITICAL)
✅ **Live Connection Status** - Real-time/polling indicator
✅ **Blocked Card Alerts** - Clear visual for blocked work orders

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| `viewer@shop.com` | `viewer123` | KANBAN_VIEWER (Read-only for TV) |
| `editor@shop.com` | `editor123` | KANBAN_EDITOR (Edit cards) |
| `admin@shop.com` | `admin123` | KANBAN_ADMIN (Full access) |

## Routes

- `/kanban-tv/login` - Login page for TV system
- `/kanban-tv/admin` - Admin panel for managing boards, columns, and users (KANBAN_ADMIN only)
- `/kanban-tv/shop-floor` - Full-screen TV viewer for "Shop Floor" board
- `/kanban-tv/:boardSlug` - Generic board viewer

## Usage

### 1. Login to TV System
Navigate to `/kanban-tv/login` and sign in with a viewer account.

### 2. Admin Panel (KANBAN_ADMIN only)
Navigate to `/kanban-tv/admin` after signing in with an admin account.

**Admin Features:**
- **Boards Tab**: Create, edit, and manage multiple Kanban boards
  - Set board name and URL slug
  - Activate/deactivate boards
  - Delete boards (removes all columns and cards)

- **Columns Tab**: Manage columns for selected board
  - Create new columns with custom colors
  - Set WIP (Work In Progress) limits
  - Drag-and-drop reordering
  - Edit/delete existing columns

- **Users Tab**: Manage Kanban TV user accounts
  - Create new users with roles (VIEWER/EDITOR/ADMIN)
  - Update user passwords and roles
  - Activate/deactivate user accounts
  - Delete user accounts

### 3. TV Display
Once logged in, the system automatically redirects to `/kanban-tv/shop-floor`.

**TV Display Features:**
- Auto-refreshes every 30 seconds
- Real-time updates via WebSocket
- Polling fallback if connection drops
- Auto-pans through columns if >4 columns exist (8s interval)
- Full-screen optimized layout
- Clock with last update timestamp

### 3. SLA Color Coding

Cards are marked with a left border indicating ETA status:
- 🟢 **Green** - More than 2 hours remaining
- 🟡 **Amber** - Less than 2 hours remaining
- 🔴 **Red** - Overdue

## Editor Mode (Coming Soon)

**Important:** Editor mode is planned but not yet implemented. For now, you can:
- Use the **Admin Panel** to manage boards, columns, and users
- Use the API directly to create/manage cards programmatically

To add cards programmatically, use the Kanban TV API:

```typescript
import { kanbanTVApi } from '@/features/kanban-tv';

// Create a card
await kanbanTVApi.createCard({
  board_id: 'board-uuid',
  column_id: 'column-uuid',
  title: 'Honda Civic - Oil Change',
  description: 'Regular maintenance',
  priority: 'MEDIUM',
  assignee: 'Mike',
  position: 0,
  eta: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
});
```

## Architecture

### Separate Authentication
- **Main App Auth**: Uses Supabase `auth.users` + `profiles` table
- **Kanban TV Auth**: Uses separate `kanban_users` table with localStorage sessions
- **No Crossover**: Sessions are completely isolated

### Database Tables
- `kanban_users` - TV system users
- `kanban_boards` - Boards (e.g., "Shop Floor")
- `kanban_columns` - Columns within boards
- `kanban_cards` - Work order cards
- `kanban_activity` - Activity log for cards

### Real-time Strategy
1. **Primary**: Supabase Realtime WebSocket subscriptions
2. **Fallback**: 15-second polling when disconnected
3. **Connection Monitoring**: Checks socket activity every 10s

## Future Enhancements

The following features were spec'd but not yet implemented:

- [ ] **Editor Mode** (`/kanban-tv/:boardSlug/edit`)
  - Drag & drop cards between columns
  - Quick card editing inline
  - Bulk actions
  
- [ ] **Advanced TV Settings**
  - Configurable auto-pan speed per board
  - Toggle SLA colors
  - Compact mode toggle

- [ ] **Security Improvements**
  - Bcrypt password hashing via edge function
  - Enable Supabase leaked password protection
  - Session expiry and refresh tokens

- [ ] **Advanced Features**
  - Device pairing with TV codes
  - Read-only API tokens for hardware players
  - Snapshot endpoint for external displays

## Security Notes

⚠️ **CRITICAL**: Passwords are currently stored in **plain text** for demo purposes. 

**Before production:**
1. Implement bcrypt hashing via Supabase edge function
2. Enable leaked password protection in Supabase Auth settings
3. Implement proper session expiry and refresh tokens
4. Add rate limiting on auth endpoints

## Technical Stack

- **Frontend**: React + TypeScript + Vite
- **State**: TanStack Query
- **Real-time**: Supabase Realtime
- **Auth**: Custom localStorage-based (separate from main app)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: PostgreSQL (Supabase)
