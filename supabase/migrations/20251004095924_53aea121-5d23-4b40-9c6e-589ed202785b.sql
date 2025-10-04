-- Update ALL RLS policies to use has_role() function instead of get_user_role()
-- This prevents privilege escalation attacks

-- PROFILES TABLE POLICIES
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- VEHICLES TABLE POLICIES  
DROP POLICY IF EXISTS "Admins can view all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Employees can view assigned ticket vehicles" ON public.vehicles;

CREATE POLICY "Admins can view all vehicles"
ON public.vehicles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view assigned ticket vehicles"
ON public.vehicles FOR SELECT
USING (
  public.has_role(auth.uid(), 'employee') AND 
  EXISTS (
    SELECT 1 FROM tickets t
    JOIN ticket_assignments ta ON t.id = ta.ticket_id
    WHERE t.vehicle_id = vehicles.id AND ta.employee_id = auth.uid()
  )
);

-- TICKETS TABLE POLICIES
DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Employees can view assigned tickets" ON public.tickets;
DROP POLICY IF EXISTS "Employees can update assigned tickets" ON public.tickets;

CREATE POLICY "Admins can manage all tickets"
ON public.tickets FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can view assigned tickets"
ON public.tickets FOR SELECT
USING (
  public.has_role(auth.uid(), 'employee') AND
  EXISTS (
    SELECT 1 FROM ticket_assignments
    WHERE ticket_assignments.ticket_id = tickets.id 
    AND ticket_assignments.employee_id = auth.uid()
  )
);

CREATE POLICY "Employees can update assigned tickets"
ON public.tickets FOR UPDATE
USING (
  public.has_role(auth.uid(), 'employee') AND
  EXISTS (
    SELECT 1 FROM ticket_assignments
    WHERE ticket_assignments.ticket_id = tickets.id 
    AND ticket_assignments.employee_id = auth.uid()
  )
);

-- TICKET_ASSIGNMENTS POLICIES
DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.ticket_assignments;

CREATE POLICY "Admins can manage all assignments"
ON public.ticket_assignments FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- INVOICES POLICIES
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Employees can manage invoices for assigned tickets" ON public.invoices;

CREATE POLICY "Admins can manage all invoices"
ON public.invoices FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can manage invoices for assigned tickets"
ON public.invoices FOR ALL
USING (
  public.has_role(auth.uid(), 'employee') AND
  EXISTS (
    SELECT 1 FROM tickets t
    JOIN ticket_assignments ta ON t.id = ta.ticket_id
    WHERE t.id = invoices.ticket_id AND ta.employee_id = auth.uid()
  )
);

-- PARTS POLICIES
DROP POLICY IF EXISTS "Admins can manage all parts" ON public.parts;
DROP POLICY IF EXISTS "Employees can manage parts for assigned tickets" ON public.parts;

CREATE POLICY "Admins can manage all parts"
ON public.parts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can manage parts for assigned tickets"
ON public.parts FOR ALL
USING (
  public.has_role(auth.uid(), 'employee') AND
  EXISTS (
    SELECT 1 FROM tickets t
    JOIN ticket_assignments ta ON t.id = ta.ticket_id
    WHERE t.id = parts.ticket_id AND ta.employee_id = auth.uid()
  )
);

-- EMPLOYEES POLICIES
DROP POLICY IF EXISTS "Admins can manage all employees" ON public.employees;

CREATE POLICY "Admins can manage all employees"
ON public.employees FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- ATTENDANCE POLICIES
DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;

CREATE POLICY "Admins can manage all attendance"
ON public.attendance FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- WORK_SESSIONS POLICIES
DROP POLICY IF EXISTS "Admins can manage all work sessions" ON public.work_sessions;

CREATE POLICY "Admins can manage all work sessions"
ON public.work_sessions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- AUDIT_LOGS POLICIES
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- VEHICLE_PHOTOS POLICIES
DROP POLICY IF EXISTS "Admins and employees can view all vehicle photos" ON public.vehicle_photos;
DROP POLICY IF EXISTS "Admins and employees can upload photos" ON public.vehicle_photos;
DROP POLICY IF EXISTS "Admins can delete photos" ON public.vehicle_photos;

CREATE POLICY "Admins and employees can view all vehicle photos"
ON public.vehicle_photos FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'employee')
);

CREATE POLICY "Admins and employees can upload photos"
ON public.vehicle_photos FOR INSERT
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
  AND uploaded_by = auth.uid()
);

CREATE POLICY "Admins can delete photos"
ON public.vehicle_photos FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- DAMAGE_LOG POLICIES
DROP POLICY IF EXISTS "Admins and employees can view all damage logs" ON public.damage_log;
DROP POLICY IF EXISTS "Admins and employees can create damage logs" ON public.damage_log;
DROP POLICY IF EXISTS "Admins and employees can update damage logs they created" ON public.damage_log;

CREATE POLICY "Admins and employees can view all damage logs"
ON public.damage_log FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'employee')
);

CREATE POLICY "Admins and employees can create damage logs"
ON public.damage_log FOR INSERT
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
  AND logged_by = auth.uid()
);

CREATE POLICY "Admins and employees can update damage logs they created"
ON public.damage_log FOR UPDATE
USING (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
  AND logged_by = auth.uid()
);

-- COMMUNICATIONS_LOG POLICIES
DROP POLICY IF EXISTS "Admins and employees can view all communications" ON public.communications_log;
DROP POLICY IF EXISTS "Admins and employees can create communication logs" ON public.communications_log;

CREATE POLICY "Admins and employees can view all communications"
ON public.communications_log FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'employee')
);

CREATE POLICY "Admins and employees can create communication logs"
ON public.communications_log FOR INSERT
WITH CHECK (
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
  AND created_by = auth.uid()
);

-- CUSTOMER_NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Admins can view all notification preferences" ON public.customer_notifications;

CREATE POLICY "Admins can view all notification preferences"
ON public.customer_notifications FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- VEHICLE_OWNERSHIP_HISTORY POLICIES
DROP POLICY IF EXISTS "Admins can manage ownership history" ON public.vehicle_ownership_history;
DROP POLICY IF EXISTS "Admins can view all ownership history" ON public.vehicle_ownership_history;

CREATE POLICY "Admins can manage ownership history"
ON public.vehicle_ownership_history FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all ownership history"
ON public.vehicle_ownership_history FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));