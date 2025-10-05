import * as checkinHistoryRepo from '@/db/checkin_history_repository'

export async function createCheckin(data) {
    return await checkinHistoryRepo.createCheckinHistory(data)
}

export async function getCheckinHistoryById(id) {
    return await checkinHistoryRepo.findCheckinHistoryById(id)
}

export async function getCheckinHistoryByRegistrationId(registrationId) {
    return await checkinHistoryRepo.findCheckinHistoryByRegistrationId(registrationId)
}

export async function getCheckinHistoryByEventId(eventId) {
    return await checkinHistoryRepo.findCheckinHistoryByEventId(eventId)
}

export async function getCheckinHistoryByEventAndRegistration(eventId, registrationId) {
    return await checkinHistoryRepo.findCheckinHistoryByEventAndRegistration(eventId, registrationId)
}

export async function getLatestCheckinByEventAndRegistration(eventId, registrationId) {
    return await checkinHistoryRepo.findLatestCheckinByEventAndRegistration(eventId, registrationId)
}

export async function getCheckinHistoryByType(checkinType) {
    return await checkinHistoryRepo.findCheckinHistoryByType(checkinType)
}

export async function getCheckinHistoryByDateRange(startDate, endDate, eventId = null) {
    return await checkinHistoryRepo.findCheckinHistoryByDateRange(startDate, endDate, eventId)
}

export async function getAllCheckinHistory(page = 1, limit = 20) {
    return await checkinHistoryRepo.findAllCheckinHistory(page, limit)
}

export async function countCheckinHistory() {
    return await checkinHistoryRepo.countCheckinHistory()
}

export async function countCheckinHistoryByEventId(eventId) {
    return await checkinHistoryRepo.countCheckinHistoryByEventId(eventId)
}

export async function countCheckinHistoryByRegistrationId(registrationId) {
    return await checkinHistoryRepo.countCheckinHistoryByRegistrationId(registrationId)
}

export async function countUniqueCheckinsForEvent(eventId) {
    return await checkinHistoryRepo.countUniqueCheckinsForEvent(eventId)
}

export async function hasUserCheckedIn(eventId, registrationId) {
    return await checkinHistoryRepo.hasUserCheckedIn(eventId, registrationId)
}

export async function updateCheckinHistory(id, updateData) {
    const updated = await checkinHistoryRepo.updateCheckinHistoryById(id, updateData)
    if (!updated) {
        return null
    }
    return await checkinHistoryRepo.findCheckinHistoryById(id)
}

export async function deleteCheckinHistory(id) {
    return await checkinHistoryRepo.deleteCheckinHistoryById(id)
}

export async function deleteCheckinHistoryByEventId(eventId) {
    return await checkinHistoryRepo.deleteCheckinHistoryByEventId(eventId)
}

export async function deleteCheckinHistoryByRegistrationId(registrationId) {
    return await checkinHistoryRepo.deleteCheckinHistoryByRegistrationId(registrationId)
}

export async function bulkCreateCheckinHistory(dataArray) {
    return await checkinHistoryRepo.bulkCreateCheckinHistory(dataArray)
}

