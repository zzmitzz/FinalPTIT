import _ from 'lodash'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import {organizerTokenBlocklist} from '@/app/services/organizer/organizer_auth.service'
import {systemUserTokenBlocklist} from '@/app/services/admin/system-user.service'
import {TOKEN_TYPE} from '@/configs'
import {abort, getToken, verifyToken} from '@/utils/helpers'
import * as organizerRepo from '@/db/organizer_repo'

async function requireOrganizerAuthentication(req, res, next) {
    try {
        const token = getToken(req.headers)

        if (token) {
            // Decode token to check user type
            const decoded = verifyToken(token, TOKEN_TYPE.AUTHORIZATION)
            const {user_id, user_type, organizer_id} = decoded

            // Handle system_user tokens (organizer-scoped system users)
            if (user_type === 'system_user') {
                // Check if system user token is blocked
                const isBlocked = !_.isUndefined(await systemUserTokenBlocklist.get(token))
                if (isBlocked) {
                    abort(401, 'Token đã bị vô hiệu hóa')
                }

                // System user must have organizer_id to access organizer routes
                if (!organizer_id) {
                    abort(403, 'Chỉ quản trị viên tổ chức mới có quyền truy cập')
                }

                // Load organizer data for the system user
                const organizer = await organizerRepo.findOrganizerById(organizer_id)
                if (organizer) {
                    req.currentOrganizer = organizer
                    req.isSystemUser = true // Flag to indicate this is a system user
                    next()
                    return
                }
            }
            // Handle regular organizer tokens
            else {
                // Check if organizer token is blocked
                const allowedToken = _.isUndefined(await organizerTokenBlocklist.get(token))
                if (allowedToken) {
                    const organizer = await organizerRepo.findOrganizerById(user_id)
                    if (organizer) {
                        req.currentOrganizer = organizer
                        req.isSystemUser = false
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

export default requireOrganizerAuthentication
