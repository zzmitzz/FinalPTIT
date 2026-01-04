import * as registrationRegisterEventService from '@/app/services/registrations/registration-register-event.service'

const buildStaticUrl = (value) => {
    if (!value || typeof value !== 'string') return value
    if (/^https?:\/\//i.test(value)) return value
    const base = (process.env.APP_URL_API || '').replace(/\/+$/, '')
    const path = value.startsWith('/') ? value : `/${value}`
    const withStatic = path.startsWith('/static/') ? path : `/static${path}`
    return `${base}${withStatic}`
}

const serializeEvent = (event) => {
    if (!event) return event
    const obj = typeof event.toJSON === 'function' ? event.toJSON() : event
    return {
        ...obj,
        thumbnail: buildStaticUrl(obj.thumbnail),
        logo: buildStaticUrl(obj.logo),
    }
}

/**
 * Get all events the authenticated user is registered for
 * GET /registrations/registered-events
 */
export async function getMyRegisteredEvents(req, res) {
    const events = await registrationRegisterEventService.getRegisteredEventsByUser(
        req.currentRegistration._id
    )
    const serializedEvents = events.map(serializeEvent)
    res.jsonify(serializedEvents)
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
    const serializedEvents = events.map(serializeEvent)
    res.jsonify(serializedEvents)
}


export async function getRegistrationStatus(req, res) {
    const { event_id } = req.params
    const status = await registrationRegisterEventService.getRegistrationStatus(
        req.currentRegistration._id,
        event_id
    )
    res.jsonify(status)
}
