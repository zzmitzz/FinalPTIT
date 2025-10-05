import Joi from 'joi'
import { MAX_STRING_SIZE } from '@/configs'

export const createItem = Joi.object({
    organization_name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .required()
        .label('Tên tổ chức'),
    
    address: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('', null)
        .optional()
        .label('Địa chỉ'),
    
    website: Joi.string()
        .trim()
        .uri()
        .max(MAX_STRING_SIZE)
        .allow('', null)
        .optional()
        .label('Website')
        .messages({
            'string.uri': '{{#label}} phải là một URL hợp lệ.'
        }),
    
    description: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE * 10)
        .allow('', null)
        .optional()
        .label('Mô tả'),
    
    logo_url: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('', null)
        .optional()
        .label('Logo URL')
})

export const updateItem = Joi.object({
    organization_name: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .optional()
        .label('Tên tổ chức'),
    
    address: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('', null)
        .optional()
        .label('Địa chỉ'),
    
    website: Joi.string()
        .trim()
        .uri()
        .max(MAX_STRING_SIZE)
        .allow('', null)
        .optional()
        .label('Website')
        .messages({
            'string.uri': '{{#label}} phải là một URL hợp lệ.'
        }),
    
    description: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE * 10)
        .allow('', null)
        .optional()
        .label('Mô tả'),
    
    logo_url: Joi.string()
        .trim()
        .max(MAX_STRING_SIZE)
        .allow('', null)
        .optional()
        .label('Logo URL')
})

