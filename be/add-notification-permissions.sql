-- Add Notification Management Permissions to RBAC System

-- Insert notification permissions
INSERT INTO permissions (_id, code, name, resource, action, description, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'NOTIFICATION:MANAGE', 'Notification Management', 'NOTIFICATION', 'MANAGE', 'Full control over notifications', NOW(), NOW()),
    (gen_random_uuid(), 'NOTIFICATION:CREATE', 'Create Notification', 'NOTIFICATION', 'CREATE', 'Create and send notifications', NOW(), NOW()),
    (gen_random_uuid(), 'NOTIFICATION:READ', 'View Notification', 'NOTIFICATION', 'READ', 'View notification history and stats', NOW(), NOW()),
    (gen_random_uuid(), 'NOTIFICATION:SEND_GLOBAL', 'Send Global Notification', 'NOTIFICATION', 'SEND_GLOBAL', 'Send notifications to all users (admin only)', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Assign notification permissions to Super Admin role
INSERT INTO role_permissions (_id, role_id, permission_id, created_at)
SELECT 
    gen_random_uuid(),
    r._id as role_id,
    p._id as permission_id,
    NOW() as created_at
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'SUPER_ADMIN'
  AND p.resource = 'NOTIFICATION'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verify
SELECT 'NOTIFICATION PERMISSIONS:' as info, COUNT(*) as count 
FROM permissions 
WHERE resource = 'NOTIFICATION';

SELECT 'SUPER ADMIN NOTIFICATION PERMISSIONS:' as info, COUNT(rp.permission_id) as count
FROM roles r
JOIN role_permissions rp ON r._id = rp.role_id
JOIN permissions p ON rp.permission_id = p._id
WHERE r.code = 'SUPER_ADMIN' AND p.resource = 'NOTIFICATION';
