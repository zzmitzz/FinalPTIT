import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'
import QRCode from 'qrcode'
import fs from 'fs/promises'
import moment from 'moment'
import 'moment/locale/vi'

import { Registration, RegistrationResponse, Event } from '@/models'
import { PUBLIC_DIR, CRYPTO_TYPE } from '@/configs'
import { encrypt } from '@/utils/helpers'
import EmailTemplate from '@/models/email-template'

dotenv.config()
moment.locale('vi')

const EMAIL_PLACEHOLDER = {
    RECEIVER_NAME: '{{RECEIVER_NAME}}',
    POSITION: '{{POSITION}}',
    EMAIL: '{{EMAIL}}',
    PHONE_NUMBER: '{{PHONE_NUMBER}}',
    EVENT_NAME: '{{EVENT_NAME}}',
    EVENT_DATE: '{{EVENT_DATE}}',
    EVENT_TIME: '{{EVENT_TIME}}',
    EVENT_LOCATION: '{{EVENT_LOCATION}}',
    CURRENT_DATE: '{{CURRENT_DATE}}',
    SYSTEM_NAME: '{{SYSTEM_NAME}}',
}


// Default SMTP transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
})

// Gmail transporter
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD, // Use App Password for Gmail
    },
})

async function prepareAttachment(filePath) {
    try {
        const absolutePath = path.join(PUBLIC_DIR, filePath)
        const fileContent = await fs.readFile(absolutePath)
        const filename = path.basename(filePath)
        
        return {
            filename,
            content: fileContent
        }
    } catch (error) {
        throw new Error(`Failed to read attachment file: ${error.message}`)
    }
}


export async function sendEmailWithTemplate({templateId, registrationId, eventId, useGmail = false}) {
    try {
        const template = await EmailTemplate.findOne({_id: templateId})
        if (!template) {
            throw new Error(`Email template with ID ${templateId} not found`)
        }

        const registration = await Registration.findOne({_id: registrationId})
        if (!registration) {
            throw new Error(`Registration with ID ${registrationId} not found`)
        }

        const event = await Event.findOne({_id: eventId})
        if (!event) {
            throw new Error(`Event with ID ${eventId} not found`)
        }

        const registration_response = await RegistrationResponse.find({registration_id: registrationId})
        if (!registration_response || registration_response.length === 0) {
            throw new Error(`No registration responses found for registration ID ${registrationId}`)
        }

        const emailResponse = registration_response.find(
            response => response.field_type === 'EMAIL' && response.field_label === 'Email'
        )
        if (!emailResponse) {
            throw new Error('No email found')
        }

        // Prepare attachments from template if they exist
        let preparedAttachments = []
        if (template.attachments && template.attachments.length > 0) {
            preparedAttachments = await Promise.all(
                template.attachments.map(async (attachmentPath) => {
                    return await prepareAttachment(attachmentPath)
                })
            )
        }

        const mailOptions = {
            from: useGmail ? process.env.GMAIL_USER : process.env.MAIL_FROM,
            to: emailResponse?.response,
            attachments: preparedAttachments
        }
        const {sender_name, subject, body} = template
        const fillSubject = subject
        mailOptions.from = sender_name
        mailOptions.subject = fillSubject.replace(EMAIL_PLACEHOLDER.EVENT_NAME, event.name)
        // Send QRcode via cid
        const qrCodeId = 'qrcode_image'
        const qrCodeBase64 = await QRCode.toDataURL(encrypt(registrationId, CRYPTO_TYPE.QR_CODE))
        
        mailOptions.html = await fillTemplate(body, registration_response, event, qrCodeId, emailResponse)
        
        mailOptions.attachments.push({
            filename: 'qrcode.png',
            content: qrCodeBase64.split(';base64,').pop(),
            encoding: 'base64',
            cid: qrCodeId
        })

        const selectedTransporter = useGmail ? gmailTransporter : transporter
        await selectedTransporter.sendMail(mailOptions)
    } catch (error) {
        throw new Error(`Failed to send email with template: ${error.message}`)
    }
}

async function fillTemplate(body, registration_response, eventDetail, qrCodeId, emailTo) {
    // Extract name and phone from registration response
    const nameResponse = registration_response.find(
        response => response.field_type === 'TEXT' && response.field_label === 'Họ và tên'
    )
    const phoneResponse = registration_response.find(
        response => response.field_type === 'PHONE'
    )
    const positionResponse = registration_response.find(
        response => response.field_type === 'TEXT' && response.field_label === 'Chức vụ'
    )

    const event_name = eventDetail.name
    const event_date = moment(eventDetail.start_time).format('DD/MM/YYYY')
    const event_time = `${moment(eventDetail.start_time).format('HH:mm (DD/MM/YYYY)')} - ${moment(eventDetail.end_time).format('HH:mm (DD/MM/YYYY)')}`
    const location = eventDetail.location
    const current_date = moment().format('DD/MM/YYYY')
    
    const email = emailTo?.response || '<no-email>'
    const name = nameResponse?.response || '<no-name>'
    const phone = phoneResponse?.response || '<no-phone>'
    const position = positionResponse?.response || ''
    const system = '[IEC PTIT] Booth Checkin System'

    const filledTemplate = body
        .replaceAll(EMAIL_PLACEHOLDER.RECEIVER_NAME, name)
        .replaceAll(EMAIL_PLACEHOLDER.POSITION, position)
        .replaceAll(EMAIL_PLACEHOLDER.EMAIL, email)
        .replaceAll(EMAIL_PLACEHOLDER.PHONE_NUMBER, phone)
        .replaceAll(EMAIL_PLACEHOLDER.CURRENT_DATE, current_date)
        .replaceAll(EMAIL_PLACEHOLDER.EVENT_NAME, event_name)
        .replaceAll(EMAIL_PLACEHOLDER.EVENT_DATE, event_date)
        .replaceAll(EMAIL_PLACEHOLDER.EVENT_TIME, event_time)
        .replaceAll(EMAIL_PLACEHOLDER.EVENT_LOCATION, location)
        .replaceAll(EMAIL_PLACEHOLDER.SYSTEM_NAME, system)

    // Add QRcode to HTML
    const qrCodeHtml = `<br><div style="text-align: center;"><img src="cid:${qrCodeId}" alt="QR Code" /></div>`
    return filledTemplate + qrCodeHtml
}