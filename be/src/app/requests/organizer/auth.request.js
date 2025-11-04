import Joi from 'joi'
import * as organizerRepo from '@/db/organizer_repo'
import {MAX_STRING_SIZE, VALIDATE_FULL_NAME_REGEX, VALIDATE_PASSWORD_REGEX, VALIDATE_PHONE_REGEX} from '@/configs'
import {AsyncValidate, FileUpload} from '@/utils/classes'

export const login = Joi.object({
    email: Joi.string().trim().max(MAX_STRING_SIZE).lowercase().email().required().label('Email'),
    password: Joi.string().max(MAX_STRING_SIZE).required().label('Mật khẩu'),
})

export const register = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).pattern(VALIDATE_FULL_NAME_REGEX).required().label('Họ và tên')
        .messages({'string.pattern.base': '{{#label}} không bao gồm số hay ký tự đặc biệt.'}),
    email: Joi.string().trim().max(MAX_STRING_SIZE).lowercase().email().required().label('Email')
        .custom((value, helpers) => new AsyncValidate(value, async function () {
            const user = await organizerRepo.findOrganizerByEmail(value)
            return !user ? value : helpers.error('any.exists')
        })),
    password: Joi.string().min(6).max(MAX_STRING_SIZE).pattern(VALIDATE_PASSWORD_REGEX).required().label('Mật khẩu')
        .messages({'string.pattern.base': '{{#label}} phải có ít nhất một chữ thường, chữ hoa, số và ký tự đặc biệt.'}),
    phone: Joi.string().trim().pattern(VALIDATE_PHONE_REGEX).allow('').required().label('Số điện thoại'),
    avatar: Joi.object({
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').required().label('Định dạng ảnh'),
    }).unknown(true).instance(FileUpload).allow('').label('Ảnh đại diện'),
})

export const updateProfile = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).pattern(VALIDATE_FULL_NAME_REGEX).required().label('Họ và tên')
        .messages({'string.pattern.base': '{{#label}} không bao gồm số hay ký tự đặc biệt.'}),
    email: Joi.string().trim().lowercase().email().max(MAX_STRING_SIZE).required().label('Email')
        .custom((value, helpers) => new AsyncValidate(value, async function (req) {
            const user = await organizerRepo.findOrganizerByEmail(value)
            // Allow if email belongs to current user or doesn't exist
            return (!user || user._id === req.currentOrganizer._id) ? value : helpers.error('any.exists')
        })),
    phone: Joi.string().trim().pattern(VALIDATE_PHONE_REGEX).allow('').required().label('Số điện thoại'),
    avatar: Joi.object({
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').required().label('Định dạng ảnh'),
    }).unknown(true).instance(FileUpload).allow('').label('Ảnh đại diện'),
})

export const changePassword = Joi.object({
    password: Joi.string().required().label('Mật khẩu cũ'),
    new_password: Joi.string().min(6).max(MAX_STRING_SIZE).pattern(VALIDATE_PASSWORD_REGEX).required().label('Mật khẩu mới')
        .messages({'string.pattern.base': '{{#label}} phải có ít nhất một chữ thường, chữ hoa, số và ký tự đặc biệt.'}),
})

export const forgotPassword = Joi.object({
    email: Joi.string().trim().lowercase().email().max(MAX_STRING_SIZE).required().label('Email')
        .custom((value, helpers) => new AsyncValidate(value, async function (req) {
            const user = await organizerRepo.findOrganizerByEmail(value)
            req.currentOrganizer = user
            return user ? value : helpers.message('{{#label}} không tồn tại.')
        })),
})

export const resetPassword = Joi.object({
    new_password: Joi.string().min(6).max(MAX_STRING_SIZE).pattern(VALIDATE_PASSWORD_REGEX).required().label('Mật khẩu mới')
        .messages({'string.pattern.base': '{{#label}} phải có ít nhất một chữ thường, chữ hoa, số và ký tự đặc biệt.'}),
}) 