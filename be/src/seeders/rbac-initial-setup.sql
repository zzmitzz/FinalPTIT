-- RBAC Initial Setup: Permissions, Roles, and Super Admin Assignment
-- Run this AFTER creating your system_users
--
-- IMPORTANT: Permissions are SYSTEM-MANAGED and should NOT be editable by users.
-- To add/modify permissions, update this seed file and re-run the migration.
-- The permissions router only exposes READ operations for UI display purposes.

-- ==================== 1. CREATE PERMISSIONS ====================

-- User Management Permissions
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'USER:MANAGE', 'User Management', 'USER', 'MANAGE', 'Full control over user management', NOW(), NOW()),
    (gen_random_uuid(), 'USER:CREATE', 'Create User', 'USER', 'CREATE', 'Create new users', NOW(), NOW()),
    (gen_random_uuid(), 'USER:READ', 'View User', 'USER', 'READ', 'View user information', NOW(), NOW()),
    (gen_random_uuid(), 'USER:UPDATE', 'Update User', 'USER', 'UPDATE', 'Update user information', NOW(), NOW()),
    (gen_random_uuid(), 'USER:DELETE', 'Delete User', 'USER', 'DELETE', 'Delete users', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Role Management Permissions
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'ROLE:MANAGE', 'Role Management', 'ROLE', 'MANAGE', 'Full control over role management', NOW(), NOW()),
    (gen_random_uuid(), 'ROLE:CREATE', 'Create Role', 'ROLE', 'CREATE', 'Create new roles', NOW(), NOW()),
    (gen_random_uuid(), 'ROLE:READ', 'View Role', 'ROLE', 'READ', 'View role information', NOW(), NOW()),
    (gen_random_uuid(), 'ROLE:UPDATE', 'Update Role', 'ROLE', 'UPDATE', 'Update role information', NOW(), NOW()),
    (gen_random_uuid(), 'ROLE:DELETE', 'Delete Role', 'ROLE', 'DELETE', 'Delete roles', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Permission Management Permissions (Read-only - permissions are system-managed)
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'PERMISSION:READ', 'View Permission', 'PERMISSION', 'READ', 'View permission information for role assignment', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Event Management Permissions
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'EVENT:MANAGE', 'Event Management', 'EVENT', 'MANAGE', 'Full control over event management', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:CREATE', 'Create Event', 'EVENT', 'CREATE', 'Create new events', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:READ', 'View Event', 'EVENT', 'READ', 'View event information', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:UPDATE', 'Update Event', 'EVENT', 'UPDATE', 'Update event information', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:DELETE', 'Delete Event', 'EVENT', 'DELETE', 'Delete events', NOW(), NOW()),
    (gen_random_uuid(), 'EVENT:PUBLISH', 'Publish Event', 'EVENT', 'PUBLISH', 'Publish events', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Organizer Management Permissions
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'ORGANIZER:MANAGE', 'Organizer Management', 'ORGANIZER', 'MANAGE', 'Full control over organizer management', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:CREATE', 'Create Organizer', 'ORGANIZER', 'CREATE', 'Create new organizers', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:READ', 'View Organizer', 'ORGANIZER', 'READ', 'View organizer information', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:UPDATE', 'Update Organizer', 'ORGANIZER', 'UPDATE', 'Update organizer information', NOW(), NOW()),
    (gen_random_uuid(), 'ORGANIZER:DELETE', 'Delete Organizer', 'ORGANIZER', 'DELETE', 'Delete organizers', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- System Permissions
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'SYSTEM:ADMIN', 'System Admin', 'SYSTEM', 'ADMIN', 'Full system administration access', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM:CONFIG', 'System Config', 'SYSTEM', 'CONFIG', 'Configure system settings', NOW(), NOW()),
    (gen_random_uuid(), 'SYSTEM:VIEW_LOGS', 'View System Logs', 'SYSTEM', 'VIEW_LOGS', 'View system logs', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- ==================== 2. CREATE SUPER ADMIN ROLE ====================

INSERT INTO roles (_id, name, code, description, scope, is_system_role, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Super Administrator',
    'SUPER_ADMIN',
    'Full system access with all permissions',
    'GLOBAL',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (code) DO NOTHING;

-- ==================== 3. ASSIGN ALL PERMISSIONS TO SUPER ADMIN ====================

INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT 
    r._id as role_id,
    p._id as permission_id,
    NOW() as created_at
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ==================== 4. ASSIGN SUPER ADMIN ROLE TO YOUR USER ====================
-- Replace 'admin@example.com' with your actual admin email

INSERT INTO system_user_roles (system_user_id, role_id, organizer_id, created_at)
SELECT 
    u._id as system_user_id,
    r._id as role_id,
    NULL as organizer_id,
    NOW() as created_at
FROM system_users u
CROSS JOIN roles r
WHERE u.email = 'admin@example.com' 
  AND r.code = 'SUPER_ADMIN'
ON CONFLICT (system_user_id, role_id, organizer_id) DO NOTHING;

-- ==================== 5. VERIFY SETUP ====================

-- Check permissions count
SELECT 'Permissions created:' as info, COUNT(*) as count FROM permissions;

-- Check roles
SELECT 'Roles created:' as info, COUNT(*) as count FROM roles;

-- Check role permissions
SELECT 
    'Role-Permission mappings:' as info, 
    r.name as role_name, 
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r._id = rp.role_id
WHERE r.code = 'SUPER_ADMIN'
GROUP BY r._id, r.name;

-- Check user role assignment
SELECT 
    'User role assignments:' as info,
    u.email,
    r.name as role_name,
    sur.organizer_id
FROM system_users u
JOIN system_user_roles sur ON u._id = sur.system_user_id
JOIN roles r ON sur.role_id = r._id
WHERE u.email = 'admin@example.com';
