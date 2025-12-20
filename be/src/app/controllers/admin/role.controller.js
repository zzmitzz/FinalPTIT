import {abort} from '@/utils/helpers'
import * as roleService from '@/app/services/admin/role.service'

/**
 * Create a new role
 */
export async function createRole(req, res) {
    const role = await roleService.createNewRole(req.body)
    res.status(201).jsonify(role, 'Tạo vai trò thành công.')
}

/**
 * Get role by ID
 */
export async function getRole(req, res) {
    const options = {
        include_permissions: req.query.include_permissions === 'true',
        include_admins: req.query.include_admins === 'true',
    }

    const role = await roleService.getRoleById(req.params.id, options)
    res.jsonify(role)
}

/**
 * List all roles
 */
export async function listRoles(req, res) {
    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        is_protected:
            req.query.is_protected === 'true' ? true : req.query.is_protected === 'false' ? false : undefined,
        include_permissions: req.query.include_permissions === 'true',
        include_admins: req.query.include_admins === 'true',
        user_id: req.query.user_id, // Include user_id to check if user has each role
    }

    const result = await roleService.listRoles(options)
    res.jsonify(result)
}

/**
 * Update role
 */
export async function updateRole(req, res) {
    const role = await roleService.updateRole(req.params.id, req.body)
    res.jsonify(role, 'Cập nhật vai trò thành công.')
}

/**
 * Delete role
 */
export async function deleteRole(req, res) {
    await roleService.deleteRole(req.params.id)
    res.jsonify('Xóa vai trò thành công.')
}

/**
 * Assign permissions to role
 */
export async function assignPermissions(req, res) {
    const {permission_ids} = req.body

    if (!Array.isArray(permission_ids) || permission_ids.length === 0) {
        abort(400, 'permission_ids phải là một mảng không rỗng')
    }

    await roleService.assignPermissions(req.params.id, permission_ids)
    res.jsonify('Gán quyền thành công.')
}

/**
 * Remove permissions from role
 */
export async function removePermissions(req, res) {
    const {permission_ids} = req.body

    if (!Array.isArray(permission_ids) || permission_ids.length === 0) {
        abort(400, 'permission_ids phải là một mảng không rỗng')
    }

    await roleService.removePermissions(req.params.id, permission_ids)
    res.jsonify('Xóa quyền thành công.')
}

/**
 * Get role permissions
 */
export async function getRolePermissions(req, res) {
    const includeInherited = req.query.include_inherited !== 'false'
    const permissions = await roleService.getPermissions(req.params.id, includeInherited)
    res.jsonify(permissions)
}

/**
 * Assign system users to role
 */
export async function assignSystemUsers(req, res) {
    const {system_user_ids} = req.body

    if (!Array.isArray(system_user_ids) || system_user_ids.length === 0) {
        abort(400, 'system_user_ids phải là một mảng không rỗng')
    }

    await roleService.assignSystemUsers(req.params.id, system_user_ids)
    res.jsonify('Gán người dùng thành công.')
}

/**
 * Remove system users from role
 */
export async function removeSystemUsers(req, res) {
    const {system_user_ids} = req.body

    if (!Array.isArray(system_user_ids) || system_user_ids.length === 0) {
        abort(400, 'system_user_ids phải là một mảng không rỗng')
    }

    await roleService.removeSystemUsers(req.params.id, system_user_ids)
    res.jsonify('Xóa người dùng thành công.')
}
