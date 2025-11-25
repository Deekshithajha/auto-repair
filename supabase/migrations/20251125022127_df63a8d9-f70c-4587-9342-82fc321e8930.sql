-- Phase 1: Fix Critical Database Issues
-- Add missing core tables for employees, attendance, work sessions, damage tracking, and vehicle photos

-- 1. Add name column to profiles table (for backward compatibility)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name text GENERATED ALWAYS AS (full_name) STORED;

-- 2. Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  employee_id text UNIQUE NOT NULL,
  hire_date date NOT NULL,
  employment_status text NOT NULL DEFAULT 'active',
  is_active boolean DEFAULT true,
  termination_date date,
  termination_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Create employee_details table
CREATE TABLE IF NOT EXISTS public.employee_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL UNIQUE,
  employment_type text NOT NULL DEFAULT 'full_time',
  hourly_rate numeric(10, 2),
  overtime_rate numeric(10, 2),
  position text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  clock_in timestamp with time zone,
  clock_out timestamp with time zone,
  status text NOT NULL DEFAULT 'present',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- 5. Create work_sessions table
CREATE TABLE IF NOT EXISTS public.work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  status text NOT NULL DEFAULT 'in_progress',
  notes text,
  hours_worked numeric(5, 2),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 6. Create damage_log table
CREATE TABLE IF NOT EXISTS public.damage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  photo_ids uuid[],
  logged_by uuid REFERENCES public.profiles(id),
  logged_at timestamp with time zone NOT NULL DEFAULT now(),
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE SET NULL,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 7. Create vehicle_photos table
CREATE TABLE IF NOT EXISTS public.vehicle_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  photo_type text NOT NULL DEFAULT 'exterior',
  photo_data text NOT NULL,
  uploaded_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON public.employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_details_employee_id ON public.employee_details(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON public.attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_work_sessions_ticket_id ON public.work_sessions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_employee_id ON public.work_sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_damage_log_vehicle_id ON public.damage_log(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_photos_vehicle_id ON public.vehicle_photos(vehicle_id);

-- 9. Add triggers for updated_at columns
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_details_updated_at
  BEFORE UPDATE ON public.employee_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_sessions_updated_at
  BEFORE UPDATE ON public.work_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_damage_log_updated_at
  BEFORE UPDATE ON public.damage_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_photos_updated_at
  BEFORE UPDATE ON public.vehicle_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Enable RLS on all new tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_photos ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies for employees table
CREATE POLICY "Admins can manage all employees"
  ON public.employees
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view all employees"
  ON public.employees
  FOR SELECT
  USING (has_role(auth.uid(), 'employee'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view their own record"
  ON public.employees
  FOR SELECT
  USING (auth.uid() = user_id);

-- 12. RLS Policies for employee_details table
CREATE POLICY "Admins can manage all employee details"
  ON public.employee_details
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view their own details"
  ON public.employee_details
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = employee_details.employee_id
      AND employees.user_id = auth.uid()
    )
  );

-- 13. RLS Policies for attendance table
CREATE POLICY "Admins can manage all attendance"
  ON public.attendance
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can clock in/out for themselves"
  ON public.attendance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = attendance.employee_id
      AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update their own attendance"
  ON public.attendance
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = attendance.employee_id
      AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can view their own attendance"
  ON public.attendance
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = attendance.employee_id
      AND employees.user_id = auth.uid()
    )
  );

-- 14. RLS Policies for work_sessions table
CREATE POLICY "Admins can manage all work sessions"
  ON public.work_sessions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can manage their own work sessions"
  ON public.work_sessions
  FOR ALL
  USING (
    has_role(auth.uid(), 'employee'::app_role) AND
    EXISTS (
      SELECT 1 FROM public.employees
      WHERE employees.id = work_sessions.employee_id
      AND employees.user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can view all work sessions"
  ON public.work_sessions
  FOR SELECT
  USING (has_role(auth.uid(), 'employee'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- 15. RLS Policies for damage_log table
CREATE POLICY "Admins and employees can manage damage logs"
  ON public.damage_log
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));

CREATE POLICY "Customers can view damage logs for their vehicles"
  ON public.damage_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = damage_log.vehicle_id
      AND vehicles.owner_id = auth.uid()
    )
  );

-- 16. RLS Policies for vehicle_photos table
CREATE POLICY "Admins and employees can manage vehicle photos"
  ON public.vehicle_photos
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));

CREATE POLICY "Customers can view photos of their vehicles"
  ON public.vehicle_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles
      WHERE vehicles.id = vehicle_photos.vehicle_id
      AND vehicles.owner_id = auth.uid()
    )
  );