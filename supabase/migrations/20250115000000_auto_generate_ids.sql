-- Auto-generate customer and employee IDs
-- Add customer_id field to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS customer_id TEXT UNIQUE;

-- Function to generate customer ID
CREATE OR REPLACE FUNCTION public.generate_customer_id()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  customer_id TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(customer_id FROM 4) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.profiles
  WHERE customer_id LIKE 'CUS-%';
  
  customer_id := 'CUS-' || LPAD(next_number::TEXT, 6, '0');
  RETURN customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate employee ID
CREATE OR REPLACE FUNCTION public.generate_employee_id()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  employee_id TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(employee_id FROM 4) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.employees
  WHERE employee_id LIKE 'EMP-%';
  
  employee_id := 'EMP-' || LPAD(next_number::TEXT, 6, '0');
  RETURN employee_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-assign customer ID when profile is created
CREATE OR REPLACE FUNCTION public.assign_customer_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'user' AND NEW.customer_id IS NULL THEN
    NEW.customer_id := public.generate_customer_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-assign employee ID when employee record is created
CREATE OR REPLACE FUNCTION public.assign_employee_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employee_id IS NULL THEN
    NEW.employee_id := public.generate_employee_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER assign_customer_id_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_customer_id();

CREATE TRIGGER assign_employee_id_trigger
  BEFORE INSERT ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.assign_employee_id();

-- Update existing profiles with customer IDs if they don't have them
UPDATE public.profiles 
SET customer_id = public.generate_customer_id()
WHERE role = 'user' AND customer_id IS NULL;

-- Update existing employees with employee IDs if they don't have them
UPDATE public.employees 
SET employee_id = public.generate_employee_id()
WHERE employee_id IS NULL OR employee_id = 'EMP001';

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own profile pictures" ON storage.objects FOR SELECT USING (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile pictures" ON storage.objects FOR UPDATE USING (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects FOR DELETE USING (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
