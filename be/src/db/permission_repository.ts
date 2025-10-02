const Permission = require('../model/permission')
const PermissionType = require('../model/permission_type')
const { Op } = require('sequelize')

type PermissionError = Error | unknown

interface PermissionData {
    code: string
    description?: string
    permission_group_code?: string
    permission_type_code: string
}

interface PermissionUpdateData extends Partial<PermissionData> {}

interface PermissionQueryOptions {
    includeType?: boolean
    groupCode?: string
    typeCode?: string
    searchTerm?: string
}

interface PermissionListOptions extends PermissionQueryOptions {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

// Create a new permission
const createPermission = async (permissionData: PermissionData) => {
    try {
        const newPermission = await Permission.create(permissionData)
        return newPermission.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create permission: ${errorMsg}`)
    }
}

// Find permission by ID with optional type inclusion
const findPermissionById = async (id: string, options: PermissionQueryOptions = {}) => {
    try {
        const query: any = {
            where: { _id: id }
        }

        if (options.includeType) {
            query.include = [{
                model: PermissionType,
                as: 'permissionType',
                required: false
            }]
        }

        const permission = await Permission.findByPk(id, query)
        return permission?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find permission by ID: ${errorMsg}`)
    }
}

// Find permission by code
const findPermissionByCode = async (code: string, options: PermissionQueryOptions = {}) => {
    try {
        const query: any = {
            where: { code }
        }

        if (options.includeType) {
            query.include = [{
                model: PermissionType,
                as: 'permissionType',
                required: false
            }]
        }

        const permission = await Permission.findOne(query)
        return permission?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find permission by code: ${errorMsg}`)
    }
}

// Get all permissions with pagination and filters
const findAllPermissions = async (options: PermissionListOptions = {}) => {
    const {
        page = 1,
        limit = 10,
        includeType = false,
        groupCode,
        typeCode,
        searchTerm,
        sortBy = '_id',
        sortOrder = 'DESC'
    } = options

    const offset = (page - 1) * limit
    
    try {
        const query: any = {
            where: {},
            order: [[sortBy, sortOrder]],
            limit,
            offset
        }

        // Add type inclusion if requested
        if (includeType) {
            query.include = [{
                model: PermissionType,
                as: 'permissionType',
                required: false
            }]
        }

        // Add group code filter if provided
        if (groupCode) {
            query.where.permission_group_code = groupCode
        }

        // Add type code filter if provided
        if (typeCode) {
            query.where.permission_type_code = typeCode
        }

        // Add search term if provided
        if (searchTerm) {
            query.where[Op.or] = [
                { code: { [Op.iLike]: `%${searchTerm}%` } },
                { description: { [Op.iLike]: `%${searchTerm}%` } }
            ]
        }

        const result = await Permission.findAll(query)
        return result.map((permission: any) => permission.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch permissions: ${errorMsg}`)
    }
}

// Get total count of permissions with filters
const countPermissions = async (options: PermissionQueryOptions = {}) => {
    try {
        const query: any = {
            where: {}
        }

        if (options.groupCode) {
            query.where.permission_group_code = options.groupCode
        }

        if (options.typeCode) {
            query.where.permission_type_code = options.typeCode
        }

        if (options.searchTerm) {
            query.where[Op.or] = [
                { code: { [Op.iLike]: `%${options.searchTerm}%` } },
                { description: { [Op.iLike]: `%${options.searchTerm}%` } }
            ]
        }

        return await Permission.count(query)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count permissions: ${errorMsg}`)
    }
}

// Update permission by ID
const updatePermissionById = async (id: string, updateData: PermissionUpdateData) => {
    try {
        if (Object.keys(updateData).length === 0) {
            throw new Error('No fields to update')
        }

        const [updatedCount, updatedPermissions] = await Permission.update(updateData, {
            where: { _id: id },
            returning: true
        })

        return updatedPermissions[0]?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update permission: ${errorMsg}`)
    }
}

// Delete permission by ID
const deletePermissionById = async (id: string) => {
    try {
        const permission = await Permission.findByPk(id)
        if (!permission) return null
        
        await permission.destroy()
        return permission.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete permission: ${errorMsg}`)
    }
}

// Find permissions by type code
const findPermissionsByTypeCode = async (typeCode: string, options: PermissionListOptions = {}) => {
    const {
        page = 1,
        limit = 10,
        includeType = false,
        sortBy = '_id',
        sortOrder = 'DESC'
    } = options

    const offset = (page - 1) * limit
    
    try {
        const query: any = {
            where: { permission_type_code: typeCode },
            order: [[sortBy, sortOrder]],
            limit,
            offset
        }

        if (includeType) {
            query.include = [{
                model: PermissionType,
                as: 'permissionType',
                required: false
            }]
        }

        const permissions = await Permission.findAll(query)
        return permissions.map((permission: any) => permission.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find permissions by type code: ${errorMsg}`)
    }
}

// Check if permission code exists
const permissionCodeExists = async (code: string, excludeId: string | null = null) => {
    try {
        const whereClause: any = { code }
        if (excludeId) {
            whereClause._id = { [Op.ne]: excludeId }
        }
        
        const count = await Permission.count({ where: whereClause })
        return count > 0
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to check code existence: ${errorMsg}`)
    }
}

module.exports = {
    createPermission,
    findPermissionById,
    findPermissionByCode,
    findAllPermissions,
    countPermissions,
    updatePermissionById,
    deletePermissionById,
    findPermissionsByTypeCode,
    permissionCodeExists
}
