import * as eventService from '../../services/organizer/event.service'
import * as speakerService from '../../services/organizer/speaker.service'
import * as formService from '../../services/organizer/form.service'
import { getOrganizerDetailsByOrganizerId } from '@/app/services/organizer/organizer-details.service'
import * as registrationRegisterEventService from '@/app/services/registrations/registration-register-event.service'
import { EVENT_STATUS } from '@/configs'
import * as registrationRegisterEventRepo from '@/db/registration_register_event_repository'
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

export async function getEventById(req, res) {
    try {
        const event = await eventService.getEventById(req.params.id)
        console.log(event)

        if (!event) {
            abort(404, 'Không tìm thấy sự kiện.')
        }

        // Check if event is published - only published events are visible to public
        if (event.status !== EVENT_STATUS.PUBLISHED) {
            abort(404, 'Không tìm thấy sự kiện.')
        }

        const organizer = event.organizer_id ? await getOrganizerDetailsByOrganizerId(event.organizer_id) : null
        const speakers = await speakerService.getSpeakersByEventId(req.params.id)

        // Check if user is registered
        const isRegistered = await registrationRegisterEventService.isUserRegisteredForEvent(
            req.params.id,
            req.currentRegistration._id
        )

        const eventWithDetails = {
            ...serializeEvent(event),
            is_registered: !!isRegistered,
            organizer: organizer ? {
                name: organizer.organization_name,
                describe: organizer.description,
                avatar: buildStaticUrl(organizer.logo_url),
            } : null,
            speakers: (speakers || []).map(serializeSpeaker)
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

        // Check if event is published - only published events are visible to public
        if (event.status !== EVENT_STATUS.PUBLISHED) {
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
        // Filter by PUBLISHED status for public endpoints
        const result = await eventService.listEvents(page, limit, null, true)
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
        // Filter by PUBLISHED status for public endpoints
        const result = await eventService.searchEvents(q, page, limit, null, true)
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
        if (!lat || !lng) {
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

export async function registerEvent(req, res) {
    try {
        const { id: eventId } = req.params
        const registrationId = req.currentRegistration._id

        // 1. Check in the register_event already have the record
        const existing = await registrationRegisterEventRepo.findRegistrationRegisterEventByCompositeKey(
            eventId,
            registrationId
        )

        if (existing) {
            return abort(400, 'Bạn đã đăng ký tham gia sự kiện này rồi.')
        }

        // 2. If not exist, get the form in the form table contains that id
        const form = await formService.getFormByEventId(eventId)

        // return the form have is_public == true one as response for this endpoint
        if (!form || !form.is_public) {
            return abort(404, 'Biểu mẫu đăng ký không tồn tại hoặc chưa được công khai.')
        }

        res.jsonify(form)
    } catch (error) {
        console.error('Error in registerEvent:', error)
        const status = error.status || 500
        return res.status(status).json({
            status: status,
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi lấy biểu mẫu đăng ký.',
            error: error.message
        })
    }
}


export async function getRegistrationStatus(req, res) {
    try {
        const { id: eventId } = req.params
        const registrationId = req.currentRegistration._id

        const registrationStatus = await registrationRegisterEventService.getRegistrationStatus(
            eventId,
            registrationId
        )
        if (!registrationStatus) {
            return abort(404, 'Không tìm thấy thông tin đăng ký.')
        }
        res.jsonify(registrationStatus)
    } catch (error) {
        console.error('Error in registerEvent:', error)
        const status = error.status || 500
        return res.status(status).json({
            status: status,
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi lấy biểu mẫu đăng ký.',
            error: error.message
        })
    }
}
