import * as speakerRepo from '@/db/speaker_repository'

export async function createSpeaker(data) {
    return await speakerRepo.createSpeaker(data)
}

export async function getSpeakerById(id) {
    return await speakerRepo.findSpeakerById(id)
}

export async function getSpeakersByEventId(eventId) {
    return await speakerRepo.getSpeakersWithEvent(eventId)
}

export async function getAllSpeakers(page = 1, limit = 10) {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    const [items, total] = await Promise.all([
        speakerRepo.findAllSpeakers(normalizedPage, normalizedLimit),
        speakerRepo.countSpeakers(),
    ])

    return {
        items,
        total,
        page: normalizedPage,
        limit: normalizedLimit,
    }
}

export async function updateSpeaker(id, updateData) {
    const updated = await speakerRepo.updateSpeakerById(id, updateData)
    if (!updated) {
        return null
    }
    return await speakerRepo.findSpeakerById(id)
}

export async function deleteSpeaker(id) {
    return await speakerRepo.deleteSpeakerById(id)
}

export async function searchSpeakers(searchTerm, page = 1, limit = 10) {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    return await speakerRepo.searchSpeakers(searchTerm ?? '', normalizedPage, normalizedLimit)
}

export async function getKeynoteSpeakers() {
    return await speakerRepo.findKeynoteSpeakers()
}

export async function getActiveSpeakers() {
    return await speakerRepo.findActiveSpeakers()
}

export async function getSpeakersByExpertise(expertiseAreas) {
    return await speakerRepo.findSpeakersByExpertise(expertiseAreas)
}

export async function getSpeakersByOrganization(organization) {
    return await speakerRepo.findSpeakersByOrganization(organization)
}

export async function countSpeakersByEventId(eventId) {
    const speakers = await speakerRepo.getSpeakersWithEvent(eventId)
    return speakers.length
}

