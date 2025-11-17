import Joi from 'joi'
import { EVENT_STATUS, MAX_STRING_SIZE, EVENT_CATEGORY } from '@/configs'
import { AsyncValidate, FileUpload } from '@/utils/classes'
import * as eventRepo from '@/db/event_repository'

export const createItem = Joi.object({
    name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Tên sự kiện')
        .custom((value, helpers) =>
            new AsyncValidate(value, async function() {
                const existingEvents = await eventRepo.findEventByName(value)
                return existingEvents.length === 0
                    ? value
                    : helpers.error('any.exists')
            })
        )
        .messages({
            'any.exists': '{{#label}} đã tồn tại.'
        }),
    thumbnail: Joi.object({
        originalname: Joi.string().trim().required().label('Tên ảnh'),
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
            .required()
            .label('Định dạng ảnh'),
        buffer: Joi.binary()
            .max(25 * 1024 ** 2)
            .required()
            .label('Thumbnail'),
    })
        .unknown(true)
        .instance(FileUpload)
        .required()
        .label('Thumbnail'),
    logo: Joi.array()
        .single()
        .items(
            Joi.object({
                mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').label(
                    'Định dạng ảnh'
                ),
            })
                .unknown(true)
                .instance(FileUpload)
                .allow('')
                .label('Logo')
        )
        .default([]),
    description: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE * 10)
        .allow('')
        .label('Mô tả sự kiện'),
    
    start_time: Joi.date()
        .required()
        .min('now')
        .label('Thời gian bắt đầu')
        .messages({
            'date.min': '{{#label}} không được nhỏ hơn thời gian hiện tại.'
        }),
    lat: Joi.number()
        .required()
        .label('Vĩ độ'),
    lng: Joi.number()
        .required()
        .label('Kinh độ'),
    end_time: Joi.date()
        .required()
        .greater(Joi.ref('start_time'))
        .label('Thời gian kết thúc')
        .messages({
            'date.greater': '{{#label}} phải lớn hơn thời gian bắt đầu.'
        }),
    
    location: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Địa điểm'),

    capacity: Joi.number()
        .integer()
        .min(1)
        .required()
        .label('Sức chứa')
        .messages({
            'number.base': '{{#label}} phải là số.',
            'number.min': '{{#label}} phải lớn hơn 0.',
            'any.required': '{{#label}} là bắt buộc.'
        }),

    category_id: Joi.alternatives()
        .try(
            Joi.string().trim().uuid(),
            Joi.string().trim().valid(...Object.values(EVENT_CATEGORY))
        )
        .label('Danh mục'),

    tags: Joi.array()
        .items(Joi.string().trim().max(50))
        .optional()
        .default([])
        .label('Thẻ'),

    speakers: Joi.array()
        .items(
            Joi.alternatives().try(
                // full speaker object (client may send full objects inline)
                Joi.object({
                    full_name: Joi.string()
                        .trim()
                        .max(MAX_STRING_SIZE)
                        .required()
                        .label('Tên đầy đủ diễn giả'),
                    bio: Joi.string()
                        .trim()
                        .max(5000)
                        .allow('')
                        .optional()
                        .label('Tiểu sử'),
                    email: Joi.string()
                        .trim()
                        .email()
                        .required()
                        .label('Email diễn giả'),
                    phone: Joi.string()
                        .trim()
                        .max(20)
                        .allow('')
                        .optional()
                        .label('Số điện thoại'),
                    photo_url: Joi.object({
                        originalname: Joi.string().trim().required().label('Tên ảnh'),
                        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
                            .required()
                            .label('Định dạng ảnh'),
                        buffer: Joi.binary()
                            .max(25 * 1024 ** 2)
                            .required()
                            .label('Ảnh diễn giả'),
                    })
                        .unknown(true)
                        .instance(FileUpload)
                        .optional()
                        .allow(null)
                        .label('Ảnh đại diện'),
                    professional_title: Joi.string()
                        .trim()
                        .max(MAX_STRING_SIZE)
                        .allow('')
                        .optional()
                        .label('Chức danh'),
                    linkedin_url: Joi.string()
                        .trim()
                        .uri()
                        .allow('')
                        .optional()
                        .label('LinkedIn URL'),
                }),
                // file-only entry created by formDataHandler when client sends speakers_json + files
                Joi.object({
                    photo_url: Joi.object({
                        originalname: Joi.string().trim().required().label('Tên ảnh'),
                        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
                            .required()
                            .label('Định dạng ảnh'),
                        buffer: Joi.binary()
                            .max(25 * 1024 ** 2)
                            .required()
                            .label('Ảnh diễn giả'),
                    })
                        .unknown(true)
                        .instance(FileUpload)
                        .required()
                        .label('Ảnh đại diện'),
                }).label('Ảnh diễn giả (file only)')
            )
        )
        .optional()
        .default([])
        .label('Danh sách diễn giả'),

})

export const updateItem = Joi.object({
    name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .label('Tên sự kiện')
        .custom((value, helpers) =>
            new AsyncValidate(value, async function(req) {
                const existingEvents = await eventRepo.findEventByName(value)
                // Allow if no events found or if it's the same event being updated
                return existingEvents.length === 0 ||
                       (existingEvents.length === 1 && existingEvents[0]._id === req.params.id)
                    ? value
                    : helpers.error('any.exists')
            })
        )
        .messages({
            'any.exists': '{{#label}} đã tồn tại.'
        }),
    
    thumbnail: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('')
        .label('Thumbnail'),
    
    logo: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('')
        .label('Logo'),
    
    description: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE * 10)
        .allow('')
        .label('Mô tả sự kiện'),
    
    start_time: Joi.date()
        .min('now')
        .label('Thời gian bắt đầu')
        .messages({
            'date.min': '{{#label}} không được nhỏ hơn thời gian hiện tại.'
        }),
    
    end_time: Joi.date()
        .when('start_time', {
            is: Joi.exist(),
            then: Joi.date().greater(Joi.ref('start_time')),
            otherwise: Joi.date()
        })
        .label('Thời gian kết thúc')
        .messages({
            'date.greater': '{{#label}} phải lớn hơn thời gian bắt đầu.'
        }),
    
    location: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .label('Địa điểm'),

    capacity: Joi.number()
        .integer()
        .min(1)
        .label('Sức chứa')
        .messages({
            'number.base': '{{#label}} phải là số.',
            'number.min': '{{#label}} phải lớn hơn 0.'
        }),

    category_id: Joi.alternatives()
        .try(
            Joi.string().trim().uuid(),
            Joi.string().trim().valid(...Object.values(EVENT_CATEGORY))
        )
        .label('Danh mục'),

    tags: Joi.array()
        .items(Joi.string().trim().max(50))
        .label('Thẻ'),
    
    status: Joi.string()
        .valid(...Object.values(EVENT_STATUS))
        .label('Trạng thái'),
    
    pin_code: Joi.string()
        .trim()
        .length(6)
        .pattern(/^[0-9]+$/)
        .label('Mã PIN')
        .custom((value, helpers) => 
            new AsyncValidate(value, async function(req) {
                const existingEvent = await eventRepo.findEventByPinCode(value)
                // Allow if it's the same event being updated
                return !existingEvent || existingEvent._id === req.params.id 
                    ? value 
                    : helpers.error('any.exists')
            })
        ),
    
    approver_id: Joi.string()
        .trim()
        .uuid()
        .label('Người phê duyệt'),

    speakers: Joi.array()
        .items(
            Joi.alternatives().try(
                // full speaker object (strings) used when updating via JSON
                Joi.object({
                    full_name: Joi.string()
                        .trim()
                        .max(MAX_STRING_SIZE)
                        .required()
                        .label('Tên đầy đủ diễn giả'),
                    bio: Joi.string()
                        .trim()
                        .max(5000)
                        .allow('')
                        .optional()
                        .label('Tiểu sử'),
                    email: Joi.string()
                        .trim()
                        .email()
                        .required()
                        .label('Email diễn giả'),
                    phone: Joi.string()
                        .trim()
                        .max(20)
                        .allow('')
                        .optional()
                        .label('Số điện thoại'),
                    photo_url: Joi.string()
                        .trim()
                        .uri()
                        .allow('')
                        .optional()
                        .label('URL ảnh đại diện'),
                    professional_title: Joi.string()
                        .trim()
                        .max(MAX_STRING_SIZE)
                        .allow('')
                        .optional()
                        .label('Chức danh'),
                    linkedin_url: Joi.string()
                        .trim()
                        .uri()
                        .allow('')
                        .optional()
                        .label('LinkedIn URL'),
                }),
                // allow file-only object produced by formDataHandler when client sends speakers_json + files
                Joi.object({
                    photo_url: Joi.object({
                        originalname: Joi.string().trim().required().label('Tên ảnh'),
                        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
                            .required()
                            .label('Định dạng ảnh'),
                        buffer: Joi.binary().max(25 * 1024 ** 2).required().label('Ảnh diễn giả'),
                    })
                        .unknown(true)
                        .instance(FileUpload)
                        .required()
                        .label('Ảnh đại diện (file)'),
                }).label('Ảnh diễn giả (file only)')
            )
        )
        .optional()
        .label('Danh sách diễn giả'),
})
