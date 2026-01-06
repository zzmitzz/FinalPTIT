import Event from '../model/event'
import OrganizerDetails from '../model/organizer_details'
import { Op, literal } from 'sequelize'
import { EVENT_STATUS, EVENT_STATE, EVENT_CATEGORY } from '../configs/constants'
import sequelize from '../configs/postgre_sql.js'

// Cache and check whether the Postgres unaccent extension is available
let hasUnaccentSupport: boolean | null = null
const checkUnaccentSupport = async (): Promise<boolean> => {
    if (hasUnaccentSupport !== null) return hasUnaccentSupport
    try {
        const [rows]: any = await sequelize.query("SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent') AS enabled")
        const enabled = rows?.[0]?.enabled ?? rows?.[0]?.exists ?? false
        hasUnaccentSupport = Boolean(enabled)
    } catch {
        hasUnaccentSupport = false
    }
    return hasUnaccentSupport
}


interface EventData {
    organizer_id: string
    name: string
    thumbnail: string
    logo?: string
    description?: string
    start_time: Date
    end_time: Date
    location: string,
    state?: typeof EVENT_STATE,
    status?: typeof EVENT_STATUS,
    lat: number
    lng: number
    category_id?: typeof EVENT_CATEGORY
    tags?: string[]
    capacity: number
}

interface EventUpdateData extends Partial<EventData> { }

export const createEvent = async (eventData: EventData) => {
    const { organizer_id, name, thumbnail, logo, description, start_time, end_time, location, lat, lng, capacity, tags, category_id } = eventData
    const status = EVENT_STATUS.WAITING
    const state = EVENT_STATE.PENDING
    const finalCategoryId = category_id || EVENT_CATEGORY.TECHNOLOGY
    const finalTags = tags || []
    try {
        const newEvent = await Event.create({
            organizer_id,
            name,
            thumbnail,
            logo,
            description,
            start_time,
            end_time,
            location,
            status,
            state,
            lat,
            lng,
            category_id: finalCategoryId,
            capacity,
            tags: finalTags
        })
        return newEvent
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create event: ${errorMsg}`)
    }
}

export const findEventById = async (id: string) => {
    try {
        console.log(id)
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
export const findAllEvents = async (page: number = 1, limit: number = 10, organizerId?: string, filterPublished: boolean = false) => {
    const offset = (page - 1) * limit
    try {
        const whereClause: any = {}
        if (organizerId) {
            whereClause.organizer_id = organizerId
        }
        // Filter by PUBLISHED status for public endpoints
        if (filterPublished) {
            whereClause.status = EVENT_STATUS.PUBLISHED
        }

        const events = await Event.findAll({
            where: whereClause,
            order: [["start_time", "ASC"], ["_id", "DESC"]],
            limit,
            offset,
        })
        return events.map(event => event.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to list events: ${errorMsg}`)
    }
}

export const countEvents = async (organizerId?: string) => {
    try {
        const whereClause: any = {}
        if (organizerId) {
            whereClause.organizer_id = organizerId
        }
        return await Event.count({ where: whereClause })
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
        const now = new Date()
        const distanceExpr = `( (lat - ${lat})*(lat - ${lat}) + (lng - ${lng})*(lng - ${lng}) )`
        const events = await Event.findAll({
            where: {
                status: EVENT_STATUS.PUBLISHED,
                end_time: {
                    [Op.gte]: now
                },
                start_time: {
                    [Op.lte]: now
                }
            },
            attributes: {
                include: [[literal(distanceExpr), 'distance']],
            },
            order: [literal('distance ASC')],
            limit,
        })


        const eventsWithOrganizerName = await Promise.all(
            events.map(async (event) => {
                const eventData = event.toJSON() as any
                const organizerId = eventData.organizer_id

                const organizerDetail = await OrganizerDetails.findOne({
                    where: { _id: organizerId },
                    attributes: ['organization_name']
                })

                const organizerName = organizerDetail?.toJSON()?.organization_name || 'Unknown Organizer'

                return {
                    ...eventData,
                    organizer_name: organizerName
                }
            })
        )

        return eventsWithOrganizerName
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find nearby events: ${errorMsg}`)
    }
}


export const searchEvents = async (searchTerm: string, page: number = 1, limit: number = 10, organizerId?: string, filterPublished: boolean = false) => {
    const offset = (page - 1) * limit
    try {
        // Normalize and escape the search term
        const term = (searchTerm ?? '').trim()

        // Escape special LIKE characters: %, _, and \
        const escaped = term.replace(/[\\%_]/g, '\\$&')

        const likePattern = `%${escaped}%`

        const where: any = {
            [Op.or]: [
                { name: { [Op.iLike]: likePattern } },
                { description: { [Op.iLike]: likePattern } },
            ]
        }

        if (organizerId) {
            where.organizer_id = organizerId
        }

        // Filter by PUBLISHED status for public endpoints
        if (filterPublished) {
            where.status = EVENT_STATUS.PUBLISHED
        }

        console.log('where clause:', JSON.stringify(where, null, 2))

        const [events, total] = await Promise.all([
            Event.findAll({
                where,
                order: [["start_time", "ASC"], ["_id", "DESC"]],
                limit,
                offset
            }),
            Event.count({ where })
        ])
        console.log('events found:', events.length, 'total:', total)
        return {
            items: events.map(event => event.toJSON()),
            total,
            page,
            limit,
        }
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error('Search error:', errorMsg)
        throw new Error(`Failed to search events: ${errorMsg}`)
    }
}

export const findEventsByOrganizerGroupedByDate = async (organizerId: string) => {
    try {
        const events = await Event.findAll({
            where: { organizer_id: organizerId },
            order: [["start_time", "ASC"], ["_id", "DESC"]],
        })
        return events.map(event => event.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find events by organizer: ${errorMsg}`)
    }
}