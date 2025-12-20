-- ============================================================================
-- RBAC System Complete Initialization Script
-- ============================================================================
-- This script sets up the complete RBAC (Role-Based Access Control) system
-- Run this ONCE during initial deployment to Kubernetes cluster
-- 
-- Prerequisites: 
--   - PostgreSQL database must exist
--   - 'organizers' table must exist (referenced by system_users.organizer_id)
--
-- What this script does:
--   1. Creates RBAC tables (system_users, roles, permissions, junction tables)
--   2. Creates 25 system permissions across 6 resources
--   3. Creates Super Administrator role
--   4. Assigns all permissions to Super Admin role
--   5. Creates default admin users
--   6. Assigns Super Admin role to default users
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE RBAC TABLES
-- ============================================================================

-- Create system_users table
CREATE TABLE IF NOT EXISTS system_users (
    _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL DEFAULT '',
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    organizer_id UUID REFERENCES organizers(_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    scope VARCHAR(50) NOT NULL DEFAULT 'ORGANIZER',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create system_user_roles junction table
CREATE TABLE IF NOT EXISTS system_user_roles (
    _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_user_id UUID NOT NULL REFERENCES system_users(_id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(_id) ON DELETE CASCADE,
    organizer_id UUID REFERENCES organizers(_id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES system_users(_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(system_user_id, role_id, organizer_id)
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(_id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_users_email ON system_users(email);
CREATE INDEX IF NOT EXISTS idx_system_users_organizer_id ON system_users(organizer_id);
CREATE INDEX IF NOT EXISTS idx_system_users_is_active ON system_users(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_scope ON roles(scope);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_system_user_roles_user ON system_user_roles(system_user_id);
CREATE INDEX IF NOT EXISTS idx_system_user_roles_role ON system_user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_system_user_roles_organizer ON system_user_roles(organizer_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_id);

-- ============================================================================
-- PART 2: CREATE PERMISSIONS (25 total)
-- ============================================================================
-- NOTE: Permissions are SYSTEM-MANAGED and should NOT be editable by users.
-- To add/modify permissions, update this file and re-run the migration.

-- User Management Permissions (5)
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'USER:MANAGE', 'User Management', 'USER', 'MANAGE', 'Full control over user management', NOW(), NOW()),
    (gen_random_uuid(), 'USER:CREATE', 'Create User', 'USER', 'CREATE', 'Create new users', NOW(), NOW()),
    (gen_random_uuid(), 'USER:READ', 'View User', 'USER', 'READ', 'View user information', NOW(), NOW()),
    (gen_random_uuid(), 'USER:UPDATE', 'Update User', 'USER', 'UPDATE', 'Update user information', NOW(), NOW()),
    (gen_random_uuid(), 'USER:DELETE', 'Delete User', 'USER', 'DELETE', 'Delete users', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Role Management Permissions (6)
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'ROLE:MANAGE', 'Role Management', 'ROLE', 'MANAGE', 'Full control over role management', NOW(), NOW()),
    (gen_random_uuid(), 'ROLE:CREATE', 'Create Role', 'ROLE', 'CREATE', 'Create new roles', NOW(), NOW()),
    (gen_random_uuid(), 'ROLE:READ', 'View Role', 'ROLE', 'READ', 'View role information', NOW(), NOW()),
    (gen_random_uuid(), 'ROLE:UPDATE', 'Update Role', 'ROLE', 'UPDATE', 'Update role information', NOW(), NOW()),
    (gen_random_uuid(), 'ROLE:DELETE', 'Delete Role', 'ROLE', 'DELETE', 'Delete roles', NOW(), NOW()),
    (gen_random_uuid(), 'ROLE:ASSIGN', 'Assign Role', 'ROLE', 'ASSIGN', 'Assign roles to users', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Permission Management Permissions (1 - Read-only)
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'PERMISSION:READ', 'View Permission', 'PERMISSION', 'READ', 'View permission information for role assignment', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Event Management Permissions (6)
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'EVENT:MANAGE', 'Event Management', 'EVENT', 'MANAGE', 'Full control over event management', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:CREATE', 'Create Event', 'EVENT', 'CREATE', 'Create new events', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:READ', 'View Event', 'EVENT', 'READ', 'View event information', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:UPDATE', 'Update Event', 'EVENT', 'UPDATE', 'Update event information', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:DELETE', 'Delete Event', 'EVENT', 'DELETE', 'Delete events', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:PUBLISH', 'Publish Event', 'EVENT', 'PUBLISH', 'Publish events', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Organizer Management Permissions (5)
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'ORGANIZER:MANAGE', 'Organizer Management', 'ORGANIZER', 'MANAGE', 'Full control over organizer management', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:CREATE', 'Create Organizer', 'ORGANIZER', 'CREATE', 'Create new organizers', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:READ', 'View Organizer', 'ORGANIZER', 'READ', 'View organizer information', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:UPDATE', 'Update Organizer', 'ORGANIZER', 'UPDATE', 'Update organizer information', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:DELETE', 'Delete Organizer', 'ORGANIZER', 'DELETE', 'Delete organizers', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- System Permissions (3)
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'SYSTEM:ADMIN', 'System Admin', 'SYSTEM', 'ADMIN', 'Full system administration access', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM:CONFIG', 'System Config', 'SYSTEM', 'CONFIG', 'Configure system settings', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM:VIEW_LOGS', 'View System Logs', 'SYSTEM', 'VIEW_LOGS', 'View system logs', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- PART 3: CREATE SUPER ADMIN ROLE
-- ============================================================================

INSERT INTO roles (_id, name, code, description, scope, is_system_role, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Super Administrator',
    'SUPER_ADMIN',
    'Full system access with all permissions. This is a protected system role.',
    'GLOBAL',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- PART 4: ASSIGN ALL PERMISSIONS TO SUPER ADMIN ROLE
-- ============================================================================

INSERT INTO role_permissions (_id, role_id, permission_id, created_at)
SELECT 
    gen_random_uuid(),
    r._id as role_id,
    p._id as permission_id,
    NOW() as created_at
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- PART 5: CREATE DEFAULT ADMIN USERS
-- ============================================================================
-- Password for all accounts: Admin@123
-- Bcrypt hash: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- 
-- IMPORTANT: Change these passwords immediately after first login!

-- Create Super Admin System User
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

-- Create Platform Admin System User
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

-- ============================================================================
-- PART 6: ASSIGN SUPER ADMIN ROLE TO DEFAULT USERS
-- ============================================================================

-- Assign Super Admin role to superadmin@ptit.com
INSERT INTO system_user_roles (_id, system_user_id, role_id, organizer_id, assigned_by, created_at)
SELECT 
    gen_random_uuid(),
    u._id as system_user_id,
    r._id as role_id,
    NULL as organizer_id,
    NULL as assigned_by,
    NOW() as created_at
FROM system_users u
CROSS JOIN roles r
WHERE u.email = 'superadmin@ptit.com' 
  AND r.code = 'SUPER_ADMIN'
ON CONFLICT (system_user_id, role_id, organizer_id) DO NOTHING;

-- Assign Super Admin role to admin@ptit.com
INSERT INTO system_user_roles (_id, system_user_id, role_id, organizer_id, assigned_by, created_at)
SELECT 
    gen_random_uuid(),
    u._id as system_user_id,
    r._id as role_id,
    NULL as organizer_id,
    NULL as assigned_by,
    NOW() as created_at
FROM system_users u
CROSS JOIN roles r
WHERE u.email = 'admin@ptit.com' 
  AND r.code = 'SUPER_ADMIN'
ON CONFLICT (system_user_id, role_id, organizer_id) DO NOTHING;

-- ============================================================================
-- PART 7: VERIFICATION QUERIES
-- ============================================================================

-- Summary report
DO $$
DECLARE
    permission_count INTEGER;
    role_count INTEGER;
    user_count INTEGER;
    role_permission_count INTEGER;
    user_role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO permission_count FROM permissions;
    SELECT COUNT(*) INTO role_count FROM roles;
    SELECT COUNT(*) INTO user_count FROM system_users;
    SELECT COUNT(*) INTO role_permission_count FROM role_permissions;
    SELECT COUNT(*) INTO user_role_count FROM system_user_roles;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RBAC System Initialization Complete!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Permissions created: %', permission_count;
    RAISE NOTICE 'Roles created: %', role_count;
    RAISE NOTICE 'System users created: %', user_count;
    RAISE NOTICE 'Role-Permission mappings: %', role_permission_count;
    RAISE NOTICE 'User-Role assignments: %', user_role_count;
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Default Login Credentials:';
    RAISE NOTICE '  Email: superadmin@ptit.com';
    RAISE NOTICE '  Email: admin@ptit.com';
    RAISE NOTICE '  Password: Admin@123';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'IMPORTANT: Change default passwords immediately!';
    RAISE NOTICE '============================================';
END $$;

-- Detailed verification
SELECT '=== PERMISSIONS BY RESOURCE ===' as section;
SELECT resource, COUNT(*) as count 
FROM permissions 
GROUP BY resource 
ORDER BY resource;

SELECT '=== SUPER ADMIN ROLE DETAILS ===' as section;
SELECT 
    r.name as role_name,
    r.code as role_code,
    r.scope,
    r.is_system_role,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r._id = rp.role_id
WHERE r.code = 'SUPER_ADMIN'
GROUP BY r._id, r.name, r.code, r.scope, r.is_system_role;

SELECT '=== SYSTEM USERS WITH ROLES ===' as section;
SELECT 
    u.email,
    u.name,
    u.is_active,
    r.name as role_name,
    r.scope
FROM system_users u
LEFT JOIN system_user_roles sur ON u._id = sur.system_user_id
LEFT JOIN roles r ON sur.role_id = r._id
ORDER BY u.email;

-- ============================================================================
-- INITIALIZATION COMPLETE
-- ============================================================================
-- Your RBAC system is now ready!
-- 
-- Next steps:
--   1. Login with superadmin@ptit.com or admin@ptit.com
--   2. Change the default password immediately
--   3. Create additional roles as needed via the API
--   4. Assign appropriate roles to other users
-- ============================================================================
