import Joi from 'joi'
import {MAX_STRING_SIZE} from '@/configs'
import * as eventRepo from '@/db/event_repository'
import * as speakerRepo from '@/db/speaker_repository'
import {AsyncValidate, FileUpload} from '@/utils/classes'

export const createItem = Joi.object({
    event_id: Joi.string()
        .trim()
        .required()
        .label('Event ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const event = await eventRepo.findEventById(value)
                    return event ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
    full_name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Tên đầy đủ'),
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
        .label('Email')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const existingSpeaker = await speakerRepo.findSpeakerByEmail(value)
                    return existingSpeaker ? helpers.message('{{#label}} đã được sử dụng.') : value
                })
        ),
    phone: Joi.string()
        .trim()
        .max(20)
        .allow('')
        .optional()
        .label('Số điện thoại'),
    organization: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('')
        .optional()
        .label('Tổ chức'),
    photo_url: Joi.alternatives().try(
        Joi.string().trim().uri().allow('').optional(),
        Joi.object({
            originalname: Joi.string().trim().required().label('Tên ảnh'),
            mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
                .required()
                .label('Định dạng ảnh'),
            buffer: Joi.binary().required().label('Ảnh diễn giả'),
        })
            .unknown(true)
            .instance(FileUpload)
    ).optional().label('URL ảnh'),
    title: Joi.string()
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
    expertise_areas: Joi.array()
        .items(Joi.string().trim().max(MAX_STRING_SIZE))
        .optional()
        .default([])
        .label('Lĩnh vực chuyên môn'),
    years_experience: Joi.number()
        .integer()
        .min(0)
        .optional()
        .label('Số năm kinh nghiệm'),
    is_keynote_speaker: Joi.boolean()
        .optional()
        .default(false)
        .label('Diễn giả chính'),
    is_active: Joi.boolean()
        .optional()
        .default(true)
        .label('Trạng thái hoạt động'),
})

export const updateItem = Joi.object({
    full_name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Tên đầy đủ'),
    bio: Joi.string()
        .trim()
        .max(5000)
        .allow('')
        .optional()
        .label('Tiểu sử'),
    email: Joi.string()
        .trim()
        .email()
        .optional()
        .label('Email')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const {id} = helpers.state.ancestors[0]
                    const existingSpeaker = await speakerRepo.findSpeakerByEmail(value)
                    // Allow if email belongs to the same speaker being updated
                    if (existingSpeaker && existingSpeaker.id !== parseInt(id)) {
                        return helpers.message('{{#label}} đã được sử dụng.')
                    }
                    return value
                })
        ),
    phone: Joi.string()
        .trim()
        .max(20)
        .allow('')
        .optional()
        .label('Số điện thoại'),
    organization: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('')
        .optional()
        .label('Tổ chức'),
    photo_url: Joi.alternatives().try(
        Joi.string().trim().uri().allow('').optional(),
        Joi.object({
            originalname: Joi.string().trim().required().label('Tên ảnh'),
            mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
                .required()
                .label('Định dạng ảnh'),
            buffer: Joi.binary().required().label('Ảnh diễn giả'),
        })
            .unknown(true)
            .instance(FileUpload)
    ).optional().label('URL ảnh'),
    title: Joi.string()
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
    expertise_areas: Joi.array()
        .items(Joi.string().trim().max(MAX_STRING_SIZE))
        .optional()
        .label('Lĩnh vực chuyên môn'),
    years_experience: Joi.number()
        .integer()
        .min(0)
        .optional()
        .label('Số năm kinh nghiệm'),
    is_keynote_speaker: Joi.boolean()
        .optional()
        .label('Diễn giả chính'),
    is_active: Joi.boolean()
        .optional()
        .label('Trạng thái hoạt động'),
})

export const updateProperties = Joi.object({
    full_name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Tên đầy đủ'),
    bio: Joi.string()
        .trim()
        .max(5000)
        .allow('')
        .optional()
        .label('Tiểu sử'),
    email: Joi.string()
        .trim()
        .email()
        .optional()
        .label('Email'),
    phone: Joi.string()
        .trim()
        .max(20)
        .allow('')
        .optional()
        .label('Số điện thoại'),
    organization: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('')
        .optional()
        .label('Tổ chức'),
    photo_url: Joi.alternatives().try(
        Joi.string().trim().uri().allow('').optional(),
        Joi.object({
            originalname: Joi.string().trim().required().label('Tên ảnh'),
            mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
                .required()
                .label('Định dạng ảnh'),
            buffer: Joi.binary().required().label('Ảnh diễn giả'),
        })
            .unknown(true)
            .instance(FileUpload)
    ).optional().label('URL ảnh'),
    title: Joi.string()
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
    expertise_areas: Joi.array()
        .items(Joi.string().trim().max(MAX_STRING_SIZE))
        .optional()
        .label('Lĩnh vực chuyên môn'),
    years_experience: Joi.number()
        .integer()
        .min(0)
        .optional()
        .label('Số năm kinh nghiệm'),
    is_keynote_speaker: Joi.boolean()
        .optional()
        .label('Diễn giả chính'),
    is_active: Joi.boolean()
        .optional()
        .label('Trạng thái hoạt động'),
})

export const getListByEventId = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(1)
        .label('Trang'),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .label('Số lượng mỗi trang'),
})

export const searchItems = Joi.object({
    q: Joi.string()
        .trim()
        .allow('')
        .optional()
        .default('')
        .label('Từ khóa tìm kiếm'),
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(1)
        .label('Trang'),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .label('Số lượng mỗi trang'),
})

export const getSpeakersByExpertise = Joi.object({
    expertise: Joi.alternatives()
        .try(
            Joi.string().trim(),
            Joi.array().items(Joi.string().trim())
        )
        .required()
        .label('Lĩnh vực chuyên môn'),
})

