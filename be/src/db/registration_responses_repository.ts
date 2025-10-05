import RegistrationResponses from '../model/registration_responses'
import { Op } from 'sequelize'

interface RegistrationResponseData {
    event_id: string
    form_fields_id: string
    registration_id: string
    response?: any
}

interface RegistrationResponseUpdateData extends Partial<RegistrationResponseData> { }

export const createRegistrationResponse = async (data: RegistrationResponseData) => {
    try {
        const response = await RegistrationResponses.create(data as any)
        return response.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create registration response: ${errorMsg}`)
    }
}

export const findRegistrationResponseById = async (id: string) => {
    try {
        const response = await RegistrationResponses.findByPk(id)
        return response?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registration response by ID: ${errorMsg}`)
    }
}

export const findRegistrationResponsesByRegistrationId = async (registrationId: string) => {
    try {
        const responses = await RegistrationResponses.findAll({
            where: { registration_id: registrationId },
            order: [['created_at', 'ASC']]
        })
        return responses.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registration responses by registration ID: ${errorMsg}`)
    }
}

export const findRegistrationResponsesByEventId = async (eventId: string) => {
    try {
        const responses = await RegistrationResponses.findAll({
            where: { event_id: eventId },
            order: [['created_at', 'DESC']]
        })
        return responses.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registration responses by event ID: ${errorMsg}`)
    }
}

export const findRegistrationResponsesByFormFieldId = async (formFieldId: string) => {
    try {
        const responses = await RegistrationResponses.findAll({
            where: { form_fields_id: formFieldId },
            order: [['created_at', 'DESC']]
        })
        return responses.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registration responses by form field ID: ${errorMsg}`)
    }
}

export const findRegistrationResponseByCompositeKey = async (
    registrationId: string,
    formFieldId: string,
    eventId: string
) => {
    try {
        const response = await RegistrationResponses.findOne({
            where: {
                registration_id: registrationId,
                form_fields_id: formFieldId,
                event_id: eventId
            }
        })
        return response?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registration response by composite key: ${errorMsg}`)
    }
}

export const findAllRegistrationResponses = async (page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit
    try {
        const responses = await RegistrationResponses.findAll({
            order: [['created_at', 'DESC']],
            limit,
            offset,
        })
        return responses.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to list registration responses: ${errorMsg}`)
    }
}

export const countRegistrationResponses = async () => {
    try {
        return await RegistrationResponses.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count registration responses: ${errorMsg}`)
    }
}

export const countRegistrationResponsesByEventId = async (eventId: string) => {
    try {
        return await RegistrationResponses.count({ where: { event_id: eventId } })
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count registration responses by event ID: ${errorMsg}`)
    }
}

export const countRegistrationResponsesByRegistrationId = async (registrationId: string) => {
    try {
        return await RegistrationResponses.count({ where: { registration_id: registrationId } })
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count registration responses by registration ID: ${errorMsg}`)
    }
}

export const updateRegistrationResponseById = async (id: string, updateData: RegistrationResponseUpdateData) => {
    try {
        const [updatedRows] = await RegistrationResponses.update(updateData, { where: { _id: id } })
        return updatedRows > 0 ? updatedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update registration response: ${errorMsg}`)
    }
}

export const deleteRegistrationResponseById = async (id: string) => {
    try {
        const deletedRows = await RegistrationResponses.destroy({ where: { _id: id } })
        return deletedRows > 0 ? deletedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete registration response: ${errorMsg}`)
    }
}

export const deleteRegistrationResponsesByRegistrationId = async (registrationId: string) => {
    try {
        const deletedRows = await RegistrationResponses.destroy({ where: { registration_id: registrationId } })
        return deletedRows
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete registration responses by registration ID: ${errorMsg}`)
    }
}

export const deleteRegistrationResponsesByEventId = async (eventId: string) => {
    try {
        const deletedRows = await RegistrationResponses.destroy({ where: { event_id: eventId } })
        return deletedRows
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete registration responses by event ID: ${errorMsg}`)
    }
}

export const bulkCreateRegistrationResponses = async (dataArray: RegistrationResponseData[]) => {
    try {
        const responses = await RegistrationResponses.bulkCreate(dataArray as any)
        return responses.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to bulk create registration responses: ${errorMsg}`)
    }
}

