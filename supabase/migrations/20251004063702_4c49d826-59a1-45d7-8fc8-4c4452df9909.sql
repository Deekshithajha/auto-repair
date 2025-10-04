-- Phase 2: Database Schema Enhancements for Enhanced Customer Portal

-- A. Extend Vehicles Table with mechanic-entered fields
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS vin VARCHAR(17) UNIQUE,
ADD COLUMN IF NOT EXISTS engine_size VARCHAR(50),
ADD COLUMN IF NOT EXISTS mileage INTEGER,
ADD COLUMN IF NOT EXISTS trim_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS drive_train VARCHAR(20),
ADD COLUMN IF NOT EXISTS location_status TEXT DEFAULT 'not_in_shop' CHECK (location_status IN ('in_shop', 'not_in_shop')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS expected_return_date TIMESTAMP WITH TIME ZONE;

-- Create index on VIN for faster lookups
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON public.vehicles(vin);

-- B. Create Vehicle Photos Table
CREATE TABLE IF NOT EXISTS public.vehicle_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('exterior', 'interior', 'vin_sticker', 'damage')),
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vehicle_photos
ALTER TABLE public.vehicle_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for vehicle_photos
CREATE POLICY "Vehicle owners can view their vehicle photos"
ON public.vehicle_photos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles
    WHERE vehicles.id = vehicle_photos.vehicle_id
    AND vehicles.user_id = auth.uid()
  )
);

CREATE POLICY "Admins and employees can view all vehicle photos"
ON public.vehicle_photos FOR SELECT
USING (get_user_role(auth.uid()) IN ('admin', 'employee'));

CREATE POLICY "Vehicle owners can upload photos"
ON public.vehicle_photos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vehicles
    WHERE vehicles.id = vehicle_photos.vehicle_id
    AND vehicles.user_id = auth.uid()
  )
  AND uploaded_by = auth.uid()
);

CREATE POLICY "Admins and employees can upload photos"
ON public.vehicle_photos FOR INSERT
WITH CHECK (
  get_user_role(auth.uid()) IN ('admin', 'employee')
  AND uploaded_by = auth.uid()
);

CREATE POLICY "Admins can delete photos"
ON public.vehicle_photos FOR DELETE
USING (get_user_role(auth.uid()) = 'admin');

-- C. Create Damage Log Table
CREATE TABLE IF NOT EXISTS public.damage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  photo_ids UUID[] DEFAULT ARRAY[]::UUID[],
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logged_by UUID NOT NULL REFERENCES public.profiles(id),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on damage_log
ALTER TABLE public.damage_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for damage_log
CREATE POLICY "Vehicle owners can view damage logs for their vehicles"
ON public.damage_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles
    WHERE vehicles.id = damage_log.vehicle_id
    AND vehicles.user_id = auth.uid()
  )
);

CREATE POLICY "Admins and employees can view all damage logs"
ON public.damage_log FOR SELECT
USING (get_user_role(auth.uid()) IN ('admin', 'employee'));

CREATE POLICY "Admins and employees can create damage logs"
ON public.damage_log FOR INSERT
WITH CHECK (
  get_user_role(auth.uid()) IN ('admin', 'employee')
  AND logged_by = auth.uid()
);

CREATE POLICY "Admins and employees can update damage logs they created"
ON public.damage_log FOR UPDATE
USING (
  get_user_role(auth.uid()) IN ('admin', 'employee')
  AND logged_by = auth.uid()
);

-- D. Extend Profiles Table for enhanced customer information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS dob_month INTEGER CHECK (dob_month >= 1 AND dob_month <= 12),
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS preferred_notification TEXT DEFAULT 'email' CHECK (preferred_notification IN ('text', 'call', 'email')),
ADD COLUMN IF NOT EXISTS legacy_status TEXT DEFAULT 'new' CHECK (legacy_status IN ('new', 'returning', 'legacy', 'returning_not_in_system')),
ADD COLUMN IF NOT EXISTS campaign_notes TEXT,
ADD COLUMN IF NOT EXISTS invoice_count INTEGER DEFAULT 0;

-- E. Create Communications Log Table
CREATE TABLE IF NOT EXISTS public.communications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('call', 'text', 'email')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on communications_log
ALTER TABLE public.communications_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for communications_log
CREATE POLICY "Customers can view their own communications"
ON public.communications_log FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Admins and employees can view all communications"
ON public.communications_log FOR SELECT
USING (get_user_role(auth.uid()) IN ('admin', 'employee'));

CREATE POLICY "Admins and employees can create communication logs"
ON public.communications_log FOR INSERT
WITH CHECK (
  get_user_role(auth.uid()) IN ('admin', 'employee')
  AND created_by = auth.uid()
);

-- F. Create Vehicle Ownership History Table
CREATE TABLE IF NOT EXISTS public.vehicle_ownership_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vehicle_ownership_history
ALTER TABLE public.vehicle_ownership_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for vehicle_ownership_history
CREATE POLICY "Admins can view all ownership history"
ON public.vehicle_ownership_history FOR SELECT
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage ownership history"
ON public.vehicle_ownership_history FOR ALL
USING (get_user_role(auth.uid()) = 'admin');

-- Triggers for updated_at timestamps
CREATE TRIGGER update_damage_log_updated_at
BEFORE UPDATE ON public.damage_log
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_ownership_history_updated_at
BEFORE UPDATE ON public.vehicle_ownership_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-update legacy_status based on invoice_count
CREATE OR REPLACE FUNCTION public.update_legacy_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.invoice_count > 1 AND NEW.legacy_status = 'new' THEN
    NEW.legacy_status := 'returning';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-update legacy_status
CREATE TRIGGER auto_update_legacy_status
BEFORE UPDATE OF invoice_count ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_legacy_status();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_photos_vehicle_id ON public.vehicle_photos(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_damage_log_vehicle_id ON public.damage_log(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_damage_log_ticket_id ON public.damage_log(ticket_id);
CREATE INDEX IF NOT EXISTS idx_communications_log_customer_id ON public.communications_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_ownership_history_vehicle_id ON public.vehicle_ownership_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_ownership_history_owner_id ON public.vehicle_ownership_history(owner_id);