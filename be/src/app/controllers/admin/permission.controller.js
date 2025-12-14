import * as permissionService from '@/app/services/admin/permission.service'

/**
 * Create a new permission
 */
export async function createPermission(req, res) {
    const permission = await permissionService.createPermission(req.body)
    res.status(201).jsonify(permission, 'Tạo quyền thành công.')
}

/**
 * Get permission by ID
 */
export async function getPermission(req, res) {
    const permission = await permissionService.getPermissionById(req.params.id)
    res.jsonify(permission)
}

/**
 * Get permission by code
 */
export async function getPermissionByCode(req, res) {
    const permission = await permissionService.getPermissionByCode(req.params.code)
    res.jsonify(permission)
}

/**
 * List all permissions
 */
export async function listPermissions(req, res) {
    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        resource: req.query.resource,
        action: req.query.action,
        searchTerm: req.query.search,
    }

    const result = await permissionService.listPermissions(options)
    res.jsonify(result)
}

/**
 * Update permission
 */
export async function updatePermission(req, res) {
    const permission = await permissionService.updatePermission(req.params.id, req.body)
    res.jsonify(permission, 'Cập nhật quyền thành công.')
}

/**
 * Delete permission
 */
export async function deletePermission(req, res) {
    await permissionService.deletePermission(req.params.id)
    res.jsonify('Xóa quyền thành công.')
}

/**
 * Get permissions grouped by resource
 */
export async function getPermissionsByResource(req, res) {
    const grouped = await permissionService.getPermissionsByResource()
    res.jsonify(grouped)
}

/**
 * Get unique resources
 */
export async function getResources(req, res) {
    const resources = await permissionService.getUniqueResources()
    res.jsonify(resources)
}

/**
 * Get unique actions
 */
export async function getActions(req, res) {
    const actions = await permissionService.getUniqueActions()
    res.jsonify(actions)
}

/**
 * Bulk create permissions
 */
export async function bulkCreatePermissions(req, res) {
    const {permissions} = req.body

    if (!Array.isArray(permissions) || permissions.length === 0) {
        abort(400, 'permissions phải là một mảng không rỗng')
    }

    const result = await permissionService.bulkCreatePermissions(permissions)
    res.status(201).jsonify(result, 'Tạo quyền hàng loạt thành công.')
}
