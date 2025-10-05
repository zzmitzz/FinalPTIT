import Registration from '../model/registration'
import { Op } from 'sequelize'

interface RegistrationData {
    email: string
    phone: string
    provider_name?: string
    provider_user_id?: string
    password: string
    full_name?: string
    dob?: Date
    gender?: string
    address?: string
    avatar_url?: string
    bio?: string
}

interface RegistrationUpdateData extends Partial<RegistrationData> { }

export const createRegistration = async (data: RegistrationData) => {
    try {
        const reg = await Registration.create(data as any)
        return reg.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create registration: ${errorMsg}`)
    }
}

export const findRegistrationById = async (id: string) => {
    try {
        const reg = await Registration.findByPk(id)
        return reg?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registration by ID: ${errorMsg}`)
    }
}

export const findRegistrationByEmail = async (email: string) => {
    try {
        const reg = await Registration.findOne({ where: { email } })
        return reg?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registration by email: ${errorMsg}`)
    }
}

export const findAllRegistrations = async (page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit
    try {
        const regs = await Registration.findAll({
            order: [["_id", "DESC"]],
            limit,
            offset,
        })
        return regs.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to list registrations: ${errorMsg}`)
    }
}

export const countRegistrations = async () => {
    try {
        return await Registration.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count registrations: ${errorMsg}`)
    }
}

export const searchRegistrations = async (searchTerm: string, page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit
    try {
        const regs = await Registration.findAll({
            where: {
                [Op.or]: [
                    { email: { [Op.iLike]: `%${searchTerm}%` } },
                    { phone: { [Op.iLike]: `%${searchTerm}%` } },
                    { full_name: { [Op.iLike]: `%${searchTerm}%` } },
                ],
            },
            order: [["_id", "DESC"]],
            limit,
            offset,
        })
        return regs.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to search registrations: ${errorMsg}`)
    }
}

export const updateRegistrationById = async (id: string, updateData: RegistrationUpdateData) => {
    try {
        const [updatedRows] = await Registration.update(updateData, { where: { _id: id } })
        return updatedRows > 0 ? updatedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update registration: ${errorMsg}`)
    }
}

export const deleteRegistrationById = async (id: string) => {
    try {
        const deletedRows = await Registration.destroy({ where: { _id: id } })
        return deletedRows > 0 ? deletedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete registration: ${errorMsg}`)
    }
}
