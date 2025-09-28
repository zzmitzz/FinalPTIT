import {MAX_STRING_SIZE, VALIDATE_PHONE_REGEX} from '@/configs'
import {EVENT_STATE, Organizer} from '@/models'
import {AsyncValidate} from '@/utils/classes'
import {tryValidateOrDefault} from '@/utils/helpers'
import Joi from 'joi'

export const createItem = Joi.object({
    name: Joi.string().trim().max(50).required().label('Tên đối tác'),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .lowercase()
        .email()
        .required()
        .label('Email')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const organizer = await Organizer.findOne({email: value, deleted: false})
                    return !organizer ? value : helpers.error('any.exists')
                })
        ),
    phone: Joi.string()
        .trim()
        .max(50)
        .required()
        .pattern(VALIDATE_PHONE_REGEX)
        .label('Số điện thoại')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const organizer = await Organizer.findOne({phone: value, deleted: false})
                    return !organizer ? value : helpers.error('any.exists')
                })
        ),
    password: Joi.string().min(6).max(50).required().label('Mật khẩu'),
})

export const updateItem = Joi.object({
    name: Joi.string().trim().max(50).required().label('Tên đối tác'),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .lowercase()
        .email()
        .required()
        .label('Email')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const organizer = await Organizer.findOne({
                        email: value,
                        deleted: false,
                        _id: {$ne: req.organizer._id},
                    })
                    return !organizer ? value : helpers.error('any.exists')
                })
        ),
    phone: Joi.string()
        .trim()
        .max(50)
        .pattern(VALIDATE_PHONE_REGEX)
        .required()
        .label('Số điện thoại')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const organizer = await Organizer.findOne({
                        phone: value,
                        deleted: false,
                        _id: {$ne: req.organizer._id},
                    })
                    return !organizer ? value : helpers.error('any.exists')
                })
        ),
})

export const changePassword = Joi.object({
    password: Joi.string().min(6).max(50).required().label('Mật khẩu'),
})

export const getList = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), null),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 20),
    field: tryValidateOrDefault(Joi.valid('created_at', 'name', 'email', 'phone'), 'created_at'),
    sort_order: tryValidateOrDefault(Joi.valid('asc', 'desc'), 'desc'),
})

export const getListEventByOrganizerId = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), null),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 20),
    start_time: tryValidateOrDefault(Joi.date(), null),
    end_time: tryValidateOrDefault(Joi.date(), null),
    field: tryValidateOrDefault(
        Joi.valid('created_at', 'name', 'start_time', 'end_time', 'location', 'is_locked'),
        'created_at'
    ),
    sort_order: tryValidateOrDefault(Joi.valid('asc', 'desc'), 'desc'),
    state: tryValidateOrDefault(Joi.string().valid(...Object.values(EVENT_STATE)), null),
})
