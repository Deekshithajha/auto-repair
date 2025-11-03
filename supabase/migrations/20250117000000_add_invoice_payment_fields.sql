-- Add paid_at and payment_method fields to invoices table for revenue tracking
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'check', 'online', 'other'));

-- Update existing paid invoices to have paid_at = created_at if payment_status = 'paid'
UPDATE public.invoices
SET paid_at = created_at
WHERE payment_status = 'paid' AND paid_at IS NULL;

-- Create index for faster queries on paid_at
CREATE INDEX IF NOT EXISTS idx_invoices_paid_at ON public.invoices(paid_at) WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON public.invoices(payment_status);

