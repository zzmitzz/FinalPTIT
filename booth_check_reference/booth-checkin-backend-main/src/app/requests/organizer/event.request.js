import {
    EVENT_CHECK_IN_TYPE,
    EVENT_MINI_GAME,
    DATE_FIELD,
    FIELD_TYPE,
    OPTION_FIELD,
    RANGE_FIELD,
    TIME_FIELD,
    UNIT_OF_TIME,
    EVENT_STATE,
    LUCKY_WHEEL_CONDITIONS,
    LUCKY_WHEEL_TYPE,
    Prize,
    Event,
    Registration,
    LwPrize
} from '@/models'
import { AsyncValidate, FileUpload } from '@/utils/classes'
import { tryValidateOrDefault } from '@/utils/helpers'
import Joi from 'joi'
import moment from 'moment'
import mime from 'mime-types'
import { isValidObjectId } from 'mongoose'


export const readRoot = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), ''),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 20),
    field: tryValidateOrDefault(
        Joi.string().valid(
            'created_at',
            'name',
            'start_time',
            'end_time',
            'organizing_unit',
            'status',
            'booth_check_in',
            'use_print_card'
        ),
        'created_at'
    ),
    sort_order: tryValidateOrDefault(Joi.string().valid('asc', 'desc'), 'desc'),
    state: tryValidateOrDefault(Joi.valid(...Object.values(EVENT_STATE)), null),
    start_time: tryValidateOrDefault(Joi.date(), null),
    end_time: tryValidateOrDefault(Joi.date(), null),
})

export const createItem = Joi.object({
    name: Joi.string().trim().required().label('Tên sự kiện'),
    thumbnail: Joi.object({
        originalname: Joi.string().trim().required().label('Tên ảnh'),
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
            .required()
            .label('Định dạng ảnh'),
        buffer: Joi.binary()
            .max(25 * 1024 ** 2)
            .required()
            .label('Thumbnail'),
    })
        .unknown(true)
        .instance(FileUpload)
        .required()
        .label('Thumbnail'),
    logo: Joi.array()
        .single()
        .items(
            Joi.object({
                mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').label(
                    'Định dạng ảnh'
                ),
            })
                .unknown(true)
                .instance(FileUpload)
                .allow('')
                .label('Logo')
        )
        .default([]),
    description: Joi.string().trim().allow('').label('Mô tả sự kiện'),
    start_time: Joi.number()
        .integer()
        .required()
        .label('Thời gian bắt đầu')
        .custom(function (value, helpers) {
            return value >= moment().unix()
                ? moment.unix(value)
                : helpers.message('{{#label}} không được nhỏ hơn thời gian hiện tại.')
        }),
    end_time: Joi.number()
        .integer()
        .required()
        .label('Thời gian kết thúc')
        .custom(function (value, helpers) {
            const { start_time } = helpers.prefs.context.data
            return value > start_time
                ? moment.unix(value)
                : helpers.message('{{#label}} phải lớn hơn thời gian bắt đầu.')
        }),
    location: Joi.string().trim().required().label('Địa điểm tổ chức'),
    organizing_unit: Joi.string().trim().required().label('Đơn vị tổ chức'),
    co_organizing_unit: Joi.string().trim().allow('').label('Đơn vị đồng tổ chức'),
    check_in_type: Joi.array()
        .single()
        .items(
            Joi.string()
                .trim()
                .valid(...Object.values(EVENT_CHECK_IN_TYPE))
        )
        .unique()
        .min(1)
        .required()
        .label('Hình thức check-in'),
    booth_check_in: Joi.number().integer().allow('').min(0).label('Số lượng Booth Check In'),
    mini_game: Joi.array()
        .single()
        .items(
            Joi.string()
                .trim()
                .valid(...Object.values(EVENT_MINI_GAME))
        )
        .unique()
        .allow('')
        .default([])
        .label('Mini game'),
    use_print_card: Joi.boolean()
        .truthy('on', '1', 'yes')
        .falsy('', 'off', '0', 'no')
        .label('Sử dụng chức năng in thẻ'),
})

export const updateItem = Joi.object({
    name: Joi.string().trim().required().label('Tên sự kiện'),
    thumbnail: Joi.object({
        originalname: Joi.string().trim().required().label('Tên ảnh'),
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp')
            .required()
            .label('Định dạng ảnh'),
        buffer: Joi.binary()
            .max(25 * 1024 ** 2)
            .required()
            .label('Thumbnail'),
    })
        .unknown(true)
        .instance(FileUpload)
        .allow('')
        .label('Thumbnail'),
    logo: Joi.array()
        .single()
        .items(
            Joi.string(),
            Joi.object({
                originalname: Joi.string().trim().required().label('Tên logo'),
                mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').label(
                    'Định dạng ảnh'
                ),
                buffer: Joi.binary()
                    .max(25 * 1024 ** 2)
                    .label('Logo'),
            })
                .unknown(true)
                .instance(FileUpload)
                .allow('')
                .allow('remote')
                .label('Logo')
        )
        .default([]),
    description: Joi.string().trim().allow('').label('Mô tả sự kiện'),
    start_time: Joi.number()
        .integer()
        .required()
        .label('Thời gian bắt đầu')
        .custom(function (value, helpers) {
            return value >= moment().unix()
                ? moment.unix(value)
                : helpers.message('{{#label}} không được nhỏ hơn thời gian hiện tại.')
        }),
    end_time: Joi.number()
        .integer()
        .required()
        .label('Thời gian kết thúc')
        .custom(function (value, helpers) {
            const { start_time } = helpers.prefs.context.data
            return value > start_time
                ? moment.unix(value)
                : helpers.message('{{#label}} phải lớn hơn thời gian bắt đầu.')
        }),
    location: Joi.string().trim().required().label('Địa điểm tổ chức'),
    organizing_unit: Joi.string().trim().required().label('Đơn vị tổ chức'),
    co_organizing_unit: Joi.string().trim().allow('').label('Đơn vị đồng tổ chức'),
    check_in_type: Joi.array()
        .single()
        .items(
            Joi.string()
                .trim()
                .valid(...Object.values(EVENT_CHECK_IN_TYPE))
        )
        .unique()
        .min(1)
        .required()
        .label('Hình thức check-in'),
    booth_check_in: Joi.number().integer().allow('').min(0).label('Số lượng Booth Check In'),
    mini_game: Joi.array()
        .single()
        .items(
            Joi.string()
                .trim()
                .valid(...Object.values(EVENT_MINI_GAME))
        )
        .unique()
        .allow('')
        .default([])
        .label('Mini game'),
    use_print_card: Joi.boolean()
        .truthy('on', '1', 'yes')
        .falsy('', 'off', '0', 'no')
        .label('Sử dụng chức năng in thẻ'),
})

function validateDateFieldMinMaxValue(endOfTime = false) {
    return function (value, helpers) {
        let date = moment.unix(value)
        if (!date.isValid()) return helpers.error('any.invalid')

        const fieldType = helpers.state.ancestors[1].field_type
        date = endOfTime ? date.endOf(UNIT_OF_TIME[fieldType]) : date.startOf(UNIT_OF_TIME[fieldType])
        return date.unix()
    }
}

export const saveFormForEvent = Joi.object({
    title: Joi.string().trim().required().label('Tiêu đề'),
    description: Joi.string().trim().allow('').default('').label('Mô tả'),
    is_public: Joi.boolean().required().label('Trạng thái công khai'),
    fields: Joi.array()
        .items(
            Joi.object({
                field_label: Joi.string().trim().required().label('Nhãn trường thông tin'),
                field_description: Joi.string().trim().allow(null, '').required().label('Mô tả trường thông'),
                field_type: Joi.string()
                    .valid(...Object.values(FIELD_TYPE).filter((type) => type !== FIELD_TYPE.FACE_ID))
                    .required()
                    .label('Loại trường thông tin'),
                field_options: Joi.any()
                    .when('field_type', {
                        is: Joi.string()
                            .valid(...Object.values(OPTION_FIELD))
                            .required(),
                        then: Joi.array()
                            .single()
                            .items(Joi.string().trim().label('Lựa chọn'))
                            .min(1)
                            .unique()
                            .required()
                            .messages({ 'array.min': '{{#label}} không được bỏ trống.' }),
                        otherwise: Joi.any().strip(),
                    })
                    .label('Các lựa chọn'),
                field_has_other_option: Joi.any().when('field_type', {
                    is: Joi.string()
                        .valid(...Object.values(OPTION_FIELD))
                        .required(),
                    then: Joi.boolean().default(false).label('Đánh dấu có tuỳ chọn khác'),
                    otherwise: Joi.any().strip(),
                }),
                field_range: Joi.any()
                    .when('field_type', {
                        is: Joi.string()
                            .valid(...Object.values(RANGE_FIELD))
                            .required(),
                        then: Joi.any()
                            .when('field_type', {
                                is: Joi.string()
                                    .valid(...Object.values(DATE_FIELD))
                                    .required(),
                                then: Joi.object({
                                    min: Joi.number()
                                        .allow(null)
                                        .label('Giá trị nhỏ nhất')
                                        .default(null)
                                        .custom(validateDateFieldMinMaxValue()),
                                    max: Joi.number()
                                        .allow(null)
                                        .label('Giá trị lớn nhất')
                                        .default(null)
                                        .custom(validateDateFieldMinMaxValue(true)),
                                }),
                                otherwise: Joi.any().when('field_type', {
                                    is: Joi.string()
                                        .valid(...Object.values(TIME_FIELD))
                                        .required(),
                                    then: Joi.object({
                                        min: Joi.number()
                                            .allow(null)
                                            .default(null)
                                            .min(0)
                                            .max(24 * 60 * 60 - 1)
                                            .label('Giá trị nhỏ nhất'),
                                        max: Joi.number()
                                            .allow(null)
                                            .default(null)
                                            .min(0)
                                            .max(24 * 60 * 60 - 1)
                                            .label('Giá trị lớn nhất'),
                                    }),
                                    otherwise: Joi.object({
                                        min: Joi.number().allow(null).default(null).label('Giá trị nhỏ nhất'),
                                        max: Joi.number().allow(null).default(null).label('Giá trị lớn nhất'),
                                    }),
                                }),
                            })
                            .default({ min: null, max: null }),
                        otherwise: Joi.any().strip(),
                    })
                    .label('Khoảng giá trị'),
                field_extensions: Joi.any()
                    .when('field_type', {
                        is: Joi.string().valid(FIELD_TYPE.FILE).required(),
                        then: Joi.array()
                            .single()
                            .items(Joi.string().trim().label('Loại tệp'))
                            .required()
                            .label('Loại tệp'),
                        otherwise: Joi.any().strip(),
                    })
                    .label('Loại tệp'),
                required: Joi.boolean().required().label('Trạng thái bắt buộc'),
            }).label('Trường thông tin')
        )
        .default([])
        .label('Các trường thông tin'),
})

export const readRegistrations = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), ''),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 20),
    field: tryValidateOrDefault(
        Joi.string().valid(
            'created_at',
            'check_in_at',
            'check_in_by',
            'response.0.response',
            'response.1.response',
        ),
        'created_at'
    ),
    sort_order: tryValidateOrDefault(Joi.string().valid('asc', 'desc'), 'desc'),
})

export const uploadRegistrationExcelData = Joi.object({
    file: Joi.object({
        mimetype: Joi.string().valid(mime.lookup('xlsx')).required().label('Định dạng tệp'),
    })
        .instance(FileUpload)
        .unknown(true)
        .label('Tệp Excel')
        .required(),
})


export const updateMiniGameSetting = Joi.object({
    mini_game: Joi.string()
        .trim()
        .valid(...Object.values(EVENT_MINI_GAME))
        .required()
        .label('Mini Game')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, (req) =>
                    req.event.mini_game.includes(req.params.MINI_GAME_CODE)
                        ? value
                        : helpers.error('any.invalid')
                )
        ),
    conditions: Joi.any()
        .required()
        .label('Điều kiện')
        .when('mini_game', [
            { is: EVENT_MINI_GAME.LUCKY_WHEEL, then: Joi.valid(...Object.values(LUCKY_WHEEL_CONDITIONS)) },
        ]),
})

export const sortPrize = Joi.object({
    prizes: Joi.array()
        .single()
        .items(
            Joi.string()
                .label('Phần quà')
                .custom(function (value, helpers) {
                    if (!isValidObjectId(value)) {
                        return helpers.error('any.invalid')
                    }
                    return new AsyncValidate(value, async function (req) {
                        const prize = await Prize.findOne({
                            _id: value,
                            event_id: req.event._id,
                            mini_game: req.params.MINI_GAME_CODE,
                        })
                        return prize ? value : helpers.error('any.invalid')
                    })
                })
        )
        .required()
        .label('Phầm quà'),
})

export const updateRegistrationResponse = Joi.object({
    responses: Joi.array().items(
        Joi.object({
            _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
            position: Joi.number().integer().min(0).required(),
            response: Joi.alternatives().try(
                Joi.string().allow(''),
                Joi.number(),
                Joi.boolean(),
                Joi.array().items(Joi.string()),
                Joi.object({
                    url: Joi.string().required(),
                    name: Joi.string().required()
                }),
                Joi.date(),
                Joi.object()
            ).required()
        })
    ).min(1).required()
})

export const updateRegistrationVIP = Joi.object({
    is_vip: Joi.boolean().required().label('VIP Status')
})

/*
 - Create by : zzmitzz 
 - CRUD prize for an event.
*/
export const lwUploadPrize = Joi.object({
    event_id: Joi.string()
        .trim()
        .required()
        .label('Sự kiện')
        .custom(function (value, helpers) {
            if (!isValidObjectId(value)) {
                return helpers.error('any.invalid')
            }
            return new AsyncValidate(value, async function (req) {
                const event = await Event.findOne({
                    _id: value,
                    organizer_id: req.currentOrganizer._id,
                    deleted: false,
                })
                req.event = event
                return event ? value : helpers.error('any.invalid')
            })
        }),
    name: Joi.string().trim().required().label('Tên phần quà'),
    picture: Joi.object({
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').label('Định dạng ảnh'),
    })
        .unknown(true)
        .instance(FileUpload)
        .allow('')
        .label('Hình ảnh'),
    availability: Joi.boolean().required().default(true).label('Trạng thái quà')
})

export const lwUpdatePrize = Joi.object({
    name: Joi.string().trim().required().label('Tên phần quà'),
    picture: Joi.object({
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').label('Định dạng ảnh'),
    })
        .unknown(true)
        .instance(FileUpload)
        .allow('')
        .label('Hình ảnh'),
    availability: Joi.boolean().required().default(true).label('Trạng thái quà')
})

/**
 * Lucky Wheel validation schemas
 */
export const createLuckyWheel = Joi.object({
    title: Joi.string().trim().required().label('Tiêu đề'),
    type: Joi.string()
        .valid(...Object.values(LUCKY_WHEEL_TYPE))
        .required()
        .label('Loại vòng quay')
})

export const updateLuckyWheel = Joi.object({
    title: Joi.string().trim().required().label('Tiêu đề'),
    type: Joi.string()
        .valid(...Object.values(LUCKY_WHEEL_TYPE))
        .required()
        .label('Loại vòng quay')
})

export const setLuckyWheelPrizes = Joi.object({
    prizes: Joi.array()
        .items(
            Joi.object({
                prize_id: Joi.string()
                    .regex(/^[0-9a-fA-F]{24}$/)
                    .required()
                    .label('ID Phần quà')
                    .custom(function (value, helpers) {
                        return new AsyncValidate(value, async function (req) {
                            const prize = await LwPrize.findOne({
                                _id: value,
                                event_id: req.event._id,
                                availability: true
                            })
                            return prize ? value : helpers.error('any.invalid')
                        })
                    }),
                quantity: Joi.number().integer().min(0).required().label('Số lượng')
            })
        )
        .min(1)
        .required()
        .label('Danh sách phần quà')
})

export const spinLuckyWheel = Joi.object({
    registration_id: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .optional()
        .label('ID Đăng ký')
        .custom(function (value, helpers) {
            return new AsyncValidate(value, async function (req) {
                const registration = await Registration.findOne({
                    _id: value,
                    event_id: req.event._id
                })
                return registration ? value : helpers.error('any.invalid')
            })
        })
})

export const getLuckyWheelHistory = Joi.object({
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 20),
    sort_order: tryValidateOrDefault(Joi.string().valid('asc', 'desc'), 'desc')
})