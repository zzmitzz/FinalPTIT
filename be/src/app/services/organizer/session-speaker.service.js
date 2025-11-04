import * as sessionSpeakerRepo from '@/db/session_speaker_repository'

export async function addSpeakerToSession(data) {
    return await sessionSpeakerRepo.createSessionSpeaker(data)
}

export async function getSessionSpeakerById(id) {
    return await sessionSpeakerRepo.findSessionSpeakerById(id)
}

export async function getSessionSpeakerByIds(sessionId, speakerId) {
    return await sessionSpeakerRepo.findSessionSpeakerByIds(sessionId, speakerId)
}

export async function getSpeakersBySessionId(sessionId) {
    return await sessionSpeakerRepo.findSpeakersBySessionId(sessionId)
}

export async function getSessionsBySpeakerId(speakerId) {
    return await sessionSpeakerRepo.findSessionsBySpeakerId(speakerId)
}

export async function updateSessionSpeaker(id, updateData) {
    const updated = await sessionSpeakerRepo.updateSessionSpeakerById(id, updateData)
    if (!updated) {
        return null
    }
    return await sessionSpeakerRepo.findSessionSpeakerById(id)
}

export async function updateSessionSpeakerByIds(sessionId, speakerId, updateData) {
    const updated = await sessionSpeakerRepo.updateSessionSpeakerByIds(sessionId, speakerId, updateData)
    if (!updated) {
        return null
    }
    return await sessionSpeakerRepo.findSessionSpeakerByIds(sessionId, speakerId)
}

export async function removeSpeakerFromSession(sessionId, speakerId) {
    return await sessionSpeakerRepo.deleteSessionSpeakerByIds(sessionId, speakerId)
}

export async function deleteSessionSpeaker(id) {
    return await sessionSpeakerRepo.deleteSessionSpeakerById(id)
}

export async function countSpeakersBySessionId(sessionId) {
    const speakers = await sessionSpeakerRepo.findSpeakersBySessionId(sessionId)
    return speakers.length
}

