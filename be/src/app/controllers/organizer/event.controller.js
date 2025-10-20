import * as eventService from '../../services/organizer/event.service'
import { EVENT_STATUS } from '@/configs'

export async function createEvent(req, res) {
    // Add organizer_id from authenticated user
    const eventData = {
        ...req.body,
        organizer_id: req.currentOrganizer._id,
    }

    const event = await eventService.createEvent(eventData)
    res.status(201).jsonify(event, 'Tạo sự kiện thành công.')
}

export async function getEventById(req, res) {
    const event = await eventService.getEventById(req.params.id)
    var result = event.toJSON()
    result.thumbnail = result.thumbnail && process.env.LINK_STATIC_URL + result.thumbnail
    result.logo = result.logo && process.env.LINK_STATIC_URL + result.logo  
    if (!event) {
        return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
    }
    res.jsonify(result)
}

export async function listEvents(req, res) {
    const { page = 1, limit = 10 } = req.query
    const result = await eventService.listEvents(page, limit)
    res.jsonify(result)
}

export async function searchEvents(req, res) {
    const { q = '', page = 1, limit = 10 } = req.query
    const result = await eventService.searchEvents(q, page, limit)
    res.jsonify(result)
}

export async function getNearbyEvents(req, res) {
    const { lat, lng, limit = 5 } = req.query
    if (lat === undefined || lng === undefined) {
        return res.status(400).jsonify(null, 'lat and lng query parameters are required')
    }
    const items = await eventService.getNearbyEvents(lat, lng, limit)
    res.jsonify({ items, total: items.length })
}


export async function updateEvent(req, res) {
    const { status } = req.body
    if (status && !isValidStatus(status)) {
        return res.status(400).jsonify(null, 'Trạng thái không hợp lệ, phải là một trong: ' + Object.values(EVENT_STATUS).join(', '))
    }

    const event = await eventService.updateEvent(req.params.id, req.body)
    if (!event) {
        return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
    }
    res.jsonify(event, 'Cập nhật sự kiện thành công.')
}

export async function deleteEvent(req, res) {
    const result = await eventService.deleteEvent(req.params.id)
    if (!result) {
        return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
    }
    res.status(204).send()
}

const isValidStatus = (value) => {
    return Object.values(EVENT_STATUS).includes(value)
}
