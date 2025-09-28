import _ from 'lodash'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import {abort, verifyToken} from '@/utils/helpers'
import {TOKEN_TYPE} from '@/configs'
import {Admin} from '@/models'
import {adminTokenBlocklist} from '@/app/services/admin.service'

export async function verifyForgotPasswordToken(req, res, next) {
    const token = req.params.token
    try {
        const allowedToken = _.isUndefined(await adminTokenBlocklist.get(token))
        if (allowedToken) {
            const {admin_id} = verifyToken(token, TOKEN_TYPE.FORGOT_PASSWORD)
            const admin = await Admin.findOne({_id: admin_id, deleted: false})
            if (admin) {
                req.currentAdmin = admin
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
