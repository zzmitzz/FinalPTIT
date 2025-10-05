import Joi from 'joi'
import * as registrationRepo from '@/db/registration_repository'
import {MAX_STRING_SIZE, VALIDATE_PASSWORD_REGEX, VALIDATE_PHONE_REGEX} from '@/configs'
import {AsyncValidate} from '@/utils/classes'

export const login = Joi.object({
    email: Joi.string().trim().max(MAX_STRING_SIZE).lowercase().email().required().label('Email'),
    password: Joi.string().max(MAX_STRING_SIZE).required().label('Mật khẩu'),
})

export const register = Joi.object({
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
                    const user = await registrationRepo.findRegistrationByEmail(value)
                    return !user ? value : helpers.error('any.exists')
                })
        ),
    password: Joi.string()
        .min(6)
        .max(MAX_STRING_SIZE)
        .pattern(VALIDATE_PASSWORD_REGEX)
        .required()
        .label('Mật khẩu')
        .messages({
            'string.pattern.base':
                '{{#label}} phải có ít nhất một chữ thường, chữ hoa, số và ký tự đặc biệt.',
        }),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow('')
        .optional()
        .label('Số điện thoại'),
})

export const updateProfile = Joi.object({
    full_name: Joi.string().trim().max(MAX_STRING_SIZE).optional().label('Họ và tên'),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow('')
        .optional()
        .label('Số điện thoại'),
    dob: Joi.date().optional().label('Ngày sinh'),
    gender: Joi.string().valid('male', 'female', 'other').optional().label('Giới tính'),
    address: Joi.string().trim().max(MAX_STRING_SIZE).allow('').optional().label('Địa chỉ'),
    bio: Joi.string().trim().max(1000).allow('').optional().label('Tiểu sử'),
})

export const changePassword = Joi.object({
    password: Joi.string().required().label('Mật khẩu cũ'),
    new_password: Joi.string()
        .min(6)
        .max(MAX_STRING_SIZE)
        .pattern(VALIDATE_PASSWORD_REGEX)
        .required()
        .label('Mật khẩu mới')
        .messages({
            'string.pattern.base':
                '{{#label}} phải có ít nhất một chữ thường, chữ hoa, số và ký tự đặc biệt.',
        })
        .custom(function (value, helpers) {
            const {data} = helpers.prefs.context
            return data.password === data.new_password
                ? helpers.message('{{#label}} không được trùng với mật khẩu cũ.')
                : value
        }),
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
                    const user = await registrationRepo.findRegistrationByEmail(value)
                    req.currentRegistration = user
                    return user ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
})

export const resetPassword = Joi.object({
    new_password: Joi.string()
        .min(6)
        .max(MAX_STRING_SIZE)
        .pattern(VALIDATE_PASSWORD_REGEX)
        .required()
        .label('Mật khẩu mới')
        .messages({
            'string.pattern.base':
                '{{#label}} phải có ít nhất một chữ thường, chữ hoa, số và ký tự đặc biệt.',
        }),
})

