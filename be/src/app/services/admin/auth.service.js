import moment from 'moment'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import * as adminRbacRepository from '@/db/admin_rbac_repository'
import {cache, LOGIN_EXPIRE_IN, TOKEN_TYPE} from '@/configs'
import {generateToken} from '@/utils/helpers'

export const tokenBlocklist = cache.create('token-block-list')

export async function checkValidLogin({email, password}) {
    if (!email || !password) {
        console.log('[AUTH] Missing email or password')
        return false
    }

    // IMPORTANT: Pass true to include password field for verification
    const admin = await adminRbacRepository.findAdminByEmail(email, true)
    console.log(
        '[AUTH] User found:',
        admin ? `${admin.email} (has password: ${!!admin.password})` : 'NOT FOUND'
    )

    if (admin && admin.password) {
        const verified = await bcrypt.compare(password, admin.password)
        console.log('[AUTH] Password verification:', verified ? 'SUCCESS' : 'FAILED')
        if (verified) {
            return admin
        }
    }
    return false
}

export function authToken(admin) {
    const accessToken = generateToken(
        {user_id: admin._id, user_type: 'system_user'},
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

export async function register({name, email, phone = '', password, organizer_id = null}) {
    const passwordHash = await bcrypt.hash(password, 10)
    const admin = await adminRbacRepository.createAdmin({
        name,
        email,
        phone,
        password: passwordHash,
        organizer_id,
    })
    return admin
}

export async function blockToken(token) {
    const decoded = jwt.decode(token)
    const expiresIn = decoded.exp
    const now = moment().unix()
    await tokenBlocklist.set(token, 1, expiresIn - now)
}

export async function profile(userId) {
    const admin = await adminRbacRepository.findAdminById(userId, true)
    return admin
}

export async function updateProfile(currentUser, {name, email, phone}) {
    await adminRbacRepository.updateAdminById(currentUser._id, {name, email, phone})
}

export async function resetPassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await adminRbacRepository.updateAdminById(userId, {password: passwordHash})
}
