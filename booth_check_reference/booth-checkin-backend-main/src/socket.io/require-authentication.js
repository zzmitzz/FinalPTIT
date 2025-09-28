import {adminTokenBlocklist} from '@/app/services/admin.service'
import {organizerTokenBlocklist} from '@/app/services/organizer.service'
import {STATUS_DEFAULT_MESSAGE, TOKEN_TYPE} from '@/configs'
import {Admin, Organizer} from '@/models'
import {verifyToken} from '@/utils/helpers'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import _ from 'lodash'

export const ACTOR = {
    ADMIN: 'ADMIN',
    ORGANIZER: 'ORGANIZER',
}

function requireAuthentication(actor) {
    return async function (socket, next) {
        try {
            const token = socket.handshake.auth.token
            if (token) {
                const allowedToken =
                    actor === ACTOR.ADMIN
                        ? _.isUndefined(await adminTokenBlocklist.get(token))
                        : actor === ACTOR.ORGANIZER
                            ? _.isUndefined(await organizerTokenBlocklist.get(token))
                            : false
                if (allowedToken) {
                    const data = verifyToken(token, TOKEN_TYPE.AUTHORIZATION)
                    if (actor === ACTOR.ADMIN) {
                        const admin = await Admin.findOne({_id: data.admin_id, deleted: false})
                        if (admin) {
                            socket.currentAdmin = admin
                            next()
                            return
                        }
                    } else if (actor === ACTOR.ORGANIZER) {
                        const organizer = await Organizer.findOne({_id: data.organizer_id, deleted: false})
                        if (organizer) {
                            socket.currentOrganizer = organizer
                            next()
                            return
                        }
                    }
                }
            }
        } catch (error) {
            if (!(error instanceof JsonWebTokenError)) {
                next({message: STATUS_DEFAULT_MESSAGE[500]})
                return
            }
            if (error instanceof TokenExpiredError) {
                next({message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập để tiếp tục!'})
                return
            }
        }
        next({message: STATUS_DEFAULT_MESSAGE[401]})
    }
}

export default requireAuthentication
