import Joi from 'joi'
import _ from 'lodash'
import { FIELD_TYPE, VALIDATE_PHONE_REGEX } from '@/configs'
import mime from 'mime-types'

/**
 * Validates a response value based on the field type and field configuration
 * @param {any} response - The response value to validate
 * @param {Object} field - The form field configuration
 * @returns {Object} - { valid: boolean, error: string|null, value: any }
 */
export function validateResponseByFieldType(response, field) {
    const {
        field_type,
        field_label,
        required,
        field_options = [],
        field_has_other_option = false,
        field_range = { min: null, max: null },
        field_extensions = []
    } = field

    try {
        let schema

        switch (field_type) {
            case FIELD_TYPE.EMAIL:
                schema = Joi.string().trim().lowercase().email().label(field_label)
                if (required) {
                    schema = schema.required()
                } else {
                    schema = schema.allow('', null).optional()
                }
                break

            case FIELD_TYPE.PHONE:
                schema = Joi.string().trim().pattern(VALIDATE_PHONE_REGEX).label(field_label)
                if (required) {
                    schema = schema.required()
                } else {
                    schema = schema.allow('', null).optional()
                }
                break

            case FIELD_TYPE.TEXT:
                schema = Joi.string().trim().max(255).label(field_label)
                if (required) {
                    schema = schema.required()
                } else {
                    schema = schema.allow('', null).optional()
                }
                break

            case FIELD_TYPE.TEXTAREA:
                schema = Joi.string().trim().max(5000).label(field_label)
                if (required) {
                    schema = schema.required()
                } else {
                    schema = schema.allow('', null).optional()
                }
                break

            case FIELD_TYPE.NUMBER:
                schema = Joi.number().label(field_label)
                if (_.isNumber(field_range.min)) {
                    schema = schema.min(field_range.min)
                }
                if (_.isNumber(field_range.max)) {
                    schema = schema.max(field_range.max)
                }
                if (required) {
                    schema = schema.required()
                } else {
                    schema = schema.allow(null).optional()
                }
                break

            case FIELD_TYPE.DATE:
                // Date stored as Unix timestamp (number)
                schema = Joi.number().integer().label(field_label)
                if (_.isNumber(field_range.min)) {
                    schema = schema.min(field_range.min)
                }
                if (_.isNumber(field_range.max)) {
                    schema = schema.max(field_range.max)
                }
                if (required) {
                    schema = schema.required()
                } else {
                    schema = schema.allow(null).optional()
                }
                break

            case FIELD_TYPE.TIME_MINUTE:
                // Time stored as seconds from start of day
                schema = Joi.number().integer().min(0).max(86400).label(field_label)
                if (_.isNumber(field_range.min)) {
                    schema = schema.min(field_range.min)
                }
                if (_.isNumber(field_range.max)) {
                    schema = schema.max(field_range.max)
                }
                if (required) {
                    schema = schema.required()
                } else {
                    schema = schema.allow(null).optional()
                }
                break

            case FIELD_TYPE.RADIO:
                // Single selection from options
                if (field_has_other_option) {
                    schema = Joi.alternatives().try(
                        Joi.string().valid(...field_options),
                        Joi.object({
                            option: Joi.string().valid('other').required(),
                            value: Joi.string().trim().max(255).required()
                        })
                    ).label(field_label)
                } else {
                    schema = Joi.string().valid(...field_options).label(field_label)
                }
                if (required) {
                    schema = schema.required()
                } else {
                    schema = schema.allow(null).optional()
                }
                break

            case FIELD_TYPE.CHECKBOX:
                // Multiple selections from options
                if (field_has_other_option) {
                    schema = Joi.array().items(
                        Joi.alternatives().try(
                            Joi.string().valid(...field_options),
                            Joi.object({
                                option: Joi.string().valid('other').required(),
                                value: Joi.string().trim().max(255).required()
                            })
                        )
                    ).label(field_label)
                } else {
                    schema = Joi.array().items(
                        Joi.string().valid(...field_options)
                    ).label(field_label)
                }
                if (required) {
                    schema = schema.min(1).required()
                } else {
                    schema = schema.allow(null).optional()
                }
                break

            case FIELD_TYPE.FILE:
            case FIELD_TYPE.FACE_ID:
                // File validation - expecting file metadata or URL
                schema = Joi.alternatives().try(
                    // File object with metadata
                    Joi.object({
                        originalname: Joi.string().required(),
                        mimetype: Joi.string().required(),
                        filename: Joi.string().required(),
                        filepath: Joi.string().required(),
                        filesize: Joi.string().optional()
                    }),
                    // Or just a file path/URL string
                    Joi.string().uri().allow('')
                ).label(field_label)

                // Validate file extensions if specified
                if (!_.isEmpty(field_extensions) && _.isObject(response)) {
                    const filename = response.originalname || response.filename
                    if (filename) {
                        const hasValidExtension = field_extensions.some(ext => 
                            filename.toLowerCase().endsWith(ext.toLowerCase())
                        )
                        if (!hasValidExtension) {
                            return {
                                valid: false,
                                error: `${field_label} phải có định dạng: ${field_extensions.join(', ')}`,
                                value: null
                            }
                        }
                    }
                }

                if (required) {
                    schema = schema.required()
                } else {
                    schema = schema.allow(null, '').optional()
                }
                break

            default:
                // Unknown field type - accept any value
                schema = Joi.any().label(field_label)
                if (required) {
                    schema = schema.required()
                } else {
                    schema = schema.optional()
                }
        }

        // Validate the response
        const { error, value } = schema.validate(response, {
            abortEarly: true,
            stripUnknown: true
        })

        if (error) {
            return {
                valid: false,
                error: error.details[0].message,
                value: null
            }
        }

        return {
            valid: true,
            error: null,
            value
        }
    } catch (err) {
        return {
            valid: false,
            error: `Lỗi xác thực ${field_label}: ${err.message}`,
            value: null
        }
    }
}

/**
 * Validates multiple responses against their corresponding form fields
 * @param {Array} responses - Array of { form_fields_id, response } objects
 * @param {Array} formFields - Array of form field configurations
 * @returns {Object} - { valid: boolean, errors: Object, validatedResponses: Array }
 */
export function validateMultipleResponses(responses, formFields) {
    const errors = {}
    const validatedResponses = []
    const fieldMap = _.keyBy(formFields, '_id')

    for (const responseItem of responses) {
        const { form_fields_id, response } = responseItem
        const field = fieldMap[form_fields_id]

        if (!field) {
            errors[form_fields_id] = `Không tìm thấy trường form với ID: ${form_fields_id}`
            continue
        }

        const validation = validateResponseByFieldType(response, field)
        
        if (!validation.valid) {
            errors[form_fields_id] = validation.error
        } else {
            validatedResponses.push({
                ...responseItem,
                response: validation.value
            })
        }
    }

    return {
        valid: _.isEmpty(errors),
        errors,
        validatedResponses
    }
}

