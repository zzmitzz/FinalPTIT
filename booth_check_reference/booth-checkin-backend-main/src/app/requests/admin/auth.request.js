import Joi from 'joi'
import {Admin} from '@/models'
import {MAX_STRING_SIZE, VALIDATE_PHONE_REGEX} from '@/configs'
import {AsyncValidate} from '@/utils/classes'

export const login = Joi.object({
    email: Joi.string().trim().max(MAX_STRING_SIZE).lowercase().email().required().label('Email'),
    password: Joi.string().max(MAX_STRING_SIZE).required().label('Mật khẩu'),
})

export const updateProfile = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).required().label('Họ và tên'),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow('')
        .required()
        .label('Số điện thoại')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const user = await Admin.findOne({phone: value, _id: {$ne: req.currentAdmin._id}, deleted: false})
                    return !user ? value : helpers.error('any.exists')
                })
        ),
})

export const changePassword = Joi.object({
    password: Joi.string()
        .required()
        .label('Mật khẩu cũ')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, (req) =>
                    req.currentAdmin.verifyPassword(value)
                        ? value
                        : helpers.message('{#label} không chính xác')
                )
        ),
    new_password: Joi.string()
        .min(6)
        .max(MAX_STRING_SIZE)
        .required()
        .label('Mật khẩu mới')
        .invalid(Joi.ref('password')),
})

export const forgotPassword = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Email')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const admin = await Admin.findOne({email: value, deleted: false})
                    req.currentAdmin = admin
                    return admin ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
})

export const resetPassword = Joi.object({
    new_password: Joi.string()
        .min(6)
        .max(MAX_STRING_SIZE)
        .required()
        .label('Mật khẩu mới')
})
