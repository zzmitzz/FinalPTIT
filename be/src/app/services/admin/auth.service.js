import moment from 'moment'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
<<<<<<< HEAD
import {
    createAdmin,
    findAdminByEmail,
    findAdminById,
    updateAdminById,
    updateAdminRoles,
    deleteAdminById,
    adminPhoneExists,
    adminEmailExists,
} from '../../../../db/admin_reporistory'
=======
import * as adminRepository from '@/db/admin_reporistory'
>>>>>>> upstream/master



import {cache, LOGIN_EXPIRE_IN, TOKEN_TYPE} from '@/configs'
import {generateToken} from '@/utils/helpers'

export const tokenBlocklist = cache.create('token-block-list')

export async function checkValidLogin({email, password}) {
    const admin = await adminRepository.findAdminByEmail(email)

    if (admin) {
        const verified = await bcrypt.compare(password, admin.password)
        if (verified) {
            return admin
        }
    }

    return false
}

export function authToken(admin) {
    const accessToken = generateToken({user_id: admin._id}, TOKEN_TYPE.AUTHORIZATION, LOGIN_EXPIRE_IN)
    const decode = jwt.decode(accessToken)
    const expireIn = decode.exp - decode.iat
    return {
        access_token: accessToken,
        expire_in: expireIn,
        auth_type: 'Bearer Token',
    }
}

export async function register({name, email, phone = '', password}) {
    const passwordHash = await bcrypt.hash(password, 10)
    const admin = await adminRepository.createAdmin({name, email, phone, password: passwordHash})
    return admin
}

export async function blockToken(token) {
    const decoded = jwt.decode(token)
    const expiresIn = decoded.exp
    const now = moment().unix()
    await tokenBlocklist.set(token, 1, expiresIn - now)
}

export async function profile(userId) {
    const admin = await adminRepository.findAdminById(userId)
    return admin
}

export async function updateProfile(currentUser, {name, email, phone}) {
    await adminRepository.updateAdminById(currentUser._id, {name, email, phone})
}

export async function resetPassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await adminRepository.updateAdminById(userId, {password: passwordHash})
}
