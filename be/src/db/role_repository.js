import Role from '@/model/role'
import Permission from '@/model/permission'
import SystemUser from '@/model/system_user'
import SystemUserRole from '@/model/system_user_role'
import RolePermission from '@/model/role_permission'
import {Op} from 'sequelize'

// ==================== Role CRUD ====================

export const createRole = async (roleData) => {
    const {name, code, description, scope = 'ORGANIZER', is_system_role = false} = roleData

    try {
        const newRole = await Role.create({
            name,
            code,
            description,
            scope,
            is_system_role,
        })
        return newRole.toJSON()
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create role: ${errorMsg}`)
    }
}

export const findRoleById = async (id, includeRelations = {}) => {
    const {include_permissions = false, include_admins = false} = includeRelations

    try {
        const include = []

        if (include_permissions) {
            include.push({
                model: Permission,
                as: 'permissions',
                through: {attributes: []},
            })
        }

        if (include_admins) {
            include.push({
                model: SystemUser,
                as: 'system_users',
                through: {
                    attributes: ['organizer_id', 'assigned_by', 'created_at'],
                    as: 'assignment',
                },
                attributes: {exclude: ['password']},
            })
        }

        const role = await Role.findByPk(id, {include})
        return role?.toJSON() || null
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find role by ID: ${errorMsg}`)
    }
}

export const findRoleByName = async (name) => {
    try {
        const role = await Role.findOne({where: {name}})
        return role?.toJSON() || null
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find role by name: ${errorMsg}`)
    }
}

export const findRoleByCode = async (code) => {
    try {
        const role = await Role.findOne({where: {code}})
        return role?.toJSON() || null
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find role by code: ${errorMsg}`)
    }
}

export const findAllRoles = async (filters = {}) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        scope = null,
        is_protected = null,
        include_permissions = false,
        include_admins = false,
    } = filters

    try {
        const offset = (page - 1) * limit
        const whereConditions = {}

        if (search) {
            whereConditions[Op.or] = [
                {name: {[Op.iLike]: `%${search}%`}},
                {code: {[Op.iLike]: `%${search}%`}},
                {description: {[Op.iLike]: `%${search}%`}},
            ]
        }

        if (scope) {
            whereConditions.scope = scope
        }

        if (is_protected !== null) {
            whereConditions.is_system_role = is_protected
        }

        const include = []

        if (include_permissions) {
            include.push({
                model: Permission,
                as: 'permissions',
                through: {attributes: []},
            })
        }

        if (include_admins) {
            include.push({
                model: SystemUser,
                as: 'system_users',
                through: {
                    attributes: ['organizer_id', 'assigned_by', 'created_at'],
                    as: 'assignment',
                },
                attributes: {exclude: ['password']},
            })
        }

        const {rows, count} = await Role.findAndCountAll({
            where: whereConditions,
            include,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            distinct: true,
        })

        return {
            data: rows.map((role) => role.toJSON()),
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch roles: ${errorMsg}`)
    }
}

export const updateRoleById = async (id, updateData) => {
    try {
        const role = await Role.findByPk(id)
        if (!role) {
            return null
        }

        // Prevent modifying system roles' protected fields
        if (role.is_system_role) {
            delete updateData.code
            delete updateData.is_system_role
        }

        await role.update(updateData)
        return role.toJSON()
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update role: ${errorMsg}`)
    }
}

export const deleteRoleById = async (id) => {
    try {
        const role = await Role.findByPk(id)
        if (!role) {
            return false
        }

        // Prevent deleting system roles
        if (role.is_system_role) {
            throw new Error('Cannot delete system role')
        }

        await role.destroy()
        return true
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete role: ${errorMsg}`)
    }
}

// ==================== Permission Management ====================

export const assignPermissionsToRole = async (roleId, permissionIds) => {
    try {
        const assignments = permissionIds.map((permissionId) => ({
            role_id: roleId,
            permission_id: permissionId,
        }))

        await RolePermission.bulkCreate(assignments, {
            ignoreDuplicates: true,
        })

        return true
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to assign permissions to role: ${errorMsg}`)
    }
}

export const removePermissionsFromRole = async (roleId, permissionIds) => {
    try {
        await RolePermission.destroy({
            where: {
                role_id: roleId,
                permission_id: {[Op.in]: permissionIds},
            },
        })
        return true
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to remove permissions from role: ${errorMsg}`)
    }
}

export const getRolePermissions = async (roleId) => {
    try {
        const role = await Role.findByPk(roleId, {
            include: [
                {
                    model: Permission,
                    as: 'permissions',
                    through: {attributes: []},
                },
            ],
        })

        if (!role) {
            return []
        }

        const roleData = role.toJSON()
        return roleData.permissions || []
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get role permissions: ${errorMsg}`)
    }
}

export const roleHasPermission = async (roleId, permissionCode) => {
    try {
        const permissions = await getRolePermissions(roleId)
        return permissions.some((p) => p.code === permissionCode)
    } catch (error) {
        return false
    }
}

// ==================== System User Assignment ====================

export const assignAdminsToRole = async (roleId, systemUserIds, organizerId = null, assignedBy = null) => {
    try {
        const assignments = systemUserIds.map((systemUserId) => ({
            system_user_id: systemUserId,
            role_id: roleId,
            organizer_id: organizerId,
            assigned_by: assignedBy,
        }))

        await SystemUserRole.bulkCreate(assignments, {
            ignoreDuplicates: true,
        })

        return true
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to assign users to role: ${errorMsg}`)
    }
}

export const removeAdminsFromRole = async (roleId, systemUserIds, organizerId = null) => {
    try {
        const whereConditions = {
            role_id: roleId,
            system_user_id: {[Op.in]: systemUserIds},
        }

        if (organizerId !== null) {
            whereConditions.organizer_id = organizerId
        }

        await SystemUserRole.destroy({where: whereConditions})
        return true
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to remove users from role: ${errorMsg}`)
    }
}

export const findRolesByAdminId = async (systemUserId, organizerId = null) => {
    try {
        const whereConditions = {system_user_id: systemUserId}

        if (organizerId !== null) {
            whereConditions.organizer_id = organizerId
        }

        const userRoles = await SystemUserRole.findAll({
            where: whereConditions,
            include: [
                {
                    model: Role,
                    as: 'role',
                },
            ],
        })

        return userRoles.map((ur) => ur.role).filter(Boolean)
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get user roles: ${errorMsg}`)
    }
}
