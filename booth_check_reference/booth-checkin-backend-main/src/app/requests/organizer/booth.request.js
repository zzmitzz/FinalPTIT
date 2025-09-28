import {EVENT_CHECK_IN_TYPE} from '@/models'
import Joi from 'joi'

export const updateBoothSetting = Joi.object({
    check_in_type: Joi.array()
        .single()
        .items(Joi.string().valid(...Object.values(EVENT_CHECK_IN_TYPE)))
        .required()
        .label('Hình thức check-in'),
    use_print_card: Joi.boolean()
        .truthy('on', '1', 'yes')
        .falsy('', 'off', '0', 'no')
        .label('In thẻ'),
    allow_check_in: Joi.boolean()
        .truthy('on', '1', 'yes')
        .falsy('', 'off', '0', 'no')
        .label('Cho phép check-in'),
})
