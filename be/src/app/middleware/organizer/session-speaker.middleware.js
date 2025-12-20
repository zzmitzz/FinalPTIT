import { abort } from '@/utils/helpers'
import * as sessionRepo from '@/db/session_repository'
import * as speakerRepo from '@/db/speaker_repository'
import * as eventRepo from '@/db/event_repository'

export async function checkSessionId(req, res, next) {
    const sessionId = parseInt(req.params.sessionId || req.body.session_id, 10)
    if (isNaN(sessionId)) {
        abort(400, 'ID phiên không hợp lệ.')
    }

    const session = await sessionRepo.findSessionById(sessionId)
    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }
    req.sessionData = session
    next()
}

export async function checkSpeakerId(req, res, next) {
    const speakerId = parseInt(req.params.speakerId || req.body.speaker_id, 10)
    if (isNaN(speakerId)) {
        abort(400, 'ID diễn giả không hợp lệ.')
    }

    const speaker = await speakerRepo.findSpeakerById(speakerId)
    if (!speaker) {
        abort(404, 'Không tìm thấy diễn giả.')
    }
    req.speakerData = speaker
    next()
}

export async function verifySessionOwnership(req, res, next) {
    // Verify that the session belongs to an event owned by the current organizer
    const session = req.sessionData
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

export async function verifySpeakerOwnership(req, res, next) {
    // Verify that the speaker belongs to an event owned by the current organizer
    const speaker = req.speakerData
    const event = await eventRepo.findEventById(speaker.event_id)

    if (!event) {
        abort(404, 'Không tìm thấy sự kiện liên quan đến diễn giả này.')
    }

    if (event.organizer_id !== req.currentOrganizer._id) {
        abort(403, 'Bạn không có quyền truy cập diễn giả này.')
    }

    // Store speaker's event for further validation
    req.speakerEvent = event
    next()
}

export function verifySameEvent(req, res, next) {
    // Verify that both session and speaker belong to the same event
    const session = req.sessionData
    const speaker = req.speakerData

    if (session.event_id !== speaker.event_id) {
        abort(400, 'Diễn giả và phiên phải thuộc cùng một sự kiện.')
    }

    next()
}

