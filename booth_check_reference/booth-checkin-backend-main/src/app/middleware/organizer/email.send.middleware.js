import Joi from 'joi'

export const sendEmail = Joi.object({
    registration_ids: Joi.array().items(Joi.string()).required().label('Danh sách đăng ký'),

})