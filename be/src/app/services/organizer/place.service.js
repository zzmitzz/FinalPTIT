import * as placeRepo from '@/db/place_repository'
import * as eventRepo from '@/db/event_repository'

export async function createPlace(data) {
    // Ensure event exists
    const event = await eventRepo.findEventById(data.event_id)
    if (!event) return null
    return await placeRepo.createPlace(data)
}

export async function getPlacesByEventId(eventId) {
    return await placeRepo.findPlacesByEventId(eventId)
}

export async function getPlaceById(id) {
    return await placeRepo.findPlaceById(id)
}

export async function deletePlace(id) {
    return await placeRepo.deletePlaceById(id)
}
