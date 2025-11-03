-- Fix infinite recursion in tickets RLS policies
-- The issue: tickets policies check ticket_assignments, which checks tickets, creating a loop

-- Drop the problematic policy on ticket_assignments
DROP POLICY IF EXISTS "Users can view their ticket assignments" ON public.ticket_assignments;

-- Create security definer function to check ticket ownership without RLS recursion
CREATE OR REPLACE FUNCTION public.user_owns_ticket(_ticket_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tickets
    WHERE id = _ticket_id
      AND user_id = _user_id
  )
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Users can view their ticket assignments"
ON public.ticket_assignments
FOR SELECT
USING (public.user_owns_ticket(ticket_id, auth.uid()));
