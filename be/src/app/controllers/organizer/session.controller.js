import {abort} from '@/utils/helpers'
import * as sessionService from '@/app/services/organizer/session.service'

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

export async function createItem(req, res) {
    const session = await sessionService.createSession(req.body)
    res.status(201).jsonify(serializeSession(session), 'Tạo phiên thành công.')
}

export async function getItem(req, res) {
    const session = await sessionService.getSessionById(req.params.id)
    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }
    res.jsonify(serializeSession(session))
}

export async function getListByEventId(req, res) {
    const sessions = await sessionService.getSessionsByEventId(req.params.eventId)
    const total = await sessionService.countSessionsByEventId(req.params.eventId)
    res.jsonify({
        data: sessions.map(serializeSession),
        total: total,
    })
}

export async function getAllItems(req, res) {
    const {page = 1, limit = 10} = req.query
    const result = await sessionService.getAllSessions(page, limit)
    res.jsonify({
        ...result,
        items: result.items ? result.items.map(serializeSession) : []
    })
}

export async function updateItem(req, res) {
    const session = await sessionService.getSessionById(req.params.id)
    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }

    const updated = await sessionService.updateSession(req.params.id, req.body)
    res.jsonify(serializeSession(updated), 'Cập nhật phiên thành công.')
}

export async function updateProperties(req, res) {
    const session = await sessionService.getSessionById(req.params.id)
    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }

    // Only update specific properties
    const allowedUpdates = {}
    const allowedFields = ['title', 'description', 'start_time', 'end_time', 'place', 'capacity', 'max_waitlist', 'is_active', 'session_type', 'prerequisites', 'tags']
    
    allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(req.body, field) && req.body[field] !== null) {
            allowedUpdates[field] = req.body[field]
        }
    })

    const updated = await sessionService.updateSession(req.params.id, allowedUpdates)
    res.jsonify(serializeSession(updated), 'Cập nhật thuộc tính phiên thành công.')
}

export async function deleteItem(req, res) {
    const session = await sessionService.getSessionById(req.params.id)
    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }

    await sessionService.deleteSession(req.params.id)
    res.jsonify('Xóa phiên thành công.')
}

export async function searchItems(req, res) {
    const {q = '', page = 1, limit = 10} = req.query
    const result = await sessionService.searchSessions(q, page, limit)
    res.jsonify({
        ...result,
        items: result.items ? result.items.map(serializeSession) : []
    })
}

export async function getByType(req, res) {
    const sessions = await sessionService.getSessionsByType(req.params.type)
    res.jsonify({
        data: sessions.map(serializeSession),
        total: sessions.length,
    })
}

export async function getActiveSessions(req, res) {
    const sessions = await sessionService.getActiveSessions()
    res.jsonify({
        data: sessions.map(serializeSession),
        total: sessions.length,
    })
}

