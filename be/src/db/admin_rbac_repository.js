import SystemUser from '@/model/system_user'
import Role from '@/model/role'
import Permission from '@/model/permission'
import SystemUserRole from '@/model/system_user_role'
import RolePermission from '@/model/role_permission'
import {Op} from 'sequelize'

// ==================== System User CRUD ====================

export const createAdmin = async (userData) => {
    const {name, email, phone = '', password, organizer_id = null, avatar_url = null} = userData

    try {
        const newUser = await SystemUser.create({
            name,
            email,
            phone,
            password,
            organizer_id,
            avatar_url,
            is_active: true,
        })
        return newUser.toJSON()
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create system user: ${errorMsg}`)
    }
}

export const findAdminById = async (id, includePassword = false, includeRoles = false) => {
    try {
        const attributes = includePassword ? undefined : {exclude: ['password']}

        const include = []
        if (includeRoles) {
            include.push({
                model: Role,
                as: 'roles',
                through: {attributes: ['organizer_id', 'assigned_by', 'created_at']},
                include: [
                    {
                        model: Permission,
                        as: 'permissions',
                        through: {attributes: []},
                    },
                ],
            })
        }

        const user = await SystemUser.findByPk(id, {
            attributes,
            include: include.length > 0 ? include : undefined,
        })
        return user?.toJSON() || null
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find system user by ID: ${errorMsg}`)
    }
}

export const findAdminByEmail = async (email, includePassword = false) => {
    try {
        const attributes = includePassword ? undefined : {exclude: ['password']}

        const user = await SystemUser.findOne({
            where: {email},
            attributes,
        })
        return user?.toJSON() || null
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find system user by email: ${errorMsg}`)
    }
}

export const findAllAdmins = async (filters = {}) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        organizer_id = null,
        is_active = null,
        role_id = null,
        include_roles = false,
    } = filters

    try {
        const offset = (page - 1) * limit
        const whereConditions = {}

        if (search) {
            whereConditions[Op.or] = [
                {name: {[Op.iLike]: `%${search}%`}},
                {email: {[Op.iLike]: `%${search}%`}},
                {phone: {[Op.iLike]: `%${search}%`}},
            ]
        }

        if (organizer_id !== null) {
            whereConditions.organizer_id = organizer_id
        }

        if (is_active !== null) {
            whereConditions.is_active = is_active
        }

        const include = []
        if (include_roles || role_id) {
            include.push({
                model: Role,
                as: 'roles',
                through: {attributes: ['organizer_id', 'assigned_by', 'created_at']},
                ...(role_id && {where: {_id: role_id}}),
            })
        }

        const {rows, count} = await SystemUser.findAndCountAll({
            where: whereConditions,
            attributes: {exclude: ['password']},
            include,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            distinct: true,
        })

        return {
            data: rows.map((user) => user.toJSON()),
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch system users: ${errorMsg}`)
    }
}

export const updateAdminById = async (id, updateData) => {
    try {
        const user = await SystemUser.findByPk(id)
        if (!user) {
            return null
        }

        await user.update(updateData)
        return user.toJSON()
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update system user: ${errorMsg}`)
    }
}

export const deleteAdminById = async (id) => {
    try {
        const user = await SystemUser.findByPk(id)
        if (!user) {
            return false
        }

        await user.destroy()
        return true
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete system user: ${errorMsg}`)
    }
}

// ==================== Role Assignment ====================

export const assignRolesToAdmin = async (systemUserId, roleIds, organizerId = null, assignedBy = null) => {
    try {
        const assignments = roleIds.map((roleId) => ({
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
        throw new Error(`Failed to assign roles: ${errorMsg}`)
    }
}

export const removeRolesFromAdmin = async (systemUserId, roleIds, organizerId = null) => {
    try {
        const whereConditions = {
            system_user_id: systemUserId,
            role_id: {[Op.in]: roleIds},
        }

        if (organizerId !== null) {
            whereConditions.organizer_id = organizerId
        }

        await SystemUserRole.destroy({where: whereConditions})
        return true
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to remove roles: ${errorMsg}`)
    }
}

export const getAdminRoles = async (systemUserId, organizerId = null) => {
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
                    include: [
                        {
                            model: Permission,
                            as: 'permissions',
                            through: {attributes: []},
                        },
                    ],
                },
            ],
        })

        return userRoles.map((ur) => ur.toJSON())
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get admin roles: ${errorMsg}`)
    }
}

// ==================== Permission Checking ====================

export const getAdminPermissions = async (systemUserId, organizerId = null) => {
    try {
        const user = await SystemUser.findByPk(systemUserId, {
            include: [
                {
                    model: Role,
                    as: 'roles',
                    through: {
                        attributes: [],
                        where:
                            organizerId !== null
                                ? {
                                      [Op.or]: [{organizer_id: organizerId}, {organizer_id: null}],
                                  }
                                : {},
                    },
                    include: [
                        {
                            model: Permission,
                            as: 'permissions',
                            through: {attributes: []},
                        },
                    ],
                },
            ],
        })

        if (!user) {
            return []
        }

        const userData = user.toJSON()
        const permissionsSet = new Set()

        if (userData.roles && Array.isArray(userData.roles)) {
            userData.roles.forEach((role) => {
                if (role.permissions && Array.isArray(role.permissions)) {
                    role.permissions.forEach((permission) => {
                        permissionsSet.add(permission.code)
                    })
                }
            })
        }

        return Array.from(permissionsSet)
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to get admin permissions: ${errorMsg}`)
    }
}

export const adminHasPermission = async (systemUserId, permissionCode, organizerId = null) => {
    try {
        const permissions = await getAdminPermissions(systemUserId, organizerId)
        return permissions.includes(permissionCode)
    } catch (error) {
        return false
    }
}

export const adminHasAnyPermission = async (systemUserId, permissionCodes, organizerId = null) => {
    try {
        const permissions = await getAdminPermissions(systemUserId, organizerId)
        return permissionCodes.some((code) => permissions.includes(code))
    } catch (error) {
        return false
    }
}

export const adminHasAllPermissions = async (systemUserId, permissionCodes, organizerId = null) => {
    try {
        const permissions = await getAdminPermissions(systemUserId, organizerId)
        return permissionCodes.every((code) => permissions.includes(code))
    } catch (error) {
        return false
    }
}
