-- KANBAN TV SYSTEM TABLES
-- Separate authentication and management system for TV display

-- USERS (separate from main app)
CREATE TABLE IF NOT EXISTS public.kanban_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('KANBAN_ADMIN','KANBAN_EDITOR','KANBAN_VIEWER')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BOARDS
CREATE TABLE IF NOT EXISTS public.kanban_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.kanban_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COLUMNS
CREATE TABLE IF NOT EXISTS public.kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL,
  wip_limit INT,
  color TEXT DEFAULT '#374151',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CARDS
CREATE TABLE IF NOT EXISTS public.kanban_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.kanban_boards(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL, -- link to main system
  priority TEXT CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')) DEFAULT 'MEDIUM',
  assignee TEXT, -- mechanic name/initials for TV clarity
  eta TIMESTAMPTZ, -- optional SLA marker
  tags TEXT[] DEFAULT '{}',
  position INT NOT NULL,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.kanban_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.kanban_cards(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.kanban_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- CREATED, MOVED, UPDATED, COMMENTED, BLOCKED, UNBLOCKED
  from_column_id UUID,
  to_column_id UUID,
  diff JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_kanban_columns_board_pos ON public.kanban_columns(board_id, position);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_board_col_pos ON public.kanban_cards(board_id, column_id, position);
CREATE INDEX IF NOT EXISTS idx_kanban_cards_eta ON public.kanban_cards(eta);
CREATE INDEX IF NOT EXISTS idx_kanban_activity_card ON public.kanban_activity(card_id);

-- Enable RLS
ALTER TABLE public.kanban_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_activity ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES (Simple - all authenticated kanban users can access)
CREATE POLICY "Kanban users can view all boards" ON public.kanban_boards FOR SELECT USING (TRUE);
CREATE POLICY "Kanban admins/editors can manage boards" ON public.kanban_boards FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Kanban users can view columns" ON public.kanban_columns FOR SELECT USING (TRUE);
CREATE POLICY "Kanban admins/editors can manage columns" ON public.kanban_columns FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Kanban users can view cards" ON public.kanban_cards FOR SELECT USING (TRUE);
CREATE POLICY "Kanban admins/editors can manage cards" ON public.kanban_cards FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Kanban users can view activity" ON public.kanban_activity FOR SELECT USING (TRUE);
CREATE POLICY "Kanban users can log activity" ON public.kanban_activity FOR INSERT WITH CHECK (TRUE);

-- Enable realtime
ALTER TABLE public.kanban_cards REPLICA IDENTITY FULL;
ALTER TABLE public.kanban_columns REPLICA IDENTITY FULL;

-- Seed data: create default board and viewer user
INSERT INTO public.kanban_boards (name, slug, is_active) 
VALUES ('Shop Floor', 'shop-floor', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Create default columns for Shop Floor
INSERT INTO public.kanban_columns (board_id, name, position, color, wip_limit)
SELECT 
  id,
  column_name,
  column_position,
  column_color,
  column_wip
FROM public.kanban_boards,
  (VALUES 
    ('Intake', 0, '#6366f1', NULL),
    ('Diagnosing', 1, '#eab308', NULL),
    ('In Progress', 2, '#f59e0b', 10),
    ('Ready for Pickup', 3, '#10b981', NULL)
  ) AS columns(column_name, column_position, column_color, column_wip)
WHERE slug = 'shop-floor'
ON CONFLICT DO NOTHING;