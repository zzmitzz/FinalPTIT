import * as resourceRepo from '@/db/resource_repository'

export async function createResource(data) {
    return await resourceRepo.createResource(data)
}

export async function getResourceById(id) {
    return await resourceRepo.findResourceById(id)
}

export async function getResourcesBySessionId(sessionId) {
    return await resourceRepo.findResourcesBySessionId(sessionId)
}

export async function getResourcesByEventId(eventId) {
    return await resourceRepo.findResourcesByEventId(eventId)
}

export async function getAllResources(page = 1, limit = 10) {
    return await resourceRepo.findAllResources(page, limit)
}

export async function countResources() {
    return await resourceRepo.countResources()
}

export async function updateResource(id, updateData) {
    return await resourceRepo.updateResourceById(id, updateData)
}

export async function deleteResource(id) {
    return await resourceRepo.deleteResourceById(id)
}

export async function searchResources(searchTerm, page = 1, limit = 10) {
    return await resourceRepo.searchResources(searchTerm, page, limit)
}

export async function getResourcesByType(resourceType) {
    return await resourceRepo.findResourcesByType(resourceType)
}

export async function getPublicResources(page = 1, limit = 10) {
    return await resourceRepo.findPublicResources(page, limit)
}

export async function getActiveResources() {
    return await resourceRepo.findActiveResources()
}

export async function getResourcesByTags(tags) {
    return await resourceRepo.findResourcesByTags(tags)
}

export async function incrementResourceDownloadCount(id) {
    return await resourceRepo.incrementDownloadCount(id)
}

export async function getMostDownloadedResources(limit = 10) {
    return await resourceRepo.getMostDownloadedResources(limit)
}

