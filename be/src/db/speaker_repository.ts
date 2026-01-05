import Speaker from '../model/speaker'
import { Op } from 'sequelize'

interface SpeakerData {
    full_name: string
    bio?: string
    email: string
    phone?: string
    event_id: string
    organization?: string
    photo_url?: string
    title?: string
    linkedin_url?: string
    expertise_areas?: string[]
    years_experience?: number
    is_keynote_speaker?: boolean
    is_active?: boolean
}

interface SpeakerUpdateData extends Partial<SpeakerData> {}


export const getSpeakersWithEvent = async (eventId: string) => {
    try {
        const speakers = await Speaker.findAll({
            where: { event_id: eventId },
            order: [['full_name', 'ASC']]
        })
        return speakers.map(speaker => speaker.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch speakers: ${errorMsg}`)
    }
}

export const findSpeakersByIdsAndEventId = async (ids: number[], eventId: string) => {
    try {
        if (!Array.isArray(ids) || ids.length === 0) return []
        const speakers = await Speaker.findAll({
            where: {
                id: { [Op.in]: ids },
                event_id: eventId,
            },
        })
        return speakers.map(speaker => speaker.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch speakers by ids and event: ${errorMsg}`)
    }
}

// Create a new speaker
export const createSpeaker = async (speakerData: SpeakerData) => {
    try {
        const newSpeaker = await Speaker.create(speakerData as any)
        return newSpeaker.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to create speaker: ${errorMsg}`)
    }
}

// Find speaker by ID
export const findSpeakerById = async (id: number) => {
    try {
        const speaker = await Speaker.findByPk(id)
        return speaker?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find speaker by ID: ${errorMsg}`)
    }
}

// Find speaker by email
export const findSpeakerByEmail = async (email: string) => {
    try {
        const speaker = await Speaker.findOne({ where: { email } })
        return speaker?.toJSON() || null
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find speaker by email: ${errorMsg}`)
    }
}

// Get all speakers with pagination
export const findAllSpeakers = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const speakers = await Speaker.findAll({
            order: [['full_name', 'ASC']],
            limit,
            offset
        })
        return speakers.map(speaker => speaker.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch speakers: ${errorMsg}`)
    }
}

// Get total count of speakers
export const countSpeakers = async () => {
    try {
        return await Speaker.count()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to count speakers: ${errorMsg}`)
    }
}




// Update speaker by ID
export const updateSpeakerById = async (id: number, updateData: SpeakerUpdateData) => {
    try {
        if (Object.keys(updateData).length === 0) {
            throw new Error('No fields to update')
        }

        const [updatedRows] = await Speaker.update(updateData, {
            where: { id }
        })

        if (updatedRows === 0) {
            return null
        }

        return await findSpeakerById(id)
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to update speaker: ${errorMsg}`)
    }
}

// Delete speaker by ID
export const deleteSpeakerById = async (id: number) => {
    try {
        const speaker = await Speaker.findByPk(id)
        if (!speaker) return null

        await speaker.destroy()
        return speaker.toJSON()
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete speaker: ${errorMsg}`)
    }
}

// Delete all speakers by event ID
export const deleteSpeakersByEventId = async (eventId: string) => {
    try {
        const deletedCount = await Speaker.destroy({
            where: { event_id: eventId }
        })
        return deletedCount
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to delete speakers by event ID: ${errorMsg}`)
    }
}

// Check if email exists
export const speakerEmailExists = async (email: string, excludeId: number | null = null) => {
    try {
        const whereClause: any = { email }
        if (excludeId) {
            whereClause.id = { [Op.ne]: excludeId }
        }

        const count = await Speaker.count({ where: whereClause })
        return count > 0
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to check email existence: ${errorMsg}`)
    }
}

// Search speakers by name, organization, or expertise
export const searchSpeakers = async (searchTerm: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit

    try {
        const speakers = await Speaker.findAll({
            where: {
                [Op.or]: [
                    { full_name: { [Op.iLike]: `%${searchTerm}%` } },
                    { organization: { [Op.iLike]: `%${searchTerm}%` } },
                    { title: { [Op.iLike]: `%${searchTerm}%` } },
                    { expertise_areas: { [Op.contains]: [searchTerm] } }
                ]
            },
            order: [['full_name', 'ASC']],
            limit,
            offset
        })
        return speakers.map(speaker => speaker.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to search speakers: ${errorMsg}`)
    }
}

// Find keynote speakers
export const findKeynoteSpeakers = async () => {
    try {
        const speakers = await Speaker.findAll({
            where: { 
                is_keynote_speaker: true,
                is_active: true 
            },
            order: [['full_name', 'ASC']]
        })
        return speakers.map(speaker => speaker.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find keynote speakers: ${errorMsg}`)
    }
}

// Find active speakers
export const findActiveSpeakers = async () => {
    try {
        const speakers = await Speaker.findAll({
            where: { is_active: true },
            order: [['full_name', 'ASC']]
        })
        return speakers.map(speaker => speaker.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find active speakers: ${errorMsg}`)
    }
}

// Find speakers by expertise areas
export const findSpeakersByExpertise = async (expertiseAreas: string[]) => {
    try {
        const speakers = await Speaker.findAll({
            where: {
                expertise_areas: { [Op.overlap]: expertiseAreas },
                is_active: true
            },
            order: [['full_name', 'ASC']]
        })
        return speakers.map(speaker => speaker.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find speakers by expertise: ${errorMsg}`)
    }
}

// Find speakers by organization
export const findSpeakersByOrganization = async (organization: string) => {
    try {
        const speakers = await Speaker.findAll({
            where: { 
                organization: { [Op.iLike]: `%${organization}%` },
                is_active: true 
            },
            order: [['full_name', 'ASC']]
        })
        return speakers.map(speaker => speaker.toJSON())
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to find speakers by organization: ${errorMsg}`)
    }
}
