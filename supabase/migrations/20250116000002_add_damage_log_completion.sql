-- Add completion tracking to damage_log table
ALTER TABLE public.damage_log
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on completion status
CREATE INDEX IF NOT EXISTS idx_damage_log_is_completed 
ON public.damage_log(is_completed) 
WHERE is_completed = true;

-- Add comment
COMMENT ON COLUMN public.damage_log.is_completed IS 'Indicates if the damage has been repaired/completed';
COMMENT ON COLUMN public.damage_log.completed_at IS 'Timestamp when the damage was marked as completed';

