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
    findEventsByOrganizerGroupedByDate,
} from '../../../db/event_repository'
import * as speakerService from './speaker.service'

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

export const listEvents = async (page = 1, limit = 10, organizerId = null) => {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    const [items, total] = await Promise.all([
        findAllEvents(normalizedPage, normalizedLimit, organizerId),
        countEvents(organizerId),
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

export const searchEvents = async (searchTerm, page = 1, limit = 10, organizerId = null) => {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    return await searchEventsInRepo(searchTerm ?? '', normalizedPage, normalizedLimit, organizerId)
}

export const getOrganizerEventsGroupedByDate = async (organizerId) => {
    return await findEventsByOrganizerGroupedByDate(organizerId)
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

export const createSpeakersForEvent = async (eventId, speakersData) => {
    const createdSpeakers = []
    
    for (const speakerData of speakersData) {
        const { photo_url, ...speakerFields } = speakerData
        
        // Save photo if provided
        let savedPhotoUrl = ''
        if (photo_url instanceof FileUpload) {
            savedPhotoUrl = photo_url.save()
        } else if (typeof photo_url === 'string' && photo_url.trim()) {
            savedPhotoUrl = photo_url
        }
        
        const speakerPayload = {
            ...speakerFields,
            event_id: eventId,
            photo_url: savedPhotoUrl || null,
        }
        
        const speaker = await speakerService.createSpeaker(speakerPayload)
        createdSpeakers.push(speaker)
    }
    
    return createdSpeakers
}

