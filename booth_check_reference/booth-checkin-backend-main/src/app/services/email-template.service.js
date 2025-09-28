import _ from 'lodash'
import {EMAIL_TEMPLATE_FIELDS, LINK_STATIC_URL} from '@/configs/constants'
import {FileUpload} from '@/utils/classes'
import EmailTemplate from '@/models/email-template'
import EmailJobs from '@/models/email_sender_jobs/email-jobs'
import { RegistrationResponse } from '@/models'

export async function getEmailTemplates(event, currentOrganizer, {q, page, per_page, field, sort_order}) {
    const filter = {
        event_id: event._id,
        organizer_id: currentOrganizer._id,
        ...(q
            ? {
                $or: [
                    {template_name: {$regex: q, $options: 'i'}},
                    {sender_name: {$regex: q, $options: 'i'}},
                    {subject: {$regex: q, $options: 'i'}},
                ],
            }
            : {}),
        is_deleted: false,
    }
    const emailTemplates = await EmailTemplate.find(filter)
        .select('template_name sender_name subject body attachments created_at')
        .skip((page - 1) * per_page)
        .limit(per_page)
        .sort({[field]: sort_order, _id: -1})
        .lean()
    emailTemplates.forEach(function (item) {
        item.attachments = item.attachments && item.attachments.map((file) => LINK_STATIC_URL + file)
    })
    return emailTemplates
}

export async function getEmailTemplate(emailTemplate) {
    const {template_name, sender_name, subject, body, attachments, created_at} = emailTemplate
    const processedAttachments = attachments && attachments.map((file) => LINK_STATIC_URL + file)
    return {
        template_name,
        sender_name,
        subject,
        body,
        attachments: processedAttachments,
        created_at,
    }
}

export async function createEmailTemplate(
    session,
    event,
    currentOrganizer,
    requestBody
) {
    if (_.isArray(requestBody.attachments)) {
        requestBody.attachments = requestBody.attachments
            .filter((file) => file instanceof FileUpload)
            .map((file) => file.save())
    }

    const emailTemplate = new EmailTemplate({
        event_id: event._id,
        organizer_id: currentOrganizer._id,
        ...requestBody,
    })
    await emailTemplate.save({session})
    return emailTemplate
}

export async function updateEmailTemplate(session, emailTemplate, requestBody, template_id) {
    const { attachments } = requestBody

    if (_.isArray(attachments)) {
        // Find and delete files that were removed
        const attachmentsToDelete = emailTemplate.attachments.filter(
            (existingFile) => !attachments.includes(existingFile)
        )
        for (const file of attachmentsToDelete) {
            FileUpload.remove(file)
        }

        // Save new files
        requestBody.attachments = attachments.map((file) => file.save())
    }

    const {template_name, sender_name, subject, body, is_deleted = false} = requestBody

    const updateData = {
        template_name,
        sender_name,
        subject,
        body,
        attachments: requestBody.attachments,
        is_deleted,
    }
    await EmailTemplate.findByIdAndUpdate(template_id, {$set: updateData}, {session})
    return updateData
}

export async function deleteEmailTemplate(session, template_id) {
    await EmailTemplate.findByIdAndUpdate(template_id, {$set: {is_deleted: true}}, {session})
}

export async function getFieldsForEmailTemplate() {
    return EMAIL_TEMPLATE_FIELDS
}

export async function getEmailLogs(eventId) {
    const emailLogs = await EmailJobs.find({event_id: eventId})
    const registrationIds = emailLogs.map((log) => log.registration_id)
    const registrationName = await RegistrationResponse.find({registration_id: {$in: registrationIds}})
    return emailLogs
}

export async function getEmailLogsWithRegistration(eventId) {
    const result = []
    const emailLogs = await EmailJobs.find({event_id: eventId})
    for (const log of emailLogs) {
        const template = await EmailTemplate.findById(log.template_id)
        const registration = await RegistrationResponse.find({registration_id: log.registration_id})
        const {template_id, status, created_at, updated_at, attempts, last_attempt} = log
        const registrationName = registration.find(
            (response) => response.field_type === 'TEXT' && response.field_label === 'Họ và tên'
        )
        const registrationEmail = registration.find(
            (response) => response.field_type === 'EMAIL' && response.field_label === 'Email'
        )
        result.push({
            template_id,
            template_name: template.template_name,
            registration_name: registrationName ? registrationName.response : '',
            email: registrationEmail ? registrationEmail.response : '',
            status,
            attempts,
            last_attempt,
            created_at,
            updated_at,
        })
    }
    return result
}
