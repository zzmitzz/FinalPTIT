import {Booth, EVENT_STATE, EVENT_STATUS} from '@/models'
import {AsyncValidate} from '@/utils/classes'
import {tryValidateOrDefault} from '@/utils/helpers'
import Joi from 'joi'
import {isValidObjectId} from 'mongoose'

export const getListEvent = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), null),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 20),
    start_time: tryValidateOrDefault(Joi.date(), null),
    end_time: tryValidateOrDefault(Joi.date(), null),
    field: tryValidateOrDefault(
        Joi.valid('created_at', 'name', 'start_time', 'end_time', 'location', 'is_locked', 'organizer'),
        'created_at'
    ),
    sort_order: tryValidateOrDefault(Joi.valid('asc', 'desc'), 'desc'),
    status: tryValidateOrDefault(Joi.string().valid(...Object.values(EVENT_STATUS)), null),
    state: tryValidateOrDefault(Joi.string().valid(...Object.values(EVENT_STATE)), null),
})

export const assignBoothToEvent = Joi.object({
    booth_ids: Joi.array()
        .single()
        .items(
            Joi.string()
                .label('Booth')
                .custom(function (value, helpers) {
                    if (!isValidObjectId(value)) {
                        return helpers.error('any.invalid')
                    }
                    return new AsyncValidate(value, async function () {
                        const booth = await Booth.findById(value)
                        return booth ? value : helpers.error('any.invalid')
                    })
                })
        )
        .default([])
        .label('Booth'),
})
