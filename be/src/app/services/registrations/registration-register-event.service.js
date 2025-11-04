import * as registrationRegisterEventRepo from '@/db/registration_register_event_repository'
import * as eventRepo from '@/db/event_repository'
import * as registrationRepo from '@/db/registration_repository'
import { abort } from '@/utils/helpers'

/**
 * Register a user for an event
 */
export async function registerUserForEvent(eventId, registrationId) {
    // Verify event exists
    const event = await eventRepo.findEventById(eventId)
    if (!event) {
        abort(404, 'Không tìm thấy sự kiện.')
    }

    // Verify registration exists
    const registration = await registrationRepo.findRegistrationById(registrationId)
    if (!registration) {
        abort(404, 'Không tìm thấy người dùng.')
    }

    // Check if already registered
    const existing = await registrationRegisterEventRepo.findRegistrationRegisterEventByCompositeKey(
        eventId,
        registrationId
    )

    if (existing) {
        if (existing.is_registered) {
            abort(409, 'Người dùng đã đăng ký sự kiện này.')
        }
        // Update existing record to registered
        await registrationRegisterEventRepo.updateRegistrationRegisterEventByCompositeKey(
            eventId,
            registrationId,
            { is_registered: true }
        )
        return await registrationRegisterEventRepo.findRegistrationRegisterEventByCompositeKey(
            eventId,
            registrationId
        )
    }

    // Create new registration
    return await registrationRegisterEventRepo.createRegistrationRegisterEvent({
        event_id: eventId,
        registration_id: registrationId,
        is_registered: true
    })
}

/**
 * Unregister a user from an event
 */
export async function unregisterUserFromEvent(eventId, registrationId) {
    const existing = await registrationRegisterEventRepo.findRegistrationRegisterEventByCompositeKey(
        eventId,
        registrationId
    )

    if (!existing) {
        abort(404, 'Không tìm thấy đăng ký sự kiện.')
    }

    if (!existing.is_registered) {
        abort(400, 'Người dùng chưa đăng ký sự kiện này.')
    }

    // Update to unregistered
    await registrationRegisterEventRepo.updateRegistrationRegisterEventByCompositeKey(
        eventId,
        registrationId,
        { is_registered: false }
    )

    return await registrationRegisterEventRepo.findRegistrationRegisterEventByCompositeKey(
        eventId,
        registrationId
    )
}

/**
 * Get registration status for a specific event and user
 */
export async function getRegistrationStatus(eventId, registrationId) {
    const registerEvent = await registrationRegisterEventRepo.findRegistrationRegisterEventByCompositeKey(
        eventId,
        registrationId
    )

    if (!registerEvent) {
        return {
            event_id: eventId,
            registration_id: registrationId,
            is_registered: false,
            registered_at: null
        }
    }

    return {
        event_id: registerEvent.event_id,
        registration_id: registerEvent.registration_id,
        is_registered: registerEvent.is_registered,
        registered_at: registerEvent.is_registered ? registerEvent.created_at : null
    }
}

/**
 * Get all events a user is registered for
 */
export async function getRegisteredEventsByUser(registrationId) {
    const listRegisteredEvent =  await registrationRegisterEventRepo.findRegisteredEventsByRegistrationId(registrationId)
    return listRegisteredEvent.map(e => e.event)
}

/**
 * Get all events a user is registered for in a specific month and year
 */
export async function getRegisteredEventsByUserAndMonth(registrationId, month, year) {
    // Validate month and year
    if (month < 1 || month > 12) {
        abort(400, 'Tháng phải từ 1 đến 12.')
    }

    const currentYear = new Date().getFullYear()
    if (year < 2000 || year > currentYear + 10) {
        abort(400, `Năm phải từ 2000 đến ${currentYear + 10}.`)
    }

    return await registrationRegisterEventRepo.findRegisteredEventsByRegistrationIdAndMonth(
        registrationId,
        month,
        year
    ).map(e => e.event)
}

/**
 * Get all users registered for an event
 */
export async function getRegisteredUsersForEvent(eventId) {
    return await registrationRegisterEventRepo.findRegisteredUsersByEventId(eventId)
}

/**
 * Get registration statistics for an event
 */
export async function getEventRegistrationStats(eventId) {
    const totalRegistered = await registrationRegisterEventRepo.countRegisteredUsersByEventId(eventId)
    const totalRecords = await registrationRegisterEventRepo.countRegistrationRegisterEventsByEventId(eventId)

    return {
        event_id: eventId,
        total_registered: totalRegistered,
        total_records: totalRecords,
        total_unregistered: totalRecords - totalRegistered
    }
}

/**
 * Get registration statistics for a user
 */
export async function getUserRegistrationStats(registrationId) {
    const allEvents = await registrationRegisterEventRepo.findRegistrationRegisterEventByRegistrationId(registrationId)
    const registeredEvents = allEvents.filter(e => e.is_registered)

    return {
        registration_id: registrationId,
        total_registered: registeredEvents.length,
        total_records: allEvents.length,
        total_unregistered: allEvents.length - registeredEvents.length
    }
}

/**
 * Check if a user is registered for an event
 */
export async function isUserRegisteredForEvent(eventId, registrationId) {
    return await registrationRegisterEventRepo.isUserRegisteredForEvent(eventId, registrationId)
}

/**
 * Get registration record by ID
 */
export async function getRegistrationRegisterEventById(id) {
    const registerEvent = await registrationRegisterEventRepo.findRegistrationRegisterEventById(id)
    if (!registerEvent) {
        abort(404, 'Không tìm thấy bản ghi đăng ký sự kiện.')
    }
    return registerEvent
}

/**
 * Get all registration records with pagination
 */
export async function getAllRegistrationRegisterEvents(page = 1, limit = 20) {
    const events = await registrationRegisterEventRepo.findAllRegistrationRegisterEvents(page, limit)
    const total = await registrationRegisterEventRepo.countRegistrationRegisterEvents()

    return {
        data: events,
        pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit)
        }
    }
}

/**
 * Update registration record
 */
export async function updateRegistrationRegisterEvent(id, updateData) {
    const existing = await registrationRegisterEventRepo.findRegistrationRegisterEventById(id)
    if (!existing) {
        abort(404, 'Không tìm thấy bản ghi đăng ký sự kiện.')
    }

    // Only allow updating is_registered field
    const allowedFields = ['is_registered']
    const filteredData = {}

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            filteredData[field] = updateData[field]
        }
    }

    if (Object.keys(filteredData).length === 0) {
        abort(400, 'Không có dữ liệu hợp lệ để cập nhật.')
    }

    await registrationRegisterEventRepo.updateRegistrationRegisterEventById(id, filteredData)
    return await registrationRegisterEventRepo.findRegistrationRegisterEventById(id)
}

/**
 * Delete registration record
 */
export async function deleteRegistrationRegisterEvent(id) {
    const existing = await registrationRegisterEventRepo.findRegistrationRegisterEventById(id)
    if (!existing) {
        abort(404, 'Không tìm thấy bản ghi đăng ký sự kiện.')
    }

    return await registrationRegisterEventRepo.deleteRegistrationRegisterEventById(id)
}

/**
 * Bulk register users for an event
 */
export async function bulkRegisterUsersForEvent(eventId, registrationIds) {
    // Verify event exists
    const event = await eventRepo.findEventById(eventId)
    if (!event) {
        abort(404, 'Không tìm thấy sự kiện.')
    }

    const results = []
    const errors = []

    for (const registrationId of registrationIds) {
        try {
            const result = await registerUserForEvent(eventId, registrationId)
            results.push(result)
        } catch (error) {
            errors.push({
                registration_id: registrationId,
                error: error.message
            })
        }
    }

    return {
        success: results,
        errors,
        total_success: results.length,
        total_errors: errors.length
    }
}

