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
-- PART 2: CREATE PERMISSIONS (70+ total)
-- ============================================================================
-- NOTE: Permissions are SYSTEM-MANAGED and should NOT be editable by users.
-- To add/modify permissions, update this file and re-run the migration.
--
-- PERMISSION SCOPES:
--   GLOBAL: System administration permissions (Super Admin only)
--   ORGANIZER: Organizer-level permissions (can be assigned to organizer-scoped roles)
-- ============================================================================

-- ============================================================================
-- GLOBAL SCOPE PERMISSIONS (System Administration)
-- ============================================================================

-- System User Management Permissions (6)
-- For managing admin panel users
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'SYSTEM_USER:MANAGE', 'System User Management', 'SYSTEM_USER', 'MANAGE', 'Full control over system user management', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM_USER:CREATE', 'Create System User', 'SYSTEM_USER', 'CREATE', 'Create new system users', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM_USER:READ', 'View System User', 'SYSTEM_USER', 'READ', 'View system user information', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM_USER:UPDATE', 'Update System User', 'SYSTEM_USER', 'UPDATE', 'Update system user information', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM_USER:DELETE', 'Delete System User', 'SYSTEM_USER', 'DELETE', 'Delete system users', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM_USER:ACTIVATE', 'Activate/Deactivate System User', 'SYSTEM_USER', 'ACTIVATE', 'Activate or deactivate system user accounts', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Role Management Permissions (6)
-- For managing roles and permissions
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
    (gen_random_uuid(), 'PERMISSION:READ', 'View Permission', 'PERMISSION', 'READ', 'View permission catalog for role assignment', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Organizer Account Management Permissions (6)
-- For managing organizer accounts (not their content)
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'ORGANIZER:MANAGE', 'Organizer Management', 'ORGANIZER', 'MANAGE', 'Full control over organizer account management', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:CREATE', 'Create Organizer', 'ORGANIZER', 'CREATE', 'Create new organizer accounts', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:READ', 'View Organizer', 'ORGANIZER', 'READ', 'View organizer account information', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:UPDATE', 'Update Organizer', 'ORGANIZER', 'UPDATE', 'Update organizer account information', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:DELETE', 'Delete Organizer', 'ORGANIZER', 'DELETE', 'Delete organizer accounts', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:ACTIVATE', 'Activate/Deactivate Organizer', 'ORGANIZER', 'ACTIVATE', 'Enable or disable organizer accounts', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Registration User Management Permissions (5)
-- For managing mobile app end-users
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'REGISTRATION_USER:MANAGE', 'Registration User Management', 'REGISTRATION_USER', 'MANAGE', 'Full control over end-user management', NOW(), NOW()),
    (gen_random_uuid(), 'REGISTRATION_USER:READ', 'View Registration User', 'REGISTRATION_USER', 'READ', 'View end-user information', NOW(), NOW()),
    (gen_random_uuid(), 'REGISTRATION_USER:UPDATE', 'Update Registration User', 'REGISTRATION_USER', 'UPDATE', 'Update end-user information', NOW(), NOW()),
    (gen_random_uuid(), 'REGISTRATION_USER:DELETE', 'Delete Registration User', 'REGISTRATION_USER', 'DELETE', 'Delete end-user accounts', NOW(), NOW()),
    (gen_random_uuid(), 'REGISTRATION_USER:ACTIVATE', 'Activate/Deactivate User', 'REGISTRATION_USER', 'ACTIVATE', 'Enable or disable end-user accounts', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Event Approval Permissions (2)
-- For system-level event approval workflow
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'EVENT:APPROVE', 'Approve Event', 'EVENT', 'APPROVE', 'Approve or reject events for publication', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:REVIEW', 'Review Events', 'EVENT', 'REVIEW', 'Review all events across all organizers', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- System Analytics & Reporting Permissions (3)
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'ANALYTICS:VIEW', 'View Analytics', 'ANALYTICS', 'VIEW', 'View system-wide analytics and reports', NOW(), NOW()),
    (gen_random_uuid(), 'ANALYTICS:EXPORT', 'Export Analytics', 'ANALYTICS', 'EXPORT', 'Export analytics data and reports', NOW(), NOW()),
    (gen_random_uuid(), 'ANALYTICS:DASHBOARD', 'View Dashboard', 'ANALYTICS', 'DASHBOARD', 'Access admin dashboard with statistics', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- System Configuration Permissions (4)
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'SYSTEM:ADMIN', 'System Admin', 'SYSTEM', 'ADMIN', 'Full system administration access', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM:CONFIG', 'System Config', 'SYSTEM', 'CONFIG', 'Configure system settings and parameters', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM:VIEW_LOGS', 'View System Logs', 'SYSTEM', 'VIEW_LOGS', 'View system logs and audit trails', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM:NOTIFICATION', 'System Notifications', 'SYSTEM', 'NOTIFICATION', 'Send system-wide notifications to all users', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- ORGANIZER SCOPE PERMISSIONS (Organizer Content Management)
-- ============================================================================

-- Event Management Permissions (6)
-- For managing events within organizer scope
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'EVENT:MANAGE', 'Event Management', 'EVENT', 'MANAGE', 'Full control over event management', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:CREATE', 'Create Event', 'EVENT', 'CREATE', 'Create new events', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:READ', 'View Event', 'EVENT', 'READ', 'View event information', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:UPDATE', 'Update Event', 'EVENT', 'UPDATE', 'Update event information', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:DELETE', 'Delete Event', 'EVENT', 'DELETE', 'Delete events', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:PUBLISH', 'Publish Event', 'EVENT', 'PUBLISH', 'Publish and unpublish events', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Session Management Permissions (5)
-- For managing sessions within events
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'SESSION:MANAGE', 'Session Management', 'SESSION', 'MANAGE', 'Full control over session management', NOW(), NOW()),
    (gen_random_uuid(), 'SESSION:CREATE', 'Create Session', 'SESSION', 'CREATE', 'Create new sessions within events', NOW(), NOW()),
    (gen_random_uuid(), 'SESSION:READ', 'View Session', 'SESSION', 'READ', 'View session information', NOW(), NOW()),
    (gen_random_uuid(), 'SESSION:UPDATE', 'Update Session', 'SESSION', 'UPDATE', 'Update session information', NOW(), NOW()),
    (gen_random_uuid(), 'SESSION:DELETE', 'Delete Session', 'SESSION', 'DELETE', 'Delete sessions', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Speaker Management Permissions (5)
-- For managing speakers for events
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'SPEAKER:MANAGE', 'Speaker Management', 'SPEAKER', 'MANAGE', 'Full control over speaker management', NOW(), NOW()),
    (gen_random_uuid(), 'SPEAKER:CREATE', 'Create Speaker', 'SPEAKER', 'CREATE', 'Add speakers to events', NOW(), NOW()),
    (gen_random_uuid(), 'SPEAKER:READ', 'View Speaker', 'SPEAKER', 'READ', 'View speaker information', NOW(), NOW()),
    (gen_random_uuid(), 'SPEAKER:UPDATE', 'Update Speaker', 'SPEAKER', 'UPDATE', 'Update speaker information', NOW(), NOW()),
    (gen_random_uuid(), 'SPEAKER:DELETE', 'Delete Speaker', 'SPEAKER', 'DELETE', 'Remove speakers from events', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Form Management Permissions (5)
-- For managing registration forms
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'FORM:MANAGE', 'Form Management', 'FORM', 'MANAGE', 'Full control over registration form management', NOW(), NOW()),
    (gen_random_uuid(), 'FORM:CREATE', 'Create Form', 'FORM', 'CREATE', 'Create new registration forms', NOW(), NOW()),
    (gen_random_uuid(), 'FORM:READ', 'View Form', 'FORM', 'READ', 'View form information and submissions', NOW(), NOW()),
    (gen_random_uuid(), 'FORM:UPDATE', 'Update Form', 'FORM', 'UPDATE', 'Update form structure and settings', NOW(), NOW()),
    (gen_random_uuid(), 'FORM:DELETE', 'Delete Form', 'FORM', 'DELETE', 'Delete registration forms', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Resource Management Permissions (5)
-- For managing event resources (files, maps)
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'RESOURCE:MANAGE', 'Resource Management', 'RESOURCE', 'MANAGE', 'Full control over resource management', NOW(), NOW()),
    (gen_random_uuid(), 'RESOURCE:CREATE', 'Upload Resource', 'RESOURCE', 'CREATE', 'Upload files, maps, and other resources', NOW(), NOW()),
    (gen_random_uuid(), 'RESOURCE:READ', 'View Resource', 'RESOURCE', 'READ', 'View and download resources', NOW(), NOW()),
    (gen_random_uuid(), 'RESOURCE:UPDATE', 'Update Resource', 'RESOURCE', 'UPDATE', 'Update resource information', NOW(), NOW()),
    (gen_random_uuid(), 'RESOURCE:DELETE', 'Delete Resource', 'RESOURCE', 'DELETE', 'Delete uploaded resources', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Place/Venue Management Permissions (5)
-- For managing event venues
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'PLACE:MANAGE', 'Place Management', 'PLACE', 'MANAGE', 'Full control over venue management', NOW(), NOW()),
    (gen_random_uuid(), 'PLACE:CREATE', 'Create Place', 'PLACE', 'CREATE', 'Create new venues for events', NOW(), NOW()),
    (gen_random_uuid(), 'PLACE:READ', 'View Place', 'PLACE', 'READ', 'View venue information', NOW(), NOW()),
    (gen_random_uuid(), 'PLACE:UPDATE', 'Update Place', 'PLACE', 'UPDATE', 'Update venue information', NOW(), NOW()),
    (gen_random_uuid(), 'PLACE:DELETE', 'Delete Place', 'PLACE', 'DELETE', 'Delete venues', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Check-in Management Permissions (4)
-- For managing event attendance
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'CHECKIN:MANAGE', 'Check-in Management', 'CHECKIN', 'MANAGE', 'Full control over check-in management', NOW(), NOW()),
    (gen_random_uuid(), 'CHECKIN:VERIFY', 'Verify Check-in', 'CHECKIN', 'VERIFY', 'Verify and process attendee check-ins', NOW(), NOW()),
    (gen_random_uuid(), 'CHECKIN:READ', 'View Check-in', 'CHECKIN', 'READ', 'View check-in records and history', NOW(), NOW()),
    (gen_random_uuid(), 'CHECKIN:EXPORT', 'Export Check-in Data', 'CHECKIN', 'EXPORT', 'Export attendance reports', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Notification Management Permissions (4)
-- For sending notifications to event attendees
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'NOTIFICATION:MANAGE', 'Notification Management', 'NOTIFICATION', 'MANAGE', 'Full control over notification management', NOW(), NOW()),
    (gen_random_uuid(), 'NOTIFICATION:CREATE', 'Create Notification', 'NOTIFICATION', 'CREATE', 'Create and send notifications to event attendees', NOW(), NOW()),
    (gen_random_uuid(), 'NOTIFICATION:READ', 'View Notification', 'NOTIFICATION', 'READ', 'View notification history and statistics', NOW(), NOW()),
    (gen_random_uuid(), 'NOTIFICATION:DELETE', 'Delete Notification', 'NOTIFICATION', 'DELETE', 'Delete scheduled notifications', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Registration Management Permissions (4)
-- For managing event registrations
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'REGISTRATION:MANAGE', 'Registration Management', 'REGISTRATION', 'MANAGE', 'Full control over registration management', NOW(), NOW()),
    (gen_random_uuid(), 'REGISTRATION:READ', 'View Registration', 'REGISTRATION', 'READ', 'View registration data and responses', NOW(), NOW()),
    (gen_random_uuid(), 'REGISTRATION:UPDATE', 'Update Registration', 'REGISTRATION', 'UPDATE', 'Update registration information', NOW(), NOW()),
    (gen_random_uuid(), 'REGISTRATION:EXPORT', 'Export Registration', 'REGISTRATION', 'EXPORT', 'Export registration data and reports', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Organizer Profile Management Permissions (2)
-- For managing organizer's own profile
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'ORGANIZER_PROFILE:READ', 'View Organizer Profile', 'ORGANIZER_PROFILE', 'READ', 'View own organizer profile', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER_PROFILE:UPDATE', 'Update Organizer Profile', 'ORGANIZER_PROFILE', 'UPDATE', 'Update own organizer profile and details', NOW(), NOW())
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
    '$2b$10$Oy3jMN8cbLHkRGcPQGJbCOGBgJt865CxAT0RRrFJeUOTi.FGSt3wS',
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
    '$2b$10$Oy3jMN8cbLHkRGcPQGJbCOGBgJt865CxAT0RRrFJeUOTi.FGSt3wS',
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
