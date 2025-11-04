import {abort} from '@/utils/helpers'
import * as speakerRepo from '@/db/speaker_repository'
import * as eventRepo from '@/db/event_repository'

export async function checkSpeakerId(req, res, next) {
    const speakerId = parseInt(req.params.id, 10)
    if (isNaN(speakerId)) {
        abort(400, 'ID diễn giả không hợp lệ.')
    }

    const speaker = await speakerRepo.findSpeakerById(speakerId)
    if (!speaker) {
        abort(404, 'Không tìm thấy diễn giả.')
    }
    req.speaker = speaker
    next()
}

export async function verifySpeakerOwnership(req, res, next) {
    // Verify that the speaker belongs to an event owned by the current organizer
    const speaker = req.speaker
    const event = await eventRepo.findEventById(speaker.event_id)
    
    if (!event) {
        abort(404, 'Không tìm thấy sự kiện liên quan đến diễn giả này.')
    }

    if (event.organizer_id !== req.currentOrganizer._id) {
        abort(403, 'Bạn không có quyền truy cập diễn giả này.')
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

