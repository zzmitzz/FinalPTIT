import * as eventService from '../../services/organizer/event.service'
import { EVENT_STATUS } from '@/configs'

const buildStaticUrl = (value) => {
    if (!value || typeof value !== 'string') return value
    if (/^https?:\/\//i.test(value)) return value
    const base = (process.env.APP_URL_API || '').replace(/\/+$/, '')
    const path = value.startsWith('/') ? value : `/${value}`
    const withStatic = path.startsWith('/static/') ? path : `/static${path}`
    return `${base}${withStatic}`
}

const serializeEvent = (event) => {
    if (!event) return event
    const obj = typeof event.toJSON === 'function' ? event.toJSON() : event
    return {
        ...obj,
        thumbnail: buildStaticUrl(obj.thumbnail),
        logo: buildStaticUrl(obj.logo),
    }
}

const mapEventsResponse = (data) => {
    if (Array.isArray(data)) return data.map(serializeEvent)
    if (data && Array.isArray(data.items)) return { ...data, items: data.items.map(serializeEvent) }
    return serializeEvent(data)
}

export async function createEvent(req, res) {
    // Add organizer_id from authenticated user
    const eventData = {
        ...req.body,
        organizer_id: req.currentOrganizer._id,
    }

    const event = await eventService.createEvent(eventData)
    const result = serializeEvent(event)
    res.status(201).jsonify(result, 'Tạo sự kiện thành công.')
}

export async function getEventById(req, res) {
    const event = await eventService.getEventById(req.params.id)
    if (!event) {
        return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
    }
    res.jsonify(serializeEvent(event))
}
export async function getEventByPinCode(req, res) {
    const event = await eventService.getEventByPinCode(req.params.pinCode)
    if (!event) {
        return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
    }
    res.jsonify(serializeEvent(event))
}


export async function listEvents(req, res) {
    // Accept common pagination aliases from clients (limit, per_page, page_size)
    const { page: pageParam = 1, limit: limitParam, per_page, page_size } = req.query
    const page = pageParam
    const limit = limitParam ?? per_page ?? page_size ?? 10

    const result = await eventService.listEvents(page, limit)
    res.jsonify(mapEventsResponse(result))
}

export async function searchEvents(req, res) {
    const { q = '', page = 1, limit = 10 } = req.query
    const result = await eventService.searchEvents(q, page, limit)
    res.jsonify(mapEventsResponse(result))
}

export async function getNearbyEvents(req, res) {
    const { lat, lng, limit = 5 } = req.query
    if (lat === undefined || lng === undefined) {
        return res.status(400).jsonify(null, 'lat and lng query parameters are required')
    }
    const items = await eventService.getNearbyEvents(lat, lng, limit)
    const serialized = items.map(serializeEvent)
    res.jsonify({ items: serialized, total: serialized.length })
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
    res.jsonify(serializeEvent(event), 'Cập nhật sự kiện thành công.')
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
