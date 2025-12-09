import Joi from 'joi'
import { RESOURCE_TYPE, MAX_STRING_SIZE } from '@/configs'
import { abort } from '@/utils/helpers'
import * as resourceRepo from '@/db/resource_repository'
import * as eventRepo from '@/db/event_repository'
import * as sessionRepo from '@/db/session_repository'
import { FileUpload } from '@/utils/classes'

const checkNameDuplicate = async (name, eventId, sessionId, excludeId = null) => {
    let resources
    if (sessionId) {
        resources = await resourceRepo.findResourcesBySessionId(sessionId)
    } else if (eventId) {
        resources = await resourceRepo.findResourcesByEventId(eventId)
    } else {
        return true
    }

    const duplicate = resources.find(r =>
        r.name.toLowerCase() === name.toLowerCase() &&
        (!excludeId || r.id !== excludeId)
    )

    return !duplicate
}

export const createItem = Joi.object({
    event_id: Joi.string()
        .uuid()
        .optional()
        .label('Event ID')
        .external(async (value, helpers) => {
            const { session_id } = helpers.prefs.context?.data || {}

            if (!value && !session_id) {
                throw new Error('Phải cung cấp event_id hoặc session_id.')
            }
            if (value && session_id) {
                throw new Error('Chỉ được cung cấp event_id hoặc session_id, không được cả hai.')
            }

            if (value) {
                const event = await eventRepo.findEventById(value)
                if (!event) {
                    throw new Error('Không tìm thấy sự kiện.')
                }
            }
            return value
        }),
    session_id: Joi.number()
        .integer()
        .optional()
        .label('Session ID')
        .external(async (value, helpers) => {
            if (value) {
                const session = await sessionRepo.findSessionById(value)
                if (!session) {
                    throw new Error('Không tìm thấy phiên.')
                }
            }
            return value
        }),
    resource_type: Joi.string()
        .valid(...Object.values(RESOURCE_TYPE))
        .required()
        .label('Loại tài nguyên'),
    name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Tên tài nguyên')
        .external(async (value, helpers) => {
            const { event_id, session_id } = helpers.prefs.context
            const isUnique = await checkNameDuplicate(value, event_id, session_id)
            if (!isUnique) {
                throw new Error('Tên tài nguyên đã tồn tại trong sự kiện/phiên này.')
            }
            return value
        }),
    file: Joi.when('resource_type', {
        is: RESOURCE_TYPE.FILE,
        then: Joi.object({
            originalname: Joi.string()
                .trim()
                .required()
                .label('Tên tệp'),
            mimetype: Joi.string()
                .required()
                .label('Định dạng tệp'),
            buffer: Joi.binary()
                .max(50 * 1024 * 1024)
                .required()
                .label('Tệp tải lên')
                .messages({
                    'binary.max': '{{#label}} không được vượt quá 50MB.'
                })
        })
            .unknown(true)
            .instance(FileUpload)
            .required()
            .label('Tệp'),
        otherwise: Joi.forbidden()
    }),
    maps: Joi.when('resource_type', {
        is: RESOURCE_TYPE.MAPS,
        then: Joi.object({
            originalname: Joi.string()
                .trim()
                .required()
                .label('Tên tệp'),

            mimetype: Joi.string()
                .valid(
                    'image/jpeg',
                    'image/png',
                    'image/webp',
                    'image/gif',
                    'image/svg+xml',
                    'image/heic',
                    'image/heif'
                )
                .required()
                .label('Định dạng tệp')
                .messages({
                    'any.only': '{{#label}} phải là định dạng ảnh hợp lệ.'
                }),

            buffer: Joi.binary()
                .max(50 * 1024 * 1024)
                .required()
                .label('Tệp tải lên')
                .messages({
                    'binary.max': '{{#label}} không được vượt quá 50MB.'
                })
        })
            .unknown(true)
            .instance(FileUpload)
            .required()
            .label('Bản đồ'),

        otherwise: Joi.forbidden()
    }),
    description: Joi.string()
        .trim()
        .max(5000)
        .optional()
        .allow('')
        .label('Mô tả'),
    is_public: Joi.boolean()
        .default(true)
        .label('Công khai'),
    is_active: Joi.boolean()
        .default(true)
        .label('Kích hoạt'),
    tags: Joi.array()
        .items(Joi.string().trim())
        .default([])
        .label('Thẻ')
})

export const updateItem = Joi.object({
    resource_type: Joi.string()
        .valid(...Object.values(RESOURCE_TYPE))
        .optional()
        .label('Loại tài nguyên'),
    name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Tên tài nguyên')
        .external(async (value, helpers) => {
            if (value) {
                const { resource } = helpers.prefs.context
                const isUnique = await checkNameDuplicate(
                    value,
                    resource.event_id,
                    resource.session_id,
                    resource.id
                )
                if (!isUnique) {
                    throw new Error('Tên tài nguyên đã tồn tại trong sự kiện/phiên này.')
                }
            }
            return value
        }),
    file: Joi.when('resource_type', {
        is: RESOURCE_TYPE.FILE,
        then: Joi.object({
            originalname: Joi.string()
                .trim()
                .required()
                .label('Tên tệp'),
            mimetype: Joi.string()
                .required()
                .label('Định dạng tệp'),
            buffer: Joi.binary()
                .max(10 * 1024 * 1024)
                .required()
                .label('Tệp tải lên')
                .messages({
                    'binary.max': '{{#label}} không được vượt quá 10MB.'
                })
        })
            .unknown(true)
            .instance(FileUpload)
            .optional()
            .label('Tệp'),
        otherwise: Joi.forbidden()
    }),
    description: Joi.string()
        .trim()
        .max(5000)
        .optional()
        .allow('')
        .label('Mô tả'),
    is_public: Joi.boolean()
        .optional()
        .label('Công khai'),
    is_active: Joi.boolean()
        .optional()
        .label('Kích hoạt'),
    tags: Joi.array()
        .items(Joi.string().trim())
        .optional()
        .label('Thẻ')
})

export const getListByEvent = Joi.object({
    eventId: Joi.string()
        .uuid()
        .required()
        .label('Event ID')
})

export const getListBySession = Joi.object({
    sessionId: Joi.number()
        .integer()
        .required()
        .label('Session ID')
})

export const checkActivation = Joi.object({
    id: Joi.number()
        .integer()
        .required()
        .label('Resource ID')
})
