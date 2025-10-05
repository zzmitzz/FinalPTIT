import Joi from 'joi'
import {FIELD_TYPE, MAX_STRING_SIZE} from '@/configs'
import * as formFieldRepo from '@/db/form_fields'
import * as formRepo from '@/db/form_repository'
import {AsyncValidate} from '@/utils/classes'

export const createItem = Joi.object({
    form_id: Joi.string()
        .trim()
        .required()
        .label('Form ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const form = await formRepo.findFormById(value)
                    return form ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
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
        .default({min: null, max: null})
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

export const updateItem = Joi.object({
    field_label: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Nhãn trường'),
    field_description: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
        .label('Mô tả trường'),
    field_type: Joi.string()
        .valid(...Object.values(FIELD_TYPE))
        .optional()
        .label('Loại trường'),
    field_options: Joi.array()
        .items(Joi.string().trim().max(MAX_STRING_SIZE))
        .optional()
        .label('Tùy chọn trường'),
    field_has_other_option: Joi.boolean()
        .optional()
        .label('Có tùy chọn khác'),
    field_range: Joi.object({
        min: Joi.number().allow(null).optional().label('Giá trị tối thiểu'),
        max: Joi.number().allow(null).optional().label('Giá trị tối đa'),
    })
        .optional()
        .label('Phạm vi giá trị'),
    field_extensions: Joi.array()
        .items(Joi.string().trim())
        .optional()
        .label('Phần mở rộng file'),
    required: Joi.boolean()
        .optional()
        .label('Bắt buộc'),
    is_primary_key: Joi.boolean()
        .optional()
        .label('Khóa chính'),
    can_edit: Joi.boolean()
        .optional()
        .label('Có thể chỉnh sửa'),
    position: Joi.number()
        .integer()
        .min(0)
        .optional()
        .label('Vị trí'),
})

export const getListByFormId = Joi.object({
    form_id: Joi.string()
        .trim()
        .required()
        .label('Form ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const form = await formRepo.findFormById(value)
                    return form ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
})

