-- Fix RLS recursion by creating security definer function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id;
$function$;

-- Update all RLS policies to use the security definer function
DROP POLICY IF EXISTS "Users can manage their own tickets" ON public.tickets;
CREATE POLICY "Users can manage their own tickets" ON public.tickets
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.tickets;
CREATE POLICY "Admins can manage all tickets" ON public.tickets
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

DROP POLICY IF EXISTS "Employees can view assigned tickets" ON public.tickets;
CREATE POLICY "Employees can view assigned tickets" ON public.tickets
FOR SELECT USING (
  get_user_role(auth.uid()) = 'employee'::user_role 
  AND EXISTS (
    SELECT 1 FROM ticket_assignments 
    WHERE ticket_assignments.ticket_id = tickets.id 
    AND ticket_assignments.employee_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Employees can update assigned tickets" ON public.tickets;
CREATE POLICY "Employees can update assigned tickets" ON public.tickets
FOR UPDATE USING (
  get_user_role(auth.uid()) = 'employee'::user_role 
  AND EXISTS (
    SELECT 1 FROM ticket_assignments 
    WHERE ticket_assignments.ticket_id = tickets.id 
    AND ticket_assignments.employee_id = auth.uid()
  )
);

-- Add work sessions table for employee work tracking
CREATE TABLE public.work_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on work_sessions
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

-- Work sessions policies
CREATE POLICY "Admins can manage all work sessions" ON public.work_sessions
FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Employees can manage their work sessions" ON public.work_sessions
FOR ALL USING (employee_id = auth.uid());

CREATE POLICY "Users can view work sessions for their tickets" ON public.work_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tickets 
    WHERE tickets.id = work_sessions.ticket_id 
    AND tickets.user_id = auth.uid()
  )
);

-- Add trigger for work_sessions timestamps
CREATE TRIGGER update_work_sessions_updated_at
BEFORE UPDATE ON public.work_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add customer notification preferences
CREATE TABLE public.customer_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sms_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT true,
  phone_verified boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on customer_notifications
ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;

-- Customer notifications policies
CREATE POLICY "Users can manage their notification preferences" ON public.customer_notifications
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all notification preferences" ON public.customer_notifications
FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role);