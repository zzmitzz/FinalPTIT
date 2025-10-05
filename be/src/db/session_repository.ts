import Session from '../model/session'
import { Op } from 'sequelize'

interface SessionData {
    event_id: string
    title: string
    description?: string
    start_time: Date
    end_time: Date
    place: string
    capacity?: number
    max_waitlist?: number
    is_active?: boolean
    session_type?: string
    prerequisites?: string
    tags?: string[]
}

interface SessionUpdateData extends Partial<SessionData> {}

// Create a new session
export const createSession = async (sessionData: SessionData) => {
    try {
        const newSession = await Session.create(sessionData as any)
        return newSession.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create session: ${errorMsg}`)
    }
}

// Find session by ID
export const findSessionById = async (id: number) => {
    try {
        const session = await Session.findByPk(id)
        return session?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find session by ID: ${errorMsg}`)
    }
}

// Find sessions by event ID
export const findSessionsByEventId = async (eventId: string) => {
    try {
        const sessions = await Session.findAll({
            where: { event_id: eventId },
            order: [['start_time', 'ASC']]
        })
        return sessions.map(session => session.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find sessions by event ID: ${errorMsg}`)
    }
}

// Get all sessions with pagination
export const findAllSessions = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const sessions = await Session.findAll({
            order: [['start_time', 'ASC']],
            limit,
            offset
        })
        return sessions.map(session => session.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch sessions: ${errorMsg}`)
    }
}

// Get total count of sessions
export const countSessions = async () => {
    try {
        return await Session.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count sessions: ${errorMsg}`)
    }
}

// Update session by ID
export const updateSessionById = async (id: number, updateData: SessionUpdateData) => {
    try {
        if (Object.keys(updateData).length === 0) {
            throw new Error('No fields to update')
        }

        const [updatedRows] = await Session.update(updateData, {
            where: { id }
        })

        if (updatedRows === 0) {
            return null
        }

        return await findSessionById(id)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update session: ${errorMsg}`)
    }
}

// Delete session by ID
export const deleteSessionById = async (id: number) => {
    try {
        const session = await Session.findByPk(id)
        if (!session) return null

        await session.destroy()
        return session.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete session: ${errorMsg}`)
    }
}

// Search sessions by title, description, or tags
export const searchSessions = async (searchTerm: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const sessions = await Session.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${searchTerm}%` } },
                    { description: { [Op.iLike]: `%${searchTerm}%` } },
                    { tags: { [Op.contains]: [searchTerm] } }
                ]
            },
            order: [['start_time', 'ASC']],
            limit,
            offset
        })
        return sessions.map(session => session.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to search sessions: ${errorMsg}`)
    }
}

// Find sessions by type
export const findSessionsByType = async (sessionType: string) => {
    try {
        const sessions = await Session.findAll({
            where: { session_type: sessionType },
            order: [['start_time', 'ASC']]
        })
        return sessions.map(session => session.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find sessions by type: ${errorMsg}`)
    }
}

// Find active sessions
export const findActiveSessions = async () => {
    try {
        const sessions = await Session.findAll({
            where: { is_active: true },
            order: [['start_time', 'ASC']]
        })
        return sessions.map(session => session.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find active sessions: ${errorMsg}`)
    }
}

// Find sessions by date range
export const findSessionsByDateRange = async (startDate: Date, endDate: Date) => {
    try {
        const sessions = await Session.findAll({
            where: {
                start_time: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['start_time', 'ASC']]
        })
        return sessions.map(session => session.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find sessions by date range: ${errorMsg}`)
    }
}

// Find sessions by tags
export const findSessionsByTags = async (tags: string[]) => {
    try {
        const sessions = await Session.findAll({
            where: {
                tags: { [Op.overlap]: tags }
            },
            order: [['start_time', 'ASC']]
        })
        return sessions.map(session => session.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find sessions by tags: ${errorMsg}`)
    }
}
