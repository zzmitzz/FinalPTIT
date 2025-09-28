import _ from 'lodash'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import {Admin} from '@/models'
import {TOKEN_TYPE} from '@/configs'
import {abort, getToken, verifyToken} from '@/utils/helpers'
import {adminTokenBlocklist} from '@/app/services/admin.service'

async function requireAdminAuthentication(req, res, next) {
    try {
        const token = getToken(req.headers)

        if (token) {
            const allowedToken = _.isUndefined(await adminTokenBlocklist.get(token))
            if (allowedToken) {
                const {admin_id} = verifyToken(token, TOKEN_TYPE.AUTHORIZATION)
                const admin = await Admin.findOne({_id: admin_id, deleted: false})
                if (admin) {
                    req.currentAdmin = admin
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

export default requireAdminAuthentication
