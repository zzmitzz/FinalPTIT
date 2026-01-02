require('dotenv').config();

import nodeMailer from 'nodemailer'
import { MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_SECURE, MAIL_PASS } from '@/configs'

const mailTransporter = nodeMailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASS,
    },
})

export default mailTransporter
