import * as emailTemplateService from '@/app/services/email-template.service'
import * as emailSenderService from '@/app/services/email-sender-service/email-sender-service'
import {db} from '@/configs'
import {EMAIL_JOB_STATUS, EmailTemplate, Event, Registration, RegistrationResponse} from '@/models'
import EmailJobs from '@/models/email_sender_jobs/email-jobs'

export async function getEmailTemplates(req, res) {
    const result = await emailTemplateService.getEmailTemplates(req.event, req.currentOrganizer, req.query)
    res.status(200).jsonify({result, message: 'Lấy danh sách email template thành công'})
}

export async function getEmailTemplate(req, res) {
    const emailTemplate = await emailTemplateService.getEmailTemplate(req.emailTemplate)
    res.status(200).jsonify({emailTemplate, message: 'Lấy email template thành công'})
}

export async function createEmailTemplate(req, res) {
    await db.transaction(async function (session) {
        const requestBody = req.body
        const emailTemplate = await emailTemplateService.createEmailTemplate(
            session,
            req.event,
            req.currentOrganizer,
            requestBody
        )
        res.status(200).jsonify({emailTemplate, message: 'Email template đã được tạo thành công'})
    })
}

export async function updateEmailTemplate(req, res) {
    const {templateId} = req.params
    await db.transaction(async function (session) {
        const emailTemplate = await emailTemplateService.updateEmailTemplate(
            session,
            req.emailTemplate,
            req.body,
            templateId
        )
        if (!emailTemplate) {
            res.status(404).jsonify({message: 'Không tìm thấy email template'})
        }
        res.status(200).jsonify({emailTemplate, message: 'Cập nhật email template thành công'})
    })
}

export async function deleteEmailTemplate(req, res) {
    const {templateId} = req.params
    await db.transaction(async function (session) {
        await emailTemplateService.deleteEmailTemplate(session, templateId)
        res.status(200).jsonify({message: 'Xóa email template thành công.'})
    })
}

export async function getFieldsForEmailTemplate(req, res) {
    try {
        const fields = await emailTemplateService.getFieldsForEmailTemplate()
        res.status(200).jsonify({fields, message: 'Lấy trường dữ liệu email template thành công.'})
    } catch (error) {
        res.status(500).jsonify({message: 'Lấy trường dữ liệu email template thất bại.'})
    }
}

export async function sendEmail(req, res) {
    const {templateId, eventId} = req.params
    const {registration_ids} = req.body
    for (const registration of registration_ids) {
        await db.transaction(async function (session) {
            const emailJob = await EmailJobs.create({
                registration_id: registration,
                event_id: eventId,
                template_id: templateId,
                status: EMAIL_JOB_STATUS.PENDING,
            })
            await emailJob.save({session})
        })
    }
    res.status(200).jsonify({message: 'Gửi email thành công.'})
}

export async function getEmailLogs(req, res) {
    const {eventId} = req.params
    try {
        const emailLogs = await emailTemplateService.getEmailLogsWithRegistration(eventId)
        res.status(200).jsonify({emailLogs, message: 'Lấy lịch sử gửi email thành công.'})
    } catch (error) {
        res.status(500).jsonify({message: 'Lấy lịch sử gửi email thất bại.'})
    }
}
