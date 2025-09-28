import _ from 'lodash'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import {abort, verifyToken} from '@/utils/helpers'
import {TOKEN_TYPE} from '@/configs'
import {Organizer} from '@/models'
import {organizerTokenBlocklist} from '@/app/services/organizer.service'

export async function verifyForgotPasswordToken(req, res, next) {
    const token = req.params.token
    try {
        const allowedToken = _.isUndefined(await organizerTokenBlocklist.get(token))
        if (allowedToken) {
            const {organizer_id} = verifyToken(token, TOKEN_TYPE.FORGOT_PASSWORD)
            const organizer = await Organizer.findOne({_id: organizer_id, deleted: false})
            if (organizer) {
                req.currentOrganizer = organizer
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
