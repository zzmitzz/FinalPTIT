import * as eventService from '../../services/organizer/event.service'
import * as speakerService from '../../services/organizer/speaker.service'
import * as formService from '../../services/organizer/form.service'
import * as registrationResponseService from '@/app/services/registrations/registration-response.service'
import * as registrationRepo from '@/db/registration_repository'
import { findOrganizerById } from '@/db/organizer_repo'
import { EVENT_STATUS } from '@/configs'
import Joi from 'joi'
import FileUpload from '@/utils/classes/file-upload'

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
    try {
        // Parse speakers from JSON string if provided
        let speakers = []
        if (req.body.speakers_json) {
            try {
                const speakersData = JSON.parse(req.body.speakers_json)
                // Match speaker photos from file uploads
                // Access req.files before formDataHandler processes them
                // Actually, formDataHandler already processed files into req.body
                // Check if there's a nested structure in req.body for speakers
                if (req.body.speakers && Array.isArray(req.body.speakers)) {
                    speakers = req.body.speakers.map((speaker, index) => {
                        // Check if there's a photo_url file for this speaker
                        const speakerData = speakersData[index] || {}
                        const photoFile = speaker.photo_url
                        return {
                            ...speakerData,
                            photo_url: photoFile || null
                        }
                    })
                } else {
                    speakers = speakersData
                }
            } catch (e) {
                console.error('Error parsing speakers_json:', e)
                speakers = req.body.speakers || []
            }
        } else if (req.body.speakers) {
            speakers = req.body.speakers
        }

        // Extract speakers from request body (remove speakers_json)
        const { speakers_json, ...eventFields } = req.body
        
        // Add organizer_id from authenticated user
        const eventData = {
            ...eventFields,
            organizer_id: req.currentOrganizer._id,
        }

        // Create event first
        const event = await eventService.createEvent(eventData)
        
        // Post-merge validation: ensure each speaker has required fields after merging speakers_json and uploaded files
        if (speakers && speakers.length > 0) {
            const speakerSchema = Joi.object({
                full_name: Joi.string().trim().max(255).required().label('Tên đầy đủ diễn giả'),
                email: Joi.string().trim().email().required().label('Email diễn giả'),
                bio: Joi.string().trim().max(5000).allow('').optional().label('Tiểu sử'),
                phone: Joi.string().trim().max(20).allow('').optional().label('Số điện thoại'),
                photo_url: Joi.alternatives().try(
                    Joi.string().trim().uri().allow(''),
                    Joi.object().instance(FileUpload)
                ).optional().label('URL ảnh đại diện'),
                professional_title: Joi.string().trim().max(255).allow('').optional().label('Chức danh'),
                linkedin_url: Joi.string().trim().uri().allow('').optional().label('LinkedIn URL'),
            })

            const { error } = Joi.array().items(speakerSchema).validate(speakers, { abortEarly: false })
            if (error) {
                const details = {}
                for (const d of error.details) {
                    // Joi path example: [0, 'full_name']
                    if (Array.isArray(d.path) && d.path.length >= 2) {
                        const idx = d.path[0]
                        const key = d.path[1]
                        details[`speakers.${idx}.${key}`] = d.message
                    } else if (Array.isArray(d.path) && d.path.length === 1) {
                        details[`speakers.${d.path[0]}`] = d.message
                    } else {
                        details[d.path.join('.')] = d.message
                    }
                }
                return res.status(400).json({ status: 400, success: false, message: 'Dữ liệu diễn giả không hợp lệ.', errors: details })
            }

            // Create speakers for event
            await eventService.createSpeakersForEvent(event._id, speakers)
        }

        // Fetch event with speakers
        const eventWithSpeakers = await eventService.getEventById(event._id)
        const speakersList = await speakerService.getSpeakersByEventId(event._id)
        
        const result = {
            ...serializeEvent(eventWithSpeakers),
            speakers: speakersList || []
        }
        // Create a default registration form for this event (non-blocking)
        try {
            const defaultTitle = `Form đăng ký ${event.name || ''}`
            const defaultFormPayload = {
                event_id: event._id,
                title: defaultTitle,
                description: '',
                is_public: false,
                fields: [
                    {
                        field_label: 'Họ và tên người tham gia',
                        field_description: '',
                        field_type: 'TEXT',
                        field_options: [],
                        field_has_other_option: false,
                        field_range: { min: null, max: null },
                        field_extensions: [],
                        required: true,
                        is_primary_key: false,
                        can_edit: true,
                        position: 0,
                    },
                    {
                        field_label: 'Email liên hệ',
                        field_description: '',
                        field_type: 'EMAIL',
                        field_options: [],
                        field_has_other_option: false,
                        field_range: { min: null, max: null },
                        field_extensions: [],
                        required: true,
                        is_primary_key: true,
                        can_edit: true,
                        position: 1,
                    }
                ]
            }

            await formService.createFormWithFields(defaultFormPayload)
        } catch (err) {
            console.error('Failed to create default form for event:', event._id, err)
        }
        
        res.status(201).jsonify(result, 'Tạo sự kiện thành công.')
    } catch (error) {
        console.error('Error in createEvent:', error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Đã xảy ra lỗi khi tạo sự kiện.',
            error: error.message
        })
    }
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

/**
 * Get all registration responses for an event (grouped per registrant)
 * GET /organizer/events/:id/registrations
 */
export async function getEventRegistrations(req, res) {
    try {
        const eventId = req.params.id

        // Get form and its fields (if any)
        const form = await formService.getFormByEventId(eventId)
        const fields = form ? (form.fields || []) : []

        // Get raw responses for the event
        const responses = await registrationResponseService.getRegistrationResponsesByEventId(eventId)

    // Group responses by registration_id
    const grouped = {}
        for (const r of responses) {
            const rid = r.registration_id
            if (!grouped[rid]) {
                grouped[rid] = {
                    registration_id: rid,
                    created_at: r.created_at,
                    responses: {}
                }
                // Try to attach registration basic info if available
                try {
                    const reg = await registrationRepo.findRegistrationById(rid)
                    if (reg) {
                            grouped[rid].registration = {
                                _id: reg._id,
                                full_name: reg.full_name || null,
                                email: reg.email || null,
                                phone: reg.phone || null,
                                dob: reg.dob || null,
                                gender: reg.gender || null,
                                address: reg.address || null,
                                avatar_url: reg.avatar_url || null,
                                bio: reg.bio || null,
                                created_at: reg.created_at || null
                            }
                        }
                } catch (err) {
                    // ignore fetch errors for registrant info
                }
            }

            grouped[rid].responses[r.form_fields_id] = r.response
        }

        const registrations = Object.values(grouped)

        res.jsonify({ fields, registrations })
    } catch (error) {
        console.error('Error in getEventRegistrations:', error)
        return res.status(500).json({ status: 500, success: false, message: 'Đã xảy ra lỗi khi lấy lượt đăng ký.', error: error.message })
    }
}


export async function listEvents(req, res) {
    try {
        // Accept common pagination aliases from clients (limit, per_page, page_size)
        const { page: pageParam = 1, limit: limitParam, per_page, page_size } = req.query
        const page = pageParam
        const limit = limitParam ?? per_page ?? page_size ?? 10
        const organizerId = req.currentOrganizer._id
        const result = await eventService.listEvents(page, limit, organizerId)
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
        const organizerId = req.currentOrganizer._id
        const result = await eventService.searchEvents(q, page, limit, organizerId)
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

export async function getMyEventsGroupedByDate(req, res) {
    try {
        const organizerId = req.currentOrganizer._id
        const events = await eventService.getOrganizerEventsGroupedByDate(organizerId)
        res.jsonify(mapEventsResponse(events))
    } catch (error) {
        console.error('Error in getMyEventsGroupedByDate:', error)
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách sự kiện.',
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
        // Parse speakers similarly to createEvent: support speakers_json + uploaded files
        let speakers = []
        if (req.body.speakers_json) {
            try {
                const speakersData = JSON.parse(req.body.speakers_json)
                if (req.body.speakers && Array.isArray(req.body.speakers)) {
                    speakers = req.body.speakers.map((speaker, index) => {
                        const speakerData = speakersData[index] || {}
                        const photoFile = speaker.photo_url
                        return {
                            ...speakerData,
                            photo_url: photoFile || null
                        }
                    })
                } else {
                    speakers = speakersData
                }
            } catch (e) {
                console.error('Error parsing speakers_json:', e)
                speakers = req.body.speakers || []
            }
        } else if (req.body.speakers) {
            speakers = req.body.speakers
        }

        const { status, speakers_json, ...eventFields } = req.body
        
        if (status && !isValidStatus(status)) {
            return res.status(400).jsonify(null, 'Trạng thái không hợp lệ, phải là một trong: ' + Object.values(EVENT_STATUS).join(', '))
        }

        // Update event fields
        const event = await eventService.updateEvent(req.params.id, eventFields)
        if (!event) {
            return res.status(404).jsonify(null, 'Không tìm thấy sự kiện.')
        }

        // Handle speakers update if provided
        if (speakers !== undefined) {
            // Validate merged speakers
            if (speakers && speakers.length > 0) {
                const speakerSchema = Joi.object({
                    full_name: Joi.string().trim().max(255).required().label('Tên đầy đủ diễn giả'),
                    email: Joi.string().trim().email().required().label('Email diễn giả'),
                    bio: Joi.string().trim().max(5000).allow('').optional().label('Tiểu sử'),
                    phone: Joi.string().trim().max(20).allow('').optional().label('Số điện thoại'),
                    photo_url: Joi.alternatives().try(
                        Joi.string().trim().uri().allow(''),
                        Joi.object().instance(FileUpload)
                    ).optional().label('URL ảnh đại diện'),
                    professional_title: Joi.string().trim().max(255).allow('').optional().label('Chức danh'),
                    linkedin_url: Joi.string().trim().uri().allow('').optional().label('LinkedIn URL'),
                })

                const { error } = Joi.array().items(speakerSchema).validate(speakers, { abortEarly: false })
                if (error) {
                    const details = {}
                    for (const d of error.details) {
                        if (Array.isArray(d.path) && d.path.length >= 2) {
                            const idx = d.path[0]
                            const key = d.path[1]
                            details[`speakers.${idx}.${key}`] = d.message
                        } else if (Array.isArray(d.path) && d.path.length === 1) {
                            details[`speakers.${d.path[0]}`] = d.message
                        } else {
                            details[d.path.join('.')] = d.message
                        }
                    }
                    return res.status(400).json({ status: 400, success: false, message: 'Dữ liệu diễn giả không hợp lệ.', errors: details })
                }
            }

            // Delete existing speakers for this event
            const existingSpeakers = await speakerService.getSpeakersByEventId(req.params.id)
            for (const existingSpeaker of existingSpeakers) {
                await speakerService.deleteSpeaker(existingSpeaker.id)
            }

            // Create new speakers if provided
            if (speakers && speakers.length > 0) {
                await eventService.createSpeakersForEvent(req.params.id, speakers)
            }
        }

        // Fetch updated event with speakers
        const updatedEvent = await eventService.getEventById(req.params.id)
        const speakersList = await speakerService.getSpeakersByEventId(req.params.id)
        
        const result = {
            ...serializeEvent(updatedEvent),
            speakers: speakersList || []
        }
        
        res.jsonify(result, 'Cập nhật sự kiện thành công.')
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
