import * as registrationRegisterEventService from '@/app/services/registrations/registration-register-event.service'
/**
 * Get all events the authenticated user is registered for
 * GET /registrations/registered-events
 */
export async function getMyRegisteredEvents(req, res) {
    const events = await registrationRegisterEventService.getRegisteredEventsByUser(
        req.currentRegistration._id
    )
    res.jsonify(events)
}

/**
 * Get all events the authenticated user is registered for in a specific month and year
 * GET /registrations/registered-events/by-month
 */
export async function getMyRegisteredEventsByMonth(req, res) {
    const { month, year } = req.query

    const events = await registrationRegisterEventService.getRegisteredEventsByUserAndMonth(
        req.currentRegistration._id,
        parseInt(month),
        parseInt(year)
    )
    res.jsonify(events)
}


export async function getRegistrationStatus(req, res) {
    const { event_id } = req.params
    const status = await registrationRegisterEventService.getRegistrationStatus(
        req.currentRegistration._id,
        event_id
    )
    res.jsonify(status)
}
