import {abort} from '@/utils/helpers'
import * as sessionRepo from '@/db/session_repository'
import * as eventRepo from '@/db/event_repository'

export async function checkSessionId(req, res, next) {
    const sessionId = parseInt(req.params.id, 10)
    if (isNaN(sessionId)) {
        abort(400, 'ID phiên không hợp lệ.')
    }

    const session = await sessionRepo.findSessionById(sessionId)
    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }
    req.session = session
    next()
}

export async function verifySessionOwnership(req, res, next) {
    // Verify that the session belongs to an event owned by the current organizer
    const session = req.session
    const event = await eventRepo.findEventById(session.event_id)
    
    if (!event) {
        abort(404, 'Không tìm thấy sự kiện liên quan đến phiên này.')
    }

    if (event.organizer_id !== req.currentOrganizer._id) {
        abort(403, 'Bạn không có quyền truy cập phiên này.')
    }

    req.event = event
    next()
}

export async function verifyEventOwnership(req, res, next) {
    // Verify that the event belongs to the current organizer
    const eventId = req.params.eventId || req.body.event_id

    if (!eventId) {
        abort(400, 'Event ID là bắt buộc.')
    }

    const event = await eventRepo.findEventById(eventId)

    if (!event) {
        abort(404, 'Không tìm thấy sự kiện.')
    }

    if (event.organizer_id !== req.currentOrganizer._id) {
        abort(403, 'Bạn không có quyền truy cập sự kiện này.')
    }

    req.event = event
    next()
}

export async function validateSessionTimeRange(req, res, next) {
    // Validate that session times are within event time range
    const {start_time, end_time} = req.body

    // If no time fields are being updated, skip validation
    if (!start_time && !end_time) {
        return next()
    }

    // Get the event (should be set by verifySessionOwnership middleware)
    const event = req.event

    if (!event) {
        abort(500, 'Không tìm thấy thông tin sự kiện.')
    }

    const eventStart = new Date(event.start_time)
    const eventEnd = new Date(event.end_time)

    // Get current session to check existing times if only one field is being updated
    const session = req.session
    const sessionStartTime = start_time ? new Date(start_time) : new Date(session.start_time)
    const sessionEndTime = end_time ? new Date(end_time) : new Date(session.end_time)

    // Validate start_time is within event range
    if (sessionStartTime < eventStart || sessionStartTime > eventEnd) {
        abort(400, 'Thời gian bắt đầu phiên phải nằm trong khoảng thời gian của sự kiện.')
    }

    // Validate end_time is within event range
    if (sessionEndTime < eventStart || sessionEndTime > eventEnd) {
        abort(400, 'Thời gian kết thúc phiên phải nằm trong khoảng thời gian của sự kiện.')
    }

    // Validate end_time is after start_time
    if (sessionEndTime <= sessionStartTime) {
        abort(400, 'Thời gian kết thúc phải sau thời gian bắt đầu.')
    }

    next()
}
