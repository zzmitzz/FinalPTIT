import * as sessionRegistrationService from '@/app/services/registrations/session-registration.service'

const buildStaticUrl = (value) => {
    if (!value || typeof value !== 'string') return value
    if (/^https?:\/\//i.test(value)) return value
    const base = (process.env.APP_URL_API || '').replace(/\/+$/, '')
    const path = value.startsWith('/') ? value : `/${value}`
    const withStatic = path.startsWith('/static/') ? path : `/static${path}`
    return `${base}${withStatic}`
}

const serializeSpeaker = (speaker) => {
    if (!speaker) return speaker
    const obj = typeof speaker.toJSON === 'function' ? speaker.toJSON() : speaker
    return {
        ...obj,
        photo_url: buildStaticUrl(obj.photo_url)
    }
}

const serializeSession = (session) => {
    if (!session) return session
    const obj = typeof session.toJSON === 'function' ? session.toJSON() : session
    return {
        ...obj,
        speakers: Array.isArray(obj.speakers) ? obj.speakers.map(serializeSpeaker) : obj.speakers
    }
}

/**
 * Register authenticated user for a session
 * POST /registrations/session-registrations/register
 */
export async function registerForSession(req, res) {
    const { session_id } = req.body
    const userId = req.currentRegistration._id

    const registration = await sessionRegistrationService.registerUserForSession(session_id, userId)

    const message = registration.status === 'waitlist'
        ? 'Phiên đã đầy. Bạn đã được thêm vào danh sách chờ.'
        : 'Đăng ký phiên thành công.'

    res.status(201).jsonify(registration, message)
}

/**
 * Check in authenticated user to a session
 * POST /registrations/session-registrations/check-in
 */
export async function checkInToSession(req, res) {
    const { session_id } = req.body
    const userId = req.currentRegistration._id

    const registration = await sessionRegistrationService.checkInUserToSession(session_id, userId)

    res.jsonify(registration, 'Check-in thành công.')
}

/**
 * Cancel authenticated user's session registration
 * POST /registrations/session-registrations/cancel
 */
export async function cancelSessionRegistration(req, res) {
    const { session_id, cancellation_reason } = req.body
    const userId = req.currentRegistration._id

    const registration = await sessionRegistrationService.cancelUserSessionRegistration(
        session_id,
        userId,
        cancellation_reason
    )

    res.jsonify(registration, 'Hủy đăng ký thành công.')
}

/**
 * Get all session registrations for authenticated user
 * GET /registrations/session-registrations
 */
export async function getMySessionRegistrations(req, res) {
    const userId = req.currentRegistration._id
    const { status, page, limit } = req.query

    const registrations = await sessionRegistrationService.getUserSessionRegistrations(
        userId,
        status,
        parseInt(page) || 1,
        parseInt(limit) || 10
    )

    res.jsonify({
        data: registrations,
        total: registrations.length
    })
}

/**
 * Get a specific session registration for authenticated user
 * GET /registrations/session-registrations/:sessionId
 */
export async function getMySessionRegistration(req, res) {
    const userId = req.currentRegistration._id
    const sessionId = parseInt(req.params.sessionId, 10)

    const registration = await sessionRegistrationService.getSessionRegistration(sessionId, userId)

    res.jsonify(registration)
}

/**
 * Get all sessions for a specific event
 * GET /registrations/session-registrations/event/:eventId/sessions
 */
export async function getSessionsByEvent(req, res) {
    const { eventId } = req.params

    const sessions = await sessionRegistrationService.getSessionsByEventId(eventId)

    res.jsonify(sessions.map(serializeSession))
}

