import {
    createRole,
    findRoleById,
    findRoleByName,
    findAllRoles,
    updateRoleById,
    deleteRoleById,
    assignPermissionsToRole,
    removePermissionsFromRole,
    getRolePermissions,
    assignAdminsToRole,
    removeAdminsFromRole,
    findRolesByAdminId,
    roleHasPermission,
} from '@/db/role_repository'

/**
 * Create a new role
 */
export async function createNewRole({name, code, description, scope = 'ORGANIZER', is_system_role = false}) {
    // Check if role code already exists
    const existingRole = await findRoleByName(name)
    if (existingRole) {
        throw new Error('Role name already exists')
    }

    const role = await createRole({
        name,
        code,
        description,
        scope,
        is_system_role,
    })

    return role
}

/**
 * Get role by ID with associations
 */
export async function getRoleById(roleId, options = {}) {
    const role = await findRoleById(roleId, options)
    if (!role) {
        throw new Error('Role not found')
    }
    return role
}

/**
 * Get role by name
 */
export async function getRoleByName(name, options = {}) {
    const role = await findRoleByName(name, options)
    if (!role) {
        throw new Error('Role not found')
    }
    return role
}

/**
 * List all roles with pagination and filters
 */
export async function listRoles(options = {}) {
    const result = await findAllRoles(options)

    // If user_id is provided, add has_role flag to each role
    if (options.user_id && result.data) {
        const {findRolesByAdminId} = await import('@/db/role_repository')
        const userRoles = await findRolesByAdminId(options.user_id)
        const userRoleIds = new Set(userRoles.map((role) => role._id))

        result.data = result.data.map((role) => ({
            ...role,
            has_role: userRoleIds.has(role._id),
        }))
    }

    return result
}

/**
 * Update role
 */
export async function updateRole(roleId, updateData) {
    const role = await updateRoleById(roleId, updateData)
    if (!role) {
        throw new Error('Role not found or cannot be updated')
    }
    return role
}

/**
 * Delete role
 */
export async function deleteRole(roleId) {
    const result = await deleteRoleById(roleId)
    if (!result) {
        throw new Error('Role not found or cannot be deleted')
    }
    return true
}

/**
 * Assign permissions to role
 */
export async function assignPermissions(roleId, permissionIds) {
    await assignPermissionsToRole(roleId, permissionIds)
    return true
}

/**
 * Remove permissions from role
 */
export async function removePermissions(roleId, permissionIds) {
    await removePermissionsFromRole(roleId, permissionIds)
    return true
}

/**
 * Get all permissions for a role
 */
export async function getPermissions(roleId, includeInherited = true) {
    const permissions = await getRolePermissions(roleId, includeInherited)
    return permissions
}

/**
 * Assign system users to role
 */
export async function assignSystemUsers(roleId, systemUserIds) {
    await assignAdminsToRole(roleId, systemUserIds)
    return true
}

/**
 * Remove system users from role
 */
export async function removeSystemUsers(roleId, systemUserIds) {
    await removeAdminsFromRole(roleId, systemUserIds)
    return true
}

/**
 * Get roles for a system user
 */
export async function getUserRoles(systemUserId, options = {}) {
    const roles = await findRolesByAdminId(systemUserId, options)
    return roles
}

/**
 * Check if role has permission
 */
export async function checkRolePermission(roleId, permissionCode) {
    return await roleHasPermission(roleId, permissionCode)
}
