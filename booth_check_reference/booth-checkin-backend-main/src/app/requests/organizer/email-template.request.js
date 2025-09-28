import Joi from 'joi'
import {tryValidateOrDefault} from '@/utils/helpers'
import { FileUpload } from '@/utils/classes'

export const getEmailTemplates = Joi.object({
    q: tryValidateOrDefault(Joi.string().trim(), ''),
    page: tryValidateOrDefault(Joi.number().integer().min(1), 1),
    per_page: tryValidateOrDefault(Joi.number().integer().min(1).max(100), 10),
    field: tryValidateOrDefault(
        Joi.string().valid('name', 'sender_name', 'subject', 'body', 'attachments', 'event_id', 'is_deleted')
    ),
    sort_order: tryValidateOrDefault(Joi.string().valid('asc', 'desc'), 'desc'),
})

export const createEmailTemplate = Joi.object({
    template_name: Joi.string().trim().required().label('Tên Template'),
    sender_name: Joi.string().trim().optional().allow('').label('Tên người gửi'),
    subject: Joi.string().trim().required().label('Subject'),
    body: Joi.string().trim().required().label('Body'),
    attachments: Joi.array()
        .single()
        .items(
            Joi.object({
                mimetype: Joi.string()
                    .valid(
                        // Images
                        'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
                        // Documents
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        // Spreadsheets
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        // Presentations
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        // Text files
                        'text/plain',
                        'text/csv',
                        // Archives
                        'application/zip',
                        'application/x-rar-compressed',
                        'application/x-7z-compressed'
                    )
                    .required()
                    .label('File type'),
                originalname: Joi.string()
                    .trim()
                    .required()
                    .label('File name'),
                buffer: Joi.binary()
                    .max(25 * 1024 ** 2) // 25MB max file size
                    .required()
                    .label('File content')
            })
                .unknown(true)
                .instance(FileUpload)
                .label('Attachment')
        )
        .default([])
        .label('File đính kèm'),
    is_deleted: Joi.boolean().truthy('on', '1', 'yes').falsy('', 'off', '0', 'no').label('Trạng thái'),
})

export const updateEmailTemplate = Joi.object({
    template_name: Joi.string().trim().required().label('Tên Template'),
    sender_name: Joi.string().trim().optional().allow('').label('Tên người gửi'),
    subject: Joi.string().trim().required().label('Subject'),
    body: Joi.string().trim().required().label('Body'),
    attachments: Joi.array()
        .single()
        .items(
            Joi.object({
                mimetype: Joi.string()
                    .valid(
                        // Images
                        'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp',
                        // Documents
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        // Spreadsheets
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        // Presentations
                        'application/vnd.ms-powerpoint',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        // Text files
                        'text/plain',
                        'text/csv',
                        // Archives
                        'application/zip',
                        'application/x-rar-compressed',
                        'application/x-7z-compressed'
                    )
                    .required()
                    .label('File type'),
                originalname: Joi.string()
                    .trim()
                    .required()
                    .label('File name'),
                buffer: Joi.binary()
                    .max(25 * 1024 ** 2) // 25MB max file size
                    .required()
                    .label('File content')
            })
                .unknown(true)
                .instance(FileUpload)
                .label('Attachment')
        )
        .default([])
        .label('File đính kèm'),
    is_deleted: Joi.boolean().truthy('on', '1', 'yes').falsy('', 'off', '0', 'no').label('Trạng thái'),
})