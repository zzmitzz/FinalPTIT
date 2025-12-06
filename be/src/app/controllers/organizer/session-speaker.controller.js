import {abort} from '@/utils/helpers'
import * as sessionSpeakerService from '@/app/services/organizer/session-speaker.service'

export async function addSpeakerToSession(req, res) {
    console.log('Request body:', req.body)  // Debugging line
    const sessionSpeaker = await sessionSpeakerService.addSpeakerToSession(req.body)
    res.status(201).jsonify(sessionSpeaker, 'Thêm diễn giả vào phiên thành công.')
}

export async function getSpeakersBySession(req, res) {
    const sessionId = parseInt(req.params.sessionId, 10)
    const speakers = await sessionSpeakerService.getSpeakersBySessionId(sessionId)
    const total = await sessionSpeakerService.countSpeakersBySessionId(sessionId)
    res.jsonify({
        data: speakers,
        total: total,
    })
}

export async function getSessionsBySpeaker(req, res) {
    const speakerId = parseInt(req.params.speakerId, 10)
    const sessions = await sessionSpeakerService.getSessionsBySpeakerId(speakerId)
    res.jsonify({
        data: sessions,
        total: sessions.length,
    })
}

export async function getSessionSpeaker(req, res) {
    const sessionId = parseInt(req.params.sessionId, 10)
    const speakerId = parseInt(req.params.speakerId, 10)
    
    const sessionSpeaker = await sessionSpeakerService.getSessionSpeakerByIds(sessionId, speakerId)
    if (!sessionSpeaker) {
        abort(404, 'Không tìm thấy diễn giả trong phiên này.')
    }
    res.jsonify(sessionSpeaker)
}

export async function updateSessionSpeaker(req, res) {
    const sessionId = parseInt(req.params.sessionId, 10)
    const speakerId = parseInt(req.params.speakerId, 10)
    
    const sessionSpeaker = await sessionSpeakerService.getSessionSpeakerByIds(sessionId, speakerId)
    if (!sessionSpeaker) {
        abort(404, 'Không tìm thấy diễn giả trong phiên này.')
    }

    const updated = await sessionSpeakerService.updateSessionSpeakerByIds(sessionId, speakerId, req.body)
    res.jsonify(updated, 'Cập nhật thông tin diễn giả trong phiên thành công.')
}

export async function removeSpeakerFromSession(req, res) {
    const sessionId = parseInt(req.params.sessionId, 10)
    const speakerId = parseInt(req.params.speakerId, 10)
    
    const sessionSpeaker = await sessionSpeakerService.getSessionSpeakerByIds(sessionId, speakerId)
    if (!sessionSpeaker) {
        abort(404, 'Không tìm thấy diễn giả trong phiên này.')
    }

    await sessionSpeakerService.removeSpeakerFromSession(sessionId, speakerId)
    res.jsonify('Xóa diễn giả khỏi phiên thành công.')
}

