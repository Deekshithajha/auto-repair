-- Add pause tracking columns to attendance table
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS total_pause_duration INTERVAL DEFAULT '0 minutes',
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false;