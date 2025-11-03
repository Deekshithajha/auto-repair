-- Insert dummy data for Revenue Tracker demonstration
-- This creates sample invoices, parts, and tickets to showcase revenue tracking

-- First, ensure we have some tickets (if they don't exist, we'll reference existing ones or create dummy refs)
-- Note: This script assumes you have existing tickets in the system
-- If not, we'll create minimal ticket references

-- Get some existing tickets or create placeholder references
DO $$
DECLARE
  sample_ticket_ids UUID[];
  ticket_id_1 UUID;
  ticket_id_2 UUID;
  ticket_id_3 UUID;
  invoice_id_1 UUID;
  invoice_id_2 UUID;
  invoice_id_3 UUID;
  invoice_id_4 UUID;
  invoice_id_5 UUID;
BEGIN
  -- Get existing tickets (up to 10) or use sample UUIDs
  SELECT ARRAY_AGG(id) INTO sample_ticket_ids
  FROM tickets
  LIMIT 10;

  -- If no tickets exist, we'll use sample UUIDs (these should match existing tickets in your system)
  -- For demonstration, we'll use the first available ticket IDs
  SELECT id INTO ticket_id_1 FROM tickets LIMIT 1 OFFSET 0;
  SELECT id INTO ticket_id_2 FROM tickets LIMIT 1 OFFSET 1;
  SELECT id INTO ticket_id_3 FROM tickets LIMIT 1 OFFSET 2;

  -- If we have at least one ticket, proceed with dummy data insertion
  IF ticket_id_1 IS NOT NULL THEN
    -- Insert dummy invoices for the last 30 days
    -- Today's invoices
    INSERT INTO invoices (
      id, ticket_id, invoice_number, subtotal, tax_amount, discount_amount, 
      total_amount, created_by, payment_status, paid_at, payment_method, created_at
    ) VALUES
    -- Today (if we're inserting today)
    (
      gen_random_uuid(),
      ticket_id_1,
      'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-001',
      450.00,
      45.00,
      0.00,
      495.00,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE + INTERVAL '2 hours',
      'card',
      CURRENT_DATE + INTERVAL '1 hour'
    ),
    (
      gen_random_uuid(),
      COALESCE(ticket_id_2, ticket_id_1),
      'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-002',
      320.50,
      32.05,
      10.00,
      342.55,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE + INTERVAL '4 hours',
      'cash',
      CURRENT_DATE + INTERVAL '3 hours'
    ),
    -- Yesterday
    (
      gen_random_uuid(),
      ticket_id_1,
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYYMMDD') || '-001',
      850.00,
      85.00,
      0.00,
      935.00,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '1 day' + INTERVAL '10 hours',
      'online',
      CURRENT_DATE - INTERVAL '1 day' + INTERVAL '9 hours'
    ),
    (
      gen_random_uuid(),
      COALESCE(ticket_id_2, ticket_id_1),
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYYMMDD') || '-002',
      1200.00,
      120.00,
      50.00,
      1270.00,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '1 day' + INTERVAL '14 hours',
      'card',
      CURRENT_DATE - INTERVAL '1 day' + INTERVAL '13 hours'
    ),
    (
      gen_random_uuid(),
      COALESCE(ticket_id_3, ticket_id_1),
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYYMMDD') || '-003',
      275.75,
      27.58,
      0.00,
      303.33,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '1 day' + INTERVAL '16 hours',
      'check',
      CURRENT_DATE - INTERVAL '1 day' + INTERVAL '15 hours'
    ),
    -- 2 days ago
    (
      gen_random_uuid(),
      ticket_id_1,
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '2 days', 'YYYYMMDD') || '-001',
      650.00,
      65.00,
      0.00,
      715.00,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '2 days' + INTERVAL '11 hours',
      'card',
      CURRENT_DATE - INTERVAL '2 days' + INTERVAL '10 hours'
    ),
    -- 3 days ago
    (
      gen_random_uuid(),
      COALESCE(ticket_id_2, ticket_id_1),
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '3 days', 'YYYYMMDD') || '-001',
      980.50,
      98.05,
      20.00,
      1058.55,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '3 days' + INTERVAL '13 hours',
      'online',
      CURRENT_DATE - INTERVAL '3 days' + INTERVAL '12 hours'
    ),
    (
      gen_random_uuid(),
      ticket_id_1,
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '3 days', 'YYYYMMDD') || '-002',
      420.00,
      42.00,
      0.00,
      462.00,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '3 days' + INTERVAL '15 hours',
      'cash',
      CURRENT_DATE - INTERVAL '3 days' + INTERVAL '14 hours'
    ),
    -- 5 days ago
    (
      gen_random_uuid(),
      COALESCE(ticket_id_3, ticket_id_1),
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '5 days', 'YYYYMMDD') || '-001',
      1100.00,
      110.00,
      100.00,
      1110.00,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '5 days' + INTERVAL '12 hours',
      'card',
      CURRENT_DATE - INTERVAL '5 days' + INTERVAL '11 hours'
    ),
    -- 7 days ago
    (
      gen_random_uuid(),
      ticket_id_1,
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '7 days', 'YYYYMMDD') || '-001',
      750.25,
      75.03,
      0.00,
      825.28,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '7 days' + INTERVAL '14 hours',
      'online',
      CURRENT_DATE - INTERVAL '7 days' + INTERVAL '13 hours'
    ),
    (
      gen_random_uuid(),
      COALESCE(ticket_id_2, ticket_id_1),
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '7 days', 'YYYYMMDD') || '-002',
      525.00,
      52.50,
      25.00,
      552.50,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '7 days' + INTERVAL '16 hours',
      'card',
      CURRENT_DATE - INTERVAL '7 days' + INTERVAL '15 hours'
    ),
    -- 10 days ago
    (
      gen_random_uuid(),
      ticket_id_1,
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '10 days', 'YYYYMMDD') || '-001',
      890.00,
      89.00,
      0.00,
      979.00,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '10 days' + INTERVAL '10 hours',
      'check',
      CURRENT_DATE - INTERVAL '10 days' + INTERVAL '9 hours'
    ),
    -- 14 days ago
    (
      gen_random_uuid(),
      COALESCE(ticket_id_2, ticket_id_1),
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '14 days', 'YYYYMMDD') || '-001',
      1320.00,
      132.00,
      50.00,
      1402.00,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '14 days' + INTERVAL '11 hours',
      'card',
      CURRENT_DATE - INTERVAL '14 days' + INTERVAL '10 hours'
    ),
    -- 20 days ago
    (
      gen_random_uuid(),
      ticket_id_1,
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '20 days', 'YYYYMMDD') || '-001',
      680.50,
      68.05,
      30.00,
      718.55,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '20 days' + INTERVAL '13 hours',
      'online',
      CURRENT_DATE - INTERVAL '20 days' + INTERVAL '12 hours'
    ),
    (
      gen_random_uuid(),
      COALESCE(ticket_id_3, ticket_id_1),
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '20 days', 'YYYYMMDD') || '-002',
      950.00,
      95.00,
      0.00,
      1045.00,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '20 days' + INTERVAL '15 hours',
      'cash',
      CURRENT_DATE - INTERVAL '20 days' + INTERVAL '14 hours'
    ),
    -- 25 days ago
    (
      gen_random_uuid(),
      ticket_id_1,
      'INV-' || TO_CHAR(CURRENT_DATE - INTERVAL '25 days', 'YYYYMMDD') || '-001',
      1125.75,
      112.58,
      75.00,
      1163.33,
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      'paid',
      CURRENT_DATE - INTERVAL '25 days' + INTERVAL '12 hours',
      'card',
      CURRENT_DATE - INTERVAL '25 days' + INTERVAL '11 hours'
    )
    ON CONFLICT (invoice_number) DO NOTHING;

    -- Insert dummy parts for COGS calculation
    -- Note: Parts are linked to ticket_id, and we calculate COGS from parts used
    -- We'll insert parts for the tickets we've used in invoices above
    
    INSERT INTO parts (
      ticket_id, name, part_code, quantity, unit_price, tax_percentage, 
      discount, status, uploaded_by, created_at
    )
    SELECT 
      ticket_id_1,
      'Brake Pads - Front',
      'BP-F-001',
      2,
      45.00,
      10.0,
      0.00,
      'approved',
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      CURRENT_DATE - INTERVAL '2 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM parts WHERE ticket_id = ticket_id_1 AND name = 'Brake Pads - Front'
    );

    INSERT INTO parts (
      ticket_id, name, part_code, quantity, unit_price, tax_percentage, 
      discount, status, uploaded_by, created_at
    )
    SELECT 
      COALESCE(ticket_id_2, ticket_id_1),
      'Oil Filter',
      'OF-001',
      1,
      12.50,
      10.0,
      0.00,
      'approved',
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      CURRENT_DATE - INTERVAL '3 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM parts WHERE ticket_id = COALESCE(ticket_id_2, ticket_id_1) AND name = 'Oil Filter'
    );

    INSERT INTO parts (
      ticket_id, name, part_code, quantity, unit_price, tax_percentage, 
      discount, status, uploaded_by, created_at
    )
    SELECT 
      ticket_id_1,
      'Air Filter',
      'AF-001',
      1,
      25.00,
      10.0,
      0.00,
      'approved',
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      CURRENT_DATE - INTERVAL '5 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM parts WHERE ticket_id = ticket_id_1 AND name = 'Air Filter'
    );

    INSERT INTO parts (
      ticket_id, name, part_code, quantity, unit_price, tax_percentage, 
      discount, status, uploaded_by, created_at
    )
    SELECT 
      COALESCE(ticket_id_3, ticket_id_1),
      'Spark Plugs Set',
      'SP-001',
      4,
      8.75,
      10.0,
      0.00,
      'approved',
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      CURRENT_DATE - INTERVAL '7 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM parts WHERE ticket_id = COALESCE(ticket_id_3, ticket_id_1) AND name = 'Spark Plugs Set'
    );

    INSERT INTO parts (
      ticket_id, name, part_code, quantity, unit_price, tax_percentage, 
      discount, status, uploaded_by, created_at
    )
    SELECT 
      ticket_id_1,
      'Battery',
      'BAT-001',
      1,
      125.00,
      10.0,
      0.00,
      'approved',
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      CURRENT_DATE - INTERVAL '10 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM parts WHERE ticket_id = ticket_id_1 AND name = 'Battery'
    );

    INSERT INTO parts (
      ticket_id, name, part_code, quantity, unit_price, tax_percentage, 
      discount, status, uploaded_by, created_at
    )
    SELECT 
      COALESCE(ticket_id_2, ticket_id_1),
      'Timing Belt',
      'TB-001',
      1,
      85.00,
      10.0,
      0.00,
      'approved',
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      CURRENT_DATE - INTERVAL '14 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM parts WHERE ticket_id = COALESCE(ticket_id_2, ticket_id_1) AND name = 'Timing Belt'
    );

    INSERT INTO parts (
      ticket_id, name, part_code, quantity, unit_price, tax_percentage, 
      discount, status, uploaded_by, created_at
    )
    SELECT 
      ticket_id_1,
      'Wiper Blades Set',
      'WB-001',
      2,
      35.00,
      10.0,
      0.00,
      'approved',
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      CURRENT_DATE - INTERVAL '20 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM parts WHERE ticket_id = ticket_id_1 AND name = 'Wiper Blades Set'
    );

    INSERT INTO parts (
      ticket_id, name, part_code, quantity, unit_price, tax_percentage, 
      discount, status, uploaded_by, created_at
    )
    SELECT 
      COALESCE(ticket_id_3, ticket_id_1),
      'Radiator Hose',
      'RH-001',
      2,
      42.50,
      10.0,
      0.00,
      'approved',
      (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
      CURRENT_DATE - INTERVAL '25 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM parts WHERE ticket_id = COALESCE(ticket_id_3, ticket_id_1) AND name = 'Radiator Hose'
    );

  END IF;
END $$;

-- Update existing invoices that have payment_status = 'paid' but no paid_at
UPDATE invoices
SET paid_at = created_at
WHERE payment_status = 'paid' AND paid_at IS NULL;

-- Ensure some invoices have payment_method set if they're paid
UPDATE invoices
SET payment_method = CASE 
  WHEN payment_method IS NULL AND payment_status = 'paid' THEN
    CASE (EXTRACT(EPOCH FROM created_at)::INTEGER % 5)
      WHEN 0 THEN 'cash'
      WHEN 1 THEN 'card'
      WHEN 2 THEN 'check'
      WHEN 3 THEN 'online'
      ELSE 'other'
    END
  ELSE payment_method
END
WHERE payment_status = 'paid' AND payment_method IS NULL;

