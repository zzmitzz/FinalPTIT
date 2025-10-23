import Joi from 'joi'
import { AsyncValidate } from '@/utils/classes'
import * as eventRepo from '@/db/event_repository'
import * as formFieldRepo from '@/db/form_fields'
import * as registrationRepo from '@/db/registration_repository'
import * as registrationResponseRepo from '@/db/registration_responses_repository'

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
    form_fields_id: Joi.string()
        .trim()
        .required()
        .label('Form Field ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const field = await formFieldRepo.findFormFieldById(value)
                    return field ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
    registration_id: Joi.string()
        .trim()
        .required()
        .label('Registration ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const registration = await registrationRepo.findRegistrationById(value)
                    return registration ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
    response: Joi.any()
        .optional()
        .label('Response')
        .description('Response value - will be validated against form field type')
})

export const updateItem = Joi.object({
    event_id: Joi.string()
        .trim()
        .optional()
        .label('Event ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const event = await eventRepo.findEventById(value)
                    return event ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
    form_fields_id: Joi.string()
        .trim()
        .optional()
        .label('Form Field ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const field = await formFieldRepo.findFormFieldById(value)
                    return field ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
    registration_id: Joi.string()
        .trim()
        .optional()
        .label('Registration ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const registration = await registrationRepo.findRegistrationById(value)
                    return registration ? value : helpers.message('{{#label}} không tồn tại.')
                })
        ),
    response: Joi.any()
        .optional()
        .label('Response')
        .description('Response value - will be validated against form field type')
})

export const getList = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .label('Page'),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
        .label('Limit'),
    event_id: Joi.string()
        .trim()
        .optional()
        .label('Event ID'),
    registration_id: Joi.string()
        .trim()
        .optional()
        .label('Registration ID'),
    form_fields_id: Joi.string()
        .trim()
        .optional()
        .label('Form Field ID')
})

export const getById = Joi.object({
    id: Joi.string()
        .trim()
        .required()
        .label('Registration Response ID')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const response = await registrationResponseRepo.findRegistrationResponseById(value)
                    return response ? value : helpers.message('{{#label}} không tồn tại.')
                })
        )
})

export const bulkCreate = Joi.object({
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
    responses: Joi.array()
        .items(
            Joi.object({
                form_fields_id: Joi.string()
                    .trim()
                    .required()
                    .label('Form Field ID')
                    .custom(
                        (value, helpers) =>
                            new AsyncValidate(value, async function () {
                                const field = await formFieldRepo.findFormFieldById(value)
                                return field ? value : helpers.message('{{#label}} không tồn tại.')
                            })
                    ),
                response: Joi.any()
                    .optional()
                    .label('Response')
                    .description('Response value - will be validated against form field type')
            })
        )
        .min(1)
        .required()
        .label('Responses')
        .description('Array of form field responses')
})
