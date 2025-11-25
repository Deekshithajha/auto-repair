-- Create Quotes/Estimates Table
-- Supports quote workflow: Open -> Closed (Converted/Rejected)
-- Can originate from service/diagnostics
-- Supports original and revised estimates

-- Create quote_status enum
DO $$ BEGIN
  CREATE TYPE public.quote_status AS ENUM ('open', 'closed_converted', 'closed_rejected', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create quote_delivery_method enum
DO $$ BEGIN
  CREATE TYPE public.quote_delivery_method AS ENUM ('phone', 'email', 'in_person');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    
    -- Quote status and workflow
    status public.quote_status DEFAULT 'open' NOT NULL,
    is_revised BOOLEAN DEFAULT false NOT NULL,
    original_quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    
    -- Quote details
    recommendations TEXT,
    estimated_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    expiration_date TIMESTAMP WITH TIME ZONE,
    
    -- Authorization
    authorized_by TEXT,
    signed_date TIMESTAMP WITH TIME ZONE,
    signature_data TEXT, -- Base64 encoded signature image
    
    -- Delivery method
    delivery_method public.quote_delivery_method DEFAULT 'in_person',
    
    -- Services and parts (stored as JSONB for flexibility)
    services JSONB DEFAULT '[]'::jsonb,
    parts JSONB DEFAULT '[]'::jsonb,
    
    -- Labor details
    labor_hours NUMERIC(5, 2) DEFAULT 0,
    labor_rate NUMERIC(10, 2) DEFAULT 0,
    labor_cost DECIMAL(10, 2) DEFAULT 0,
    
    -- Tax and totals
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Notes and disclaimers
    notes TEXT,
    disclaimer TEXT,
    
    -- Conversion tracking
    converted_to_ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    converted_to_invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    converted_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON public.quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_vehicle_id ON public.quotes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_quotes_ticket_id ON public.quotes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON public.quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_original_quote_id ON public.quotes(original_quote_id);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Customers can view their own quotes"
  ON public.quotes FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Admins and employees can view all quotes"
  ON public.quotes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins and employees can create quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'))
    AND created_by = auth.uid()
  );

CREATE POLICY "Admins and employees can update quotes"
  ON public.quotes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'employee'));

CREATE POLICY "Admins can delete quotes"
  ON public.quotes FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate quote number (QUOTE-00000001 format)
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
  quote_num TEXT;
BEGIN
  -- Get the next sequence number
  SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 7) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.quotes
  WHERE quote_number LIKE 'QUOTE-%';
  
  -- Format as QUOTE-00000001
  quote_num := 'QUOTE-' || LPAD(next_num::TEXT, 8, '0');
  
  RETURN quote_num;
END;
$$;

-- Trigger to auto-generate quote number
CREATE OR REPLACE FUNCTION public.set_quote_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    NEW.quote_number := public.generate_quote_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_quote_number
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_quote_number();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_quotes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quotes_updated_at();

-- Function to check if quote is expired
CREATE OR REPLACE FUNCTION public.is_quote_expired(quote_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  exp_date TIMESTAMP WITH TIME ZONE;
  quote_stat public.quote_status;
BEGIN
  SELECT expiration_date, status
  INTO exp_date, quote_stat
  FROM public.quotes
  WHERE id = quote_id;
  
  -- If already closed or converted, not expired
  IF quote_stat IN ('closed_converted', 'closed_rejected') THEN
    RETURN false;
  END IF;
  
  -- Check if expiration date has passed
  IF exp_date IS NOT NULL AND exp_date < now() THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

COMMENT ON TABLE public.quotes IS 'Stores quotes/estimates for vehicle repairs. Can be converted to workorders/invoices.';
COMMENT ON COLUMN public.quotes.is_revised IS 'Indicates if this is a revised version of an original quote';
COMMENT ON COLUMN public.quotes.original_quote_id IS 'Reference to the original quote if this is a revision';
COMMENT ON COLUMN public.quotes.converted_to_ticket_id IS 'Ticket ID if quote was converted to a workorder';
COMMENT ON COLUMN public.quotes.converted_to_invoice_id IS 'Invoice ID if quote was directly converted to invoice';

