-- Fix security warnings by setting search_path for all functions

-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update create_audit_log function  
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update auto_assign_employee function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update generate_invoice_number function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update handle_new_user function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;