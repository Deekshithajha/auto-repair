-- Create demo user accounts with proper roles
-- Insert demo users into auth.users (this would normally be handled by Supabase Auth)
-- For now, we'll create the profiles directly and assume users will be created through the UI

-- Insert demo user profiles
INSERT INTO public.profiles (id, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Customer', 'user'),
  ('00000000-0000-0000-0000-000000000002', 'Demo Employee', 'employee'),
  ('00000000-0000-0000-0000-000000000003', 'Demo Admin', 'admin')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Create demo employee record for the employee user
INSERT INTO public.employees (id, user_id, employee_id, hire_date, is_active) VALUES
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'EMP001', CURRENT_DATE, true)
ON CONFLICT (user_id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  hire_date = EXCLUDED.hire_date,
  is_active = EXCLUDED.is_active;

-- Create demo vehicles for the customer
INSERT INTO public.vehicles (id, user_id, make, model, year, reg_No, license_no) VALUES
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Toyota', 'Camry', 2020, 'ABC-1234', 'DL123456789'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Honda', 'Civic', 2019, 'XYZ-5678', 'DL987654321')
ON CONFLICT (id) DO UPDATE SET
  make = EXCLUDED.make,
  model = EXCLUDED.model,
  year = EXCLUDED.year,
  reg_no = EXCLUDED.reg_no,
  license_no = EXCLUDED.license_no;

-- Create demo tickets
INSERT INTO public.tickets (id, user_id, vehicle_id, description, status) VALUES
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'Engine making strange noise when starting', 'pending'),
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'Brake pads need replacement', 'approved')
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- Create demo ticket assignment
INSERT INTO public.ticket_assignments (id, ticket_id, employee_id, admin_id, is_auto_assigned) VALUES
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', false)
ON CONFLICT (ticket_id, employee_id) DO UPDATE SET
  admin_id = EXCLUDED.admin_id,
  is_auto_assigned = EXCLUDED.is_auto_assigned;