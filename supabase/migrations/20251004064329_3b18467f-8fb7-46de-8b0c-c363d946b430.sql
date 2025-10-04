-- Phase 6: Workflow Integration & Automation

-- Function to auto-update vehicle location status based on ticket status
CREATE OR REPLACE FUNCTION public.sync_vehicle_location_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When ticket is assigned or in_progress, set vehicle to in_shop
  IF NEW.status IN ('assigned', 'in_progress') THEN
    UPDATE public.vehicles
    SET location_status = 'in_shop',
        expected_return_date = NEW.scheduled_pickup_time
    WHERE id = NEW.vehicle_id;
  
  -- When ticket is completed, prompt should be handled in frontend
  -- but we can set a flag or keep it in_shop until manually updated
  ELSIF NEW.status = 'completed' THEN
    -- Keep vehicle in shop until manual checkout or pickup
    -- This gives admin control over when vehicle actually leaves
    UPDATE public.vehicles
    SET expected_return_date = NULL
    WHERE id = NEW.vehicle_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to sync vehicle location when ticket status changes
DROP TRIGGER IF EXISTS trigger_sync_vehicle_location ON public.tickets;
CREATE TRIGGER trigger_sync_vehicle_location
  AFTER UPDATE OF status ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_vehicle_location_status();

-- Function to auto-increment invoice count when invoice is created
CREATE OR REPLACE FUNCTION public.increment_invoice_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_id UUID;
BEGIN
  -- Get the customer ID from the ticket
  SELECT user_id INTO customer_id
  FROM public.tickets
  WHERE id = NEW.ticket_id;
  
  -- Increment invoice count for the customer
  IF customer_id IS NOT NULL THEN
    UPDATE public.profiles
    SET invoice_count = invoice_count + 1
    WHERE id = customer_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to increment invoice count when new invoice is created
DROP TRIGGER IF EXISTS trigger_increment_invoice_count ON public.invoices;
CREATE TRIGGER trigger_increment_invoice_count
  AFTER INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_invoice_count();

-- Function to create notification when ticket status changes
CREATE OR REPLACE FUNCTION public.notify_customer_on_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Only notify on specific status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'approved' THEN
        notification_title := 'Ticket Approved';
        notification_message := 'Your service ticket has been approved and is being assigned to a technician.';
      WHEN 'assigned' THEN
        notification_title := 'Technician Assigned';
        notification_message := 'A technician has been assigned to your vehicle. Work will begin soon.';
      WHEN 'in_progress' THEN
        notification_title := 'Work Started';
        notification_message := 'Work has started on your vehicle.';
      WHEN 'completed' THEN
        notification_title := 'Work Completed';
        notification_message := 'The work on your vehicle has been completed. Please review your invoice.';
      WHEN 'declined' THEN
        notification_title := 'Ticket Declined';
        notification_message := 'Unfortunately, your service ticket has been declined. Please contact us for more information.';
      ELSE
        RETURN NEW; -- Don't create notification for other statuses
    END CASE;
    
    -- Create notification
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      metadata
    ) VALUES (
      NEW.user_id,
      'ticket_status',
      notification_title,
      notification_message,
      jsonb_build_object(
        'ticket_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to create notifications on ticket status changes
DROP TRIGGER IF EXISTS trigger_notify_on_status_change ON public.tickets;
CREATE TRIGGER trigger_notify_on_status_change
  AFTER UPDATE OF status ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_customer_on_status_change();

-- Function to auto-create initial ownership record when vehicle is created
CREATE OR REPLACE FUNCTION public.create_initial_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create initial ownership record
  INSERT INTO public.vehicle_ownership_history (
    vehicle_id,
    owner_id,
    started_at,
    notes
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NOW(),
    'Initial vehicle registration'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create ownership history on vehicle creation
DROP TRIGGER IF EXISTS trigger_create_initial_ownership ON public.vehicles;
CREATE TRIGGER trigger_create_initial_ownership
  AFTER INSERT ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_initial_ownership();

-- Function to update customer notification preferences when they're verified
CREATE OR REPLACE FUNCTION public.auto_enable_verified_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-enable email notifications when email is verified
  IF NEW.email_verified = true AND OLD.email_verified = false THEN
    NEW.email_enabled := true;
  END IF;
  
  -- Auto-enable SMS notifications when phone is verified
  IF NEW.phone_verified = true AND OLD.phone_verified = false THEN
    NEW.sms_enabled := true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-enable notifications when verified
DROP TRIGGER IF EXISTS trigger_auto_enable_notifications ON public.customer_notifications;
CREATE TRIGGER trigger_auto_enable_notifications
  BEFORE UPDATE ON public.customer_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_enable_verified_notifications();

-- Create index for better notification query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);