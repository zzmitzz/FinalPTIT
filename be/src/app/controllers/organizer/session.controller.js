import {abort} from '@/utils/helpers'
import * as sessionService from '@/app/services/organizer/session.service'

export async function createItem(req, res) {
    const session = await sessionService.createSession(req.body)
    res.status(201).jsonify(session, 'Tạo phiên thành công.')
}

export async function getItem(req, res) {
    const session = await sessionService.getSessionById(req.params.id)
    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }
    res.jsonify(session)
}

export async function getListByEventId(req, res) {
    const sessions = await sessionService.getSessionsByEventId(req.params.eventId)
    const total = await sessionService.countSessionsByEventId(req.params.eventId)
    res.jsonify({
        data: sessions,
        total: total,
    })
}

export async function getAllItems(req, res) {
    const {page = 1, limit = 10} = req.query
    const result = await sessionService.getAllSessions(page, limit)
    res.jsonify(result)
}

export async function updateItem(req, res) {
    const session = await sessionService.getSessionById(req.params.id)
    if (!session) {
        abort(404, 'Không tìm thấy phiên.')
    }

    const updated = await sessionService.updateSession(req.params.id, req.body)
    res.jsonify(updated, 'Cập nhật phiên thành công.')
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
        if (req.body[field] !== undefined) {
            allowedUpdates[field] = req.body[field]
        }
    })

    const updated = await sessionService.updateSession(req.params.id, allowedUpdates)
    res.jsonify(updated, 'Cập nhật thuộc tính phiên thành công.')
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
    res.jsonify(result)
}

export async function getByType(req, res) {
    const sessions = await sessionService.getSessionsByType(req.params.type)
    res.jsonify({
        data: sessions,
        total: sessions.length,
    })
}

export async function getActiveSessions(req, res) {
    const sessions = await sessionService.getActiveSessions()
    res.jsonify({
        data: sessions,
        total: sessions.length,
    })
}

