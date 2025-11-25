-- Add reschedule columns to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS reschedule_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS reschedule_reason text,
ADD COLUMN IF NOT EXISTS primary_mechanic_id uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS secondary_mechanic_id uuid REFERENCES profiles(id);

-- Add location_status to vehicles table  
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS location_status text DEFAULT 'with_customer';

-- Create index for faster reschedule queries
CREATE INDEX IF NOT EXISTS idx_tickets_reschedule_date 
ON tickets(reschedule_date) WHERE reschedule_date IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN tickets.reschedule_date IS 'Date when the ticket was rescheduled to';
COMMENT ON COLUMN tickets.reschedule_reason IS 'Reason for rescheduling the ticket';
COMMENT ON COLUMN vehicles.location_status IS 'Current location of vehicle: with_customer, in_shop, ready_for_pickup';