-- CRITICAL SECURITY FIX: Move roles to separate table
-- Step 1: Create app_role enum (reuse existing user_role enum values)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'employee', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create user_roles table for role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Step 4: Create helper function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'employee' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- Step 5: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT id, role::text::app_role, created_at
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 6: RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can assign roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') AND assigned_by = auth.uid());

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Step 7: Add system_id and license_plate for new login methods
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS system_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS license_plate TEXT;

-- Step 8: Update vehicles table to match requirements
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- Update existing vehicles to set owner_id
UPDATE public.vehicles SET owner_id = user_id WHERE owner_id IS NULL;

-- Step 9: Rename tickets table fields to match workorder requirements
ALTER TABLE public.tickets
ADD COLUMN IF NOT EXISTS ticket_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS primary_mechanic_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS secondary_mechanic_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS estimated_completion_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expected_return_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS labor_hours NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS parts_cost NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) DEFAULT 0;

-- Generate ticket numbers for existing tickets
UPDATE public.tickets 
SET ticket_number = 'WO-' || LPAD(CAST(EXTRACT(EPOCH FROM created_at)::BIGINT AS TEXT), 10, '0')
WHERE ticket_number IS NULL;

-- Step 10: Add payment_status to invoices
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled'));

-- Step 11: Create trigger to auto-assign ticket numbers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
BEGIN
  IF NEW.ticket_number IS NULL THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.tickets
    WHERE ticket_number LIKE 'WO-%';
    
    NEW.ticket_number := 'WO-' || LPAD(next_number::TEXT, 8, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_ticket_number ON public.tickets;
CREATE TRIGGER set_ticket_number
BEFORE INSERT ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.generate_ticket_number();

-- Step 12: Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_system_id ON public.profiles(system_id) WHERE system_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_license_plate ON public.profiles(license_plate) WHERE license_plate IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets(ticket_number);

COMMENT ON TABLE public.user_roles IS 'Stores user roles separately for security - prevents privilege escalation';
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check user roles - bypasses RLS to prevent recursion';