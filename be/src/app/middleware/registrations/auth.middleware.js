import _ from 'lodash'
import { registrationTokenBlocklist } from '@/app/services/registrations/auth.service'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { abort, verifyToken } from '@/utils/helpers'
import { TOKEN_TYPE } from '@/configs'
import * as registrationRepo from '@/db/registration_repository'

export async function verifyForgotPasswordToken(req, res, next) {
    const token = req.params.token
    try {
        const allowedToken = _.isUndefined(await registrationTokenBlocklist.get(token))
        if (allowedToken) {
            const { user_id } = verifyToken(token, TOKEN_TYPE.FORGOT_PASSWORD)
            const registration = await registrationRepo.findRegistrationById(user_id)
            if (registration) {
                req.currentRegistration = registration
                next()
                return
            }
        }
        abort(410, 'Liên kết đã hết hạn.')
    } catch (error) {
        if (!(error instanceof JsonWebTokenError)) {
            throw error
        }
        if (error instanceof TokenExpiredError) {
            abort(410, 'Liên kết đã hết hạn.')
        }
    }
    abort(403, 'Liên kết không hợp lệ.')
}

export async function verifyEmailVerificationToken(req, res, next) {
    const token = req.params.token
    try {
        const allowedToken = _.isUndefined(await registrationTokenBlocklist.get(token))
        if (allowedToken) {
            const { user_id } = verifyToken(token, TOKEN_TYPE.EMAIL_VERIFICATION)
            const registration = await registrationRepo.findRegistrationById(user_id)
            if (registration) {
                if (registration.is_active) {
                    abort(400, 'Tài khoản đã được kích hoạt trước đó.')
                }
                req.currentRegistration = registration
                req.verificationToken = token
                next()
                return
            }
        }
        abort(410, 'Liên kết đã hết hạn.')
    } catch (error) {
        if (!(error instanceof JsonWebTokenError)) {
            throw error
        }
        if (error instanceof TokenExpiredError) {
            abort(410, 'Liên kết đã hết hạn.')
        }
    }
    abort(403, 'Liên kết không hợp lệ.')
}

