-- SQL Script with real bcrypt hashes for default accounts
-- Generated on: 2025-11-06T17:03:02.624Z
-- Admin password: admin123
-- Organizer password: organizer123

-- Create Admin Account
INSERT INTO admins (_id, name, email, phone, password, role_ids)
VALUES (
    gen_random_uuid(),
    'Super Admin',
    'admin@example.com',
    '+1234567890',
    '$2b$10$etGe/ChvEyRDRrkcQLYPPOvAtmZssQbjq/eK4l6XTv3zKnx475roi',
    ARRAY[]::UUID[]
)
ON CONFLICT (email) DO NOTHING;

-- Create Organizer Account
INSERT INTO organizers (_id, name, email, phone, password, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Event Organizer',
    'organizer@example.com',
    '+1234567891',
    '$2b$10$Rks548.1JEbDkdixgyLu3uZc2OKHHAi2.TBi4dp2qis8v0BbU3Y1q',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;
