-- Phase 1: Add priority field to tickets table
CREATE TYPE ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');

ALTER TABLE public.tickets 
ADD COLUMN priority ticket_priority DEFAULT 'normal';

-- Update existing tickets to have 'normal' priority
UPDATE public.tickets SET priority = 'normal' WHERE priority IS NULL;

-- Enable realtime for tickets table
ALTER TABLE public.tickets REPLICA IDENTITY FULL;

-- Add tickets to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'tickets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
  END IF;
END $$;