import _ from 'lodash'
import {tokenBlocklist} from '../services/admin/auth.service'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import {abort, verifyToken} from '@/utils/helpers'
import {TOKEN_TYPE} from '@/configs'
import * as adminRbacRepository from '@/db/admin_rbac_repository'

export async function verifyForgotPasswordToken(req, res, next) {
    const token = req.params.token
    try {
        const allowedToken = _.isUndefined(await tokenBlocklist.get(token))
        if (allowedToken) {
            const {user_id} = verifyToken(token, TOKEN_TYPE.FORGOT_PASSWORD)
            const admin = await adminRbacRepository.findAdminById(user_id, false)
            if (admin) {
                req.currentUser = admin
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
