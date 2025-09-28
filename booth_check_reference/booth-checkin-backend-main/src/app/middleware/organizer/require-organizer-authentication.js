import _ from 'lodash'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import {Organizer} from '@/models'
import {TOKEN_TYPE} from '@/configs'
import {abort, getToken, verifyToken} from '@/utils/helpers'
import {organizerTokenBlocklist} from '@/app/services/organizer.service'

async function requireOrganizerAuthentication(req, res, next) {
    try {
        const token = getToken(req.headers)

        if (token) {
            const allowedToken = _.isUndefined(await organizerTokenBlocklist.get(token))
            if (allowedToken) {
                const {organizer_id} = verifyToken(token, TOKEN_TYPE.AUTHORIZATION)
                const organizer = await Organizer.findOne({_id: organizer_id, deleted: false})
                if (organizer) {
                    req.currentOrganizer = organizer
                    next()
                    return
                }
            }
        }
    } catch (error) {
        if (!(error instanceof JsonWebTokenError)) {
            throw error
        }
        if (error instanceof TokenExpiredError) {
            abort(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập để tiếp tục!')
        }
    }
    abort(401)
}

export default requireOrganizerAuthentication
