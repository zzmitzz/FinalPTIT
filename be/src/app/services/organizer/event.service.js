import { FileUpload } from '@/utils/classes'
import {
    createEvent as createEventInRepo,
    findEventById,
    findEventByPinCode,
    findAllEvents,
    countEvents,
    updateEventById,
    deleteEventById,
    searchEvents as searchEventsInRepo,
    findNearbyEvents,
} from '../../../db/event_repository'

export const createEvent = async (eventData) => {
    const { thumbnail, logo } = eventData

    // Save thumbnail if a FileUpload instance; otherwise keep as-is
    const savedThumbnail = thumbnail instanceof FileUpload ? thumbnail.save() : thumbnail
    eventData.thumbnail = savedThumbnail

    // Normalize and save logo(s). DB expects a string path, so pick the first saved/valid path.
    let logos = []
    if (Array.isArray(logo)) {
        logos = logo
    } else if (logo) {
        logos = [logo]
    }

    const savedLogos = logos
        .filter((img) => img instanceof FileUpload)
        .map((img) => img.save())
        .concat(
            logos
                .filter((img) => !(img instanceof FileUpload) && typeof img === 'string' && img.trim())
        )

    eventData.logo = savedLogos[0] || ''

    return await createEventInRepo(eventData)
}

export const getEventById = async (id) => {
    return await findEventById(id)
}

export const getEventByPinCode = async (pinCode) => {
    return await findEventByPinCode(pinCode)
}

export const listEvents = async (page = 1, limit = 10) => {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    const [items, total] = await Promise.all([
        findAllEvents(normalizedPage, normalizedLimit),
        countEvents(),
    ])

    return {
        items,
        total,
        page: normalizedPage,
        limit: normalizedLimit,
    }
}

export const updateEvent = async (id, updateData) => {
    return await updateEventById(id, updateData)
}

export const deleteEvent = async (id) => {
    return await deleteEventById(id)
}

export const searchEvents = async (searchTerm, page = 1, limit = 10) => {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    return await searchEventsInRepo(searchTerm ?? '', normalizedPage, normalizedLimit)
}

export const getNearbyEvents = async (lat, lng, limit = 5) => {
    const parsedLat = Number(lat)
    const parsedLng = Number(lng)
    const parsedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 5

    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
        throw new Error('Invalid lat/lng provided')
    }

    return await findNearbyEvents(parsedLat, parsedLng, parsedLimit)
}

