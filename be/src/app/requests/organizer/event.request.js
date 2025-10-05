import Joi from 'joi'
import { EVENT_STATUS, MAX_STRING_SIZE } from '@/configs'
import { AsyncValidate } from '@/utils/classes'
import * as eventRepo from '@/db/event_repository'

export const createItem = Joi.object({
    name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Tên sự kiện'),
    
    thumbnail: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Thumbnail'),

    logo: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('')
        .default('')
        .label('Logo'),
    
    description: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE * 10)
        .allow('')
        .label('Mô tả sự kiện'),
    
    start_time: Joi.date()
        .required()
        .min('now')
        .label('Thời gian bắt đầu')
        .messages({
            'date.min': '{{#label}} không được nhỏ hơn thời gian hiện tại.'
        }),
    
    end_time: Joi.date()
        .required()
        .greater(Joi.ref('start_time'))
        .label('Thời gian kết thúc')
        .messages({
            'date.greater': '{{#label}} phải lớn hơn thời gian bắt đầu.'
        }),
    
    location: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Địa điểm'),
    
    category_id: Joi.string()
        .trim()
        .uuid()
        .required()
        .label('Danh mục'),
    
    tags: Joi.array()
        .items(Joi.string().trim().max(50))
        .default([])
        .label('Thẻ'),
    
    status: Joi.string()
        .valid(...Object.values(EVENT_STATUS))
        .default(EVENT_STATUS.WAITING)
        .label('Trạng thái'),
    
    pin_code: Joi.string()
        .trim()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .label('Mã PIN')
        .custom((value, helpers) => 
            new AsyncValidate(value, async function() {
                const existingEvent = await eventRepo.findEventByPinCode(value)
                return !existingEvent ? value : helpers.error('any.exists')
            })
        ),
    
    approver_id: Joi.string()
        .trim()
        .uuid()
        .required()
        .label('Người phê duyệt')
})

export const updateItem = Joi.object({
    name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .label('Tên sự kiện'),
    
    thumbnail: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('')
        .label('Thumbnail'),
    
    logo: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('')
        .label('Logo'),
    
    description: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE * 10)
        .allow('')
        .label('Mô tả sự kiện'),
    
    start_time: Joi.date()
        .min('now')
        .label('Thời gian bắt đầu')
        .messages({
            'date.min': '{{#label}} không được nhỏ hơn thời gian hiện tại.'
        }),
    
    end_time: Joi.date()
        .when('start_time', {
            is: Joi.exist(),
            then: Joi.date().greater(Joi.ref('start_time')),
            otherwise: Joi.date()
        })
        .label('Thời gian kết thúc')
        .messages({
            'date.greater': '{{#label}} phải lớn hơn thời gian bắt đầu.'
        }),
    
    location: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .label('Địa điểm'),
    
    category_id: Joi.string()
        .trim()
        .uuid()
        .label('Danh mục'),
    
    tags: Joi.array()
        .items(Joi.string().trim().max(50))
        .label('Thẻ'),
    
    status: Joi.string()
        .valid(...Object.values(EVENT_STATUS))
        .label('Trạng thái'),
    
    pin_code: Joi.string()
        .trim()
        .length(6)
        .pattern(/^[0-9]+$/)
        .label('Mã PIN')
        .custom((value, helpers) => 
            new AsyncValidate(value, async function(req) {
                const existingEvent = await eventRepo.findEventByPinCode(value)
                // Allow if it's the same event being updated
                return !existingEvent || existingEvent._id === req.params.id 
                    ? value 
                    : helpers.error('any.exists')
            })
        ),
    
    approver_id: Joi.string()
        .trim()
        .uuid()
        .label('Người phê duyệt')
})
