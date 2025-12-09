import * as speakerService from '@/app/services/registrations/speaker.service'
import { abort } from '@/utils/helpers'

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

/**
 * Get speaker by ID with all properties
 * GET /api/registrations/events/speakers/:id
 */
export async function getSpeakerById(req, res) {
    try {
        const speakerId = parseInt(req.params.id, 10)

        if (isNaN(speakerId)) {
            return abort(400, 'ID diễn giả không hợp lệ.')
        }

        const speaker = await speakerService.getSpeakerById(speakerId)

        if (!speaker) {
            return abort(404, 'Không tìm thấy diễn giả.')
        }

        res.jsonify(serializeSpeaker(speaker))
    } catch (error) {
        console.error('Error in getSpeakerById:', error)
        const status = error.status || 500
        return res.status(status).json({
            status: status,
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi lấy thông tin diễn giả.',
            error: error.message
        })
    }
}

/**
 * Get all sessions that belong to a speaker by speaker ID
 * GET /api/registrations/events/speakers/:id/sessions
 */
export async function getSessionsBySpeakerId(req, res) {
    try {
        const speakerId = parseInt(req.params.id, 10)

        if (isNaN(speakerId)) {
            return abort(400, 'ID diễn giả không hợp lệ.')
        }

        // First verify the speaker exists
        const speaker = await speakerService.getSpeakerById(speakerId)
        if (!speaker) {
            return abort(404, 'Không tìm thấy diễn giả.')
        }

        const sessions = await speakerService.getSessionsBySpeakerId(speakerId)

        res.jsonify({
            speaker: serializeSpeaker(speaker),
            sessions: sessions,
            total: sessions.length
        })
    } catch (error) {
        console.error('Error in getSessionsBySpeakerId:', error)
        const status = error.status || 500
        return res.status(status).json({
            status: status,
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi lấy danh sách phiên của diễn giả.',
            error: error.message
        })
    }
}
