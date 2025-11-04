import * as sessionRepo from '@/db/session_repository'

export async function createSession(data) {
    return await sessionRepo.createSession(data)
}

export async function getSessionById(id) {
    return await sessionRepo.findSessionById(id)
}

export async function getSessionsByEventId(eventId) {
    return await sessionRepo.findSessionsByEventId(eventId)
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
    const updated = await sessionRepo.updateSessionById(id, updateData)
    if (!updated) {
        return null
    }
    return await sessionRepo.findSessionById(id)
}

export async function deleteSession(id) {
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

