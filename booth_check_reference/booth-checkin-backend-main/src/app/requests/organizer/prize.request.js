import {Event, EVENT_MINI_GAME} from '@/models'
import {AsyncValidate, FileUpload} from '@/utils/classes'
import Joi from 'joi'
import {isValidObjectId} from 'mongoose'

export const createItem = Joi.object({
    event_id: Joi.string()
        .trim()
        .required()
        .label('Sự kiện')
        .custom(function (value, helpers) {
            if (!isValidObjectId(value)) {
                return helpers.error('any.invalid')
            }
            const {mini_game} = helpers.prefs.context.data
            return new AsyncValidate(value, async function (req) {
                const event = await Event.findOne({
                    _id: value,
                    organizer_id: req.currentOrganizer._id,
                    mini_game,
                    deleted: false,
                })
                req.event = event
                return event ? value : helpers.error('any.invalid')
            })
        }),
    mini_game: Joi.string()
        .valid(...Object.values(EVENT_MINI_GAME))
        .required()
        .label('Mini Game'),
    name: Joi.string().trim().required().label('Tên phần quà'),
    picture: Joi.object({
        mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').label('Định dạng ảnh'),
    })
        .unknown(true)
        .instance(FileUpload)
        .allow('')
        .label('Hình ảnh'),
    rate: Joi.number().min(0).max(100).required().label('Tỷ lệ trúng phần quà'),
    quantity: Joi.number().integer().min(0).allow(null, '').label('Số lượng'),
})
export const updateItem = Joi.object({
    name: Joi.string().trim().required().label('Tên phần quà'),
    picture: Joi.alternatives(
        Joi.object({
            mimetype: Joi.valid('image/jpeg', 'image/png', 'image/svg+xml', 'image/webp').label(
                'Định dạng ảnh'
            ),
        })
            .unknown(true)
            .instance(FileUpload)
            .allow('', 'remove'),
        Joi.string()
    ).label('Hình ảnh'),
    rate: Joi.number().min(0).max(100).required().label('Tỷ lệ trúng phần quà'),
    quantity: Joi.number().integer().min(0).allow(null, '').label('Số lượng'),
})
