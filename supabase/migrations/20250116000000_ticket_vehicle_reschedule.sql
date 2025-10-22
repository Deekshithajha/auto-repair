-- Add system ticket number and reschedule fields, extend vehicle details, and add notification enum value

-- 1) Ticket number generator
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  tkt_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.tickets
  WHERE ticket_number LIKE 'TKT-%';

  tkt_num := 'TKT-' || LPAD(next_number::TEXT, 6, '0');
  RETURN tkt_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS ticket_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS reschedule_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS reschedule_reason TEXT,
  ADD COLUMN IF NOT EXISTS not_in_shop_reason TEXT;

-- Trigger to assign ticket_number
CREATE OR REPLACE FUNCTION public.assign_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := public.generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'assign_ticket_number_trigger'
  ) THEN
    CREATE TRIGGER assign_ticket_number_trigger
      BEFORE INSERT ON public.tickets
      FOR EACH ROW EXECUTE FUNCTION public.assign_ticket_number();
  END IF;
END $$;

-- 2) Extend vehicles table
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS vin TEXT,
  ADD COLUMN IF NOT EXISTS engine_size TEXT,
  ADD COLUMN IF NOT EXISTS mileage INTEGER,
  ADD COLUMN IF NOT EXISTS trim_code TEXT,
  ADD COLUMN IF NOT EXISTS drivetrain TEXT;

-- 3) Extend notification type with reschedule reminder (if not already present)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'notification_type' AND e.enumlabel = 'vehicle_reschedule_reminder'
  ) THEN
    ALTER TYPE public.notification_type ADD VALUE 'vehicle_reschedule_reminder';
  END IF;
END $$;

-- 4) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_tickets_reschedule_date ON public.tickets(reschedule_date);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON public.vehicles(vin);
