-- Fix demo user roles
UPDATE public.profiles 
SET role = 'admin'::user_role 
WHERE id = (SELECT id FROM auth.users WHERE email = 'demo-admin@autorepair.com');

UPDATE public.profiles 
SET role = 'employee'::user_role 
WHERE id = (SELECT id FROM auth.users WHERE email = 'demo-employee@autorepair.com');

-- Create employee record for demo employee
INSERT INTO public.employees (user_id, employee_id, hire_date, is_active)
SELECT id, 'EMP-001', CURRENT_DATE, true
FROM auth.users 
WHERE email = 'demo-employee@autorepair.com'
ON CONFLICT (user_id) DO NOTHING;