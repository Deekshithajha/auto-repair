-- Create work_logs table
CREATE TABLE IF NOT EXISTS public.work_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  work_description TEXT NOT NULL,
  hours_worked DECIMAL(4,2) NOT NULL DEFAULT 0,
  work_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for work_logs
CREATE INDEX IF NOT EXISTS idx_work_logs_employee_id ON public.work_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_ticket_id ON public.work_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_work_date ON public.work_logs(work_date);

-- Enable RLS on work_logs
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_logs
CREATE POLICY "Employees can view their own work logs" ON public.work_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.employees WHERE id = work_logs.employee_id AND user_id = auth.uid())
);

CREATE POLICY "Employees can insert their own work logs" ON public.work_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.employees WHERE id = work_logs.employee_id AND user_id = auth.uid())
);

CREATE POLICY "Employees can update their own work logs" ON public.work_logs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.employees WHERE id = work_logs.employee_id AND user_id = auth.uid())
);

CREATE POLICY "Employees can delete their own work logs" ON public.work_logs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.employees WHERE id = work_logs.employee_id AND user_id = auth.uid())
);

CREATE POLICY "Admins can manage all work logs" ON public.work_logs FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Update attendance table to include total_hours if it doesn't exist
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS total_hours DECIMAL(4,2) DEFAULT 0;

-- Create function to calculate total hours
CREATE OR REPLACE FUNCTION public.calculate_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clock_in IS NOT NULL AND NEW.clock_out IS NOT NULL THEN
    NEW.total_hours := EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600;
  ELSE
    NEW.total_hours := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate total hours
DROP TRIGGER IF EXISTS calculate_hours_trigger ON public.attendance;
CREATE TRIGGER calculate_hours_trigger
  BEFORE INSERT OR UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.calculate_total_hours();

-- Create update trigger for work_logs
CREATE TRIGGER update_work_logs_updated_at 
  BEFORE UPDATE ON public.work_logs 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample work logs for demo
INSERT INTO public.work_logs (employee_id, ticket_id, work_description, hours_worked, work_date, status, notes) VALUES
  (
    (SELECT id FROM public.employees WHERE user_id = '00000000-0000-0000-0000-000000000002' LIMIT 1),
    (SELECT id FROM public.tickets LIMIT 1),
    'Diagnosed AC compressor issue and replaced faulty unit',
    4.5,
    CURRENT_DATE - INTERVAL '2 days',
    'completed',
    'Customer reported AC not cooling. Found compressor failure.'
  ),
  (
    (SELECT id FROM public.employees WHERE user_id = '00000000-0000-0000-0000-000000000002' LIMIT 1),
    (SELECT id FROM public.tickets LIMIT 1),
    'Replaced spark plugs and ignition coil',
    2.0,
    CURRENT_DATE - INTERVAL '1 day',
    'completed',
    'Engine misfiring resolved. Test drive successful.'
  )
ON CONFLICT DO NOTHING;

-- Insert sample attendance records
INSERT INTO public.attendance (employee_id, date, clock_in, clock_out, status, total_hours) VALUES
  (
    (SELECT id FROM public.employees WHERE user_id = '00000000-0000-0000-0000-000000000002' LIMIT 1),
    CURRENT_DATE - INTERVAL '2 days',
    (CURRENT_DATE - INTERVAL '2 days')::timestamp + '08:00:00'::time,
    (CURRENT_DATE - INTERVAL '2 days')::timestamp + '17:00:00'::time,
    'present',
    8.0
  ),
  (
    (SELECT id FROM public.employees WHERE user_id = '00000000-0000-0000-0000-000000000002' LIMIT 1),
    CURRENT_DATE - INTERVAL '1 day',
    (CURRENT_DATE - INTERVAL '1 day')::timestamp + '08:30:00'::time,
    (CURRENT_DATE - INTERVAL '1 day')::timestamp + '16:30:00'::time,
    'present',
    7.5
  ),
  (
    (SELECT id FROM public.employees WHERE user_id = '00000000-0000-0000-0000-000000000002' LIMIT 1),
    CURRENT_DATE,
    (CURRENT_DATE)::timestamp + '08:00:00'::time,
    NULL,
    'present',
    0.0
  )
ON CONFLICT (employee_id, date) DO NOTHING;
