import Joi from 'joi'
import Booth from '@/models/booth'
import {MAX_STRING_SIZE, VALIDATE_MAC_ADDRESS_REGEX} from '@/configs'
import {AsyncValidate} from '@/utils/classes'
import {isValidObjectId} from 'mongoose'
import {EVENT_STATUS, Event} from '@/models'
import moment from 'moment'

export const createBooth = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).required().label('Tên booth'),
    mac: Joi.string()
        .trim()
        .pattern(VALIDATE_MAC_ADDRESS_REGEX)
        .required()
        .label('Địa chỉ MAC')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function () {
                    const booth = await Booth.findOne({mac: value})

                    return !booth ? value : helpers.error('any.exists')
                })
        ),
})

export const updateBooth = Joi.object({
    name: Joi.string().trim().max(MAX_STRING_SIZE).required().label('Tên booth'),
    mac: Joi.string()
        .trim()
        .pattern(VALIDATE_MAC_ADDRESS_REGEX)
        .required()
        .label('Địa chỉ MAC')
        .custom(
            (value, helpers) =>
                new AsyncValidate(value, async function (req) {
                    const boothId = req.booth._id
                    const booth = await Booth.findOne({mac: value, _id: {$ne: boothId}})

                    return !booth ? value : helpers.error('any.exists')
                })
        ),
})

export const assignToEvent = Joi.object({
    event_id: Joi.string()
        .allow(null, '')
        .default(null)
        .label('Sự kiện')
        .custom(function (value, helpers) {
            if (!isValidObjectId(value)) {
                return helpers.error('any.invalid')
            }
            return new AsyncValidate(value, async function (req) {
                const event = await Event.findOne({_id: value, deleted: false})
                if (event) {
                    if (event.is_locked) return helpers.message('{{#label}} đã bị khoá.')
                    if (event.status === EVENT_STATUS.PENDING)
                        return helpers.message('{{#label}} chưa được xử lý.')
                    if (event.status === EVENT_STATUS.CANCELLED)
                        return helpers.message('{{#label}} đã bị huỷ.')
                    if (moment().isAfter(event.end_time)) return helpers.message('{{#label}} đã kết thúc.')
                    req.event = event
                    return value
                }
                return helpers.error('any.invalid')
            })
        }),
})
