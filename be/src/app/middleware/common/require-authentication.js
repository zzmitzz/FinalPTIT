import _ from 'lodash'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import {tokenBlocklist} from '@/app/services/admin/auth.service'
import {TOKEN_TYPE} from '@/configs'
import {abort, getToken, verifyToken} from '@/utils/helpers'
import * as adminRbacRepository from '@/db/admin_rbac_repository'

async function requireAuthentication(req, res, next) {
    try {
        const token = getToken(req.headers)

        if (token) {
            const allowedToken = _.isUndefined(await tokenBlocklist.get(token))
            if (allowedToken) {
                const {user_id, user_type} = verifyToken(token, TOKEN_TYPE.AUTHORIZATION)
                // Accept both 'system_user' (new RBAC) and 'admin' (legacy) for backward compatibility
                if (user_type === 'system_user' || user_type === 'admin' || !user_type) {
                    const admin = await adminRbacRepository.findAdminById(user_id, false)
                    if (admin) {
                        req.currentUser = admin
                        next()
                        return
                    }
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

export default requireAuthentication
