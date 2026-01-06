import Joi from 'joi'
import * as registrationRepo from '@/db/registration_repository'
import {MAX_STRING_SIZE} from '@/configs'
import {AsyncValidate} from '@/utils/classes'

export const create = Joi.object({
    full_name: Joi.string().trim().max(MAX_STRING_SIZE).allow('').label('Họ và tên'),
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
    phone: Joi.string().trim().max(MAX_STRING_SIZE).allow('').label('Số điện thoại'),
    password: Joi.string().min(6).max(MAX_STRING_SIZE).required().label('Mật khẩu'),
    is_active: Joi.boolean().optional().label('Trạng thái'),
})
