import nodeMailer from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
import {
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM_ADDRESS,
    MAIL_FROM_NAME,
    VIEW_DIR,
    logger,
    APP_DEBUG,
    MAIL_SECURE,
} from '@/configs'
import {normalizeError} from './error.helper'
import chalk from 'chalk'
import _ from 'lodash'

const transport = nodeMailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: MAIL_SECURE,
    auth: {
        user: MAIL_USERNAME,
        pass: MAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
})

export async function sendMail({to, subject, template, data, attachments, fromName}) {
    try {
        const html = await ejs.renderFile(path.join(VIEW_DIR, template), data)
        return await transport.sendMail({
            from: {
                address: MAIL_FROM_ADDRESS,
                name: fromName || MAIL_FROM_NAME,
            },
            to,
            subject,
            html,
            attachments,
        })
    } catch (error) {
        const detail = normalizeError(error)
        console.error(chalk.redBright(detail.name + ': ' + detail.message))
        if (_.isArray(detail.stack)) {
            const stack = detail.stack.map((s) => '- ' + s).join('\n')
            console.error(chalk.redBright(stack))
        }
        if (APP_DEBUG) return
        logger.error({
            message: 'Error send mail',
            detail,
        })
    }
}
