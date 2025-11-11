-- Seed demo users and sample cards (one-time data seeding)
-- WARNING: Passwords are stored in plain text for demo purposes only
-- In production, use bcrypt hashing via edge function

INSERT INTO kanban_users (email, password_hash, role, is_active)
VALUES 
  ('viewer@shop.com', 'viewer123', 'KANBAN_VIEWER', TRUE),
  ('editor@shop.com', 'editor123', 'KANBAN_EDITOR', TRUE),
  ('admin@shop.com', 'admin123', 'KANBAN_ADMIN', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Create sample cards for Shop Floor board
INSERT INTO kanban_cards (board_id, column_id, title, description, priority, assignee, position, eta)
SELECT 
  b.id,
  c.id,
  card_data.title,
  card_data.description,
  card_data.priority::TEXT,
  card_data.assignee,
  card_data.position,
  (NOW() + (card_data.hours_until_due || ' hours')::INTERVAL)
FROM kanban_boards b
CROSS JOIN LATERAL (
  SELECT id, position as col_position FROM kanban_columns WHERE board_id = b.id ORDER BY position
) c
CROSS JOIN LATERAL (
  VALUES
    -- Intake column
    (1, 0, 'Toyota Camry - Oil Change', 'Regular maintenance service', 'MEDIUM', 'Mike', 0, 4),
    (1, 0, 'Honda Civic - Brake Check', 'Customer reports squeaking', 'HIGH', NULL, 1, 2),
    -- Diagnosing column
    (2, 1, 'Ford F-150 - Engine Light', 'Check engine light on, needs diagnostic', 'HIGH', 'Sarah', 0, 3),
    -- In Progress column
    (3, 2, 'Subaru Outback - Transmission', 'Transmission rebuild in progress', 'CRITICAL', 'Tom', 0, 1),
    (3, 2, 'Jeep Wrangler - Suspension', 'Full suspension replacement', 'MEDIUM', 'Mike', 1, 6),
    -- Ready for Pickup column
    (4, 3, 'Tesla Model 3 - Software Update', 'Completed software update and tire rotation', 'LOW', 'Sarah', 0, -1)
) AS card_data(col_pos, position, title, description, priority, assignee, card_position, hours_until_due)
WHERE b.slug = 'shop-floor' 
  AND c.col_position = card_data.col_pos
ON CONFLICT DO NOTHING;