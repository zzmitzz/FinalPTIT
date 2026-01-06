import RegistrationRegisterEvent from '../model/registration_register_event'
import Event from '../model/event'
import { Op } from 'sequelize'
import sequelize from '../configs/postgre_sql.js'

interface RegistrationRegisterEventData {
    event_id: string
    registration_id: string
    is_registered?: boolean
}

interface RegistrationRegisterEventUpdateData extends Partial<RegistrationRegisterEventData> { }

export const createRegistrationRegisterEvent = async (data: RegistrationRegisterEventData) => {
    try {
        const registerEvent = await RegistrationRegisterEvent.create(data as any)
        return registerEvent.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create registration register event: ${errorMsg}`)
    }
}

export const findRegistrationRegisterEventById = async (id: number) => {
    try {
        const registerEvent = await RegistrationRegisterEvent.findByPk(id)
        return registerEvent?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registration register event by ID: ${errorMsg}`)
    }
}

export const findRegistrationRegisterEventByEventId = async (eventId: string) => {
    try {
        const registerEvents = await RegistrationRegisterEvent.findAll({
            where: { event_id: eventId },
            order: [['created_at', 'DESC']]
        })
        return registerEvents.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registration register events by event ID: ${errorMsg}`)
    }
}

export const findRegistrationRegisterEventByRegistrationId = async (registrationId: string) => {
    try {
        const registerEvents = await RegistrationRegisterEvent.findAll({
            where: { registration_id: registrationId },
            order: [['created_at', 'DESC']]
        })
        return registerEvents.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registration register events by registration ID: ${errorMsg}`)
    }
}

export const findRegistrationRegisterEventByCompositeKey = async (
    eventId: string,
    registrationId: string
) => {
    try {
        const registerEvent = await RegistrationRegisterEvent.findOne({
            where: {
                event_id: eventId,
                registration_id: registrationId
            }
        })
        return registerEvent?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registration register event by composite key: ${errorMsg}`)
    }
}

export const findRegisteredEventsByRegistrationId = async (registrationId: string) => {
    try {
        const registerEvents = await RegistrationRegisterEvent.findAll({
            where: {
                registration_id: registrationId,
                is_registered: true
            },
            include: [{
                model: Event,
                as: 'event',
                required: true
            }],
            order: [['created_at', 'DESC']]
        })
        return registerEvents.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registered events by registration ID: ${errorMsg}`)
    }
}

export const findRegisteredUsersByEventId = async (eventId: string) => {
    try {
        const registerEvents = await RegistrationRegisterEvent.findAll({
            where: {
                event_id: eventId,
                is_registered: true
            },
            order: [['created_at', 'DESC']]
        })
        return registerEvents.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registered users by event ID: ${errorMsg}`)
    }
}

export const findAllRegistrationRegisterEvents = async (page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit
    try {
        const registerEvents = await RegistrationRegisterEvent.findAll({
            order: [['created_at', 'DESC']],
            limit,
            offset,
        })
        return registerEvents.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to list registration register events: ${errorMsg}`)
    }
}

export const countRegistrationRegisterEvents = async () => {
    try {
        return await RegistrationRegisterEvent.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count registration register events: ${errorMsg}`)
    }
}

export const countRegistrationRegisterEventsByEventId = async (eventId: string) => {
    try {
        return await RegistrationRegisterEvent.count({ where: { event_id: eventId } })
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count registration register events by event ID: ${errorMsg}`)
    }
}

export const countRegistrationRegisterEventsByRegistrationId = async (registrationId: string) => {
    try {
        return await RegistrationRegisterEvent.count({ where: { registration_id: registrationId } })
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count registration register events by registration ID: ${errorMsg}`)
    }
}

export const countRegisteredUsersByEventId = async (eventId: string) => {
    try {
        return await RegistrationRegisterEvent.count({
            where: {
                event_id: eventId,
                is_registered: true
            }
        })
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count registered users by event ID: ${errorMsg}`)
    }
}

export const countRegisteredUsersGroupedByEventIds = async (eventIds: string[]) => {
    try {
        const ids = Array.isArray(eventIds) ? eventIds.filter(Boolean) : []
        if (ids.length === 0) return {}

        const rows = await RegistrationRegisterEvent.findAll({
            attributes: [
                'event_id',
                [sequelize.fn('COUNT', sequelize.col('registration_id')), 'registered_count'],
            ],
            where: {
                event_id: { [Op.in]: ids },
                is_registered: true,
            },
            group: ['event_id'],
            raw: true,
        })

        const out: Record<string, number> = {}
        for (const r of rows as any[]) {
            const eventId = String(r.event_id)
            const n = Number(r.registered_count)
            out[eventId] = Number.isFinite(n) ? n : 0
        }
        return out
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count registered users grouped by event IDs: ${errorMsg}`)
    }
}

export const countRegisteredUsersGroupedByEventIdsInCreatedAtRange = async (
    eventIds: string[],
    start: Date,
    end: Date
) => {
    try {
        const ids = Array.isArray(eventIds) ? eventIds.filter(Boolean) : []
        if (ids.length === 0) return {}

        const rows = await RegistrationRegisterEvent.findAll({
            attributes: [
                'event_id',
                [sequelize.fn('COUNT', sequelize.col('registration_id')), 'registered_count'],
            ],
            where: {
                event_id: { [Op.in]: ids },
                is_registered: true,
                created_at: { [Op.between]: [start, end] },
            },
            group: ['event_id'],
            raw: true,
        })

        const out: Record<string, number> = {}
        for (const r of rows as any[]) {
            const eventId = String(r.event_id)
            const n = Number(r.registered_count)
            out[eventId] = Number.isFinite(n) ? n : 0
        }
        return out
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count registered users grouped by event IDs in date range: ${errorMsg}`)
    }
}

export const isUserRegisteredForEvent = async (eventId: string, registrationId: string): Promise<boolean> => {
    try {
        console.log(eventId, registrationId)
        const registerEvent = await RegistrationRegisterEvent.findOne({
            where: {
                event_id: eventId,
                registration_id: registrationId,
                is_registered: true
            },
            raw: true
        })
        console.log(registerEvent)
        return registerEvent !== null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to check if user is registered for event: ${errorMsg}`)
    }
}

export const updateRegistrationRegisterEventById = async (id: number, updateData: RegistrationRegisterEventUpdateData) => {
    try {
        const [updatedRows] = await RegistrationRegisterEvent.update(updateData, { where: { _id: id } })
        return updatedRows > 0 ? updatedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update registration register event: ${errorMsg}`)
    }
}

export const updateRegistrationRegisterEventByCompositeKey = async (
    eventId: string,
    registrationId: string,
    updateData: RegistrationRegisterEventUpdateData
) => {
    try {
        const [updatedRows] = await RegistrationRegisterEvent.update(updateData, {
            where: {
                event_id: eventId,
                registration_id: registrationId
            }
        })
        return updatedRows > 0 ? updatedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update registration register event by composite key: ${errorMsg}`)
    }
}

export const deleteRegistrationRegisterEventById = async (id: number) => {
    try {
        const deletedRows = await RegistrationRegisterEvent.destroy({ where: { _id: id } })
        return deletedRows > 0 ? deletedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete registration register event: ${errorMsg}`)
    }
}

export const deleteRegistrationRegisterEventByEventId = async (eventId: string) => {
    try {
        const deletedRows = await RegistrationRegisterEvent.destroy({ where: { event_id: eventId } })
        return deletedRows
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete registration register events by event ID: ${errorMsg}`)
    }
}

export const deleteRegistrationRegisterEventByRegistrationId = async (registrationId: string) => {
    try {
        const deletedRows = await RegistrationRegisterEvent.destroy({ where: { registration_id: registrationId } })
        return deletedRows
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete registration register events by registration ID: ${errorMsg}`)
    }
}

export const deleteRegistrationRegisterEventByCompositeKey = async (
    eventId: string,
    registrationId: string
) => {
    try {
        const deletedRows = await RegistrationRegisterEvent.destroy({
            where: {
                event_id: eventId,
                registration_id: registrationId
            }
        })
        return deletedRows > 0 ? deletedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete registration register event by composite key: ${errorMsg}`)
    }
}

export const bulkCreateRegistrationRegisterEvents = async (dataArray: RegistrationRegisterEventData[]) => {
    try {
        const registerEvents = await RegistrationRegisterEvent.bulkCreate(dataArray as any)
        return registerEvents.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to bulk create registration register events: ${errorMsg}`)
    }
}

export const findRegisteredEventsByRegistrationIdAndMonth = async (
    registrationId: string,
    month: number,
    year: number
) => {
    try {
        // Create date range for the specified month and year
        const startDate = new Date(year, month - 1, 1) // month is 0-indexed in JS Date
        const endDate = new Date(year, month, 0, 23, 59, 59, 999) // Last day of the month

        const registerEvents = await RegistrationRegisterEvent.findAll({
            where: {
                registration_id: registrationId,
                is_registered: true
            },
            include: [{
                model: Event,
                as: 'event',
                where: {
                    start_time: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate
                    }
                },
                required: true
            }],
            order: [['created_at', 'DESC']]
        })
        return registerEvents.map(r => r.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find registered events by registration ID and month: ${errorMsg}`)
    }
}

