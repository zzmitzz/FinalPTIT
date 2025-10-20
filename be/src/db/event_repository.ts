import Event from '../model/event'
import { Op, literal } from 'sequelize'
import { EVENT_STATUS, EVENT_STATE, EVENT_CATEGORY } from '../configs/constants'

interface EventData {
    organizer_id: string
    name: string
    thumbnail: string
    logo: string
    description: string
    start_time: Date
    end_time: Date
    location: string,
    state: typeof EVENT_STATE,
    status: typeof EVENT_STATUS,
    lat: number
    lng: number
    category_id: typeof EVENT_CATEGORY
    tags: string[]
}

interface EventUpdateData extends Partial<EventData> { }

export const createEvent = async (eventData: EventData) => {
    const { organizer_id, name, thumbnail, logo, description, start_time, end_time, location,lat, lng } = eventData
    const status = EVENT_STATUS.WAITING
    const state = EVENT_STATE.PENDING
    const category_id = EVENT_CATEGORY.TECHNOLOGY
    try {
        const newEvent = await Event.create({ organizer_id, name, thumbnail, logo, description, start_time, end_time, location, status, state, lat, lng, category_id })
        return newEvent
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create event: ${errorMsg}`)
    }
}

export const findEventById = async (id: string) => {
    try {
        const event = await Event.findByPk(id)
        return event?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find event by ID: ${errorMsg}`)
    }
}

export const findEventByOrganizerId = async (organizer_id: string) => {
    try {
        const events = await Event.findAll({ where: { organizer_id } })
        return events.map(event => event.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find events by organizer ID: ${errorMsg}`)
    }
}

export const findEventByName = async (name: string) => {
    try {
        const events = await Event.findAll({ where: { name } })
        return events.map(event => event.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find events by name: ${errorMsg}`)
    }
}

export const findEventByCategoryId = async (category_id: string) => {
    try {
        const events = await Event.findAll({ where: { category_id } })
        return events.map(event => event.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find events by category ID: ${errorMsg}`)
    }
}

export const findEventByStatus = async (status: typeof EVENT_STATUS) => {
    try {
        const events = await Event.findAll({ where: { status } })
        return events.map(event => event.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find events by status: ${errorMsg}`)
    }
}

export const updateEventById = async (id: string, updateData: EventUpdateData) => {
    try {
        const [updatedRows] = await Event.update(updateData, { where: { _id: id } })
        return updatedRows > 0 ? updatedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update event: ${errorMsg}`)
    }
}


export const deleteEventById = async (id: string) => {
    try {
        const deletedRows = await Event.destroy({ where: { _id: id } })
        return deletedRows > 0 ? deletedRows : null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete event: ${errorMsg}`)
    }
}
export const findAllEvents = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit
    try {
        const events = await Event.findAll({
            order: [["_id", "DESC"]],
            limit,
            offset,
        })
        return events.map(event => event.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to list events: ${errorMsg}`)
    }
}

export const countEvents = async () => {
    try {
        return await Event.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count events: ${errorMsg}`)
    }
}

export const findEventByPinCode = async (pin_code: string) => {
    try {
        const event = await Event.findOne({ where: { pin_code } })
        return event?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find event by pin code: ${errorMsg}`)
    }
}

export const findNearbyEvents = async (lat: number, lng: number, limit: number = 5) => {
    try {
        // Simple squared distance ordering (sufficient for nearest-neighbor ranking)
        const distanceExpr = `( (lat - ${lat})*(lat - ${lat}) + (lng - ${lng})*(lng - ${lng}) )`
        const events = await Event.findAll({
            attributes: {
                include: [[literal(distanceExpr), 'distance']],
            },
            order: [literal('distance ASC')],
            limit,
        })
        return events.map(event => event.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find nearby events: ${errorMsg}`)
    }
}


export const searchEvents = async (searchTerm: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const where = {
            [Op.or]: [
                { name: { [Op.iLike]: `%${searchTerm}%` } },
                { description: { [Op.iLike]: `%${searchTerm}%` } },
            ]
        }
        const [events, total] = await Promise.all([
            Event.findAll({
                where,
                order: [["_id", "DESC"]],
                limit,
                offset
            }),
            Event.count({ where })
        ])
        return {
            items: events.map(event => event.toJSON()),
            total,
            page,
            limit,
        }
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to search events: ${errorMsg}`)
    }
}