import * as eventService from '../../services/organizer/event.service'
import * as speakerService from '../../services/organizer/speaker.service'
import { findOrganizerById } from '@/db/organizer_repo'
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
    try {
        const event = await eventService.getEventById(req.params.id)
        console.log(event)

        if (!event) {
            abort(404, 'Không tìm thấy sự kiện.')
        }

        const organizer = event.organizer_id ? await findOrganizerById(event.organizer_id) : null
        const speakers = await speakerService.getSpeakersByEventId(req.params.id)

        const eventWithDetails = {
            ...serializeEvent(event),
            organizer: organizer ? {
                _id: organizer._id,
                name: organizer.name,
                email: organizer.email,
                phone: organizer.phone,
                avatar: buildStaticUrl(organizer.avatar)
            } : null,
            speakers: speakers || []
        }

        res.jsonify(eventWithDetails)
    } catch (error) {
        console.error('Error in getEventById:', error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Đã xảy ra lỗi khi lấy thông tin sự kiện.',
            error: error.message
        })
    }
}
export async function getEventByPinCode(req, res) {
    try {
        const event = await eventService.getEventByPinCode(req.params.pinCode)
        if (!event) {
            return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
        }
        res.jsonify(serializeEvent(event))
    } catch (error) {
        console.error('Error in getEventByPinCode:', error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Đã xảy ra lỗi khi lấy thông tin sự kiện.',
            error: error.message
        })
    }
}


export async function listEvents(req, res) {
    try {
        // Accept common pagination aliases from clients (limit, per_page, page_size)
        const { page: pageParam = 1, limit: limitParam, per_page, page_size } = req.query
        const page = pageParam
        const limit = limitParam ?? per_page ?? page_size ?? 10
        const result = await eventService.listEvents(page, limit)
        res.jsonify(mapEventsResponse(result))
    } catch (error) {
        console.error('Error in listEvents:', error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách sự kiện.',
            error: error.message
        })
    }
}

export async function searchEvents(req, res) {
    try {
        const { q = '', page = 1, limit = 10 } = req.query
        const result = await eventService.searchEvents(q, page, limit)
        console.log(result)
        res.jsonify(mapEventsResponse(result))
    } catch (error) {
        console.error('Error in searchEvents:', error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Đã xảy ra lỗi khi tìm kiếm sự kiện.',
            error: error.message
        })
    }
}

export async function getNearbyEvents(req, res) {
    try {
        const { lat, lng, limit = 5 } = req.query
        if (lat === undefined || lng === undefined) {
            return res.status(400).jsonify(null, 'lat and lng query parameters are required')
        }
        const items = await eventService.getNearbyEvents(lat, lng, limit)
        const serialized = items.map(serializeEvent)
        res.jsonify({ items: serialized, total: serialized.length })
    } catch (error) {
        console.error('Error in getNearbyEvents:', error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Đã xảy ra lỗi khi lấy sự kiện gần đây.',
            error: error.message
        })
    }
}


export async function updateEvent(req, res) {
    try {
        const { status } = req.body
        if (status && !isValidStatus(status)) {
            return res.status(400).jsonify(null, 'Trạng thái không hợp lệ, phải là một trong: ' + Object.values(EVENT_STATUS).join(', '))
        }

        const event = await eventService.updateEvent(req.params.id, req.body)
        if (!event) {
            return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
        }
        res.jsonify(serializeEvent(event), 'Cập nhật sự kiện thành công.')
    } catch (error) {
        console.error('Error in updateEvent:', error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật sự kiện.',
            error: error.message
        })
    }
}

export async function deleteEvent(req, res) {
    try {
        const result = await eventService.deleteEvent(req.params.id)
        if (!result) {
            return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
        }
        res.status(204).send()
    } catch (error) {
        console.error('Error in deleteEvent:', error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Đã xảy ra lỗi khi xóa sự kiện.',
            error: error.message
        })
    }
}

const isValidStatus = (value) => {
    return Object.values(EVENT_STATUS).includes(value)
}
