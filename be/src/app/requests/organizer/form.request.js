import Joi from 'joi'
import { FIELD_TYPE, MAX_STRING_SIZE } from '@/configs'
import * as eventRepo from '@/db/event_repository'
import { AsyncValidate } from '@/utils/classes'

export const createFormWithFields = Joi.object({
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
        .label('Tiêu đề form'),
    description: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .default('')
        .label('Mô tả form'),
    is_public: Joi.boolean()
        .default(false)
        .label('Công khai'),
    fields: Joi.array()
        .items(
            Joi.object({
                field_label: Joi.string()
                    .trim()
                    .max(MAX_STRING_SIZE)
                    .required()
                    .label('Nhãn trường'),
                field_description: Joi.string()
                    .trim()
                    .max(1000)
                    .allow('')
                    .optional()
                    .label('Mô tả trường'),
                field_type: Joi.string()
                    .valid(...Object.values(FIELD_TYPE))
                    .required()
                    .label('Loại trường'),
                field_options: Joi.array()
                    .items(Joi.string().trim().max(MAX_STRING_SIZE))
                    .default([])
                    .label('Tùy chọn trường'),
                field_has_other_option: Joi.boolean()
                    .default(false)
                    .label('Có tùy chọn khác'),
                field_range: Joi.object({
                    min: Joi.number().allow(null).optional().label('Giá trị tối thiểu'),
                    max: Joi.number().allow(null).optional().label('Giá trị tối đa'),
                })
                    .default({ min: null, max: null })
                    .label('Phạm vi giá trị'),
                field_extensions: Joi.array()
                    .items(Joi.string().trim())
                    .default([])
                    .label('Phần mở rộng file'),
                required: Joi.boolean()
                    .default(false)
                    .label('Bắt buộc'),
                is_primary_key: Joi.boolean()
                    .default(false)
                    .label('Khóa chính'),
                can_edit: Joi.boolean()
                    .default(true)
                    .label('Có thể chỉnh sửa'),
                position: Joi.number()
                    .integer()
                    .min(0)
                    .required()
                    .label('Vị trí'),
            })
        )
        .min(1)
        .required()
        .label('Danh sách trường'),
})

export const updateForm = Joi.object({
    title: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Tiêu đề form'),
    description: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
        .label('Mô tả form'),
    is_public: Joi.boolean()
        .optional()
        .label('Công khai'),
})

