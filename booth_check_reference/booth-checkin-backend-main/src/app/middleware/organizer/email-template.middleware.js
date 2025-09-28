import {isValidObjectId} from 'mongoose'
import {abort} from '@/utils/helpers'
import {EmailTemplate} from '@/models'
import bytes from 'bytes'

export async function verifyEmailTemplateId(req, res, next) {
    const {templateId, eventId} = req.params
    if (isValidObjectId(templateId)) {
        const findTemplate = await EmailTemplate.findOne({
            _id: templateId,
            event_id: eventId,
            organizer_id: req.currentOrganizer._id,
            is_deleted: false,
        })
        if (findTemplate) {
            req.emailTemplate = findTemplate
            next()
            return
        }
    }
    abort(404, 'Không tìm thấy template.')
}

export async function verifyFileUploadSize(req, res, next) {
    const files = req.body.attachments
    if(files) {
        for (const file of files) {
            if (file.size > bytes('25mb')) {
                abort(417, 'Kích thước tệp vượt quá giới hạn cho phép (25MB)')
                return
            }
        }
    }

    next()
}