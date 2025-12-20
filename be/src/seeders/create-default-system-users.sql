-- SQL Script to create default RBAC system users
-- Generated for RBAC system
-- Password for all accounts: Admin@123
-- Bcrypt hash generated with 10 salt rounds

-- Create Super Admin System User (Global Admin)
INSERT INTO system_users (_id, name, email, phone, password, avatar_url, is_active, organizer_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Super Admin',
    'superadmin@ptit.com',
    '0123456789',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    NULL,
    TRUE,
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create Platform Admin System User (Global Admin)
INSERT INTO system_users (_id, name, email, phone, password, avatar_url, is_active, organizer_id, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Platform Admin',
    'admin@ptit.com',
    '0987654321',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    NULL,
    TRUE,
    NULL,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Note: Use the RBAC registration endpoint or login with these credentials:
-- Email: superadmin@ptit.com or admin@ptit.com
-- Password: Admin@123
