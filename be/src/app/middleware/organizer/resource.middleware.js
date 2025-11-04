import { abort } from '@/utils/helpers'
import * as resourceRepo from '@/db/resource_repository'
import * as eventRepo from '@/db/event_repository'
import * as sessionRepo from '@/db/session_repository'

/**
 * Verify that the resource exists and attach it to the request
 */
export async function verifyResourceId(req, res, next) {
    const resourceId = req.params.id
    
    if (!resourceId) {
        abort(400, 'Resource ID là bắt buộc.')
    }

    const resource = await resourceRepo.findResourceById(parseInt(resourceId))

    if (!resource) {
        abort(404, 'Không tìm thấy tài nguyên.')
    }

    req.resource = resource
    next()
}

/**
 * Verify that the resource belongs to an event owned by the current organizer
 */
export async function verifyResourceOwnership(req, res, next) {
    const resource = req.resource

    // Get the event associated with this resource
    let event
    if (resource.event_id) {
        event = await eventRepo.findEventById(resource.event_id)
    } else if (resource.session_id) {
        const session = await sessionRepo.findSessionById(resource.session_id)
        if (!session) {
            abort(404, 'Không tìm thấy phiên liên quan đến tài nguyên này.')
        }
        event = await eventRepo.findEventById(session.event_id)
    }

    if (!event) {
        abort(404, 'Không tìm thấy sự kiện liên quan đến tài nguyên này.')
    }

    if (event.organizer_id !== req.currentOrganizer._id) {
        abort(403, 'Bạn không có quyền truy cập tài nguyên này.')
    }

    req.event = event
    next()
}

/**
 * Verify that the event belongs to the current organizer
 */
export async function verifyEventOwnership(req, res, next) {
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

/**
 * Verify that the session belongs to an event owned by the current organizer
 */
export async function verifySessionOwnership(req, res, next) {
    const sessionId = req.params.sessionId || req.body.session_id

    if (!sessionId) {
        abort(400, 'Session ID là bắt buộc.')
    }

    const session = await sessionRepo.findSessionById(parseInt(sessionId))

    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }

    const event = await eventRepo.findEventById(session.event_id)

    if (!event) {
        abort(404, 'Không tìm thấy sự kiện liên quan đến phiên này.')
    }

    if (event.organizer_id !== req.currentOrganizer._id) {
        abort(403, 'Bạn không có quyền truy cập phiên này.')
    }

    req.session = session
    req.event = event
    next()
}

/**
 * Verify ownership based on event_id or session_id in request body
 */
export async function verifyOwnershipForCreate(req, res, next) {
    const { event_id, session_id } = req.body

    if (event_id) {
        const event = await eventRepo.findEventById(event_id)
        if (!event) {
            abort(404, 'Không tìm thấy sự kiện.')
        }
        if (event.organizer_id !== req.currentOrganizer._id) {
            abort(403, 'Bạn không có quyền tạo tài nguyên cho sự kiện này.')
        }
        req.event = event
    } else if (session_id) {
        const session = await sessionRepo.findSessionById(parseInt(session_id))
        if (!session) {
            abort(404, 'Không tìm thấy phiên.')
        }
        const event = await eventRepo.findEventById(session.event_id)
        if (!event) {
            abort(404, 'Không tìm thấy sự kiện liên quan đến phiên này.')
        }
        if (event.organizer_id !== req.currentOrganizer._id) {
            abort(403, 'Bạn không có quyền tạo tài nguyên cho phiên này.')
        }
        req.session = session
        req.event = event
    } else {
        abort(400, 'Phải cung cấp event_id hoặc session_id.')
    }

    next()
}

