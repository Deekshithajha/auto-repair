-- Create enums for application
CREATE TYPE public.user_role AS ENUM ('user', 'employee', 'admin');
CREATE TYPE public.ticket_status AS ENUM ('pending', 'approved', 'declined', 'assigned', 'in_progress', 'ready_for_pickup', 'completed');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'half_day');
CREATE TYPE public.notification_type AS ENUM ('ticket_created', 'ticket_approved', 'ticket_declined', 'ticket_assigned', 'work_started', 'work_completed', 'invoice_created', 'customer_deleted');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  role public.user_role NOT NULL DEFAULT 'user',
  employee_id TEXT UNIQUE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  reg_no TEXT,
  license_no TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  status public.ticket_status NOT NULL DEFAULT 'pending',
  description TEXT NOT NULL,
  preferred_pickup_time TIMESTAMP WITH TIME ZONE,
  scheduled_pickup_time TIMESTAMP WITH TIME ZONE,
  work_started_at TIMESTAMP WITH TIME ZONE,
  work_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Ticket assignments table
CREATE TABLE public.ticket_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_auto_assigned BOOLEAN NOT NULL DEFAULT true
);

-- Parts table
CREATE TABLE public.parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  part_code TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  print_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Employees table (additional employee data)
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  employee_id TEXT NOT NULL UNIQUE,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  status public.attendance_status NOT NULL DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can insert their profile on signup" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for vehicles
CREATE POLICY "Users can manage their own vehicles" ON public.vehicles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Employees can view assigned ticket vehicles" ON public.vehicles FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'employee' AND 
  EXISTS (
    SELECT 1 FROM public.tickets t 
    JOIN public.ticket_assignments ta ON t.id = ta.ticket_id 
    WHERE t.vehicle_id = vehicles.id AND ta.employee_id = auth.uid()
  )
);
CREATE POLICY "Admins can view all vehicles" ON public.vehicles FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for tickets
CREATE POLICY "Users can manage their own tickets" ON public.tickets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Employees can view assigned tickets" ON public.tickets FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'employee' AND 
  EXISTS (SELECT 1 FROM public.ticket_assignments WHERE ticket_id = tickets.id AND employee_id = auth.uid())
);
CREATE POLICY "Employees can update assigned tickets" ON public.tickets FOR UPDATE USING (
  public.get_user_role(auth.uid()) = 'employee' AND 
  EXISTS (SELECT 1 FROM public.ticket_assignments WHERE ticket_id = tickets.id AND employee_id = auth.uid())
);
CREATE POLICY "Admins can manage all tickets" ON public.tickets FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for ticket_assignments
CREATE POLICY "Users can view their ticket assignments" ON public.ticket_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tickets WHERE id = ticket_assignments.ticket_id AND user_id = auth.uid())
);
CREATE POLICY "Employees can view their assignments" ON public.ticket_assignments FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Admins can manage all assignments" ON public.ticket_assignments FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for parts
CREATE POLICY "Users can view parts for their tickets" ON public.parts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tickets WHERE id = parts.ticket_id AND user_id = auth.uid())
);
CREATE POLICY "Employees can manage parts for assigned tickets" ON public.parts FOR ALL USING (
  public.get_user_role(auth.uid()) = 'employee' AND 
  EXISTS (
    SELECT 1 FROM public.tickets t 
    JOIN public.ticket_assignments ta ON t.id = ta.ticket_id 
    WHERE t.id = parts.ticket_id AND ta.employee_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage all parts" ON public.parts FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices for their tickets" ON public.invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tickets WHERE id = invoices.ticket_id AND user_id = auth.uid())
);
CREATE POLICY "Employees can manage invoices for assigned tickets" ON public.invoices FOR ALL USING (
  public.get_user_role(auth.uid()) = 'employee' AND 
  EXISTS (
    SELECT 1 FROM public.tickets t 
    JOIN public.ticket_assignments ta ON t.id = ta.ticket_id 
    WHERE t.id = invoices.ticket_id AND ta.employee_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage all invoices" ON public.invoices FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for employees
CREATE POLICY "Employees can view their own record" ON public.employees FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Employees can update their own record" ON public.employees FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all employees" ON public.employees FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for attendance
CREATE POLICY "Employees can manage their own attendance" ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.employees WHERE id = attendance.employee_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all attendance" ON public.attendance FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-photos', 'vehicle-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('repair-photos', 'repair-photos', true);

-- Storage policies for vehicle photos
CREATE POLICY "Users can upload their vehicle photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'vehicle-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view their vehicle photos" ON storage.objects FOR SELECT USING (
  bucket_id = 'vehicle-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Employees and admins can view all vehicle photos" ON storage.objects FOR SELECT USING (
  bucket_id = 'vehicle-photos' AND 
  public.get_user_role(auth.uid()) IN ('employee', 'admin')
);

-- Storage policies for repair photos
CREATE POLICY "Authenticated users can upload repair photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'repair-photos' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can view repair photos for their tickets" ON storage.objects FOR SELECT USING (
  bucket_id = 'repair-photos' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    public.get_user_role(auth.uid()) IN ('employee', 'admin')
  )
);

-- Function to create audit log
CREATE OR REPLACE FUNCTION public.create_audit_log(
  actor_id UUID,
  action_type TEXT,
  table_name TEXT,
  record_id UUID,
  old_data JSONB DEFAULT NULL,
  new_data JSONB DEFAULT NULL,
  log_details TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, target_table, target_id, old_values, new_values, details)
  VALUES (actor_id, action_type, table_name, record_id, old_data, new_data, log_details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-assign employees
CREATE OR REPLACE FUNCTION public.auto_assign_employee(ticket_id_param UUID)
RETURNS UUID AS $$
DECLARE
  available_employee UUID;
  admin_user UUID;
BEGIN
  -- Find the least loaded employee
  SELECT e.user_id INTO available_employee
  FROM public.employees e
  LEFT JOIN public.ticket_assignments ta ON e.user_id = ta.employee_id
  LEFT JOIN public.tickets t ON ta.ticket_id = t.id AND t.status IN ('assigned', 'in_progress')
  WHERE e.is_active = true
  GROUP BY e.user_id
  ORDER BY COUNT(t.id) ASC
  LIMIT 1;
  
  -- Get first admin user for admin_id
  SELECT id INTO admin_user
  FROM public.profiles
  WHERE role = 'admin'
  LIMIT 1;
  
  IF available_employee IS NOT NULL AND admin_user IS NOT NULL THEN
    INSERT INTO public.ticket_assignments (ticket_id, employee_id, admin_id, is_auto_assigned)
    VALUES (ticket_id_param, available_employee, admin_user, true);
    
    -- Update ticket status
    UPDATE public.tickets SET status = 'assigned', updated_at = NOW()
    WHERE id = ticket_id_param;
    
    RETURN available_employee;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-%';
  
  invoice_num := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON public.parts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();