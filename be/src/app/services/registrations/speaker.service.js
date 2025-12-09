import * as speakerRepo from '@/db/speaker_repository'
import * as sessionSpeakerRepo from '@/db/session_speaker_repository'
import Session from '@/model/session'

/**
 * Get speaker by ID with all properties
 * @param {number} speakerId - The speaker ID
 * @returns {Promise<Object|null>} Speaker object or null if not found
 */
export async function getSpeakerById(speakerId) {
    return await speakerRepo.findSpeakerById(speakerId)
}

/**
 * Get all sessions that belong to a speaker by speaker ID
 * @param {number} speakerId - The speaker ID
 * @returns {Promise<Array>} Array of sessions with details
 */
export async function getSessionsBySpeakerId(speakerId) {
    try {
        // Get all session-speaker relationships for this speaker
        const sessionSpeakers = await sessionSpeakerRepo.findSessionsBySpeakerId(speakerId)

        if (!sessionSpeakers || sessionSpeakers.length === 0) {
            return []
        }

        // Get session IDs
        const sessionIds = sessionSpeakers.map(ss => ss.session_id)

        // Fetch full session details
        const sessions = await Session.findAll({
            where: {
                id: sessionIds
            },
            order: [['start_time', 'ASC']]
        })

        // Map sessions with speaker role information
        const sessionsWithRole = sessions.map(session => {
            const sessionData = session.toJSON()
            const speakerRole = sessionSpeakers.find(ss => ss.session_id === sessionData.id)

            return {
                ...sessionData,
                speaker_role: speakerRole?.role || 'speaker',
                speaking_order: speakerRole?.speaking_order || null,
                speaking_duration_minutes: speakerRole?.speaking_duration_minutes || null
            }
        })

        return sessionsWithRole
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to fetch sessions for speaker: ${errorMsg}`)
    }
}
