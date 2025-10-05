import * as organizerDetailsRepo from '@/db/organizer_details_repository'

export async function createOrganizerDetails(data) {
    return await organizerDetailsRepo.createOrganizerDetails(data)
}

export async function getOrganizerDetailsByOrganizerId(organizerId) {
    return await organizerDetailsRepo.findOrganizerDetailsByOrganizerId(organizerId)
}

export async function getAllOrganizerDetails(page = 1, limit = 20) {
    return await organizerDetailsRepo.findAllOrganizerDetails(page, limit)
}

export async function countOrganizerDetails() {
    return await organizerDetailsRepo.countOrganizerDetails()
}

export async function updateOrganizerDetails(organizerId, updateData) {
    const updated = await organizerDetailsRepo.updateOrganizerDetailsByOrganizerId(organizerId, updateData)
    if (!updated) {
        return null
    }
    return await organizerDetailsRepo.findOrganizerDetailsByOrganizerId(organizerId)
}

export async function deleteOrganizerDetails(organizerId) {
    return await organizerDetailsRepo.deleteOrganizerDetailsByOrganizerId(organizerId)
}

export async function organizerDetailsExists(organizerId) {
    return await organizerDetailsRepo.organizerDetailsExists(organizerId)
}

export async function upsertOrganizerDetails(data) {
    return await organizerDetailsRepo.upsertOrganizerDetails(data)
}

