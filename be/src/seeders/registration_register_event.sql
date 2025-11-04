-- =====================================================
-- SQL Script to Mock Data for registration_register_event
-- =====================================================
-- This script creates mock data for testing the registration_register_event feature
-- It assumes you have existing events and registrations in your database

-- First, create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS registration_register_event (
    _id SERIAL PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(_id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES registrations(_id) ON DELETE CASCADE,
    is_registered BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, registration_id)
);

-- Add comment to table
COMMENT ON TABLE registration_register_event IS 'User registered event';

-- Add comments to columns
COMMENT ON COLUMN registration_register_event._id IS 'Auto-incrementing primary key';
COMMENT ON COLUMN registration_register_event.event_id IS 'Reference to the event';
COMMENT ON COLUMN registration_register_event.registration_id IS 'Reference to the registration/user';
COMMENT ON COLUMN registration_register_event.is_registered IS 'Indicates if the user is registered for the event';
COMMENT ON COLUMN registration_register_event.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN registration_register_event.updated_at IS 'Timestamp when the record was last updated';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_registration_register_event_event_id ON registration_register_event(event_id);
CREATE INDEX IF NOT EXISTS idx_registration_register_event_registration_id ON registration_register_event(registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_register_event_is_registered ON registration_register_event(is_registered);

-- =====================================================
-- MOCK DATA INSERTION
-- =====================================================

-- Note: Replace the UUIDs below with actual UUIDs from your events and registrations tables
-- You can get them by running:
-- SELECT _id FROM events LIMIT 10;
-- SELECT _id FROM registrations LIMIT 10;

-- Example: Insert mock data using actual event and registration IDs
-- This assumes you have at least 3 events and 5 registrations in your database

-- Method 1: Using WITH clause to get existing IDs (recommended)
WITH 
  events_sample AS (
    SELECT _id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn 
    FROM events 
    LIMIT 5
  ),
  registrations_sample AS (
    SELECT _id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn 
    FROM registrations 
    LIMIT 10
  )
INSERT INTO registration_register_event (event_id, registration_id, is_registered, created_at, updated_at)
SELECT 
  e._id,
  r._id,
  CASE 
    WHEN (r.rn % 3) = 0 THEN false  -- Every 3rd registration is not registered
    ELSE true                        -- Others are registered
  END as is_registered,
  NOW() - (r.rn || ' days')::INTERVAL as created_at,
  NOW() - (r.rn || ' days')::INTERVAL as updated_at
FROM events_sample e
CROSS JOIN registrations_sample r
WHERE r.rn <= 10 AND e.rn <= 5
ON CONFLICT (event_id, registration_id) DO NOTHING;

-- =====================================================
-- Alternative Method 2: Manual insertion with specific UUIDs
-- =====================================================
-- Uncomment and replace UUIDs with actual values from your database

/*
-- Example with placeholder UUIDs (REPLACE THESE!)
INSERT INTO registration_register_event (event_id, registration_id, is_registered, created_at, updated_at)
VALUES
  -- Event 1 registrations
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', true, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', true, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', false, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222224', true, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222225', true, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  
  -- Event 2 registrations
  ('11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222221', true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222222', false, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222223', true, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222226', true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  
  -- Event 3 registrations
  ('11111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222221', true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('11111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222224', true, NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222225', false, NOW(), NOW())
ON CONFLICT (event_id, registration_id) DO NOTHING;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check total records inserted
SELECT COUNT(*) as total_records FROM registration_register_event;

-- Check registered vs unregistered
SELECT 
  is_registered,
  COUNT(*) as count
FROM registration_register_event
GROUP BY is_registered;

-- Check registrations per event
SELECT 
  e.name as event_name,
  COUNT(rre._id) as total_registrations,
  SUM(CASE WHEN rre.is_registered THEN 1 ELSE 0 END) as registered_count,
  SUM(CASE WHEN NOT rre.is_registered THEN 1 ELSE 0 END) as unregistered_count
FROM registration_register_event rre
JOIN events e ON e._id = rre.event_id
GROUP BY e._id, e.name
ORDER BY total_registrations DESC;

-- Check events per user
SELECT 
  r.email,
  r.full_name,
  COUNT(rre._id) as total_events,
  SUM(CASE WHEN rre.is_registered THEN 1 ELSE 0 END) as registered_events
FROM registration_register_event rre
JOIN registrations r ON r._id = rre.registration_id
GROUP BY r._id, r.email, r.full_name
ORDER BY total_events DESC;

-- View sample data
SELECT 
  rre._id,
  e.name as event_name,
  r.email as user_email,
  r.full_name as user_name,
  rre.is_registered,
  rre.created_at
FROM registration_register_event rre
JOIN events e ON e._id = rre.event_id
JOIN registrations r ON r._id = rre.registration_id
ORDER BY rre.created_at DESC
LIMIT 20;

-- =====================================================
-- HELPER SCRIPT: Generate INSERT statements from existing data
-- =====================================================
-- Run this to generate INSERT statements with actual UUIDs from your database

/*
SELECT 
  'INSERT INTO registration_register_event (event_id, registration_id, is_registered, created_at, updated_at) VALUES' || E'\n' ||
  STRING_AGG(
    '  (''' || e._id || ''', ''' || r._id || ''', ' || 
    CASE WHEN (ROW_NUMBER() OVER ()) % 3 = 0 THEN 'false' ELSE 'true' END || 
    ', NOW() - INTERVAL ''' || (ROW_NUMBER() OVER ()) || ' days'', NOW() - INTERVAL ''' || (ROW_NUMBER() OVER ()) || ' days'')',
    ',' || E'\n'
  ) || E'\n' || 'ON CONFLICT (event_id, registration_id) DO NOTHING;' as insert_statement
FROM 
  (SELECT _id FROM events ORDER BY created_at DESC LIMIT 3) e
CROSS JOIN 
  (SELECT _id FROM registrations ORDER BY created_at DESC LIMIT 5) r;
*/

-- =====================================================
-- CLEANUP (Use with caution!)
-- =====================================================
-- Uncomment to delete all mock data
-- DELETE FROM registration_register_event;

-- Uncomment to drop the table completely
-- DROP TABLE IF EXISTS registration_register_event CASCADE;

