import Joi from 'joi'
import {Admin, Role} from '@/models'
import {MAX_STRING_SIZE, VALIDATE_PHONE_REGEX} from '@/configs'
import {AsyncValidate} from '@/utils/classes'
import {validateName} from '@/utils/helpers/name.helper'
import {isValidObjectId} from 'mongoose'

export const createAdmin = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).custom(validateName).required().label('Họ tên'),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .lowercase()
        .email()
        .required()
        .label('Email')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function() {
                    const admin = await Admin.findOne({email: value, deleted: false})

                    return !admin ? value : helpers.error('any.exists')
                })
        ),
    password: Joi.string()
        .min(6)
        .max(MAX_STRING_SIZE)
        .required()
        .label('Mật khẩu'),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow('')
        .label('Số điện thoại')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function() {
                    if (value) {
                        const admin = await Admin.findOne({phone: value, deleted: false})
                        return !admin ? value : helpers.error('any.exists')
                    }
                    return value
                })
        ),
    role_ids: Joi.array().items(
        Joi.string().custom(function(value, helpers) {
            if (!isValidObjectId(value)) {
                return helpers.message('{{#label}} không hợp lệ.')
            }

            return new AsyncValidate(value, async function() {
                if (value) {
                    const role = await Role.findOne({_id: value, is_protected: false})
                    return role ? value : helpers.message('{{#label}} không hợp lệ.')
                }

                return value
            })
        }).label('Vai trò')
    ).label('Vai trò')
})

export const updateAdmin = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).custom(validateName).required().label('Họ tên'),
    email: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .email()
        .required()
        .label('Email')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function(req) {
                    const adminId = req.admin._id
                    const admin = await Admin.findOne({email: value, deleted: false, _id: {$ne: adminId}})
                    return !admin ? value : helpers.error('any.exists')
                })
        ),
    phone: Joi.string()
        .trim()
        .pattern(VALIDATE_PHONE_REGEX)
        .allow('')
        .label('Số điện thoại')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function(req) {
                    const adminId = req.admin._id
                    const admin = await Admin.findOne({phone: value, deleted: false, _id: {$ne: adminId}})
                    return !admin ? value : helpers.error('any.exists')
                })
        ),
    role_ids: Joi.array().items(
        Joi.string().custom(function(value, helpers) {
            if (!isValidObjectId(value)) {
                return helpers.message('{{#label}} không hợp lệ.')
            }

            return new AsyncValidate(value, async function() {
                if (value) {
                    const role = await Role.findOne({_id: value, is_protected: false})
                    return role ? value : helpers.message('{{#label}} không hợp lệ.')
                }

                return value
            })
        }).label('Vai trò')
    ).label('Vai trò')
})

export const changePassword = Joi.object({
    password: Joi.string()
        .min(6)
        .max(MAX_STRING_SIZE)
        .required()
        .label('Mật khẩu')
})
