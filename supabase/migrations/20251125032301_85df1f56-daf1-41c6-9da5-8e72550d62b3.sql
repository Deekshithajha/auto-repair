-- Create missing workorder_services table
CREATE TABLE IF NOT EXISTS workorder_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id),
  service_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  labor_hours numeric DEFAULT 0,
  is_taxable boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for workorder_services
ALTER TABLE workorder_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and employees can manage workorder services"
  ON workorder_services FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));

CREATE POLICY "Customers can view their workorder services"
  ON workorder_services FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tickets 
    WHERE tickets.id = workorder_services.ticket_id 
    AND tickets.customer_id = auth.uid()
  ));

-- Add missing is_active column to vehicles
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Rename notifications.read to is_read to match code expectations
ALTER TABLE notifications 
RENAME COLUMN read TO is_read;

-- Add missing payment_status column to invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- Add trigger for workorder_services updated_at
CREATE TRIGGER update_workorder_services_updated_at
  BEFORE UPDATE ON workorder_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();