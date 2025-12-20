import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import moment from 'moment'
import {
    createAdmin as createSystemUserInRepo,
    findAdminById as findSystemUserByIdInRepo,
    findAdminByEmail as findSystemUserByEmailInRepo,
    findAllAdmins as findAllSystemUsersInRepo,
    updateAdminById as updateSystemUserByIdInRepo,
    deleteAdminById as deleteSystemUserByIdInRepo,
    assignRolesToAdmin,
    removeRolesFromAdmin,
    getAdminPermissions,
    adminHasPermission,
    adminHasAnyPermission,
    adminHasAllPermissions,
} from '@/db/admin_rbac_repository'
import {cache, LOGIN_EXPIRE_IN, TOKEN_TYPE} from '@/configs'
import {generateToken} from '@/utils/helpers'

export const systemUserTokenBlocklist = cache.create('system-user-token-blocklist')

/**
 * Check valid login for system user
 */
export async function checkValidLogin({email, password}) {
    const systemUser = await findSystemUserByEmailInRepo(email, true)
    if (systemUser) {
        // Check if account is active
        if (!systemUser.is_active) {
            throw new Error('Account is deactivated')
        }

        const verified = await bcrypt.compare(password, systemUser.password)
        if (verified) {
            // Remove password from response
            delete systemUser.password
            return systemUser
        }
    }
    return false
}

/**
 * Generate auth token for system user
 */
export function authToken(systemUser) {
    const accessToken = generateToken(
        {
            user_id: systemUser._id,
            user_type: 'system_user',
            organizer_id: systemUser.organizer_id,
        },
        TOKEN_TYPE.AUTHORIZATION,
        LOGIN_EXPIRE_IN
    )
    const decode = jwt.decode(accessToken)
    const expireIn = decode.exp - decode.iat
    return {
        access_token: accessToken,
        expire_in: expireIn,
        auth_type: 'Bearer Token',
    }
}

/**
 * Register a new system user
 */
export async function register({name, email, phone = '', password, organizer_id = null}) {
    const passwordHash = await bcrypt.hash(password, 10)
    const systemUser = await createSystemUserInRepo({
        name,
        email,
        phone,
        password: passwordHash,
        organizer_id,
    })
    return systemUser
}

/**
 * Block/logout token
 */
export async function blockToken(token) {
    const decoded = jwt.decode(token)
    const expiresIn = decoded.exp
    const now = moment().unix()
    await systemUserTokenBlocklist.set(token, 1, expiresIn - now)
}

/**
 * Get system user profile with roles
 */
export async function profile(userId) {
    const systemUser = await findSystemUserByIdInRepo(userId, {includeRoles: true})
    return systemUser
}

/**
 * Update system user profile
 */
export async function updateProfile(currentUser, {name, email, phone, avatar_url}) {
    await updateSystemUserByIdInRepo(currentUser._id, {name, email, phone, avatar_url})
}

/**
 * Reset password
 */
export async function resetPassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await updateSystemUserByIdInRepo(userId, {password: passwordHash})
}

/**
 * Get all system users with pagination
 */
export async function listSystemUsers(options = {}) {
    const result = await findAllSystemUsersInRepo(options)
    return result
}

/**
 * Get system user by ID
 */
export async function getSystemUserById(userId, options = {}) {
    const systemUser = await findSystemUserByIdInRepo(userId, options)
    if (!systemUser) {
        throw new Error('System user not found')
    }
    return systemUser
}

/**
 * Update system user
 */
export async function updateSystemUser(userId, updateData) {
    const systemUser = await updateSystemUserByIdInRepo(userId, updateData)
    if (!systemUser) {
        throw new Error('System user not found')
    }
    return systemUser
}

/**
 * Delete system user
 */
export async function deleteSystemUser(userId) {
    const result = await deleteSystemUserByIdInRepo(userId)
    if (!result) {
        throw new Error('System user not found')
    }
    return true
}

/**
 * Deactivate system user
 */
export async function deactivateSystemUser(userId) {
    return await updateSystemUserByIdInRepo(userId, {is_active: false})
}

/**
 * Activate system user
 */
export async function activateSystemUser(userId) {
    return await updateSystemUserByIdInRepo(userId, {is_active: true})
}

/**
 * Assign roles to system user
 */
export async function assignRoles(userId, roleIds) {
    await assignRolesToAdmin(userId, roleIds)
    return true
}

/**
 * Remove roles from system user
 */
export async function removeRoles(userId, roleIds) {
    await removeRolesFromAdmin(userId, roleIds)
    return true
}

/**
 * Get all permissions for a system user
 */
export async function getUserPermissions(userId) {
    const permissions = await getAdminPermissions(userId)
    return permissions
}

/**
 * Check if user has specific permission
 */
export async function userHasPermission(userId, permissionCode) {
    return await adminHasPermission(userId, permissionCode)
}

/**
 * Check if user has any of the permissions
 */
export async function userHasAnyPermission(userId, permissionCodes) {
    return await adminHasAnyPermission(userId, permissionCodes)
}

/**
 * Check if user has all permissions
 */
export async function userHasAllPermissions(userId, permissionCodes) {
    return await adminHasAllPermissions(userId, permissionCodes)
}
