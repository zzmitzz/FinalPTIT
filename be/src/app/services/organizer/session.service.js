import * as sessionRepo from '@/db/session_repository'
import * as sessionSpeakerRepo from '@/db/session_speaker_repository'
import * as speakerRepo from '@/db/speaker_repository'

export async function createSession(data) {
    // create session and attach speakers if provided
    const session = await sessionRepo.createSession(data)
    if (data.speakers && Array.isArray(data.speakers) && session && session.id) {
        const speakersPayload = data.speakers.map((spId) => ({ session_id: session.id, speaker_id: spId }))
        try {
            await sessionSpeakerRepo.bulkCreateSessionSpeakers(speakersPayload)
        } catch (err) {
            // If speaker linking fails, log but don't fail session creation
            console.error('Failed to attach speakers to session', err)
        }
    }

    // return session enriched with speakers
    const speakers = await sessionSpeakerRepo.findSpeakersBySessionId(session.id)
    return { ...session, speakers }
}

export async function getSessionById(id) {
    const session = await sessionRepo.findSessionById(id)
    if (!session) return null

    try {
        const speakers = await sessionSpeakerRepo.findSpeakersBySessionId(session.id)
        return { ...session, speakers }
    } catch (err) {
        console.error('Failed to attach speakers to session', err)
        return session
    }
}

export async function getSessionsByEventId(eventId) {
    const sessions = await sessionRepo.findSessionsByEventId(eventId)
    // Attach speakers for each session
    try {
        const enriched = await Promise.all(sessions.map(async (s) => {
            const speakers = await (await import('@/db/session_speaker_repository')).findSpeakersBySessionId(s.id)
            return { ...s, speakers }
        }))
        return enriched
    } catch (err) {
        console.error('Failed to attach speakers to sessions', err)
        return sessions
    }
}

export async function getAllSessions(page = 1, limit = 10) {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    const [items, total] = await Promise.all([
        sessionRepo.findAllSessions(normalizedPage, normalizedLimit),
        sessionRepo.countSessions(),
    ])

    return {
        items,
        total,
        page: normalizedPage,
        limit: normalizedLimit,
    }
}

export async function updateSession(id, updateData) {
    const sid = Number(id)
    if (Number.isNaN(sid)) return null

    const existing = await sessionRepo.findSessionById(sid)
    if (!existing) return null

    const { speakers, ...sessionUpdates } = updateData || {}

    if (Object.prototype.hasOwnProperty.call(updateData || {}, 'speakers')) {
        const speakerIdsRaw = Array.isArray(speakers) ? speakers : []
        const speakerIds = [...new Set(speakerIdsRaw.map(Number).filter((n) => Number.isFinite(n) && n > 0))]

        // Validate that all provided speakers belong to the same event as the session
        if (speakerIds.length > 0) {
            const speakersInEvent = await speakerRepo.findSpeakersByIdsAndEventId(speakerIds, existing.event_id)
            if (speakersInEvent.length !== speakerIds.length) {
                const foundIds = new Set(speakersInEvent.map((s) => s.id))
                const invalidIds = speakerIds.filter((idVal) => !foundIds.has(idVal))
                const err = new Error(`Invalid speakers for this event: ${invalidIds.join(', ')}`)
                ;(err).status = 400
                throw err
            }
        }

        // Replace session-speaker relationships
        await sessionSpeakerRepo.deleteSessionSpeakersBySessionId(sid)
        if (speakerIds.length > 0) {
            const payload = speakerIds.map((spId) => ({ session_id: sid, speaker_id: spId }))
            await sessionSpeakerRepo.bulkCreateSessionSpeakers(payload)
        }
    }

    if (sessionUpdates && Object.keys(sessionUpdates).length > 0) {
        await sessionRepo.updateSessionById(sid, sessionUpdates)
    }

    return await getSessionById(sid)
}

export async function deleteSession(id) {
    // First remove any session-speaker relationships to avoid FK constraint errors
    try {
        const sid = Number(id)
        if (!Number.isNaN(sid)) {
            await sessionSpeakerRepo.deleteSessionSpeakersBySessionId(sid)
        }
    } catch (err) {
        // Log but continue to attempt session deletion — if this fails, higher layer will handle
        console.error('Failed to delete session-speakers before deleting session:', err)
    }

    return await sessionRepo.deleteSessionById(id)
}

export async function searchSessions(searchTerm, page = 1, limit = 10) {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    return await sessionRepo.searchSessions(searchTerm ?? '', normalizedPage, normalizedLimit)
}

export async function getSessionsByType(sessionType) {
    return await sessionRepo.findSessionsByType(sessionType)
}

export async function getActiveSessions() {
    return await sessionRepo.findActiveSessions()
}

export async function getSessionsByDateRange(startDate, endDate) {
    return await sessionRepo.findSessionsByDateRange(startDate, endDate)
}

export async function getSessionsByTags(tags) {
    return await sessionRepo.findSessionsByTags(tags)
}

export async function countSessionsByEventId(eventId) {
    const sessions = await sessionRepo.findSessionsByEventId(eventId)
    return sessions.length
}

