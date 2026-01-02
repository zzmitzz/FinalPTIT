import ejs from 'ejs'
import path from 'path'
import { logger, MAIL_FROM_ADDRESS, MAIL_FROM_NAME, mailTransporter, VIEW_DIR, APP_URL_API, APP_NAME, APP_URL_CLIENT } from '@/configs'
import { normalizeError } from '@/utils/helpers'
import { buildStaticUrl } from '@/utils/url-builder'
export class EmailService {
    static async sendEmail(to, subject, template, data = {}, mailOptions = {}) {


        const LOGO_URL = buildStaticUrl('logo.png')

        try {
            const html = await ejs.renderFile(
                path.join(VIEW_DIR, template + '.ejs'),
                {
                    APP_NAME,
                    LOGO_URL,
                    APP_URL_API,
                    APP_URL_CLIENT,
                    ...data
                }
            )

            const mailConfig = {
                ...mailOptions,
                from: {
                    address: MAIL_FROM_ADDRESS,
                    name: MAIL_FROM_NAME,
                },
                to,
                subject,
                html,
            }

            await mailTransporter.sendMail(mailConfig)

            logger.info({
                message: `Email sent successfully to ${to}`,
                subject,
            })
        } catch (err) {
            const detail = normalizeError(err)
            logger.error({
                message: `Error sending email to ${to}`,
                detail,
            })
            throw err
        }
    }

    static async sendWelcomeEmail(user) {
        const { email, full_name } = user

        await this.sendEmail(
            email,
            'Chào mừng bạn đến với hệ thống',
            'emails/welcome',
            {
                name: full_name || email,
            }
        )
    }

    static async sendPasswordResetEmail(user, resetLink) {
        const { email, full_name } = user

        await this.sendEmail(
            email,
            'Quên mật khẩu',
            'emails/forgot-password',
            {
                name: full_name || email,
                linkResetPassword: resetLink,
            }
        )
    }

    static async sendVerificationEmail(user, verifyLink) {
        const { email, full_name } = user

        await this.sendEmail(
            email,
            'Xác thực tài khoản',
            'emails/verify-email',
            {
                name: full_name || email,
                linkVerifyEmail: verifyLink,
            }
        )
    }
}
