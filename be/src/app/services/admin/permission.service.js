import Permission from '@/model/permission'
import {Op} from 'sequelize'

/**
 * Create a new permission
 */
export async function createPermission({code, name, description = '', resource, action}) {
    // Check if permission code already exists
    const existingPermission = await Permission.findOne({where: {code}})
    if (existingPermission) {
        throw new Error('Permission code already exists')
    }

    const permission = await Permission.create({
        code,
        name,
        description,
        resource,
        action,
    })

    return permission.toJSON()
}

/**
 * Get permission by ID
 */
export async function getPermissionById(permissionId) {
    const permission = await Permission.findByPk(permissionId)
    if (!permission) {
        throw new Error('Permission not found')
    }
    return permission.toJSON()
}

/**
 * Get permission by code
 */
export async function getPermissionByCode(code) {
    const permission = await Permission.findOne({where: {code}})
    if (!permission) {
        throw new Error('Permission not found')
    }
    return permission.toJSON()
}

/**
 * List all permissions with pagination and filters
 */
export async function listPermissions(options = {}) {
    const {
        page = 1,
        limit = 50,
        resource,
        action,
        searchTerm,
        sortBy = 'resource',
        sortOrder = 'ASC',
    } = options

    const offset = (page - 1) * limit
    const where = {}

    // Filter by resource
    if (resource) {
        where.resource = resource
    }

    // Filter by action
    if (action) {
        where.action = action
    }

    // Search by code, name, or description
    if (searchTerm) {
        where[Op.or] = [
            {code: {[Op.iLike]: `%${searchTerm}%`}},
            {name: {[Op.iLike]: `%${searchTerm}%`}},
            {description: {[Op.iLike]: `%${searchTerm}%`}},
        ]
    }

    const {count, rows} = await Permission.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
    })

    return {
        permissions: rows.map((p) => p.toJSON()),
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        },
    }
}

/**
 * Update permission
 */
export async function updatePermission(permissionId, updateData) {
    const permission = await Permission.findByPk(permissionId)
    if (!permission) {
        throw new Error('Permission not found')
    }

    await permission.update(updateData)
    return permission.toJSON()
}

/**
 * Delete permission
 */
export async function deletePermission(permissionId) {
    const permission = await Permission.findByPk(permissionId)
    if (!permission) {
        throw new Error('Permission not found')
    }

    await permission.destroy()
    return true
}

/**
 * Get permissions grouped by resource
 */
export async function getPermissionsByResource() {
    const permissions = await Permission.findAll({
        order: [
            ['resource', 'ASC'],
            ['action', 'ASC'],
        ],
    })

    const grouped = {}
    permissions.forEach((permission) => {
        const perm = permission.toJSON()
        if (!grouped[perm.resource]) {
            grouped[perm.resource] = []
        }
        grouped[perm.resource].push(perm)
    })

    return grouped
}

/**
 * Get unique resources
 */
export async function getUniqueResources() {
    const resources = await Permission.findAll({
        attributes: [[Permission.sequelize.fn('DISTINCT', Permission.sequelize.col('resource')), 'resource']],
        raw: true,
    })

    return resources.map((r) => r.resource)
}

/**
 * Get unique actions
 */
export async function getUniqueActions() {
    const actions = await Permission.findAll({
        attributes: [[Permission.sequelize.fn('DISTINCT', Permission.sequelize.col('action')), 'action']],
        raw: true,
    })

    return actions.map((a) => a.action)
}

/**
 * Bulk create permissions
 */
export async function bulkCreatePermissions(permissionsData) {
    const permissions = await Permission.bulkCreate(permissionsData, {
        ignoreDuplicates: true,
    })

    return permissions.map((p) => p.toJSON())
}

/**
 * Find permissions by IDs
 */
export async function getPermissionsByIds(permissionIds) {
    const permissions = await Permission.findAll({
        where: {
            _id: {[Op.in]: permissionIds},
        },
    })

    return permissions.map((p) => p.toJSON())
}
