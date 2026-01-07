import _ from 'lodash'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import {organizerTokenBlocklist} from '@/app/services/organizer/organizer_auth.service'
import {systemUserTokenBlocklist} from '@/app/services/admin/system-user.service'
import {TOKEN_TYPE} from '@/configs'
import {abort, getToken, verifyToken} from '@/utils/helpers'
import * as organizerRepo from '@/db/organizer_repo'
import {findAdminById} from '@/db/admin_rbac_repository'

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

                // Load system user WITH roles and permissions
                const systemUser = await findAdminById(user_id, false, true)
                if (!systemUser) {
                    abort(404, 'Người dùng không tồn tại')
                }

                if (!systemUser.is_active) {
                    abort(403, 'Tài khoản đã bị vô hiệu hóa')
                }

                // Load organizer data for the system user
                const organizer = await organizerRepo.findOrganizerById(organizer_id)
                if (organizer) {
                    req.currentOrganizer = organizer
                    req.currentUser = systemUser // Store system user for permission checks
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
                        req.currentUser = null // Regular organizers have full access
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

/**
 * Middleware to check organizer-scoped permissions for system users
 * Regular organizers bypass this check (they own all their resources)
 *
 * @param {...string} permissionCodes - Permission codes to check (OR logic)
 */
export function requireOrganizerPermission(...permissionCodes) {
    return async (req, res, next) => {
        try {
            // Regular organizers have full access to their resources
            if (!req.isSystemUser) {
                next()
                return
            }

            const systemUser = req.currentUser
            if (!systemUser) {
                abort(401, 'Chưa xác thực')
            }

            // Check if user is Super Admin (bypasses all permission checks)
            const roles = systemUser.roles || []
            const isSuperAdmin = roles.some((role) => role.code === 'SUPER_ADMIN')

            if (isSuperAdmin) {
                next()
                return
            }

            // Get all permissions from user's roles (scoped to this organizer)
            const userPermissions = new Set()
            const currentOrganizerId = req.currentOrganizer._id

            for (const role of roles) {
                // Check if this role is assigned for the current organizer
                const junctionData = role.SystemUserRole || role.system_user_roles
                const roleOrganizerId = junctionData?.organizer_id

                // Only include permissions from roles scoped to this organizer or global roles
                if (roleOrganizerId === currentOrganizerId || roleOrganizerId === null) {
                    if (role.permissions) {
                        role.permissions.forEach((permission) => {
                            userPermissions.add(permission.code)
                        })
                    }
                }
            }

            // Check if user has any of the required permissions
            const hasPermission = permissionCodes.some((code) => userPermissions.has(code))

            if (!hasPermission) {
                abort(403, 'Không có quyền truy cập')
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}

export default requireOrganizerAuthentication
