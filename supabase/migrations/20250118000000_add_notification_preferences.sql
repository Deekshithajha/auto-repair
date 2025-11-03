-- Migration: Add notification preferences and notifications system
-- This migration adds customer communication preferences and notification tracking

-- 1. Create customer_profiles table (extends profiles for communication preferences)
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  language TEXT DEFAULT 'en',
  comms_opt_in BOOLEAN DEFAULT true,
  preferred_channel TEXT CHECK (preferred_channel IN ('email','sms','whatsapp')) DEFAULT 'sms',
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add notification_prefs and preferred_pickup_at to tickets table
ALTER TABLE IF EXISTS public.tickets
  ADD COLUMN IF NOT EXISTS preferred_pickup_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{}';

-- 3. Create notifications outbox table (for audit + retries)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
  channel TEXT CHECK (channel IN ('email','sms','whatsapp')) NOT NULL,
  type TEXT CHECK (type IN ('confirm','reminder','update')) NOT NULL,
  status TEXT CHECK (status IN ('queued','sent','failed','skipped')) DEFAULT 'queued',
  to_address TEXT,
  subject TEXT,
  body TEXT,
  payload JSONB,
  send_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create helper view for reminders due
CREATE OR REPLACE VIEW public.notifications_due AS
SELECT * FROM public.notifications
WHERE status = 'queued' AND send_at <= NOW();

-- 5. Enable RLS
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for customer_profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'customer_profiles' AND policyname = 'customer_profiles_select'
  ) THEN
    CREATE POLICY customer_profiles_select ON public.customer_profiles FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'customer_profiles' AND policyname = 'customer_profiles_modify'
  ) THEN
    CREATE POLICY customer_profiles_modify ON public.customer_profiles FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'customer_profiles' AND policyname = 'customer_profiles_update'
  ) THEN
    CREATE POLICY customer_profiles_update ON public.customer_profiles FOR UPDATE USING (true);
  END IF;
END $$;

-- 7. RLS Policies for notifications
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_read'
  ) THEN
    CREATE POLICY notifications_read ON public.notifications FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_write'
  ) THEN
    CREATE POLICY notifications_write ON public.notifications FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_update'
  ) THEN
    CREATE POLICY notifications_update ON public.notifications FOR UPDATE USING (true);
  END IF;
END $$;

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON public.customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_profile_id ON public.customer_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_ticket_id ON public.notifications(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON public.notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status_send_at ON public.notifications(status, send_at);
CREATE INDEX IF NOT EXISTS idx_notifications_due ON public.notifications(status, send_at) WHERE status = 'queued';

-- 9. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_customer_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_customer_profile_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_customer_profile_updated_at_trigger
      BEFORE UPDATE ON public.customer_profiles
      FOR EACH ROW EXECUTE FUNCTION public.update_customer_profile_updated_at();
  END IF;
END $$;

