import SessionSpeaker from '../model/session_speaker'
import { Op } from 'sequelize'

interface SessionSpeakerData {
    session_id: number
    speaker_id: number
    role?: string
    speaking_order?: number
    speaking_duration_minutes?: number
    is_confirmed?: boolean
    notes?: string
}

interface SessionSpeakerUpdateData extends Partial<SessionSpeakerData> {}

// Create a new session-speaker relationship
export const createSessionSpeaker = async (sessionSpeakerData: SessionSpeakerData) => {
    try {
        const newSessionSpeaker = await SessionSpeaker.create(sessionSpeakerData as any)
        return newSessionSpeaker.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create session-speaker relationship: ${errorMsg}`)
    }
}

// Find session-speaker relationship by ID
export const findSessionSpeakerById = async (id: number) => {
    try {
        const sessionSpeaker = await SessionSpeaker.findByPk(id)
        return sessionSpeaker?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find session-speaker by ID: ${errorMsg}`)
    }
}

// Return speaker details (join speakers table) for a session
export const findSpeakersBySessionId = async (sessionId: number) => {
    try {
        const sessionSpeakers = await SessionSpeaker.findAll({
            where: { session_id: sessionId },
            include: [{ model: (await import('../model/speaker')).default, as: 'speaker' }],
            order: [['speaking_order', 'ASC'], ['id', 'ASC']]
        })
        // Map to speaker details
        return sessionSpeakers.map(ss => {
            const raw = ss.toJSON()
            return raw.speaker || { id: raw.speaker_id }
        })
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find speakers by session ID: ${errorMsg}`)
    }
}

// Find sessions for a specific speaker
export const findSessionsBySpeakerId = async (speakerId: number) => {
    try {
        const sessionSpeakers = await SessionSpeaker.findAll({
            where: { speaker_id: speakerId },
            order: [['id', 'DESC']]
        })
        return sessionSpeakers.map(ss => ss.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find sessions by speaker ID: ${errorMsg}`)
    }
}

// Find specific session-speaker relationship
export const findSessionSpeakerByIds = async (sessionId: number, speakerId: number) => {
    try {
        const sessionSpeaker = await SessionSpeaker.findOne({
            where: { 
                session_id: sessionId,
                speaker_id: speakerId 
            }
        })
        return sessionSpeaker?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find session-speaker relationship: ${errorMsg}`)
    }
}

// Get all session-speaker relationships with pagination
export const findAllSessionSpeakers = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const sessionSpeakers = await SessionSpeaker.findAll({
            order: [['id', 'DESC']],
            limit,
            offset
        })
        return sessionSpeakers.map(ss => ss.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch session-speakers: ${errorMsg}`)
    }
}

// Get total count of session-speaker relationships
export const countSessionSpeakers = async () => {
    try {
        return await SessionSpeaker.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count session-speakers: ${errorMsg}`)
    }
}

// Update session-speaker relationship by ID
export const updateSessionSpeakerById = async (id: number, updateData: SessionSpeakerUpdateData) => {
    try {
        if (Object.keys(updateData).length === 0) {
            throw new Error('No fields to update')
        }

        const [updatedRows] = await SessionSpeaker.update(updateData, {
            where: { id }
        })

        if (updatedRows === 0) {
            return null
        }

        return await findSessionSpeakerById(id)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update session-speaker: ${errorMsg}`)
    }
}

// Update session-speaker relationship by session and speaker IDs
export const updateSessionSpeakerByIds = async (sessionId: number, speakerId: number, updateData: SessionSpeakerUpdateData) => {
    try {
        if (Object.keys(updateData).length === 0) {
            throw new Error('No fields to update')
        }

        const [updatedRows] = await SessionSpeaker.update(updateData, {
            where: {
                session_id: sessionId,
                speaker_id: speakerId
            }
        })

        if (updatedRows === 0) {
            return null
        }

        return await findSessionSpeakerByIds(sessionId, speakerId)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update session-speaker by IDs: ${errorMsg}`)
    }
}

// Delete session-speaker relationship by ID
export const deleteSessionSpeakerById = async (id: number) => {
    try {
        const sessionSpeaker = await SessionSpeaker.findByPk(id)
        if (!sessionSpeaker) return null

        await sessionSpeaker.destroy()
        return sessionSpeaker.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete session-speaker: ${errorMsg}`)
    }
}

// Delete session-speaker relationship by session and speaker IDs
export const deleteSessionSpeakerByIds = async (sessionId: number, speakerId: number) => {
    try {
        const sessionSpeaker = await SessionSpeaker.findOne({
            where: { 
                session_id: sessionId,
                speaker_id: speakerId 
            }
        })
        
        if (!sessionSpeaker) return null

        await sessionSpeaker.destroy()
        return sessionSpeaker.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete session-speaker by IDs: ${errorMsg}`)
    }
}

// Find session-speakers by role
export const findSessionSpeakersByRole = async (role: string) => {
    try {
        const sessionSpeakers = await SessionSpeaker.findAll({
            where: { role },
            order: [['id', 'DESC']]
        })
        return sessionSpeakers.map(ss => ss.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find session-speakers by role: ${errorMsg}`)
    }
}

// Find confirmed session-speakers
export const findConfirmedSessionSpeakers = async () => {
    try {
        const sessionSpeakers = await SessionSpeaker.findAll({
            where: { is_confirmed: true },
            order: [['id', 'DESC']]
        })
        return sessionSpeakers.map(ss => ss.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find confirmed session-speakers: ${errorMsg}`)
    }
}

// Update confirmation status
export const updateConfirmationStatus = async (id: number, isConfirmed: boolean) => {
    try {
        const [updatedRows] = await SessionSpeaker.update(
            { is_confirmed: isConfirmed },
            { where: { id } }
        )

        if (updatedRows === 0) {
            return null
        }

        return await findSessionSpeakerById(id)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update confirmation status: ${errorMsg}`)
    }
}

// Bulk create session-speakers
export const bulkCreateSessionSpeakers = async (sessionSpeakersData: SessionSpeakerData[]) => {
    try {
        const sessionSpeakers = await SessionSpeaker.bulkCreate(sessionSpeakersData as any[])
        return sessionSpeakers.map(ss => ss.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to bulk create session-speakers: ${errorMsg}`)
    }
}

// Delete all session-speaker relationships for a given session id
export const deleteSessionSpeakersBySessionId = async (sessionId: number) => {
    try {
        const deleted = await SessionSpeaker.destroy({ where: { session_id: sessionId } })
        return deleted
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete session-speakers for session ${sessionId}: ${errorMsg}`)
    }
}

// Delete all session-speaker relationships for a given speaker id
export const deleteSessionSpeakersBySpeakerId = async (speakerId: number) => {
    try {
        const deleted = await SessionSpeaker.destroy({ where: { speaker_id: speakerId } })
        return deleted
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete session-speakers for speaker ${speakerId}: ${errorMsg}`)
    }
}
