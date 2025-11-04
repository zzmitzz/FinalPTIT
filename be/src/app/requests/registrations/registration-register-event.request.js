import Joi from 'joi'

export const getByMonth = Joi.object({
    month: Joi.number()
        .integer()
        .min(1)
        .max(12)
        .required()
        .label('Tháng')
        .messages({
            'number.base': '{{#label}} phải là số.',
            'number.min': '{{#label}} phải từ 1 đến 12.',
            'number.max': '{{#label}} phải từ 1 đến 12.',
            'any.required': '{{#label}} là bắt buộc.'
        }),
    year: Joi.number()
        .integer()
        .min(2000)
        .max(new Date().getFullYear() + 10)
        .required()
        .label('Năm')
        .messages({
            'number.base': '{{#label}} phải là số.',
            'number.min': `{{#label}} phải từ 2000 đến ${new Date().getFullYear() + 10}.`,
            'number.max': `{{#label}} phải từ 2000 đến ${new Date().getFullYear() + 10}.`,
            'any.required': '{{#label}} là bắt buộc.'
        })
})

