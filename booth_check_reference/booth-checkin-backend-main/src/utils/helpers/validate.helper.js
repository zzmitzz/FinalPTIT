import Joi from 'joi'
import _ from 'lodash'
import assert from 'assert'
import {FACE_RECOGNIZE_CONTENT_LIMIT, JOI_DEFAULT_OPTIONS, VALIDATE_PHONE_REGEX} from '@/configs'
import {AsyncValidate, FileUpload} from '@/utils/classes'
import mime from 'mime-types'
import bytes from 'bytes'
import {DATE_FIELD, RegistrationResponse, TIME_FIELD} from '@/models'
import moment from 'moment'

export async function validateAsync(schema, data, ...args) {
    assert(Joi.isSchema(schema), new TypeError('"schema" must be a Joi schema.'))

    let errorDetails = {}

    async function dfs(variable) {
        if (variable instanceof AsyncValidate) {
            variable = await variable.exec(...args)
            if (variable?.prefs) {
                errorDetails[variable.path.join('.')] = `${variable}`
            }
        } else if (_.isPlainObject(variable) || _.isArray(variable)) {
            for (const key in variable) {
                if (_.isObject(variable[key])) {
                    variable[key] = await dfs(variable[key])
                }
            }
        }

        return variable
    }

    let {value, error} = schema.validate(data, {
        ...JOI_DEFAULT_OPTIONS,
        context: {
            data: _.cloneDeep(data),
        },
    })

    if (error) {
        error = error.details.reduce(function (pre, curr) {
            const path = curr.path.join('.')
            if (!(path in pre)) {
                pre[path] = curr.message
            }
            return pre
        }, {})

        errorDetails = error
    }

    value = await dfs(value)

    return [value, errorDetails]
}

export function tryValidateOrDefault(...args) {
    const defaultValue = args.pop()
    return Joi.alternatives()
        .try(...args, Joi.any().empty(Joi.any()))
        .default(defaultValue)
}

export const GENERATE_SCHEMA = {
    EMAIL({field_label, required = false}) {
        let schema = Joi.string().trim().lowercase().email().label('Trường ' + field_label)
        if (required) schema = schema.required()
        else schema = schema.allow('')
        return schema
    },
    PHONE({field_label, required = false}) {
        let schema = Joi.string().trim().pattern(VALIDATE_PHONE_REGEX).label('Trường ' + field_label)
        if (required) schema = schema.required()
        else schema = schema.allow('')
        return schema
    },
    BOOLEAN({field_label, required = false}) {
        let schema = Joi.boolean().truthy('on', '1', 'yes').falsy('', 'off', '0', 'no').label('Trường ' + field_label)
        if (required) schema = schema.required()
        else schema = schema.allow('')
        return schema
    },
    SELECT({field_label, required = false, field_options = [], field_has_other_option = false}) {
        let schema
        if (field_has_other_option) {
            schema = Joi.string().trim()
        } else {
            schema = Joi.string().trim().valid(...field_options)
        }
        schema = schema.label('Trường ' + field_label)
        if (required) schema = schema.required()
        return schema
    },
    SELECT_MULTIPLE({field_label, required = false, field_options = [], field_has_other_option = false}) {
        let schema = Joi.array()
            .single()
            .items(
                field_has_other_option
                    ? Joi.string().trim().label('Trường ' + field_label)
                    : Joi.string()
                        .trim()
                        .valid(...field_options)
                        .label('Trường ' + field_label)
            )
            .unique()
            .label('Trường ' + field_label)
        if (required)
            schema = schema.min(1).required().messages({'array.min': '{{#label}} không được bỏ trống.'})
        return schema
    },
    RADIO({field_label, required = false, field_options = [], field_has_other_option = false}) {
        let schema
        if (field_has_other_option) {
            schema = Joi.string().trim()
        } else {
            schema = Joi.string()
                .trim()
                .valid(...field_options)
        }
        schema = schema.label('Trường ' + field_label)
        if (required) schema = schema.required()
        return schema
    },
    CHECKBOX({field_label, required = false, field_options = [], field_has_other_option = false}) {
        let schema = Joi.array()
            .single()
            .items(
                field_has_other_option
                    ? Joi.string().trim().label('Trường ' + field_label)
                    : Joi.string()
                        .trim()
                        .valid(...field_options)
                        .label('Trường ' + field_label)
            )
            .unique()
            .label('Trường ' + field_label)
        if (required)
            schema = schema.min(1).required().messages({'array.min': '{{#label}} không được bỏ trống.'})
        return schema
    },
    TEXT({field_label, required = false, field_range: {min = null, max = null}}) {
        let schema = Joi.string().label('Trường ' + field_label)
        if (_.isNumber(min)) schema = schema.min(min)
        if (_.isNumber(max)) schema = schema.max(max)
        if (required) schema = schema.trim().required()
        else schema = schema.trim().allow('')
        return schema
    },
    TEXTAREA({field_label, required = false, field_range: {min = null, max = null}}) {
        let schema = Joi.string().label('Trường ' + field_label)
        if (_.isNumber(min)) schema = schema.min(min)
        if (_.isNumber(max)) schema = schema.max(max)
        if (required) schema = schema.trim().required()
        else schema = schema.trim().allow('')
        return schema
    },
    NUMBER({field_label, required = false, field_range: {min = null, max = null}}) {
        let schema = Joi.number().label('Trường ' + field_label)
        if (_.isNumber(min)) schema = schema.min(min)
        if (_.isNumber(max)) schema = schema.max(max)
        if (required) schema = schema.required().empty('', null)
        else schema = schema.allow('')
        return schema
    },
    FACE_ID({required = false, field_extensions = []}) {
        let schema = Joi.object({
            originalname: Joi.string()
                .trim()
                .required()
                .label('Tên tệp')
                .custom(function (value, helpers) {
                    if (_.isArray(field_extensions) && !_.isEmpty(field_extensions)) {
                        return field_extensions.some((ext) => value.endsWith(ext))
                            ? value
                            : helpers.error('any.invalid')
                    }
                    return value
                }),
            mimetype: Joi.string()
                .required()
                .label('Định dạng tệp')
                .custom((value, helpers) => (mime.extension(value) ? value : helpers.error('any.invalid'))),
            buffer: Joi.binary()
                .required()
                .label('Tệp tải lên')
                .max(FACE_RECOGNIZE_CONTENT_LIMIT)
                .messages({'binary.max': `{{#label}} không được vượt quá ${bytes(FACE_RECOGNIZE_CONTENT_LIMIT)}.`}),
        })
            .unknown(true)
            .instance(FileUpload)
            .label('Tệp tải lên')
        if (required) schema = schema.required()
        else schema = schema.allow('')
        return schema
    },
    FILE({required = false, field_extensions = []}) {
        let schema = Joi.object({
            originalname: Joi.string()
                .trim()
                .required()
                .label('Tên tệp')
                .custom(function (value, helpers) {
                    if (_.isArray(field_extensions) && !_.isEmpty(field_extensions)) {
                        return field_extensions.some((ext) => value.endsWith(ext))
                            ? value
                            : helpers.error('any.invalid')
                    }
                    return value
                }),
            mimetype: Joi.string()
                .required()
                .label('Định dạng tệp')
                .custom((value, helpers) => (mime.extension(value) ? value : helpers.error('any.invalid'))),
            buffer: Joi.binary()
                .required()
                .label('Tệp tải lên')
                .max(25 * 1024 ** 2)
                .messages({'binary.max': '{{#label}} không được vượt quá 25mb.'}),
        })
            .unknown(true)
            .instance(FileUpload)
            .label('Tệp tải lên')
        if (required) schema = schema.required()
        else schema = schema.allow('')
        return schema
    },
    MULTIPLE_FILE({required = false, field_extensions = [], field_range: {min = null, max = null}}) {
        let schema = Joi.array()
            .single()
            .items(
                Joi.object({
                    originalname: Joi.string()
                        .trim()
                        .required()
                        .label('Tên tệp')
                        .custom(function (value, helpers) {
                            if (_.isArray(field_extensions) && !_.isEmpty(field_extensions)) {
                                return field_extensions.some((ext) => value.endsWith(ext))
                                    ? value
                                    : helpers.error('any.invalid')
                            }
                            return value
                        }),
                    mimetype: Joi.string()
                        .required()
                        .label('Định dạng tệp')
                        .custom((value, helpers) =>
                            mime.extension('value') ? value : helpers.error('any.invalid')
                        ),
                    buffer: Joi.binary()
                        .required()
                        .label('Tệp tải lên')
                        .max(25 * 1024 ** 2)
                        .messages({'binary.max': '{{#label}} không được vượt quá 25mb.'}),
                })
                    .unknown(true)
                    .instance(FileUpload)
                    .label('Tệp tải lên')
            )
            .label('Trường này')
        if (_.isNumber(min)) schema = schema.min(min)
        if (_.isNumber(max)) schema = schema.max(max)
        if (required) {
            if (_.isNumber(min)) schema = schema.required()
            else schema = schema.min(1).required().messages({'array.min': '{{#label}} không được bỏ trống.'})
        } else {
            schema = schema.allow('')
        }
        return schema
    },
    DATE_FIELD(type = 'DATE') {
        if (type.startsWith('DATE')) {
            return function ({field_label, required = false, field_range: {min = null, max = null}}) {
                const messages = {}
                let schema = Joi.number().integer().label('Trường ' + field_label)
                if (_.isNumber(min)) {
                    schema = schema.min(min)
                    messages['number.min'] = `{{#label}} không được nhỏ hơn ${moment.unix(min).format('DD-MM-YYYY')}`
                }
                if (_.isNumber(max)) {
                    schema = schema.max(max)
                    messages['number.max'] = `{{#label}} không được lớn hơn ${moment.unix(min).format('DD-MM-YYYY')}`
                }
                if (required) schema = schema.required().empty('', null)
                else schema = schema.allow('')
                return schema.messages(messages)
            }
        } else if (type.startsWith('RANGE_DATE')) {
            return function ({field_label, required = false, field_range: {min = null, max = null}}) {
                const messages = {}
                let itemSchema = Joi.number().integer().label('Trường ' + field_label)
                if (_.isNumber(min)) {
                    itemSchema = itemSchema.min(min)
                    messages['number.min'] = `{{#label}} không được nhỏ hơn ${moment.unix(min).format('DD-MM-YYYY')}`
                }
                if (_.isNumber(max)) {
                    itemSchema = itemSchema.max(max)
                    messages['number.max'] = `{{#label}} không được lớn hơn ${moment.unix(min).format('DD-MM-YYYY')}`
                }
                let schema = Joi.array()
                    .length(2)
                    .items(itemSchema)
                    .custom(function (value) {
                        const [startTime, endTime] = value
                        if (startTime > endTime) {
                            value = [endTime, startTime]
                        } else {
                            value = [startTime, endTime]
                        }
                        return value
                    })
                    .label('Trường ' + field_label)
                if (required) schema = schema.required()
                else schema = schema.allow('')
                return schema.messages(messages)
            }
        } else {
            throw new Error('Invalid date field type.')
        }
    },
    TIME_FIELD(type) {
        if (type.startsWith('TIME')) {
            return function ({field_label, required = false, field_range: {min = null, max = null}}) {
                const messages = {}
                let schema = Joi.number()
                    .integer()
                    .custom(function (value) {
                        if (type === 'TIME_HOUR') {
                            return Math.floor(value / (60 * 60)) * 3600
                        } else if (type === 'TIME_MINUTE') {
                            return Math.floor(value / 60) * 60
                        }
                        return value
                    })
                    .label('Trường ' + field_label)
                if (_.isNumber(min)) {
                    schema = schema.min(min)
                    messages['number.min'] = `{{#label}} không được nhỏ hơn ${moment()
                        .startOf('day')
                        .add(min, 'second')
                        .format('HH:mm:ss')}`
                }
                if (_.isNumber(max)) {
                    schema = schema.max(max)
                    messages['number.max'] = `{{#label}} không được lớn hơn ${moment()
                        .startOf('day')
                        .add(min, 'second')
                        .format('HH:mm:ss')}`
                }
                if (required) schema = schema.required().empty('', null)
                else schema = schema.allow('')
                return schema.messages(messages)
            }
        } else if (type.startsWith('RANGE_TIME')) {
            return function ({field_label, required = false, field_range: {min = null, max = null}}) {
                const messages = {}
                let itemSchema = Joi.number()
                    .integer()
                    .custom(function (value) {
                        if (type === 'TIME_HOUR') {
                            return Math.floor(value / (60 * 60)) * 60 * 60
                        } else if (type === 'TIME_MINUTE') {
                            return Math.floor(value / 60) * 60
                        }
                        return value
                    })
                    .label('Trường ' + field_label)
                if (_.isNumber(min)) {
                    itemSchema = itemSchema.min(min)
                    messages['number.min'] = `{{#label}} không được nhỏ hơn ${moment()
                        .startOf('day')
                        .add(min, 'second')
                        .format('HH:mm:ss')}`
                }
                if (_.isNumber(max)) {
                    itemSchema = itemSchema.max(max)
                    messages['number.max'] = `{{#label}} không được lớn hơn ${moment()
                        .startOf('day')
                        .add(min, 'second')
                        .format('HH:mm:ss')}`
                }
                let schema = Joi.array()
                    .length(2)
                    .items(itemSchema)
                    .custom(function (value) {
                        const [startTime, endTime] = value
                        if (startTime > endTime) {
                            value = [endTime, startTime]
                        } else {
                            value = [startTime, endTime]
                        }
                        return value
                    })
                    .label('Trường ' + field_label)
                if (required) schema = schema.required()
                else schema = schema.allow('')
                return schema.messages(messages)
            }
        } else {
            throw new Error('Invalid time field type.')
        }
    },
}

export function generateSchema(field) {
    const {is_primary_key, field_type} = field
    let result
    if (Object.values(DATE_FIELD).includes(field_type)) {
        result = GENERATE_SCHEMA.DATE_FIELD(field_type)(field)
    } else if (Object.values(TIME_FIELD).includes(field_type)) {
        result = GENERATE_SCHEMA.TIME_FIELD(field_type)(field)
    } else {
        result = GENERATE_SCHEMA[field_type](field)
    }
    if (is_primary_key) {
        result = result.custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const exists = await RegistrationResponse.findOne({
                        form_id: field.form_id,
                        response: value,
                        is_primary_key: true,
                    })
                    return exists ? helpers.message('{{#label}} đã được đăng ký.') : value
                })
        )
    }
    return result
}
