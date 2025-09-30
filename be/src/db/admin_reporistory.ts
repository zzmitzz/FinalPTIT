const Admin = require('../models/admin')
const {Op} = require('sequelize')

type AdminError = Error | unknown

interface AdminData {
    name: string
    email: string
    phone?: string
    password: string
    role_ids?: string[]
}

interface AdminUpdateData extends Partial<AdminData> {}

// Create a new admin
const createAdmin = async (adminData: AdminData) => {
    const { name, email, phone = '', password, role_ids = [] } = adminData

    try {
        const newAdmin = await Admin.create({
            name,
            email,
            phone,
            password,
            role_ids
        })
        return newAdmin
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create admin: ${errorMsg}`)
    }
}

// Find admin by ID
const findAdminById = async (id: string) => {    
    try {
        const admin = await Admin.findByPk(id)
        return admin?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find admin by ID: ${errorMsg}`)
    }
}

// Find admin by email
const findAdminByEmail = async (email: string) => {
    try {
        const admin = await Admin.findOne({ where: { email } })
        return admin?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find admin by email: ${errorMsg}`)
    }
}

// Add: Find admin by phone
const findAdminByPhone = async (phone: string) => {
    try {
        const admin = await Admin.findOne({ where: { phone } })
        return admin?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find admin by phone: ${errorMsg}`)
    }
}

// Get all admins with pagination
const findAllAdmins = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit
    
    try {
        const result = await Admin.findAll({
            order: [["_id", "DESC"]],
            limit,
            offset
        })
        return result.map((admin: any) => admin.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch admins: ${errorMsg}`)
    }
}

// Get total count of admins
const countAdmins = async () => {
    try {
        return await Admin.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count admins: ${errorMsg}`)
    }
}

// Update admin by ID
const updateAdminById = async (id: string, updateData: AdminUpdateData) => {
    try {
        if (Object.keys(updateData).length === 0) {
            throw new Error('No fields to update')
        }

        const [updatedCount, updatedAdmins] = await Admin.update(updateData, {
            where: { _id: id },
            returning: true
        })

        return updatedAdmins[0]?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update admin: ${errorMsg}`)
    }
}

// Delete admin by ID
const deleteAdminById = async (id: string) => {
    try {
        const admin = await Admin.findByPk(id)
        if (!admin) return null
        
        await admin.destroy()
        return admin.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete admin: ${errorMsg}`)
    }
}

// Check if email exists
const adminEmailExists = async (email: string, excludeId: string | null = null) => {
    try {
        const whereClause: any = { email }
        if (excludeId) {
            whereClause._id = { [Op.ne]: excludeId }
        }
        
        const count = await Admin.count({ where: whereClause })
        return count > 0
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to check email existence: ${errorMsg}`)
    }
}

// Search admins by name or email
const searchAdmins = async (searchTerm: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit
    
    try {
        const admins = await Admin.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchTerm}%` } },
                    { email: { [Op.iLike]: `%${searchTerm}%` } }
                ]
            },
            order: [["_id", "DESC"]],
            limit,
            offset
        })
        return admins.map((admin: any) => admin.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to search admins: ${errorMsg}`)
    }
}

// Get admins by role IDs
const findAdminsByRoleIds = async (roleIds: string[]) => {
    try {
        const admins = await Admin.findAll({
            where: {
                role_ids: { [Op.contains]: roleIds }
            },
            order: [["_id", "DESC"]]
        })
        return admins.map((admin: any) => admin.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find admins by role IDs: ${errorMsg}`)
    }
}

// Update admin roles
const updateAdminRoles = async (id: string, roleIds: string[]) => {
    try {
        const [count, updatedAdmins] = await Admin.update(
            { role_ids: roleIds },
            {
                where: { _id: id },
                returning: true
            }
        )
        return updatedAdmins[0]?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update admin roles: ${errorMsg}`)
    }
}

module.exports = {
    createAdmin,
    findAdminById,
    findAdminByEmail,
    findAdminByPhone,
    findAllAdmins,
    countAdmins,
    updateAdminById,
    deleteAdminById,
    adminEmailExists,
    searchAdmins,
    findAdminsByRoleIds,
    updateAdminRoles
}
