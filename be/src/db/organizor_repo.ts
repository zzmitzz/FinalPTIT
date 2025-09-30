const Organizer = require('../model/organizor')
const {Op} = require('sequelize')

type OrganizerError = Error | unknown

interface OrganizerData {
    name: string
    email: string
    phone: string
    password: string
}

interface OrganizerUpdateData extends Partial<OrganizerData> {}

// Create a new organizer
const createOrganizer = async (organizerData: OrganizerData) => {
    const { name, email, phone, password } = organizerData

    try {
        const newOrganizer = await Organizer.create({
            name,
            email,
            phone,
            password
        })
        return newOrganizer.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create organizer: ${errorMsg}`)
    }
}

// Find organizer by ID
const findOrganizerById = async (id: string) => {    
    try {
        const organizer = await Organizer.findByPk(id)
        return organizer?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find organizer by ID: ${errorMsg}`)
    }
}

// Find organizer by email
const findOrganizerByEmail = async (email: string) => {
    try {
        const organizer = await Organizer.findOne({ where: { email } })
        return organizer?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find organizer by email: ${errorMsg}`)
    }
}

// Find organizer by phone
const findOrganizerByPhone = async (phone: string) => {
    try {
        const organizer = await Organizer.findOne({ where: { phone } })
        return organizer?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find organizer by phone: ${errorMsg}`)
    }
}

// Get all organizers with pagination
const findAllOrganizers = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit
    
    try {
        const result = await Organizer.findAll({
            order: [['_id', 'DESC']],
            limit,
            offset
        })
        return result.map((organizer: any) => organizer.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch organizers: ${errorMsg}`)
    }
}

// Get total count of organizers
const countOrganizers = async () => {
    try {
        return await Organizer.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count organizers: ${errorMsg}`)
    }
}

// Update organizer by ID
const updateOrganizerById = async (id: string, updateData: OrganizerUpdateData) => {
    try {
        if (Object.keys(updateData).length === 0) {
            throw new Error('No fields to update')
        }

        const [updatedCount, updatedOrganizers] = await Organizer.update(updateData, {
            where: { _id: id },
            returning: true
        })

        return updatedOrganizers[0]?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update organizer: ${errorMsg}`)
    }
}

// Delete organizer by ID
const deleteOrganizerById = async (id: string) => {
    try {
        const organizer = await Organizer.findByPk(id)
        if (!organizer) return null
        
        await organizer.destroy()
        return organizer.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete organizer: ${errorMsg}`)
    }
}

// Check if email exists
const organizerEmailExists = async (email: string, excludeId: string | null = null) => {
    try {
        const whereClause: any = { email }
        if (excludeId) {
            whereClause._id = { [Op.ne]: excludeId }
        }
        
        const count = await Organizer.count({ where: whereClause })
        return count > 0
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to check email existence: ${errorMsg}`)
    }
}

// Search organizers by name or email
const searchOrganizers = async (searchTerm: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit
    
    try {
        const organizers = await Organizer.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${searchTerm}%` } },
                    { email: { [Op.iLike]: `%${searchTerm}%` } }
                ]
            },
            order: [['_id', 'DESC']],
            limit,
            offset
        })
        return organizers.map((organizer: any) => organizer.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to search organizers: ${errorMsg}`)
    }
}

module.exports = {
    createOrganizer,
    findOrganizerById,
    findOrganizerByEmail,
    findAllOrganizers,
    countOrganizers,
    updateOrganizerById,
    deleteOrganizerById,
    organizerEmailExists,
    searchOrganizers
}
