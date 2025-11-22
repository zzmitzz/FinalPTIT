import Joi from 'joi'
import {MAX_STRING_SIZE} from '@/configs'
import * as eventRepo from '@/db/event_repository'
import * as sessionRepo from '@/db/session_repository'
import {AsyncValidate} from '@/utils/classes'
import * as speakerRepo from '@/db/speaker_repository'

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
    title: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Tiêu đề phiên'),
    description: Joi.string()
        .trim()
        .max(5000)
        .allow('')
        .optional()
        .label('Mô tả phiên'),
    start_time: Joi.date()
        .required()
        .label('Thời gian bắt đầu')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const {event_id} = helpers.state.ancestors[0]
                    if (!event_id) return value

                    const event = await eventRepo.findEventById(event_id)
                    if (!event) return value

                    const sessionStart = new Date(value)
                    const eventStart = new Date(event.start_time)
                    const eventEnd = new Date(event.end_time)

                    if (sessionStart < eventStart || sessionStart > eventEnd) {
                        return helpers.message('{{#label}} phải nằm trong khoảng thời gian của sự kiện.')
                    }

                    return value
                })
        ),
    end_time: Joi.date()
        .required()
        .label('Thời gian kết thúc')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const {event_id, start_time} = helpers.state.ancestors[0]

                    // Validate end_time is after start_time
                    if (start_time) {
                        const sessionStart = new Date(start_time)
                        const sessionEnd = new Date(value)
                        if (sessionEnd <= sessionStart) {
                            return helpers.message('{{#label}} phải sau thời gian bắt đầu.')
                        }
                    }

                    if (!event_id) return value

                    const event = await eventRepo.findEventById(event_id)
                    if (!event) return value

                    const sessionEnd = new Date(value)
                    const eventStart = new Date(event.start_time)
                    const eventEnd = new Date(event.end_time)

                    if (sessionEnd < eventStart || sessionEnd > eventEnd) {
                        return helpers.message('{{#label}} phải nằm trong khoảng thời gian của sự kiện.')
                    }

                    return value
                })
        ),
    place: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Địa điểm'),
    capacity: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(50)
        .label('Sức chứa'),
    max_waitlist: Joi.number()
        .integer()
        .min(0)
        .optional()
        .label('Số lượng danh sách chờ tối đa'),
    is_active: Joi.boolean()
        .optional()
        .default(true)
        .label('Trạng thái hoạt động'),
    session_type: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .default('general')
        .label('Loại phiên'),
    prerequisites: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
        .label('Yêu cầu trước'),
    tags: Joi.array()
        .items(Joi.string().trim().max(MAX_STRING_SIZE))
        .optional()
        .default([])
        .label('Thẻ'),
    speakers: Joi.array()
        .items(Joi.number().integer().positive())
        .optional()
        .label('Danh sách diễn giả')
        .custom((value, helpers) =>
            new AsyncValidate(value, async function () {
                // value is array of speaker ids
                const { event_id } = helpers.state.ancestors[0]
                if (!value || !Array.isArray(value) || value.length === 0) return value
                if (!event_id) return value

                for (const spId of value) {
                    const sp = await speakerRepo.findSpeakerById(spId)
                    if (!sp || sp.event_id !== event_id) {
                        return helpers.message('Một hoặc nhiều diễn giả không thuộc sự kiện này.')
                    }
                }

                return value
            })
        ),
})

export const updateItem = Joi.object({
    title: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Tiêu đề phiên'),
    description: Joi.string()
        .trim()
        .max(5000)
        .allow('')
        .optional()
        .label('Mô tả phiên'),
    start_time: Joi.date()
        .optional()
        .label('Thời gian bắt đầu'),
    end_time: Joi.date()
        .optional()
        .when('start_time', {
            is: Joi.exist(),
            then: Joi.date().greater(Joi.ref('start_time')),
            otherwise: Joi.date()
        })
        .label('Thời gian kết thúc')
        .messages({
            'date.greater': '{{#label}} phải sau thời gian bắt đầu.'
        }),
    place: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Địa điểm'),
    capacity: Joi.number()
        .integer()
        .min(1)
        .optional()
        .label('Sức chứa'),
    max_waitlist: Joi.number()
        .integer()
        .min(0)
        .optional()
        .label('Số lượng danh sách chờ tối đa'),
    is_active: Joi.boolean()
        .optional()
        .label('Trạng thái hoạt động'),
    session_type: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Loại phiên'),
    prerequisites: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
        .label('Yêu cầu trước'),
    tags: Joi.array()
        .items(Joi.string().trim().max(MAX_STRING_SIZE))
        .optional()
        .label('Thẻ'),
})

export const updateProperties = Joi.object({
    title: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Tiêu đề phiên'),
    description: Joi.string()
        .trim()
        .max(5000)
        .allow('')
        .optional()
        .label('Mô tả phiên'),
    start_time: Joi.date()
        .optional()
        .label('Thời gian bắt đầu'),
    end_time: Joi.date()
        .optional()
        .label('Thời gian kết thúc'),
    place: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Địa điểm'),
    capacity: Joi.number()
        .integer()
        .min(1)
        .optional()
        .label('Sức chứa'),
    max_waitlist: Joi.number()
        .integer()
        .min(0)
        .optional()
        .label('Số lượng danh sách chờ tối đa'),
    is_active: Joi.boolean()
        .optional()
        .label('Trạng thái hoạt động'),
    session_type: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Loại phiên'),
    prerequisites: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
        .label('Yêu cầu trước'),
    tags: Joi.array()
        .items(Joi.string().trim().max(MAX_STRING_SIZE))
        .optional()
        .label('Thẻ'),
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

