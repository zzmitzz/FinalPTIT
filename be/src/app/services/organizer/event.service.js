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
import { deleteSpeakersByEventId, getSpeakersWithEvent } from '../../../db/speaker_repository'
import { deleteSessionsByEventId, findSessionsByEventId } from '../../../db/session_repository'
import { deleteSessionSpeakersBySessionId, deleteSessionSpeakersBySpeakerId } from '../../../db/session_speaker_repository'
import { deleteSessionRegistrationsBySessionId } from '../../../db/session_registration_repository'
import { deletePlacesByEventId } from '../../../db/place_repository'
import { deleteFormByEventId } from '../../../db/form_repository'
import { deleteResourcesByEventId } from '../../../db/resource_repository'
import { deleteCheckinHistoryByEventId } from '../../../db/checkin_history_repository'
import { deleteRegistrationResponsesByEventId } from '../../../db/registration_responses_repository'
import { deleteRegistrationRegisterEventByEventId } from '../../../db/registration_register_event_repository'
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

export const listEvents = async (page = 1, limit = 10, organizerId = null, filterPublished = false) => {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    const [items] = await Promise.all([
        findAllEvents(normalizedPage, normalizedLimit, organizerId, filterPublished),
    ])

    return {
        items,
        page: normalizedPage,
        limit: normalizedLimit,
    }
}

export const updateEvent = async (id, updateData) => {
    return await updateEventById(id, updateData)
}

export const deleteEvent = async (id) => {
    // Delete all related records first to avoid foreign key constraint violations
    // Order matters: delete dependent records before the main event
    
    // 1. Get all sessions and speakers for this event
    const sessions = await findSessionsByEventId(id)
    const speakers = await getSpeakersWithEvent(id)
    
    // 2. Delete session registrations for all sessions
    for (const session of sessions) {
        await deleteSessionRegistrationsBySessionId(session.id)
    }
    
    // 3. Delete session-speaker relationships (can be done by session or speaker)
    for (const session of sessions) {
        await deleteSessionSpeakersBySessionId(session.id)
    }
    
    // 4. Now safe to delete sessions and speakers
    await deleteSessionsByEventId(id)
    await deleteSpeakersByEventId(id)
    
    // 5. Delete other related records
    await deleteCheckinHistoryByEventId(id)          // Delete check-in history
    await deleteRegistrationResponsesByEventId(id)   // Delete registration responses
    await deleteRegistrationRegisterEventByEventId(id) // Delete event registrations
    await deleteResourcesByEventId(id)               // Delete resources
    await deletePlacesByEventId(id)                  // Delete places/rooms
    await deleteFormByEventId(id)                    // Delete form (and its fields via cascade)
    
    // 6. Finally delete the event itself
    return await deleteEventById(id)
}

export const searchEvents = async (searchTerm, page = 1, limit = 10, organizerId = null, filterPublished = false) => {
    const normalizedPage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1
    const normalizedLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10

    return await searchEventsInRepo(searchTerm ?? '', normalizedPage, normalizedLimit, organizerId, filterPublished)
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

