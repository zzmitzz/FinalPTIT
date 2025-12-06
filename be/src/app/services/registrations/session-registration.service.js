import { abort } from '@/utils/helpers'
import * as sessionRepo from '@/db/session_repository'
import * as sessionRegistrationRepo from '@/db/session_registration_repository'
import * as registrationRepo from '@/db/registration_repository'
import * as eventRepo from '@/db/event_repository'
import * as sessionSpeakerRepo from '@/db/session_speaker_repository'

/**
 * Register a user for a session
 */
export async function registerUserForSession(sessionId, userId) {
    // Verify session exists
    const session = await sessionRepo.findSessionById(sessionId)
    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }

    // Verify session is active
    if (!session.is_active) {
        abort(400, 'Phiên này hiện không nhận đăng ký.')
    }

    // Verify session hasn't ended
    const now = new Date()
    const sessionEnd = new Date(session.end_time)
    if (now > sessionEnd) {
        abort(400, 'Phiên này đã kết thúc.')
    }

    // Verify user exists
    const user = await registrationRepo.findRegistrationById(userId)
    if (!user) {
        abort(404, 'Không tìm thấy người dùng.')
    }

    // Check if user is already registered
    const existingRegistration = await sessionRegistrationRepo.findSessionRegistrationByIds(sessionId, userId)
    if (existingRegistration) {
        if (existingRegistration.status === 'cancelled') {
            // Allow re-registration if previously cancelled
            const updated = await sessionRegistrationRepo.updateSessionRegistrationById(
                existingRegistration.id,
                {
                    status: 'attending',
                    registered_at: new Date(),
                    cancellation_reason: null
                }
            )
            return updated
        } else {
            abort(409, 'Bạn đã đăng ký phiên này rồi.')
        }
    }

    // Check capacity
    const attendingCount = await sessionRegistrationRepo.countRegistrationsBySessionAndStatus(sessionId, 'attending')
    const checkedInCount = await sessionRegistrationRepo.countRegistrationsBySessionAndStatus(sessionId, 'checked_in')
    const totalRegistered = attendingCount + checkedInCount

    let registrationData = {
        session_id: sessionId,
        user_id: userId,
        registered_at: new Date()
    }

    // If session is full, add to waitlist
    if (totalRegistered >= session.capacity) {
        const waitlistCount = await sessionRegistrationRepo.countRegistrationsBySessionAndStatus(sessionId, 'waitlist')
        registrationData.status = 'waitlist'
        registrationData.waitlist_position = waitlistCount + 1
    } else {
        registrationData.status = 'attending'
    }

    // Create registration
    const registration = await sessionRegistrationRepo.createSessionRegistration(registrationData)
    return registration
}

/**
 * Check in user to a session
 */
export async function checkInUserToSession(sessionId, userId) {
    // Verify session exists
    const session = await sessionRepo.findSessionById(sessionId)
    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }

    // Verify user is registered
    const registration = await sessionRegistrationRepo.findSessionRegistrationByIds(sessionId, userId)
    if (!registration) {
        abort(404, 'Bạn chưa đăng ký tham gia phiên này.')
    }

    // Verify registration status
    if (registration.status !== 'attending') {
        if (registration.status === 'checked_in') {
            abort(400, 'Bạn đã check-in phiên này rồi.')
        } else if (registration.status === 'cancelled') {
            abort(400, 'Đăng ký của bạn đã bị hủy.')
        } else if (registration.status === 'waitlist') {
            abort(400, 'Bạn đang trong danh sách chờ.')
        } else {
            abort(400, `Trạng thái đăng ký không hợp lệ: ${registration.status}`)
        }
    }

    // Validate check-in time
    const now = new Date()
    const sessionStart = new Date(session.start_time)
    const sessionEnd = new Date(session.end_time)

    // Allow check-in 30 minutes before session starts
    const checkInAllowedTime = new Date(sessionStart.getTime() - 30 * 60 * 1000)

    if (now < checkInAllowedTime) {
        abort(400, 'Chưa đến thời gian check-in. Bạn có thể check-in từ 30 phút trước khi phiên bắt đầu.')
    }

    if (now > sessionEnd) {
        abort(400, 'Phiên này đã kết thúc, không thể check-in.')
    }

    // Perform check-in
    const checkedIn = await sessionRegistrationRepo.checkInUser(sessionId, userId)
    if (!checkedIn) {
        abort(500, 'Không thể check-in. Vui lòng thử lại.')
    }

    return checkedIn
}

/**
 * Cancel a session registration
 */
export async function cancelUserSessionRegistration(sessionId, userId, cancellationReason) {
    // Verify session exists
    const session = await sessionRepo.findSessionById(sessionId)
    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }

    // Verify user is registered
    const registration = await sessionRegistrationRepo.findSessionRegistrationByIds(sessionId, userId)
    if (!registration) {
        abort(404, 'Bạn chưa đăng ký tham gia phiên này.')
    }

    // Verify registration can be cancelled
    if (registration.status === 'cancelled') {
        abort(400, 'Đăng ký này đã bị hủy trước đó.')
    }

    if (registration.status === 'checked_in') {
        abort(400, 'Không thể hủy đăng ký đã check-in.')
    }

    // Cancel registration
    const cancelled = await sessionRegistrationRepo.cancelSessionRegistration(
        sessionId,
        userId,
        cancellationReason
    )

    if (!cancelled) {
        abort(500, 'Không thể hủy đăng ký. Vui lòng thử lại.')
    }

    // If user was attending, promote someone from waitlist
    if (registration.status === 'attending') {
        const waitlist = await sessionRegistrationRepo.getSessionWaitlist(sessionId)
        if (waitlist.length > 0) {
            // Promote first person in waitlist
            const firstInWaitlist = waitlist[0]
            await sessionRegistrationRepo.promoteFromWaitlist(sessionId, firstInWaitlist.user_id)

            // Update waitlist positions for remaining users
            for (let i = 1; i < waitlist.length; i++) {
                await sessionRegistrationRepo.updateSessionRegistrationById(
                    waitlist[i].id,
                    { waitlist_position: i }
                )
            }
        }
    }

    return cancelled
}

/**
 * Get all sessions a user is registered for
 */
export async function getUserSessionRegistrations(userId, status, page = 1, limit = 10) {
    const user = await registrationRepo.findRegistrationById(userId)
    if (!user) {
        abort(404, 'Không tìm thấy người dùng.')
    }

    let registrations
    if (status) {
        registrations = await sessionRegistrationRepo.findRegistrationsByUserIdAndStatus(userId, status, page, limit)
    } else {
        registrations = await sessionRegistrationRepo.findRegistrationsByUserId(userId)
    }

    // Enrich with session details
    const enrichedRegistrations = await Promise.all(
        registrations.map(async (reg) => {
            const session = await sessionRepo.findSessionById(reg.session_id)
            let event = null
            if (session) {
                event = await eventRepo.findEventById(session.event_id)
            }
            return {
                ...reg,
                session,
                event
            }
        })
    )

    return enrichedRegistrations
}

/**
 * Get all sessions for a specific event
 */
export async function getSessionsByEventId(eventId) {
    const event = await eventRepo.findEventById(eventId)
    if (!event) {
        abort(404, 'Không tìm thấy sự kiện.')
    }

    const sessions = await sessionRepo.findSessionsByEventId(eventId)

    // Enrich with registration counts
    const enrichedSessions = await Promise.all(
        sessions.map(async (session) => {
            const attendingCount = await sessionRegistrationRepo.countRegistrationsBySessionAndStatus(session.id, 'attending')
            const checkedInCount = await sessionRegistrationRepo.countRegistrationsBySessionAndStatus(session.id, 'checked_in')
            const waitlistCount = await sessionRegistrationRepo.countRegistrationsBySessionAndStatus(session.id, 'waitlist')

            // Fetch speakers for this session
            const speakers = (await sessionSpeakerRepo.findSpeakersBySessionId(session.id)).map(s => ({
                id: s.id,
                photo_url: s.photo_url}))

            return {
                ...session,
                registered_count: attendingCount + checkedInCount,
                waitlist_count: waitlistCount,
                available_spots: Math.max(0, session.capacity - (attendingCount + checkedInCount)),
                speakers: speakers || []
            }
        })
    )

    return enrichedSessions
}

/**
 * Get a specific session registration
 */
export async function getSessionRegistration(sessionId, userId) {
    const registration = await sessionRegistrationRepo.findSessionRegistrationByIds(sessionId, userId)
    if (!registration) {
        abort(404, 'Không tìm thấy đăng ký.')
    }

    const session = await sessionRepo.findSessionById(sessionId)
    const event = session ? await eventRepo.findEventById(session.event_id) : null

    return {
        ...registration,
        session,
        event
    }
}

