import {abort, getToken} from '@/utils/helpers'
import * as systemUserService from '@/app/services/admin/system-user.service'

/**
 * Check if current user can modify target user
 * Rules:
 * 1. Super admins can modify anyone except themselves
 * 2. Regular admins cannot modify super admins
 * 3. Users cannot modify themselves (to prevent self-privilege escalation)
 */
async function canModifyUser(currentUser, targetUserId) {
    // Prevent self-modification
    if (currentUser._id === targetUserId) {
        abort(403, 'Không thể thực hiện thao tác trên chính tài khoản của bạn')
    }

    // Check if current user is super admin
    const currentUserRoles = currentUser.roles || []
    const isSuperAdmin = currentUserRoles.some((role) => role.code === 'SUPER_ADMIN')

    // If not super admin, check if target user is super admin
    if (!isSuperAdmin) {
        const targetUser = await systemUserService.getSystemUserById(targetUserId, {includeRoles: true})
        const targetRoles = targetUser.roles || []
        const targetIsSuperAdmin = targetRoles.some((role) => role.code === 'SUPER_ADMIN')

        if (targetIsSuperAdmin) {
            abort(403, 'Chỉ Super Admin mới có thể thao tác trên tài khoản Super Admin khác')
        }
    }

    return true
}

/**
 * Login system user
 */
export async function login(req, res) {
    const validLogin = await systemUserService.checkValidLogin(req.body)

    if (validLogin) {
        res.jsonify(systemUserService.authToken(validLogin))
    } else {
        abort(400, 'Email hoặc mật khẩu không đúng.')
    }
}

/**
 * Register new system user
 */
export async function register(req, res) {
    const newUser = await systemUserService.register(req.body)
    const result = systemUserService.authToken(newUser)
    res.status(201).jsonify(result, 'Đăng ký thành công.')
}

/**
 * Logout system user
 */
export async function logout(req, res) {
    const token = getToken(req.headers)
    await systemUserService.blockToken(token)
    res.jsonify('Đăng xuất thành công.')
}

/**
 * Get current user profile
 */
export async function me(req, res) {
    const result = await systemUserService.profile(req.currentUser._id)

    // Add scope information for frontend routing
    const isGlobalAdmin = req.currentUser.organizer_id === null
    const scope = isGlobalAdmin ? 'GLOBAL' : 'ORGANIZER'

    res.jsonify({
        ...result,
        scope: scope,
        is_global_admin: isGlobalAdmin,
    })
}

/**
 * Update profile
 */
export async function updateProfile(req, res) {
    await systemUserService.updateProfile(req.currentUser, req.body)
    res.status(201).jsonify('Cập nhật thông tin cá nhân thành công.')
}

/**
 * Change password
 */
export async function changePassword(req, res) {
    await systemUserService.resetPassword(req.currentUser._id, req.body.new_password)
    res.status(201).jsonify('Cập nhật mật khẩu thành công.')
}

/**
 * List all system users (admin only)
 */
export async function listSystemUsers(req, res) {
    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        searchTerm: req.query.search,
        roleId: req.query.role_id,
        includeRoles: req.query.include_roles === 'true',
    }

    const result = await systemUserService.listSystemUsers(options)
    res.jsonify(result)
}

/**
 * Get system user by ID
 */
export async function getSystemUser(req, res) {
    const options = {
        includeRoles: req.query.include_roles === 'true',
    }

    const systemUser = await systemUserService.getSystemUserById(req.params.id, options)
    res.jsonify(systemUser)
}

/**
 * Create system user (admin only)
 */
export async function createSystemUser(req, res) {
    const systemUser = await systemUserService.register(req.body)
    res.status(201).jsonify(systemUser, 'Tạo người dùng thành công.')
}

/**
 * Update system user
 */
export async function updateSystemUser(req, res) {
    await canModifyUser(req.currentUser, req.params.id)
    const systemUser = await systemUserService.updateSystemUser(req.params.id, req.body)
    res.jsonify(systemUser, 'Cập nhật người dùng thành công.')
}

/**
 * Delete system user
 */
export async function deleteSystemUser(req, res) {
    await canModifyUser(req.currentUser, req.params.id)
    await systemUserService.deleteSystemUser(req.params.id)
    res.jsonify('Xóa người dùng thành công.')
}

/**
 * Deactivate system user
 */
export async function deactivateSystemUser(req, res) {
    await canModifyUser(req.currentUser, req.params.id)
    await systemUserService.deactivateSystemUser(req.params.id)
    res.jsonify('Vô hiệu hóa người dùng thành công.')
}

/**
 * Activate system user
 */
export async function activateSystemUser(req, res) {
    await canModifyUser(req.currentUser, req.params.id)
    await systemUserService.activateSystemUser(req.params.id)
    res.jsonify('Kích hoạt người dùng thành công.')
}

/**
 * Assign roles to system user
 */
export async function assignRoles(req, res) {
    const {role_ids, organizer_id = null} = req.body

    if (!Array.isArray(role_ids) || role_ids.length === 0) {
        abort(400, 'role_ids phải là một mảng không rỗng')
    }

    await canModifyUser(req.currentUser, req.params.id)
    await systemUserService.assignRoles(req.params.id, role_ids, organizer_id, req.currentUser._id)
    res.jsonify('Gán vai trò thành công.')
}

/**
 * Remove roles from system user
 */
export async function removeRoles(req, res) {
    const {role_ids, organizer_id = null} = req.body

    if (!Array.isArray(role_ids) || role_ids.length === 0) {
        abort(400, 'role_ids phải là một mảng không rỗng')
    }

    await canModifyUser(req.currentUser, req.params.id)
    await systemUserService.removeRoles(req.params.id, role_ids, organizer_id)
    res.jsonify('Xóa vai trò thành công.')
}

/**
 * Get user permissions
 */
export async function getUserPermissions(req, res) {
    const permissions = await systemUserService.getUserPermissions(req.params.id)
    res.jsonify(permissions)
}
