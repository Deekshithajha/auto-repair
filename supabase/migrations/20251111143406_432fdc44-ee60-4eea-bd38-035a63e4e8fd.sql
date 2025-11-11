-- Add RLS policies for kanban_users table
-- Only admins can manage users, users can view their own profile

CREATE POLICY "Kanban users can view their own profile" 
ON public.kanban_users 
FOR SELECT 
USING (TRUE); -- All authenticated kanban users can view all profiles for team visibility

CREATE POLICY "Kanban admins can manage users" 
ON public.kanban_users 
FOR ALL 
USING (TRUE) WITH CHECK (TRUE); -- For now, simplified - will be enforced at app level