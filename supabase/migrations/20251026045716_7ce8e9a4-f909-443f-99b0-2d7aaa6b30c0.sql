-- Add employment fields to employees table
ALTER TABLE employees 
ADD COLUMN employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'on_leave', 'terminated')),
ADD COLUMN termination_date DATE,
ADD COLUMN termination_reason TEXT;

-- Create employee_details table for rates and employment type
CREATE TABLE employee_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contractor')),
  hourly_rate NUMERIC(10,2) NOT NULL,
  overtime_rate NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on employee_details
ALTER TABLE employee_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_details
CREATE POLICY "Admins can manage employee details"
  ON employee_details FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view their own details"
  ON employee_details FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = employee_details.employee_id 
    AND employees.user_id = auth.uid()
  ));

-- Create standard_services table
CREATE TABLE standard_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('standard', 'non_standard')),
  default_price NUMERIC(10,2),
  labor_hours NUMERIC(5,2),
  taxable BOOLEAN DEFAULT true,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE standard_services ENABLE ROW LEVEL SECURITY;

-- RLS for standard_services
CREATE POLICY "Anyone authenticated can view services"
  ON standard_services FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage services"
  ON standard_services FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed standard services
INSERT INTO standard_services (service_name, category, default_price, labor_hours, taxable) VALUES
('Brake Job - Front', 'standard', 450.00, 2.5, true),
('Brake Job - Rear', 'standard', 450.00, 2.5, true),
('Brake Job - Both', 'standard', 900.00, 4.5, true),
('AC Service', 'standard', 140.00, 1.5, true),
('Oil Change - Synthetic', 'standard', 102.35, 0.5, true),
('Oil Change - Blend', 'standard', 85.78, 0.5, true),
('Tire Rotation', 'standard', 30.00, 0.5, true),
('Brake Fluid Flush', 'standard', 100.00, 1.0, false),
('Coolant Flush', 'standard', 200.00, 1.5, true),
('Diagnostic', 'standard', 100.00, 1.0, true),
('Engine Wash', 'standard', 50.00, 0.75, true),
('Engine Replacement', 'non_standard', NULL, NULL, true),
('Rear-end Rebuild', 'non_standard', NULL, NULL, true),
('Battery Services', 'non_standard', NULL, NULL, true),
('Belts Replacement', 'non_standard', NULL, NULL, true),
('Transmission Services', 'non_standard', NULL, NULL, true),
('Defective Diagnostics/Parts', 'non_standard', NULL, NULL, true);

-- Create workorder_services junction table
CREATE TABLE workorder_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  service_id UUID REFERENCES standard_services(id),
  service_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  labor_hours NUMERIC(5,2),
  is_taxable BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workorder_services ENABLE ROW LEVEL SECURITY;

-- RLS for workorder_services
CREATE POLICY "Admins can manage workorder services"
  ON workorder_services FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can manage services for assigned tickets"
  ON workorder_services FOR ALL
  USING (
    has_role(auth.uid(), 'employee'::app_role) 
    AND EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = workorder_services.ticket_id
      AND (t.primary_mechanic_id = auth.uid() OR t.secondary_mechanic_id = auth.uid())
    )
  );

CREATE POLICY "Users can view services for their tickets"
  ON workorder_services FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tickets
    WHERE tickets.id = workorder_services.ticket_id 
    AND tickets.user_id = auth.uid()
  ));

-- Add trigger for updated_at
CREATE TRIGGER update_employee_details_updated_at
  BEFORE UPDATE ON employee_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standard_services_updated_at
  BEFORE UPDATE ON standard_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();