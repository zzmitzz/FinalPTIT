import _ from 'lodash'
import {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken'
import {abort, verifyToken} from '@/utils/helpers'
import {TOKEN_TYPE} from '@/configs'
import {systemUserTokenBlocklist} from '@/app/services/admin/system-user.service'
import {findAdminById} from '@/db/admin_rbac_repository'

/**
 * Verify system user authentication token
 */
export async function verifySystemUserToken(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '')

        if (!token) {
            abort(401, 'Token không được cung cấp')
        }

        // Check if token is blocked
        const isBlocked = !_.isUndefined(await systemUserTokenBlocklist.get(token))
        if (isBlocked) {
            abort(401, 'Token đã bị vô hiệu hóa')
        }

        // Verify token
        const decoded = verifyToken(token, TOKEN_TYPE.AUTHORIZATION)

        // Accept 'system_user' or tokens without user_type (legacy support)
        // This allows smooth transition from old admin system to RBAC
        if (decoded.user_type && decoded.user_type !== 'system_user') {
            abort(403, 'Token không hợp lệ cho hệ thống')
        }

        // Get system user WITH roles and permissions (third parameter)
        const systemUser = await findAdminById(decoded.user_id, false, true)

        if (!systemUser) {
            abort(404, 'Người dùng không tồn tại')
        }

        if (!systemUser.is_active) {
            abort(403, 'Tài khoản đã bị vô hiệu hóa')
        }

        req.currentUser = systemUser
        req.token = token
        next()
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            return next({statusCode: 401, message: 'Token đã hết hạn'})
        }
        if (error instanceof JsonWebTokenError) {
            return next({statusCode: 401, message: 'Token không hợp lệ'})
        }
        next(error)
    }
}

/**
 * Check if user has specific permission
 */
export function requirePermission(...permissionCodes) {
    return async (req, res, next) => {
        try {
            const systemUser = req.currentUser

            if (!systemUser) {
                abort(401, 'Chưa xác thực')
            }

            // Super admin has all permissions
            const roles = systemUser.roles || []
            const isSuperAdmin = roles.some((role) => role.code === 'SUPER_ADMIN')

            if (isSuperAdmin) {
                next()
                return
            }

            // Get all permissions from all roles
            const userPermissions = new Set()
            for (const role of roles) {
                if (role.permissions) {
                    role.permissions.forEach((permission) => {
                        userPermissions.add(permission.code)
                    })
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

/**
 * Check if user has all specified permissions
 */
export function requireAllPermissions(...permissionCodes) {
    return async (req, res, next) => {
        try {
            const systemUser = req.currentUser

            if (!systemUser) {
                abort(401, 'Chưa xác thực')
            }

            // Super admin has all permissions
            const roles = systemUser.roles || []
            const isSuperAdmin = roles.some((role) => role.code === 'SUPER_ADMIN')

            if (isSuperAdmin) {
                next()
                return
            }

            // Get all permissions from all roles
            const userPermissions = new Set()
            for (const role of roles) {
                if (role.permissions) {
                    role.permissions.forEach((permission) => {
                        userPermissions.add(permission.code)
                    })
                }
            }

            // Check if user has all required permissions
            const hasAllPermissions = permissionCodes.every((code) => userPermissions.has(code))

            if (!hasAllPermissions) {
                abort(403, 'Không có đủ quyền truy cập')
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}

/**
 * Check if user has specific role
 */
export function requireRole(...roleCodes) {
    return async (req, res, next) => {
        try {
            const systemUser = req.currentUser

            if (!systemUser) {
                abort(401, 'Chưa xác thực')
            }

            const roles = systemUser.roles || []
            const userRoleCodes = roles.map((role) => role.code)

            const hasRole = roleCodes.some((code) => userRoleCodes.includes(code))

            if (!hasRole) {
                abort(403, 'Không có vai trò phù hợp')
            }

            next()
        } catch (error) {
            next(error)
        }
    }
}

/**
 * Check if user is global admin (no organizer_id)
 */
export function requireGlobalAdmin(req, res, next) {
    try {
        const systemUser = req.currentUser

        if (!systemUser) {
            abort(401, 'Chưa xác thực')
        }

        if (systemUser.organizer_id !== null) {
            abort(403, 'Chỉ quản trị viên toàn cục mới có quyền truy cập')
        }

        next()
    } catch (error) {
        next(error)
    }
}

/**
 * Check if user belongs to specific organizer or is global admin
 */
export function requireOrganizerAccess(req, res, next) {
    try {
        const systemUser = req.currentUser

        if (!systemUser) {
            abort(401, 'Chưa xác thực')
        }

        // Get organizer ID from request params or body
        const requestedOrganizerId =
            req.params.organizer_id || req.params.organizerId || req.body.organizer_id

        // Global admins can access all organizers
        if (systemUser.organizer_id === null) {
            next()
            return
        }

        // Check if user's organizer matches requested organizer
        if (systemUser.organizer_id !== requestedOrganizerId) {
            abort(403, 'Không có quyền truy cập tổ chức này')
        }

        next()
    } catch (error) {
        next(error)
    }
}

/**
 * Check if user can manage system users (only for org owners or global admins)
 */
export function requireUserManagement(req, res, next) {
    return requirePermission(
        'SYSTEM_USER:MANAGE',
        'SYSTEM_USER:CREATE',
        'SYSTEM_USER:UPDATE',
        'SYSTEM_USER:DELETE'
    )(req, res, next)
}

/**
 * Check if user can manage roles
 */
export function requireRoleManagement(req, res, next) {
    return requirePermission('ROLE:MANAGE')(req, res, next)
}
